import React from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  isLightTheme: boolean;
  onToggleTheme: () => void;
}

export function ThemeToggle({ isLightTheme, onToggleTheme }: ThemeToggleProps) {
  return (
    <div 
      id="theme-toggle-button"
      className={`inline-flex items-center p-1 rounded-xl border text-xs font-mono transition select-none ${
        isLightTheme 
          ? "bg-slate-200/80 border-slate-300" 
          : "bg-black/40 border-white/10"
      }`}
    >
      <button
        type="button"
        onClick={() => { if (!isLightTheme) onToggleTheme(); }}
        className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
          isLightTheme 
            ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
            : "text-white/50 hover:text-white"
        }`}
        title="Switch to Light Theme"
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => { if (isLightTheme) onToggleTheme(); }}
        className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
          !isLightTheme 
            ? "bg-slate-800 text-amber-400 shadow-sm border border-white/10" 
            : "text-slate-600 hover:text-slate-900"
        }`}
        title="Switch to Dark Theme"
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </button>
    </div>
  );
}

