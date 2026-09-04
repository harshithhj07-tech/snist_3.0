import React from "react";
import { t } from "../../utils/translations";

interface NavSectionProps {
  labelKey: string;
  defaultLabel: string;
  isCollapsed?: boolean;
  isLightTheme?: boolean;
  userLanguage?: string;
}

export const NavSection: React.FC<NavSectionProps> = ({
  labelKey,
  defaultLabel,
  isCollapsed = false,
  isLightTheme = false,
  userLanguage = "English",
}) => {
  const title = t(labelKey, userLanguage) || defaultLabel;

  if (isCollapsed) {
    return <div className={`my-2 h-[1px] ${isLightTheme ? "bg-slate-200" : "bg-white/10"}`} />;
  }

  return (
    <div className="pt-3 pb-1 px-3">
      <span
        className={`text-[9.5px] uppercase tracking-widest font-mono font-bold block select-none ${
          isLightTheme ? "text-slate-400" : "text-white/35"
        }`}
      >
        {title}
      </span>
    </div>
  );
};
