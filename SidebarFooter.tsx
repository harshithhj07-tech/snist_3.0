import React from "react";
import { Sun, Moon, Search, PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface SidebarFooterProps {
  isLightTheme: boolean;
  onToggleTheme: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenQuickAction: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isLightTheme,
  onToggleTheme,
  isCollapsed,
  onToggleCollapse,
  onOpenQuickAction,
}) => {
  return (
    <div
      className={`p-3 border-t flex items-center justify-between gap-2 shrink-0 ${
        isLightTheme ? "border-slate-300 bg-slate-200/40" : "border-white/10 bg-black/20"
      }`}
    >
      {/* Quick Search Cmd+K Trigger */}
      {!isCollapsed ? (
        <button
          type="button"
          onClick={onOpenQuickAction}
          className={`flex-1 px-2.5 py-1.5 rounded-xl text-[10px] font-mono flex items-center justify-between border transition cursor-pointer ${
            isLightTheme
              ? "bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300/80"
              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
          title="Open Quick Search (Ctrl+K / Cmd+K)"
          aria-label="Open Quick Search"
        >
          <span className="flex items-center gap-1.5 truncate">
            <Search className="w-3 h-3 text-amber-500" />
            <span>Search...</span>
          </span>
          <kbd className="px-1 py-0.2 bg-black/20 text-[8px] rounded border border-white/10 shrink-0 font-mono">
            ⌘K
          </kbd>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenQuickAction}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            isLightTheme
              ? "bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300"
              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
          }`}
          title="Quick Search (Ctrl+K / Cmd+K)"
          aria-label="Quick Search"
        >
          <Search className="w-4 h-4 text-amber-500" />
        </button>
      )}

      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={onToggleTheme}
        className={`p-2 rounded-xl border transition cursor-pointer ${
          isLightTheme
            ? "bg-slate-200 border-slate-300 text-amber-600 hover:bg-slate-300"
            : "bg-white/5 border-white/10 text-amber-400 hover:bg-white/10"
        }`}
        title={`Switch to ${isLightTheme ? "Dark" : "Light"} Mode`}
        aria-label={`Switch to ${isLightTheme ? "Dark" : "Light"} Mode`}
      >
        {isLightTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      {/* Collapse/Expand Sidebar Toggle (Desktop Only) */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className={`hidden lg:flex p-2 rounded-xl border transition cursor-pointer ${
          isLightTheme
            ? "bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300"
            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
        }`}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
      </button>
    </div>
  );
};
