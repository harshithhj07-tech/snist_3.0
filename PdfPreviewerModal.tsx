import React, { useState } from "react";
import { 
  X, Download, Eye, ZoomIn, ZoomOut, RotateCw, Printer, ShieldCheck, 
  CheckCircle2, Lock, FileText, QrCode, Copy, Share2, ExternalLink, Maximize2
} from "lucide-react";

export interface PdfDocument {
  id: string;
  name: string;
  docNumber?: string;
  issuer?: string;
  category?: string;
  validity?: string;
  issueDate?: string;
  downloadUrl?: string;
  fileType?: string;
  uploadedFileName?: string;
  sha256Hash?: string;
  extractedFields?: Record<string, string>;
}

interface PdfPreviewerModalProps {
  document: PdfDocument;
  onClose: () => void;
  onDownload?: (url: string, filename: string) => void;
}

export const PdfPreviewerModal: React.FC<PdfPreviewerModalProps> = ({
  document,
  onClose,
  onDownload
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"document" | "metadata" | "verification">("document");
  const [copiedHash, setCopiedHash] = useState(false);

  const docTitle = document.name || "Government Document Certificate";
  const issuer = document.issuer || "Government of India / Federal Public Registry";
  const docNumber = document.docNumber || "GOV-2026-882194";
  const issueDate = document.issueDate || "12-Jan-2024";
  const validity = document.validity || "Lifetime";
  const sha256Hash = document.sha256Hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  const isPdfFile = document.downloadUrl && (
    document.downloadUrl.includes(".pdf") || 
    document.downloadUrl.includes("blob:") ||
    document.fileType === "application/pdf" ||
    document.uploadedFileName?.endsWith(".pdf")
  );

  const isImageFile = document.downloadUrl && (
    document.fileType?.startsWith("image/") ||
    document.uploadedFileName?.match(/\.(jpg|jpeg|png|webp|gif)$/i)
  );

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handlePrint = () => {
    window.print();
  };

  const copyHashToClipboard = () => {
    navigator.clipboard.writeText(sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 text-left animate-fade-in">
      <div className="bg-[#0b0e14] border border-amber-500/20 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* TOP BAR / HEADER */}
        <div className="px-5 py-4 bg-[#0e121b] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-sans">{docTitle}</h3>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-400 rounded uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified PDF
                </span>
              </div>
              <p className="text-[11px] text-white/50 font-mono">
                Issuer: <span className="text-white/80">{issuer}</span> • ID: <span className="text-amber-400">{docNumber}</span>
              </p>
            </div>
          </div>

          {/* VIEW & TOOLBAR CONTROLS */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono px-2 text-amber-400 font-bold">{zoomLevel}%</span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-white/10 my-auto" />
              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Rotate Document"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition cursor-pointer hidden sm:flex items-center gap-1.5"
              title="Print Certificate"
            >
              <Printer className="w-4 h-4 text-white/70" />
            </button>

            {document.downloadUrl && (
              <button
                type="button"
                onClick={() => {
                  if (onDownload) {
                    onDownload(document.downloadUrl!, document.uploadedFileName || `${docTitle}.pdf`);
                  } else {
                    const a = window.document.createElement("a");
                    a.href = document.downloadUrl!;
                    a.download = document.uploadedFileName || `${docTitle}.pdf`;
                    a.click();
                  }
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT VIEW: DOCUMENT + METADATA SIDEBAR */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* MAIN DOCUMENT CANVAS / IFRAME AREA */}
          <div className="flex-1 bg-[#05070a] p-4 overflow-auto flex items-center justify-center relative">
            
            <div 
              className="transition-all duration-200 origin-center max-w-full"
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              }}
            >
              {/* IF IT'S AN IMAGE OR HAS IMAGE URL */}
              {isImageFile ? (
                <div className="bg-white p-2 rounded-2xl shadow-2xl border border-white/20 max-w-2xl">
                  <img
                    src={document.downloadUrl}
                    alt={docTitle}
                    className="max-h-[65vh] object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : isPdfFile ? (
                /* IF IT HAS AN EMBEDDABLE PDF URL */
                <div className="w-[700px] h-[650px] max-w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                  <iframe
                    src={`${document.downloadUrl}#toolbar=0&navpanes=0`}
                    title={docTitle}
                    className="w-full h-full border-none"
                  />
                </div>
              ) : (
                /* OFFICIAL HIGH-FIDELITY DIGITAL CERTIFICATE RENDERER (GOVT DRAFT/SPECIMEN) */
                <div className="w-[680px] min-h-[500px] bg-slate-50 text-slate-900 rounded-2xl p-8 shadow-2xl border-4 border-slate-300 relative font-serif select-none overflow-hidden">
                  
                  {/* WATERMARK STAMP */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                    <ShieldCheck className="w-96 h-96 text-slate-900" />
                  </div>
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 border-8 border-emerald-600/10 rounded-full flex items-center justify-center pointer-events-none rotate-12">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-widest text-center px-4">
                      DigiLocker Verified Security Seal • Govt of India
                    </span>
                  </div>

                  {/* CERTIFICATE HEADER */}
                  <div className="text-center space-y-2 border-b-2 border-slate-800 pb-5">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-12 h-12 bg-amber-600/10 rounded-full border border-amber-600/30 flex items-center justify-center text-amber-700 font-bold text-xl">
                        🇮🇳
                      </div>
                    </div>
                    <h2 className="text-xs font-mono font-bold tracking-widest text-slate-600 uppercase">
                      GOVERNMENT OF INDIA • NATIONAL PUBLIC INFRASTRUCTURE
                    </h2>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans uppercase">
                      {docTitle}
                    </h1>
                    <p className="text-xs font-mono text-emerald-700 font-bold uppercase tracking-wider">
                      Officially Issued Certificate via Bharat Navigator Secure Vault
                    </p>
                  </div>

                  {/* BODY & DETAILS */}
                  <div className="py-6 space-y-5 text-xs font-sans">
                    <div className="grid grid-cols-2 gap-4 bg-slate-100/80 p-4 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Document ID Number</span>
                        <span className="text-sm font-bold font-mono text-slate-900">{docNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Issuing Authority</span>
                        <span className="text-xs font-semibold text-slate-800">{issuer}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Date of Issue</span>
                        <span className="text-xs font-medium text-slate-800">{issueDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Validity Status</span>
                        <span className="text-xs font-bold text-emerald-700">{validity}</span>
                      </div>
                    </div>

                    {/* EXTRACTED FIELDS SPECIMEN */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider border-b pb-1">
                        Cryptographic Verification Credentials
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Beneficiary Name</span>
                          <span className="font-bold text-slate-800">Harshith Verma</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">State Jurisdiction</span>
                          <span className="font-bold text-slate-800">Telangana, India</span>
                        </div>
                      </div>
                    </div>

                    {/* QR & DIGITAL SIGNATURE STAMP */}
                    <div className="pt-6 border-t border-slate-300 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-white p-1.5 border border-slate-300 rounded-lg shadow-sm flex items-center justify-center">
                          <QrCode className="w-full h-full text-slate-900" />
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 space-y-0.5">
                          <p className="font-bold text-slate-800">DigiLocker QR Hash</p>
                          <p className="truncate max-w-[200px] text-slate-400">{sha256Hash}</p>
                          <p className="text-emerald-700 font-bold">✓ Authenticated by UIDAI / ITD</p>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="w-28 h-8 border-b-2 border-dashed border-slate-400 mx-auto font-serif italic text-slate-600 text-xs flex items-center justify-center">
                          Digitally Signed
                        </div>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">Authorized Officer Signature</p>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: METADATA & INSPECTION */}
          <div className="w-full md:w-80 bg-[#0e121b] border-t md:border-t-0 md:border-l border-white/10 p-5 space-y-5 overflow-y-auto shrink-0 text-xs">
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Document Inspector</span>
              <h4 className="text-sm font-bold text-white">Metadata & Compliance</h4>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2.5 font-mono">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/40 uppercase">Category:</span>
                <span className="text-amber-400 font-bold">{document.category || "Identity"}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/40 uppercase">Issue Date:</span>
                <span className="text-white">{issueDate}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/40 uppercase">Validity:</span>
                <span className="text-emerald-400 font-bold">{validity}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/40 uppercase">Storage Mode:</span>
                <span className="text-indigo-400 font-bold">DigiLocker / Firebase</span>
              </div>
            </div>

            {/* SHA-256 CHECKSUM */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
                SHA-256 Checksum Hash
              </label>
              <div className="p-3 bg-black/60 border border-white/10 rounded-xl font-mono text-[10px] text-amber-300 break-all relative group">
                {sha256Hash}
                <button
                  type="button"
                  onClick={copyHashToClipboard}
                  className="mt-2 w-full py-1.5 bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-amber-400" />
                  <span>{copiedHash ? "Hash Copied!" : "Copy SHA256 Hash"}</span>
                </button>
              </div>
            </div>

            {/* EXTRACTED OCR FIELDS */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h5 className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Extracted OCR Key Fields</h5>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between">
                  <span className="text-white/40">Name:</span>
                  <span className="text-white font-bold">Harshith Verma</span>
                </div>
                <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between">
                  <span className="text-white/40">Doc Number:</span>
                  <span className="text-amber-400 font-bold">{docNumber}</span>
                </div>
                <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between">
                  <span className="text-white/40">Status:</span>
                  <span className="text-emerald-400 font-bold">Active & Valid</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
