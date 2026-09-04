import React from "react";
import { ExplainabilityPayload } from "../types";
import { ShieldCheck, HelpCircle, ExternalLink, CheckCircle2, AlertTriangle, FileText, X, ChevronRight, User, Database } from "lucide-react";

interface WhyAmISeeingThisModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: ExplainabilityPayload | null;
  isLightTheme?: boolean;
}

export const WhyAmISeeingThisModal: React.FC<WhyAmISeeingThisModalProps> = ({
  isOpen,
  onClose,
  payload,
  isLightTheme = false
}) => {
  if (!isOpen || !payload) return null;

  const isHighConfidence = payload.confidenceState.level === "HIGH";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className={`border rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl relative ${
        isLightTheme
          ? "bg-white border-slate-200 text-slate-900"
          : "bg-[#0c1017] border-cyan-500/30 text-white"
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> Explainability Engine
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                isHighConfidence ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {payload.confidenceState.level} CONFIDENCE
              </span>
            </div>
            <h3 className="text-base font-bold font-display">{payload.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Why Recommended Statement */}
        <div className={`p-4 rounded-xl border space-y-1.5 ${
          isLightTheme ? "bg-cyan-50/50 border-cyan-200" : "bg-cyan-500/10 border-cyan-500/20"
        }`}>
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
            Why was this recommended to you?
          </span>
          <p className="text-xs leading-relaxed">{payload.whyRecommended}</p>
        </div>

        {/* 2. Citizen Data Points Used */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-wider block flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Citizen Data Evaluated ({payload.dataPointsUsed.length} Data Points)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {payload.dataPointsUsed.map((dp, idx) => (
              <div key={idx} className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                isLightTheme ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10"
              }`}>
                <span className="text-[10px] text-white/40">{dp.label}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-white">{dp.value}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-semibold">{dp.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Official Government Gazette Source */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-wider block flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Official Verified Government Gazette Source
          </span>
          <div className={`p-3.5 rounded-xl border space-y-2 text-xs font-mono ${
            isLightTheme ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10"
          }`}>
            <div className="flex justify-between items-start gap-2">
              <span className="font-bold text-amber-400">{payload.officialSource.title}</span>
              <span className="text-[10px] text-white/40">{payload.officialSource.clauseReference}</span>
            </div>
            <p className="text-[11px] text-white/60">{payload.officialSource.department}</p>
            <a
              href={payload.officialSource.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1 pt-1 font-bold"
            >
              <span>View Gazette Reference ({payload.officialSource.sourceUrl})</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* 4. Missing Gaps & Next Steps */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-wider block flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            Requirements Status & Action Plan
          </span>

          {payload.missingGaps.length > 0 ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1 text-xs font-mono text-rose-300">
              <span className="font-bold block text-[10px] uppercase">Gaps to Address for 100% Qualification:</span>
              <ul className="list-disc list-inside space-y-1">
                {payload.missingGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs font-mono text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Zero requirement gaps. You satisfy 100% of prerequisite criteria.</span>
            </div>
          )}

          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-mono text-white/40 uppercase block">Recommended Next Steps:</span>
            {payload.nextSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-mono text-white/80">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl transition cursor-pointer shadow-lg"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
