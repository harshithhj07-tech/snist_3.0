import React, { useState, useRef } from "react";
import { Camera, Upload, Check, RefreshCw, X, User, Image as ImageIcon } from "lucide-react";
import { t } from "../utils/translations";
import { compressImageToDataUrl } from "../utils/imageUtils";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (photoUrl: string) => void;
  language?: string;
  isLightTheme?: boolean;
}

// Preset realistic Indian citizen avatars
export const PRESET_CITIZEN_AVATARS = [
  {
    id: "avatar_1",
    label: "Male Citizen",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "avatar_2",
    label: "Female Professional",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "avatar_3",
    label: "MSME Entrepreneur",
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "avatar_4",
    label: "Senior Citizen",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "avatar_5",
    label: "Student / Youth",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "avatar_6",
    label: "Farmer / Agriculture Specialist",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
  }
];

export function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoChange,
  language = "English",
  isLightTheme = false
}: ProfilePhotoUploadProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Handle File Upload via Input
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit. Please select a smaller photo.");
        return;
      }
      try {
        const compressedUrl = await compressImageToDataUrl(file, 200, 200, 0.75);
        onPhotoChange(compressedUrl);
      } catch (err) {
        console.warn("Error compressing selected photo file:", err);
      }
    }
  };

  // Start Web Camera Feed
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      mediaStreamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError("Camera access was declined or unavailable. Please upload a photo or pick a preset avatar.");
    }
  };

  // Stop Camera Feed
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Snapshot from Camera
  const captureSnapshot = async () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      // Scale down canvas directly to 200x200 square thumbnail for fast rendering & low size
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, 200, 200);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        onPhotoChange(dataUrl);
        stopCamera();
      }
    }
  };

  return (
    <div className={`p-4 rounded-2xl border space-y-4 ${
      isLightTheme ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10"
    }`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div>
          <h4 className={`text-xs font-bold uppercase tracking-wider ${
            isLightTheme ? "text-slate-900" : "text-amber-400"
          }`}>
            {t("photo.uploadHeading", language)}
          </h4>
          <p className={`text-[11px] ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
            {t("photo.uploadDesc", language)}
          </p>
        </div>
      </div>

      {/* Main Preview & Action Area */}
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Photo Display Frame */}
        <div className="relative group flex-shrink-0">
          <div className={`w-28 h-28 rounded-2xl overflow-hidden border-2 flex items-center justify-center shadow-lg transition-all ${
            currentPhotoUrl
              ? "border-amber-500 bg-black/60"
              : isLightTheme ? "border-slate-300 bg-white" : "border-white/20 bg-white/5"
          }`}>
            {currentPhotoUrl ? (
              <img
                src={currentPhotoUrl}
                alt="Citizen Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 text-slate-400 p-2 text-center">
                <User className="w-8 h-8 text-amber-500/70" />
                <span className="text-[10px] font-semibold">No Photo</span>
              </div>
            )}
          </div>

          {currentPhotoUrl && (
            <div className="absolute -bottom-2 -right-1 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>OK</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 space-y-2 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Upload File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                isLightTheme
                  ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm"
                  : "bg-white/10 border-white/15 text-white hover:bg-white/20"
              }`}
            >
              <Upload className="w-4 h-4 text-amber-500" />
              <span>{t("photo.uploadFile", language)}</span>
            </button>

            {/* Camera Capture Toggle */}
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{t("photo.takeCamera", language)}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="p-2.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>{t("photo.closeCamera", language)}</span>
              </button>
            )}
          </div>

          {currentPhotoUrl && (
            <button
              type="button"
              onClick={() => onPhotoChange("")}
              className="text-[11px] text-red-400 hover:text-red-300 font-semibold underline cursor-pointer pt-1 block"
            >
              {t("photo.remove", language)}
            </button>
          )}

          {cameraError && (
            <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              {cameraError}
            </p>
          )}
        </div>
      </div>

      {/* Camera Live View Box */}
      {isCameraActive && (
        <div className="space-y-3 p-3 bg-black/80 rounded-xl border border-amber-500/40">
          <div className="relative aspect-video max-h-48 rounded-lg overflow-hidden bg-black border border-white/10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={captureSnapshot}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
          >
            <Camera className="w-4 h-4" />
            <span>{t("photo.capture", language)}</span>
          </button>
        </div>
      )}

      {/* Preset Realistic Avatars Section */}
      <div className="space-y-2 pt-1 border-t border-white/10">
        <label className={`text-[11px] font-semibold block ${
          isLightTheme ? "text-slate-700" : "text-white/70"
        }`}>
          {t("photo.selectAvatar", language)}:
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESET_CITIZEN_AVATARS.map((avatar) => {
            const isSelected = currentPhotoUrl === avatar.url;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => onPhotoChange(avatar.url)}
                className={`group p-1.5 rounded-xl border text-center transition cursor-pointer relative ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/30"
                    : isLightTheme ? "border-slate-200 bg-white hover:border-amber-500/40" : "border-white/10 bg-black/40 hover:border-amber-500/40"
                }`}
                title={avatar.label}
              >
                <img
                  src={avatar.url}
                  alt={avatar.label}
                  className="w-10 h-10 rounded-lg object-cover mx-auto"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[9px] block font-medium truncate mt-1 text-white/70">
                  {avatar.label}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 bg-amber-500 text-black rounded-full p-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
