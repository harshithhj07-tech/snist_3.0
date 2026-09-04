import React, { useEffect, useState } from "react";
import { 
  MessageSquare, 
  BadgePercent, 
  Files, 
  Route, 
  MapPin, 
  Bell, 
  X, 
  Compass, 
  Search, 
  ArrowRight 
} from "lucide-react";
import { t } from "../../utils/translations";

interface QuickActionPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  isLightTheme?: boolean;
  userLanguage?: string;
}

export const QuickActionPalette: React.FC<QuickActionPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  isLightTheme = false,
  userLanguage = "English",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Global Ctrl/Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via custom event or direct state toggle in parent if passed
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: "assistant",
      title: "Ask Bharat Navigator",
      desc: "Get instant AI roadmap and policy guidance",
      icon: MessageSquare,
      color: "text-cyan-400 bg-cyan-500/10",
      tab: "assistant",
    },
    {
      id: "eligibility",
      title: "Check Eligibility",
      desc: "Verify central and state scheme eligibility",
      icon: BadgePercent,
      color: "text-emerald-400 bg-emerald-500/10",
      tab: "eligibility",
    },
    {
      id: "documents",
      title: "Upload & Verify Documents",
      desc: "Manage vault documents and OCR extractions",
      icon: Files,
      color: "text-indigo-400 bg-indigo-500/10",
      tab: "documents",
    },
    {
      id: "roadmap",
      title: "Continue Current Journey",
      desc: "Review roadmap steps and next best actions",
      icon: Route,
      color: "text-amber-400 bg-amber-500/10",
      tab: "roadmap",
    },
    {
      id: "office-locator",
      title: "Find Nearest Government Office",
      desc: "Locate Tehsildar, e-District & Seva Kendras",
      icon: MapPin,
      color: "text-rose-400 bg-rose-500/10",
      tab: "office-locator",
    },
    {
      id: "notifications",
      title: "View Notifications & Alerts",
      desc: "Check SLA deadlines, updates, and document alerts",
      icon: Bell,
      color: "text-amber-400 bg-amber-500/10",
      tab: "notifications",
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div
        className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden z-10 transition-all ${
          isLightTheme ? "bg-white border-slate-300" : "bg-[#0d1017] border-white/20 text-white"
        }`}
      >
        {/* Search Header */}
        <div className={`p-4 border-b flex items-center gap-3 ${isLightTheme ? "border-slate-200 bg-slate-50" : "border-white/10 bg-black/20"}`}>
          <Search className="w-5 h-5 text-amber-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type a service, command, or action..."
            autoFocus
            className={`w-full bg-transparent text-sm font-medium focus:outline-none ${
              isLightTheme ? "text-slate-900 placeholder:text-slate-400" : "text-white placeholder:text-white/40"
            }`}
          />
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition ${
              isLightTheme ? "bg-slate-200 border-slate-300 text-slate-700" : "bg-white/10 border-white/10 text-white/70"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filtered.length > 0 ? (
            filtered.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    onNavigate(action.tab);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition cursor-pointer group border ${
                    isLightTheme
                      ? "border-transparent hover:bg-amber-50/80 hover:border-amber-200 text-slate-800"
                      : "border-transparent hover:bg-white/[0.05] hover:border-white/10 text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-snug">{action.title}</h4>
                      <p className={`text-[10.5px] ${isLightTheme ? "text-slate-500" : "text-white/50"}`}>{action.desc}</p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-white/50 font-mono">
              No matching commands or actions found.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className={`px-4 py-2.5 border-t text-[10px] font-mono flex items-center justify-between ${isLightTheme ? "border-slate-200 bg-slate-100 text-slate-500" : "border-white/10 bg-black/40 text-white/40"}`}>
          <span className="flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-amber-500" />
            Bharat Navigator Quick Actions
          </span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
