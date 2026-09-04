import React, { useRef, useState, useEffect } from "react";
import {
  Pencil,
  Type,
  Square,
  Eraser,
  RotateCcw,
  Trash2,
  Check,
  X,
  Highlighter,
  Tag,
  Download,
  Sparkles,
  Layers,
  Palette
} from "lucide-react";

interface DocumentAnnotatorProps {
  imageUrl: string;
  onSave: (annotatedBase64: string) => void;
  onClose: () => void;
}

type ToolMode = "pen" | "highlighter" | "text" | "rectangle" | "eraser";

interface TextLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

const COLOR_PALETTE = [
  { name: "Amber Gold", hex: "#f59e0b" },
  { name: "Crimson Red", hex: "#ef4444" },
  { name: "Emerald Green", hex: "#10b981" },
  { name: "Cyan Tech", hex: "#06b6d4" },
  { name: "Purple Accent", hex: "#a855f7" },
  { name: "Pure White", hex: "#ffffff" },
  { name: "Deep Dark", hex: "#000000" }
];

const PRESET_STAMPS = [
  "VERIFIED SEAL",
  "SENSITIVE DATA",
  "INCOME MATCH",
  "OFFICIAL SIGNATURE",
  "CONFIDENTIAL",
  "AADHAAR UID"
];

export const DocumentAnnotator: React.FC<DocumentAnnotatorProps> = ({
  imageUrl,
  onSave,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Tools state
  const [activeTool, setActiveTool] = useState<ToolMode>("pen");
  const [currentColor, setCurrentColor] = useState<string>("#f59e0b");
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [textInput, setTextInput] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(20);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Text labels placed on canvas
  const [textLabels, setTextLabels] = useState<TextLabel[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);

  // Image element ref
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Initialize canvas with background image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set internal resolution matching original image, bounded for high performance
      const maxDim = 1600;
      let width = img.width || 800;
      let height = img.height || 600;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Save initial snapshot
        const initialData = ctx.getImageData(0, 0, width, height);
        setHistory([initialData]);
        setHistoryIndex(0);
      }
    };
  }, [imageUrl]);

  // Helper to save current canvas state to history
  const pushHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.putImageData(history[prevIndex], 0, 0);
      setHistoryIndex(prevIndex);
    }
  };

  // Reset to original image
  const handleReset = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.putImageData(history[0], 0, 0);
    setHistory([history[0]]);
    setHistoryIndex(0);
    setTextLabels([]);
  };

  // Convert pointer event to canvas coordinates
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Start Drawing / Placing Tool
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoordinates(e);
    setStartPos(pos);
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (activeTool === "pen") {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = strokeWidth;
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = "source-over";
      } else if (activeTool === "highlighter") {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = strokeWidth * 3.5;
        ctx.globalAlpha = 0.35;
        ctx.globalCompositeOperation = "source-over";
      } else if (activeTool === "eraser") {
        // Redraw image under eraser area or erase
        ctx.lineWidth = strokeWidth * 4;
        ctx.globalAlpha = 1.0;
        // Draw image section over eraser line
        ctx.strokeStyle = "#ffffff";
        ctx.globalCompositeOperation = "destination-out";
      }
    } else if (activeTool === "text") {
      const labelText = textInput.trim() || "VERIFIED LABEL";
      drawTextOnCanvas(ctx, labelText, pos.x, pos.y, currentColor, fontSize);
      pushHistoryState();
      setIsDrawing(false);
    }
  };

  // Draw motion
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getCanvasCoordinates(e);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (activeTool === "rectangle") {
      // Preview rectangle by putting previous snapshot first
      if (historyIndex >= 0) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }
      ctx.beginPath();
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = currentColor;
      ctx.globalAlpha = 0.9;
      ctx.globalCompositeOperation = "source-over";
      const w = pos.x - startPos.x;
      const h = pos.y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, w, h);
    }
  };

  // Mouse Up / Finish stroke
  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = "source-over";
    pushHistoryState();
  };

  // Helper to render stylish badge text onto canvas
  const drawTextOnCanvas = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color: string,
    size: number
  ) => {
    ctx.save();
    ctx.font = `bold ${size}px sans-serif`;
    const metrics = ctx.measureText(text);
    const padding = Math.round(size * 0.4);
    const bgWidth = metrics.width + padding * 2;
    const bgHeight = size + padding * 1.2;

    // Draw dark rounded pill background
    ctx.fillStyle = "rgba(10, 15, 25, 0.85)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const rx = x - padding;
    const ry = y - size;

    ctx.beginPath();
    ctx.roundRect(rx, ry, bgWidth, bgHeight, 6);
    ctx.fill();
    ctx.stroke();

    // Draw Text
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // Quick stamp placement in center of canvas
  const handlePlaceStamp = (stampText: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2 - stampText.length * 5;
    const centerY = canvas.height / 2;

    drawTextOnCanvas(ctx, stampText, centerX, centerY, currentColor, 22);
    pushHistoryState();
  };

  // Bake annotations and return base64 string
  const handleSaveAndApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64Data = canvas.toDataURL("image/jpeg", 0.92);
    onSave(base64Data);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col p-3 md:p-6 text-white overflow-hidden animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Pencil className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                OCR Certificate Annotator
              </span>
              <span className="text-[10px] font-mono text-white/40">
                Mark, Highlight & Stamp Document
              </span>
            </div>
            <h2 className="text-base font-bold text-white">Document Mark & Annotation Canvas</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-white font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5"
            title="Undo last stroke"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5"
            title="Reset canvas to original image"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-xl transition cursor-pointer"
            title="Close editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Left Toolbar (3 cols) */}
        <div className="lg:col-span-3 space-y-4 bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Tool Selection */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">
                1. Select Tool
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTool("pen")}
                  className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                    activeTool === "pen"
                      ? "bg-amber-500 text-black border-amber-400 shadow-md"
                      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Pencil className="w-4 h-4" />
                  <span>Freehand Pen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool("highlighter")}
                  className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                    activeTool === "highlighter"
                      ? "bg-amber-500 text-black border-amber-400 shadow-md"
                      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Highlighter className="w-4 h-4" />
                  <span>Highlighter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool("text")}
                  className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                    activeTool === "text"
                      ? "bg-amber-500 text-black border-amber-400 shadow-md"
                      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Text Stamp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool("rectangle")}
                  className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                    activeTool === "rectangle"
                      ? "bg-amber-500 text-black border-amber-400 shadow-md"
                      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Square className="w-4 h-4" />
                  <span>Bounding Box</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool("eraser")}
                  className={`col-span-2 p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    activeTool === "eraser"
                      ? "bg-red-500 text-white border-red-400 shadow-md"
                      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Eraser className="w-4 h-4" />
                  <span>Eraser Tool</span>
                </button>
              </div>
            </div>

            {/* Custom Text Label Input */}
            {activeTool === "text" && (
              <div className="space-y-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                  Custom Label Text
                </span>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g. OFFICIAL STAMP"
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-mono"
                />
                <p className="text-[10px] text-white/40">
                  Click on canvas image where you wish to place this label.
                </p>
              </div>
            )}

            {/* Color Palette */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block flex items-center gap-1">
                <Palette className="w-3 h-3 text-amber-400" />
                2. Stroke Color
              </span>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((item) => (
                  <button
                    key={item.hex}
                    type="button"
                    onClick={() => setCurrentColor(item.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${
                      currentColor === item.hex
                        ? "border-amber-400 scale-110 shadow-lg"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: item.hex }}
                    title={item.name}
                  >
                    {currentColor === item.hex && (
                      <Check className={`w-3.5 h-3.5 ${item.hex === "#ffffff" ? "text-black" : "text-white"}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stroke Thickness slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-white/40">
                <span>3. Stroke Thickness</span>
                <span className="text-amber-400 font-mono">{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Quick Stamps */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" />
                Quick Statutory Stamps
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_STAMPS.map((stamp) => (
                  <button
                    key={stamp}
                    type="button"
                    onClick={() => handlePlaceStamp(stamp)}
                    className="px-2.5 py-1 bg-white/5 hover:bg-amber-500/20 hover:border-amber-500/40 border border-white/10 rounded-lg text-[10px] font-mono font-bold text-white/80 hover:text-amber-400 transition cursor-pointer"
                  >
                    + {stamp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Apply / Save Button */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xl hover:shadow-amber-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Save Annotations</span>
            </button>
            <p className="text-[10px] text-white/40 text-center font-mono">
              Bakes drawings into document image for OCR re-processing.
            </p>
          </div>
        </div>

        {/* Right Stage Viewport (9 cols) */}
        <div
          ref={containerRef}
          className="lg:col-span-9 bg-black/60 border border-white/10 rounded-2xl p-4 flex items-center justify-center relative overflow-auto select-none min-h-[350px]"
        >
          {!imageLoaded && (
            <div className="text-white/40 text-xs font-mono animate-pulse flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              Loading certificate image into annotator canvas...
            </div>
          )}

          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            className={`max-w-full max-h-[70vh] object-contain rounded-lg border border-white/10 shadow-2xl transition-all ${
              activeTool === "eraser"
                ? "cursor-cell"
                : activeTool === "text"
                ? "cursor-crosshair"
                : "cursor-crosshair"
            }`}
          />
        </div>
      </div>
    </div>
  );
};
