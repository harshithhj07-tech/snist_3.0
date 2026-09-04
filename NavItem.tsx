import React from "react";
import { NavConfigItem } from "./navConfig";
import { t } from "../../utils/translations";

interface NavItemProps {
  item: NavConfigItem;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
  isCollapsed?: boolean;
  isLightTheme?: boolean;
  userLanguage?: string;
}

export const NavItem: React.FC<NavItemProps> = ({
  item,
  isActive,
  onClick,
  badgeCount = 0,
  isCollapsed = false,
  isLightTheme = false,
  userLanguage = "English",
}) => {
  const Icon = item.icon;
  const label = t(item.labelKey, userLanguage) || item.defaultLabel;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      aria-label={`${label}${badgeCount > 0 ? `, ${badgeCount} items` : ""}`}
      title={isCollapsed ? `${label}${badgeCount > 0 ? ` (${badgeCount})` : ""}` : undefined}
      className={`relative w-full min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-medium flex items-center transition-all duration-150 cursor-pointer group focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
        isCollapsed ? "justify-center" : "gap-3"
      } ${
        isActive
          ? isLightTheme
            ? "bg-amber-100/80 text-amber-950 font-bold shadow-sm"
            : "bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
          : isLightTheme
          ? "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          : "text-white/60 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {/* Active Left Indicator Bar */}
      {isActive && (
        <span
          className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] ${
            isCollapsed ? "left-0.5" : "left-0"
          }`}
        />
      )}

      {/* Icon with active highlight */}
      <div className="relative flex items-center justify-center shrink-0">
        <Icon
          className={`w-4 h-4 transition-colors ${
            isActive
              ? "text-amber-500"
              : isLightTheme
              ? "text-slate-500 group-hover:text-slate-900"
              : "text-white/50 group-hover:text-white"
          }`}
        />

        {/* Collapsed Mode Badge dot/count */}
        {isCollapsed && badgeCount > 0 && (
          <span className="absolute -top-1.5 -right-2 px-1 py-0.2 min-w-[14px] h-[14px] text-[8px] font-mono font-bold bg-amber-500 text-black rounded-full flex items-center justify-center border border-black/40">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </div>

      {/* Label and Badge (Expanded Mode) */}
      {!isCollapsed && (
        <div className="flex-1 flex items-center justify-between min-w-0 text-left">
          <span className="truncate leading-tight tracking-wide">{label}</span>

          {badgeCount > 0 && (
            <span
              className={`ml-2 px-2 py-0.5 text-[9px] font-mono font-bold rounded-full transition-colors shrink-0 ${
                isActive
                  ? isLightTheme
                    ? "bg-amber-200 text-amber-900"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : isLightTheme
                  ? "bg-slate-200 text-slate-700"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </div>
      )}
    </button>
  );
};
