import React from "react";
import { RoadmapData } from "../../types";
import { Route, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { t } from "../../utils/translations";

interface CurrentJourneyCardProps {
  activeRoadmap?: RoadmapData | null;
  onNavigate: (tab: string) => void;
  onResetGoal?: () => void;
  isCollapsed?: boolean;
  isLightTheme?: boolean;
  userLanguage?: string;
}

export const CurrentJourneyCard: React.FC<CurrentJourneyCardProps> = ({
  activeRoadmap,
  onNavigate,
  isCollapsed = false,
  isLightTheme = false,
  userLanguage = "English",
}) => {
  const hasGoal = !!(activeRoadmap && activeRoadmap.goal && activeRoadmap.goal.trim().length > 0);
  const percentage = activeRoadmap?.completionPercentage || 0;
  const isBlocked = activeRoadmap?.workflowStatus === "BLOCKED";
  const isCompleted = activeRoadmap?.workflowStatus === "COMPLETED" || percentage === 100;

  // Flatten all steps across phases
  const allSteps = activeRoadmap?.phases?.flatMap((p) => p.steps || []) || [];

  // Find next best step or action
  const currentStep = allSteps.find((s) => s.status === "IN_PROGRESS" || s.status === "BLOCKED" || s.status === "PENDING") ||
    allSteps.find((s) => !s.completed) ||
    allSteps[0];

  const rawNextAction = activeRoadmap?.nextBestAction || currentStep?.purpose || currentStep?.title || "Check document checklist";
  const nextAction = typeof rawNextAction === "string" ? rawNextAction : (rawNextAction as any)?.actionText || (rawNextAction as any)?.title || (rawNextAction as any)?.description || "Check document checklist";

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={() => onNavigate("roadmap")}
        title={hasGoal ? `Active Journey: ${activeRoadmap.goal} (${percentage}%)` : "Start a Citizen Journey with AI"}
        className={`w-full p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
          hasGoal
            ? isLightTheme
              ? "bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
            : isLightTheme
            ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
        }`}
      >
        <Route className="w-4 h-4 text-amber-500" />
        <span className="text-[9px] font-mono font-bold">{hasGoal ? `${percentage}%` : "AI"}</span>
      </button>
    );
  }

  if (!hasGoal) {
    return (
      <div
        className={`p-3.5 rounded-2xl border transition-all text-left space-y-2.5 ${
          isLightTheme
            ? "bg-gradient-to-br from-amber-50/60 to-slate-100/80 border-amber-200/80 shadow-sm"
            : "bg-gradient-to-br from-amber-500/10 via-[#0d1117] to-black/80 border-amber-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-amber-500 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {t("nav.startJourney", userLanguage) || "START A JOURNEY"}
          </span>
        </div>

        <p className={`text-xs font-medium leading-snug ${isLightTheme ? "text-slate-800" : "text-white/90"}`}>
          Tell Bharat Navigator what government service or application you need to navigate.
        </p>

        <button
          type="button"
          onClick={() => onNavigate("assistant")}
          className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer group focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <span>{t("nav.startWithAI", userLanguage) || "Start with AI"}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all text-left space-y-2.5 ${
        isBlocked
          ? isLightTheme
            ? "bg-red-50/90 border-red-200"
            : "bg-red-950/20 border-red-500/30"
          : isCompleted
          ? isLightTheme
            ? "bg-emerald-50/90 border-emerald-200"
            : "bg-emerald-950/20 border-emerald-500/30"
          : isLightTheme
          ? "bg-gradient-to-br from-amber-50/90 to-amber-100/30 border-amber-200/90 shadow-sm"
          : "bg-gradient-to-br from-amber-500/10 via-[#0d121c] to-[#07090e] border-amber-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      }`}
    >
      {/* Header status badge */}
      <div className="flex items-center justify-between">
        <span
          className={`text-[9px] font-mono font-bold tracking-widest uppercase flex items-center gap-1.5 ${
            isBlocked
              ? "text-red-500"
              : isCompleted
              ? "text-emerald-500"
              : "text-amber-500"
          }`}
        >
          {isBlocked ? (
            <>
              <AlertCircle className="w-3 h-3 text-red-500" />
              BLOCKED
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              COMPLETED
            </>
          ) : (
            <>
              <Route className="w-3 h-3 text-amber-500" />
              {t("nav.currentJourney", userLanguage) || "CURRENT JOURNEY"}
            </>
          )}
        </span>

        <span className="text-xs font-mono font-bold text-amber-500">{percentage}%</span>
      </div>

      {/* Goal Title */}
      <div className="space-y-1">
        <h3 className={`text-xs font-bold leading-tight line-clamp-2 ${isLightTheme ? "text-slate-900" : "text-white"}`}>
          {activeRoadmap.goal}
        </h3>

        {nextAction && (
          <p className={`text-[10.5px] line-clamp-2 leading-relaxed ${isLightTheme ? "text-slate-600" : "text-white/70"}`}>
            <span className="font-semibold text-amber-500/90">Next: </span>
            {nextAction}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLightTheme ? "bg-slate-200" : "bg-white/10"}`}>
        <div
          className={`h-full transition-all duration-500 ${
            isBlocked
              ? "bg-red-500"
              : isCompleted
              ? "bg-emerald-500"
              : "bg-gradient-to-r from-amber-500 to-amber-400"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      {/* Action CTA */}
      <button
        type="button"
        onClick={() => onNavigate("roadmap")}
        className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-amber-500 ${
          isBlocked
            ? "bg-red-500 hover:bg-red-400 text-white"
            : isCompleted
            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
            : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
        }`}
      >
        <span>
          {isBlocked
            ? "Resolve Blocker →"
            : isCompleted
            ? "View Summary →"
            : t("nav.continueJourney", userLanguage) || "Continue journey →"}
        </span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
};
