import React from "react";
import { Clock, ShieldAlert, RefreshCw, LogOut } from "lucide-react";

interface SessionTimeoutBannerProps {
  showWarning: boolean;
  secondsRemaining: number;
  onExtendSession: () => void;
  onLogout: () => void;
}

export function SessionTimeoutBanner({
  showWarning,
  secondsRemaining,
  onExtendSession,
  onLogout
}: SessionTimeoutBannerProps) {
  if (!showWarning) return null;

  const formattedSeconds = String(secondsRemaining).padStart(2, "0");

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-xl w-[92%] bg-[#0f1218]/95 border-2 border-amber-500/80 backdrop-blur-md rounded-2xl p-4 shadow-2xl shadow-amber-500/20 text-left space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
              Inactivity Timeout Warning
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">
              Session Expiring Soon
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl font-mono text-xs font-bold text-amber-300 shrink-0">
          <Clock className="w-4 h-4 text-amber-400 animate-spin" />
          <span>00:{formattedSeconds}s</span>
        </div>
      </div>

      <p className="text-xs text-white/80 leading-relaxed pl-1">
        For your security on Bharat Navigator, your session will automatically terminate after 30 minutes of inactivity. Click below to extend your session.
      </p>

      <div className="flex items-center justify-end gap-2.5 pt-1 border-t border-white/10">
        <button
          type="button"
          onClick={onLogout}
          className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-mono text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out Now</span>
        </button>

        <button
          type="button"
          onClick={onExtendSession}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Extend Session</span>
        </button>
      </div>
    </div>
  );
}
