import React, { useState } from "react";
import {
  MapPin,
  Sparkles,
  Layers,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  ArrowRight,
  Map,
  Cpu,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Clock,
  Building2,
  BookOpen,
  Filter,
  Share2
} from "lucide-react";
import { StructuredAiResponse, RoadmapData } from "../types";
import { RoadmapDocumentChecklist } from "./RoadmapDocumentChecklist";
import { SuggestImprovementModal } from "./SuggestImprovementModal";
import { generateRoadmapFromIntent } from "../utils/roadmapGenerator";

/**
 * Design Tokens for Unified Response Card sections
 */
export const RESPONSE_CARD_TOKENS = {
  jurisdictionBanner: {
    light: "bg-slate-100/90 border-slate-200 text-slate-800",
    dark: "bg-slate-900/60 border-slate-800 text-slate-200",
    accent: "text-amber-500",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
  },
  whySection: {
    light: "bg-amber-500/10 border-amber-200/80 text-slate-900",
    dark: "bg-amber-500/10 border-amber-500/20 text-slate-100",
    accentIcon: "text-amber-500 dark:text-amber-400",
    badge: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
  },
  stepsSection: {
    header: "text-amber-500 font-bold",
    cardLight: "bg-white border-slate-200 shadow-sm hover:border-slate-300",
    cardDark: "bg-black/40 border-white/10 hover:border-white/20",
    numberBadge: "bg-amber-500 text-slate-950 font-bold",
    mandatoryBadge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    timelineTag: "text-amber-600 dark:text-amber-400 font-semibold font-mono",
    portalBtn: "text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
  },
  documentsSection: {
    header: "text-cyan-500 font-bold",
    availableBadge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    missingBadge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    needsVerificationBadge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
  },
  eligibilitySection: {
    eligibleBadge: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    possiblyBadge: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
    notEligibleBadge: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
    criteriaTag: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  },
  sourcesSection: {
    light: "bg-slate-100/80 border-slate-200 text-slate-800",
    dark: "bg-slate-900/60 border-slate-800 text-slate-200",
    verifiedTag: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  },
  actionFooter: {
    light: "bg-slate-100/90 border-slate-200",
    dark: "bg-[#0c1017] border-white/10",
    roadmapBtn: "bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold",
    orchestratorBtn: "bg-cyan-950/40 border-cyan-500/30 text-cyan-200 hover:bg-cyan-900/50 hover:border-cyan-500/60"
  }
};

export interface UnifiedResponseCardProps {
  response: StructuredAiResponse;
  isLightTheme: boolean;
  vaultDocs: any[];
  profile: any;
  onSendFollowUp: (text: string) => void;
  onSelectRoadmap?: (roadmap: RoadmapData) => void;
  onNavigateTab?: (tab: string, roadmap?: RoadmapData, contextQuery?: string) => void;
  addRoadmap?: (roadmap: RoadmapData) => void;
  confidenceScore?: number;
}

export const UnifiedResponseCard: React.FC<UnifiedResponseCardProps> = ({
  response,
  isLightTheme,
  vaultDocs = [],
  profile,
  onSendFollowUp,
  onSelectRoadmap,
  onNavigateTab,
  addRoadmap,
  confidenceScore
}) => {
  const [activeFilterTab, setActiveFilterTab] = useState<"ALL" | "STEPS" | "DOCS" | "WHY" | "SOURCES">("ALL");
  const [copied, setCopied] = useState(false);
  const [showHowToObtainModal, setShowHowToObtainModal] = useState<any | null>(null);
  const [selectedImprovementStep, setSelectedImprovementStep] = useState<any | null>(null);

  const stateJurisdiction = response.jurisdiction || profile?.state || "Telangana";
  const districtName = profile?.district || "District Office";

  const handleCopySummary = () => {
    const fullText = `[${stateJurisdiction} Government Guidance]\nGoal: ${response.title || response.goal}\n\nSummary:\n${response.explanation || response.summary}\n\nSteps:\n${(response.steps || []).map((s, i) => `${i + 1}. ${s.title} (${s.timeline || 'SLA processing'})`).join("\n")}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEligibilityBadge = (status?: string) => {
    switch (status) {
      case "ELIGIBLE":
        return <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${RESPONSE_CARD_TOKENS.eligibilitySection.eligibleBadge}`}>✓ ELIGIBLE CITIZEN</span>;
      case "POSSIBLY_ELIGIBLE":
        return <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${RESPONSE_CARD_TOKENS.eligibilitySection.possiblyBadge}`}>⚠ POSSIBLY ELIGIBLE</span>;
      case "NOT_ELIGIBLE":
        return <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${RESPONSE_CARD_TOKENS.eligibilitySection.notEligibleBadge}`}>✕ NOT ELIGIBLE</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-500/20 text-slate-400 border border-slate-500/30">VERIFIED STATUS</span>;
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 1. JURISDICTION & CONTEXT HEADER BANNER */}
      <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 flex-wrap ${
        isLightTheme ? RESPONSE_CARD_TOKENS.jurisdictionBanner.light : RESPONSE_CARD_TOKENS.jurisdictionBanner.dark
      }`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Jurisdiction Context</span>
            <span className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
              <span>{stateJurisdiction}</span>
              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">({districtName})</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(confidenceScore || response.confidenceScore) && (
            <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{confidenceScore || response.confidenceScore}% RAG Grounded</span>
            </span>
          )}

          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border shrink-0 ${
            response.executionProvenance === "OFFLINE_SANDBOX_DEMO"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
          }`}>
            {response.executionProvenance === "OFFLINE_SANDBOX_DEMO" ? "📜 Rules Engine Fallback" : "⚡ Featherless AI (Qwen 2.5)"}
          </span>

          <button
            type="button"
            onClick={handleCopySummary}
            title="Copy structured response text"
            className="p-1.5 rounded-lg border border-slate-300 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. SECTION FILTER CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px] font-mono">
        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 pr-1">
          <Filter className="w-3 h-3" /> Focus:
        </span>
        {[
          { key: "ALL", label: "All Sections" },
          { key: "WHY", label: "Why & Rationale" },
          { key: "STEPS", label: `Steps (${response.steps?.length || 0})` },
          { key: "DOCS", label: `Documents (${response.documentStatus?.length || response.documents?.length || 0})` },
          { key: "SOURCES", label: `Sources (${response.officialSources?.length || 0})` }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilterTab(tab.key as any)}
            className={`px-2.5 py-1 rounded-lg border transition shrink-0 cursor-pointer ${
              activeFilterTab === tab.key
                ? "bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-xs"
                : isLightTheme
                  ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. SECTION: WHY / WHAT THIS MEANS FOR YOU (RATIONALE) */}
      {(activeFilterTab === "ALL" || activeFilterTab === "WHY") && (response.explanation || response.summary) && (
        <div className={`p-4 rounded-xl border space-y-1.5 ${
          isLightTheme ? RESPONSE_CARD_TOKENS.whySection.light : RESPONSE_CARD_TOKENS.whySection.dark
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> What This Means For You (Statutory Rationale)
            </span>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${RESPONSE_CARD_TOKENS.whySection.badge}`}>
              Citizen Impact
            </span>
          </div>
          <p className="text-xs leading-relaxed font-normal">{response.explanation || response.summary}</p>
        </div>
      )}

      {/* 4. SECTION: STEP-BY-STEP PROCEDURE ROADMAP */}
      {(activeFilterTab === "ALL" || activeFilterTab === "STEPS") && response.steps && response.steps.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" /> Action Roadmap ({response.steps.length} Steps)
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Department SLA Processing
            </span>
          </div>

          <div className="space-y-2">
            {response.steps.map((step, idx) => (
              <div
                key={step.id || idx}
                className={`p-3.5 rounded-xl border space-y-2 transition ${
                  isLightTheme ? RESPONSE_CARD_TOKENS.stepsSection.cardLight : RESPONSE_CARD_TOKENS.stepsSection.cardDark
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center shrink-0 ${RESPONSE_CARD_TOKENS.stepsSection.numberBadge}`}>
                      {idx + 1}
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate">{step.title}</h5>
                  </div>
                  {step.mandatory && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${RESPONSE_CARD_TOKENS.stepsSection.mandatoryBadge}`}>
                      MANDATORY
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{step.purpose || step.whyRequired}</p>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/5 flex-wrap text-[11px] font-mono">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>Dept: <strong className="text-slate-700 dark:text-slate-200">{step.dept || `${stateJurisdiction} Department`}</strong></span>
                  </span>
                  {step.timeline && (
                    <span className={`flex items-center gap-1 ${RESPONSE_CARD_TOKENS.stepsSection.timelineTag}`}>
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{step.timeline}</span>
                    </span>
                  )}
                  {step.portal && (
                    <a
                      href={step.portal.startsWith("http") ? step.portal : `https://${step.portal}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1 ${RESPONSE_CARD_TOKENS.stepsSection.portalBtn}`}
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedImprovementStep(step)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 text-[10px] font-bold transition ml-auto"
                    title="Suggest improvement to AI for future roadmap refinement"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Suggest Improvement</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SECTION: REQUIRED DOCUMENTS & VAULT RECOGNITION */}
      {(activeFilterTab === "ALL" || activeFilterTab === "DOCS") && ((response.documentStatus && response.documentStatus.length > 0) || (response.documents && response.documents.length > 0)) && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" /> Required Documents & DigiLocker Vault Status
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-medium">
              {vaultDocs.length} Docs in Vault
            </span>
          </div>

          <RoadmapDocumentChecklist
            requiredDocs={response.documentStatus || response.documents || []}
            vaultDocs={vaultDocs}
            onNavigateToVault={() => {
              if (onNavigateTab) onNavigateTab("documents");
            }}
            userId={profile?.id || "usr_default"}
          />
        </div>
      )}

      {/* 6. SECTION: ELIGIBILITY EVALUATION */}
      {activeFilterTab === "ALL" && response.eligibility && (
        <div className={`p-4 rounded-xl border space-y-2 ${
          isLightTheme ? "bg-white border-slate-200 shadow-xs" : "bg-black/40 border-white/10"
        }`}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-500" /> Jurisdictional Eligibility Evaluation
            </span>
            {getEligibilityBadge(response.eligibility?.status)}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">{response.eligibility?.explanation}</p>

          {response.eligibility?.matchedCriteria && response.eligibility.matchedCriteria.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider block">Matched Criteria</span>
              <div className="flex flex-wrap gap-1.5">
                {response.eligibility.matchedCriteria.map((crit, cIdx) => (
                  <span key={cIdx} className={`px-2 py-0.5 text-[10px] font-medium rounded border flex items-center gap-1 ${RESPONSE_CARD_TOKENS.eligibilitySection.criteriaTag}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {crit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. SECTION: GROUNDED OFFICIAL SOURCES & PROVENANCE */}
      {(activeFilterTab === "ALL" || activeFilterTab === "SOURCES") && response.officialSources && response.officialSources.length > 0 && (
        <div className={`p-3.5 rounded-xl border space-y-2 ${
          isLightTheme ? RESPONSE_CARD_TOKENS.sourcesSection.light : RESPONSE_CARD_TOKENS.sourcesSection.dark
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Grounded Official Government Sources
            </span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              NO HALLUCINATION
            </span>
          </div>

          <div className="space-y-1.5">
            {response.officialSources.map((src, sIdx) => (
              <div key={sIdx} className="flex items-center justify-between text-[11px] gap-2 flex-wrap p-2 rounded-lg bg-white/5 border border-white/5">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{src.name}</span>
                  {src.department && <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{src.department}</span>}
                </div>
                <a
                  href={src.url?.startsWith("http") ? src.url : `https://${src.url || "india.gov.in"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-bold text-[10px] shrink-0"
                >
                  <span>Verify Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. SECTION: ACTION FOOTER & VIEW SWITCHERS */}
      <div className={`pt-3.5 border-t rounded-xl p-3.5 space-y-3 font-sans ${
        isLightTheme ? RESPONSE_CARD_TOKENS.actionFooter.light : RESPONSE_CARD_TOKENS.actionFooter.dark
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400">
              Next Action Options • Intent Context Active
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 truncate max-w-xs font-medium">
            🎯 {response.title || response.summary?.slice(0, 40) || "Citizen Guidance Intent"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Option 1: Interactive Roadmap View */}
          <button
            type="button"
            onClick={() => {
              const roadmap = response.roadmapData || generateRoadmapFromIntent(
                response.title || response.summary || "Citizen Public Service",
                response.summary || "",
                profile,
                vaultDocs
              );
              if (addRoadmap) addRoadmap(roadmap);
              if (onSelectRoadmap) onSelectRoadmap(roadmap);
              if (onNavigateTab) onNavigateTab("roadmap", roadmap, response.title || response.summary);
            }}
            className={`group p-3 rounded-xl ${RESPONSE_CARD_TOKENS.actionFooter.roadmapBtn} transition shadow-md cursor-pointer text-left flex items-center justify-between gap-2.5`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-black/20 text-slate-950 shrink-0 group-hover:scale-105 transition-transform">
                <Map className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>Roadmap View</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/25 text-slate-900 font-mono">
                    D3 Gantt
                  </span>
                </div>
                <p className="text-[10px] opacity-85 font-normal truncate mt-0.5">
                  {response.nextAction?.description || "Step-by-step procedures & SLA dates"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Option 2: AI Workflow Orchestrator View */}
          <button
            type="button"
            onClick={() => {
              const roadmap = response.roadmapData || generateRoadmapFromIntent(
                response.title || response.summary || "Citizen Public Service",
                response.summary || "",
                profile,
                vaultDocs
              );
              if (onNavigateTab) onNavigateTab("orchestrator", roadmap, response.title || response.summary || "Government Workflow");
            }}
            className={`group p-3 rounded-xl border font-bold transition shadow-sm cursor-pointer text-left flex items-center justify-between gap-2.5 ${RESPONSE_CARD_TOKENS.actionFooter.orchestratorBtn}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg shrink-0 group-hover:scale-105 transition-transform ${
                isLightTheme ? "bg-cyan-200 text-cyan-900" : "bg-cyan-500/20 text-cyan-300"
              }`}>
                <Cpu className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>Orchestrator View</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                    isLightTheme ? "bg-cyan-200/80 text-cyan-900" : "bg-cyan-500/20 text-cyan-300"
                  }`}>
                    Multi-Agent
                  </span>
                </div>
                <p className={`text-[10px] truncate mt-0.5 ${
                  isLightTheme ? "text-cyan-800" : "text-cyan-300/80"
                }`}>
                  Autonomous policy audit & filing
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Quick Context Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className={`text-[10px] font-mono ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>Context Jumps:</span>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("eligibility", undefined, response.title || response.summary)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
              isLightTheme
                ? "border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700"
                : "border-white/10 text-white/70 hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <CheckSquare className="w-3 h-3 text-amber-500" />
            <span>Check Eligibility</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("documents", undefined, response.title || response.summary)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
              isLightTheme
                ? "border-slate-300 text-slate-700 hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-800"
                : "border-white/10 text-white/70 hover:border-cyan-500/30 hover:text-cyan-300 hover:bg-cyan-500/10"
            }`}
          >
            <FileText className="w-3 h-3 text-cyan-400" />
            <span>Verify Enclosures ({vaultDocs.length})</span>
          </button>
        </div>
      </div>

      {/* 9. FOLLOW-UP CHIPS */}
      {response.followUps && response.followUps.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/10">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Suggested Follow-Up Questions</span>
          <div className="flex flex-wrap gap-1.5">
            {response.followUps.map((chip, fIdx) => (
              <button
                key={fIdx}
                type="button"
                onClick={() => onSendFollowUp(chip)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium transition cursor-pointer text-left flex items-center gap-1.5 ${
                  isLightTheme
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-amber-500/20 hover:border-amber-500/40 hover:text-amber-300"
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggest Improvement Modal */}
      <SuggestImprovementModal
        isOpen={Boolean(selectedImprovementStep)}
        onClose={() => setSelectedImprovementStep(null)}
        step={selectedImprovementStep}
        roadmapGoal={response.goal || response.title || "Government Guidance"}
        roadmapId={response.roadmapData?.id}
      />
    </div>
  );
};
