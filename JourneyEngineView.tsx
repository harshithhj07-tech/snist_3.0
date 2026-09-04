import React, { useState } from "react";
import {
  RoadmapData,
  Step,
  NextBestAction,
  JourneyMemory,
  WorkflowStatus,
  StepStatus,
  TrackingStage
} from "../types";
import { VaultDocument } from "../services/vaultDocumentEngine";
import { evaluateJourneyInstance } from "../services/journeyEngine";
import { RoadmapDocumentChecklist } from "./RoadmapDocumentChecklist";
import { SuggestImprovementModal } from "./SuggestImprovementModal";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Lock, 
  ExternalLink, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  RotateCcw,
  FileText,
  Info,
  Calendar,
  Layers,
  HelpCircle,
  Compass,
  FileCheck2,
  ChevronRight,
  HelpCircle as QuestionIcon
} from "lucide-react";

interface JourneyEngineViewProps {
  roadmap: RoadmapData | null;
  vaultDocs?: VaultDocument[];
  onUpdateRoadmap?: (updatedRoadmap: RoadmapData) => void;
  onVaultDocsUpdated?: (updatedDocs: any[]) => void;
  onNavigateToVault?: () => void;
  onAskAI?: (prompt: string) => void;
  activeWorkflows?: RoadmapData[];
  isLightTheme?: boolean;
}

export const JourneyEngineView: React.FC<JourneyEngineViewProps> = ({
  roadmap,
  vaultDocs = [],
  onUpdateRoadmap,
  onVaultDocsUpdated,
  onNavigateToVault,
  onAskAI,
  activeWorkflows = [],
  isLightTheme = false
}) => {
  // Secondary views toggle: "citizen" (default), "details", "timeline", "evidence"
  const [activeSubView, setActiveSubView] = useState<"citizen" | "details" | "timeline" | "evidence">("citizen");
  const [selectedLauncherStep, setSelectedLauncherStep] = useState<Step | null>(null);
  const [selectedImprovementStep, setSelectedImprovementStep] = useState<Step | null>(null);
  const [inspectedStepId, setInspectedStepId] = useState<string | null>(null);
  const [showIntelligenceDrawer, setShowIntelligenceDrawer] = useState<boolean>(false);

  if (!roadmap) {
    return (
      <div className={`p-10 text-center rounded-2xl border ${
        isLightTheme ? "bg-white border-slate-200 text-slate-600" : "bg-slate-900/60 border-slate-800 text-slate-400"
      }`}>
        <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3 animate-pulse" />
        <h3 className={`text-lg font-semibold ${isLightTheme ? "text-slate-900" : "text-white"}`}>No Active Journey Selected</h3>
        <p className="text-sm max-w-md mx-auto mt-1">
          Select or start a statutory roadmap to begin your guided citizen journey.
        </p>
      </div>
    );
  }

  // Evaluate state through Journey Engine logic
  const evaluatedRoadmap = evaluateJourneyInstance(roadmap, vaultDocs);
  const {
    goal,
    category,
    workflowStatus = "IN_PROGRESS",
    completionPercentage,
    phases,
    nextBestAction,
    journeyMemory,
    citizenIntelligence,
    trackingStatus = "UNAVAILABLE",
    trackingStatusMessage,
    applicationRefId
  } = evaluatedRoadmap;

  // Flatten all steps for direct sequence access
  const allSteps: Step[] = [];
  phases.forEach((phase) => {
    if (phase.steps) allSteps.push(...phase.steps);
  });

  // Determine current active step
  const currentStep = inspectedStepId
    ? allSteps.find((s) => s.id === inspectedStepId) || allSteps.find((s) => s.status === "IN_PROGRESS" || s.status === "BLOCKED") || allSteps[0]
    : allSteps.find((s) => s.status === "IN_PROGRESS" || s.status === "BLOCKED") || allSteps[0];

  const currentStepIndex = currentStep ? allSteps.findIndex((s) => s.id === currentStep.id) : 0;
  const currentStepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;

  // Step Status Toggler
  const handleToggleStepComplete = (stepId: string) => {
    const updatedPhases = evaluatedRoadmap.phases.map((phase) => ({
      ...phase,
      steps: phase.steps.map((s) => {
        if (s.id === stepId) {
          const newCompleted = !s.completed;
          return {
            ...s,
            completed: newCompleted,
            status: newCompleted ? ("COMPLETED" as StepStatus) : ("PENDING" as StepStatus)
          };
        }
        return s;
      })
    }));

    const updated = evaluateJourneyInstance(
      { ...evaluatedRoadmap, phases: updatedPhases },
      vaultDocs
    );

    if (onUpdateRoadmap) {
      onUpdateRoadmap(updated);
    }
  };

  // Helper to extract documents needed for the step
  const getStepDocumentsNeeded = (step: Step) => {
    if (step.documentsNeeded && step.documentsNeeded.length > 0) {
      return step.documentsNeeded;
    }
    const docs: Array<{ name: string; purpose?: string; status: "AVAILABLE" | "MISSING" | "INVALID" | "EXPIRED"; verified?: boolean }> = [];
    if (step.requiredDocName) {
      const match = vaultDocs.find(
        (v) => v.name?.toLowerCase().includes(step.requiredDocName!.toLowerCase()) || step.requiredDocName!.toLowerCase().includes(v.name?.toLowerCase() || "")
      );
      docs.push({
        name: step.requiredDocName,
        status: match ? "AVAILABLE" : "MISSING",
        verified: Boolean(match)
      });
    }
    const text = (step.title + " " + (step.purpose || "") + " " + (step.whyRequired || "")).toLowerCase();
    if (text.includes("aadhaar") && !docs.some(d => d.name.toLowerCase().includes("aadhaar"))) {
      const match = vaultDocs.find(v => v.name?.toLowerCase().includes("aadhaar"));
      docs.push({ name: "Aadhaar Card", status: match ? "AVAILABLE" : "MISSING", verified: Boolean(match) });
    }
    if (text.includes("address") && !docs.some(d => d.name.toLowerCase().includes("address"))) {
      const match = vaultDocs.find(v => v.name?.toLowerCase().includes("address") || v.name?.toLowerCase().includes("aadhaar"));
      docs.push({ name: "Address Proof", status: match ? "AVAILABLE" : "MISSING", verified: Boolean(match) });
    }
    if (text.includes("income") && !docs.some(d => d.name.toLowerCase().includes("income"))) {
      const match = vaultDocs.find(v => v.name?.toLowerCase().includes("income"));
      docs.push({ name: "Income Certificate", status: match ? "AVAILABLE" : "MISSING", verified: Boolean(match) });
    }
    return docs;
  };

  const currentStepDocs = currentStep ? getStepDocumentsNeeded(currentStep) : [];

  return (
    <div className="space-y-6 text-left">
      {/* SECONDARY VIEW MODE TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
          <button
            onClick={() => setActiveSubView("citizen")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubView === "citizen"
                ? "bg-amber-500 text-black shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Citizen Journey</span>
          </button>

          <button
            onClick={() => setActiveSubView("details")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubView === "details"
                ? "bg-amber-500 text-black shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Step Details & Docs</span>
          </button>

          <button
            onClick={() => setActiveSubView("timeline")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubView === "timeline"
                ? "bg-amber-500 text-black shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline & SLAs</span>
          </button>

          <button
            onClick={() => setActiveSubView("evidence")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubView === "evidence"
                ? "bg-amber-500 text-black shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Evidence</span>
          </button>
        </div>

        {/* 8 Questions Intelligence Button */}
        <button
          onClick={() => setShowIntelligenceDrawer(!showIntelligenceDrawer)}
          className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-mono font-bold flex items-center gap-1.5 transition"
        >
          <QuestionIcon className="w-3.5 h-3.5" />
          <span>{showIntelligenceDrawer ? "Hide Journey Analysis" : "Why Am I Here? (8 Qs)"}</span>
        </button>
      </div>

      {/* 8 QUESTIONS ANALYSIS ACCORDION */}
      {showIntelligenceDrawer && citizenIntelligence && (
        <div className="p-5 rounded-2xl bg-[#0c1322] border border-indigo-500/30 space-y-4 animate-fade-in shadow-xl text-left">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Citizen Journey Intelligence Matrix (Official Grounding)
            </span>
            <span className="text-[10px] font-mono text-white/50">Auto-Recalculating State</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-white/5 rounded-xl space-y-1">
              <span className="font-mono text-[10px] uppercase text-amber-400 font-bold">1. Where am I?</span>
              <p className="text-white font-medium">{citizenIntelligence.whereAmI.summary}: "{currentStep?.title}"</p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl space-y-1">
              <span className="font-mono text-[10px] uppercase text-cyan-400 font-bold">2. Why am I here?</span>
              <p className="text-white/80">{citizenIntelligence.whyAmIHere}</p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl space-y-1">
              <span className="font-mono text-[10px] uppercase text-emerald-400 font-bold">3. What do I already have?</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {citizenIntelligence.whatDoIHave.length > 0 ? (
                  citizenIntelligence.whatDoIHave.map((doc, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                      ✓ {doc.name}
                    </span>
                  ))
                ) : (
                  <span className="text-white/40">No documents in vault yet.</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl space-y-1">
              <span className="font-mono text-[10px] uppercase text-rose-400 font-bold">4. What is missing?</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {citizenIntelligence.whatIsMissing.length > 0 ? (
                  citizenIntelligence.whatIsMissing.map((doc, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono">
                      ○ {doc.name}
                    </span>
                  ))
                ) : (
                  <span className="text-emerald-400">All required documents verified!</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl space-y-1">
              <span className="font-mono text-[10px] uppercase text-amber-400 font-bold">5. Why is it missing?</span>
              <p className="text-white/80">{citizenIntelligence.whyIsItMissing}</p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl space-y-1">
              <span className="font-mono text-[10px] uppercase text-indigo-400 font-bold">6. What exactly should I do?</span>
              <p className="text-white font-medium">{citizenIntelligence.whatExactlyShouldIDo}</p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl space-y-1 md:col-span-2">
              <span className="font-mono text-[10px] uppercase text-slate-400 font-bold">7. What happens after that?</span>
              <p className="text-white/80">
                {citizenIntelligence.whatHappensAfterThat.length > 0
                  ? citizenIntelligence.whatHappensAfterThat.join(" → ")
                  : "Final government verification and completion."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* UNVERIFIED INFORMATION NOTICE (IF APPLICABLE) */}
      {citizenIntelligence?.informationStatus === "NEEDS_VERIFICATION" && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider font-mono text-[11px]">Honest Government Verification:</span>
            <p className="mt-0.5 text-amber-200/90 leading-relaxed">
              {citizenIntelligence.verificationNotice || "The available government source does not clearly specify the current district-level requirement. We are not treating this as confirmed until verified with the local office."}
            </p>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SUB-VIEW 1: PRIMARY CITIZEN VIEW (THE HEART OF THE APP)     */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeSubView === "citizen" && (
        <div className="space-y-6">
          {/* A. YOUR JOURNEY HEADER */}
          <div className="p-6 rounded-2xl bg-[#0b0f19] border border-white/10 relative overflow-hidden shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                  YOUR JOURNEY &bull; {category || "Government Service"}
                </span>
                <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
                  {goal}
                </h1>
              </div>

              <div className="flex items-center gap-3 bg-black/40 px-4 py-2.5 rounded-xl border border-white/5">
                <div className="text-right">
                  <span className="text-lg font-bold text-amber-400 font-mono">{completionPercentage}%</span>
                  <p className="text-[10px] text-white/50 font-mono uppercase">Complete</p>
                </div>
                <div className="w-20 bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* B. SCANNABLE JOURNEY PROGRESS LIST */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="space-y-2 font-sans text-sm">
                {allSteps.map((step, idx) => {
                  const isCompleted = step.status === "COMPLETED";
                  const isCurrent = currentStep?.id === step.id;
                  const isBlocked = step.status === "BLOCKED";

                  return (
                    <button
                      key={step.id}
                      onClick={() => setInspectedStepId(step.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left cursor-pointer ${
                        isCurrent
                          ? "bg-amber-500/15 border border-amber-500/40 text-amber-200 font-bold"
                          : isCompleted
                          ? "hover:bg-white/5 text-emerald-400 font-medium"
                          : "hover:bg-white/5 text-white/60 font-normal"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isCompleted ? (
                          <span className="text-emerald-400 font-bold">✓</span>
                        ) : isCurrent ? (
                          <span className="text-amber-400 font-bold text-base animate-pulse">→</span>
                        ) : (
                          <span className="text-white/30">○</span>
                        )}
                        <span className="truncate">{step.title}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
                        {isCompleted && (
                          <span className="text-[10px] text-emerald-400 uppercase font-semibold">Done</span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase font-bold">
                            {isBlocked ? "Needs Action" : "In Progress"}
                          </span>
                        )}
                        {!isCompleted && !isCurrent && (
                          <span className="text-[10px] text-white/30 uppercase">{step.timeline}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* C. CURRENT STEP CARD (FOCUSED CITIZEN GUIDANCE) */}
          {currentStep && (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0d121e] border border-amber-500/20 shadow-2xl space-y-6 relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                    CURRENT STEP &bull; Step {currentStepNumber} of {allSteps.length}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {currentStep.title}
                  </h2>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-white/70">
                  <input
                    type="checkbox"
                    checked={currentStep.completed || currentStep.status === "COMPLETED"}
                    onChange={() => handleToggleStepComplete(currentStep.id)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>{currentStep.completed ? "Marked Complete" : "Mark as Done"}</span>
                </label>
              </div>

              {/* HUMAN BLOCKER EXPLANATION (IF BLOCKED) */}
              {currentStep.humanBlocker ? (
                <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Lock className="w-4 h-4" />
                    <span>You can't complete "{currentStep.humanBlocker.cannotCompleteStepTitle}" yet.</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-amber-100/90 leading-relaxed font-sans">
                    <p>
                      <strong>First:</strong> {currentStep.humanBlocker.firstRequirement}
                    </p>
                    <p>
                      <strong>Why:</strong> {currentStep.humanBlocker.whyReason}
                    </p>
                    <p>
                      <strong>Next:</strong> {currentStep.humanBlocker.nextAction}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    {currentStep.humanBlocker.missingDocumentName && onNavigateToVault ? (
                      <button
                        onClick={onNavigateToVault}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload {currentStep.humanBlocker.missingDocumentName} →</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (currentStep.humanBlocker?.targetStepId) {
                            setInspectedStepId(currentStep.humanBlocker.targetStepId);
                          }
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <span>{currentStep.humanBlocker.actionCtaLabel} →</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {/* WHY YOU NEED IT */}
              <div className="space-y-1 text-xs">
                <span className="font-mono font-bold uppercase tracking-wider text-white/50 text-[10px]">
                  Why you need it
                </span>
                <p className="text-white/80 leading-relaxed">
                  {currentStep.whyRequired || currentStep.purpose || "Required for statutory eligibility and application processing under state rules."}
                </p>
              </div>

              {/* WHAT YOU NEED (DOCUMENTS & PREREQUISITES) */}
              <div className="space-y-2 text-xs">
                <span className="font-mono font-bold uppercase tracking-wider text-white/50 text-[10px]">
                  What you need
                </span>
                <div className="space-y-1.5">
                  {currentStepDocs.length > 0 ? (
                    currentStepDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2">
                          {doc.verified || doc.status === "AVAILABLE" ? (
                            <span className="text-emerald-400 font-bold">✓</span>
                          ) : (
                            <span className="text-amber-400 font-bold">○</span>
                          )}
                          <span className="text-white font-medium">{doc.name}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          doc.verified || doc.status === "AVAILABLE"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {doc.verified || doc.status === "AVAILABLE" ? "Ready in Vault" : "Missing / Needs Upload"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/60">No additional physical documents required for this step.</p>
                  )}
                </div>
              </div>

              {/* WHERE */}
              <div className="space-y-1 text-xs">
                <span className="font-mono font-bold uppercase tracking-wider text-white/50 text-[10px]">
                  Where
                </span>
                <div className="flex items-center gap-2 text-white">
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold">{currentStep.portal || "Official State Portal"}</span>
                  {currentStep.dept && <span className="text-white/50">({currentStep.dept})</span>}
                </div>
              </div>

              {/* NEXT ACTION BUTTON */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    NEXT ACTION
                  </span>
                  <p className="text-xs text-white/60">
                    {currentStep.humanBlocker
                      ? currentStep.humanBlocker.nextAction
                      : `Launch ${currentStep.portal || "the official portal"} to complete this step.`}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <button
                    onClick={() => setSelectedLauncherStep(currentStep)}
                    className="flex-1 sm:flex-none px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <span>{currentStep.humanBlocker ? currentStep.humanBlocker.actionCtaLabel : `Get ${currentStep.title}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SUB-VIEW 2: DETAILED STEP LIST & DOCUMENT CHECKLIST         */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeSubView === "details" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Full Statutory Roadmap Execution Details</span>
            </h3>
            <p className="text-xs text-white/60">
              Each step tracks mandatory enclosures, official government departments, and portal endpoints.
            </p>
          </div>

          <div className="space-y-4">
            {allSteps.map((step, idx) => (
              <div key={step.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">Step {idx + 1}</span>
                    <h4 className="text-sm font-bold text-white">{step.title}</h4>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer font-mono">
                    <input
                      type="checkbox"
                      checked={step.completed || step.status === "COMPLETED"}
                      onChange={() => handleToggleStepComplete(step.id)}
                      className="rounded border-slate-700 bg-slate-800 text-amber-500"
                    />
                    <span>{step.completed ? "Done" : "Mark Done"}</span>
                  </label>
                </div>

                <p className="text-xs text-white/70">{step.purpose || step.whyRequired}</p>

                <div className="flex flex-wrap gap-4 text-[11px] font-mono text-white/50 pt-1">
                  <span>Dept: <strong className="text-white">{step.dept}</strong></span>
                  <span>Portal: <strong className="text-amber-400">{step.portal}</strong></span>
                  <span>Timeline: <strong className="text-white">{step.timeline}</strong></span>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setSelectedLauncherStep(step)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>Launch Official Resource</span>
                  </button>
                  <button
                    onClick={() => setSelectedImprovementStep(step)}
                    className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Suggest Improvement</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SUB-VIEW 3: TIMELINE & STATUTORY SLAS                       */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeSubView === "timeline" && (
        <div className="p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Statutory Timeline & Citizen Charter SLAs</span>
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Guaranteed delivery timelines under Public Services Guarantee Acts and state citizen charters.
            </p>
          </div>

          <div className="space-y-3">
            {allSteps.map((step, idx) => (
              <div key={step.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase">Step {idx + 1}</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{step.title}</h4>
                  <p className="text-[11px] text-white/60 mt-0.5">{step.dept}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold ${
                    step.timelineType === "STATUTORY_SLA"
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-white/5 text-white/70"
                  }`}>
                    {step.timelineLabel || step.timeline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SUB-VIEW 4: OFFICIAL EVIDENCE & GROUNDING                   */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeSubView === "evidence" && (
        <div className="p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Official Government Evidence & Grounding</span>
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Every step is cross-referenced with gazette notifications, central ministries, and state service rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="font-mono text-[10px] text-amber-400 uppercase font-bold">Official Application Reference</span>
              <p className="text-white font-medium">
                {applicationRefId || "Not yet linked — will be assigned upon portal submission"}
              </p>
              <p className="text-[11px] text-white/50">
                Tracking Status: {trackingStatusMessage || "Check official state portal"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold">Verification Engine Integrity</span>
              <p className="text-white font-medium">100% Rule-Grounded</p>
              <p className="text-[11px] text-white/50">
                "Never fabricate the missing piece just to keep the journey moving."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUGGEST IMPROVEMENT MODAL */}
      <SuggestImprovementModal
        isOpen={Boolean(selectedImprovementStep)}
        onClose={() => setSelectedImprovementStep(null)}
        step={selectedImprovementStep}
        roadmapGoal={goal || "Government Service Journey"}
        roadmapId={roadmap?.id}
        onApplyRefinementNow={(stepId, updatedStepData) => {
          const updatedPhases = evaluatedRoadmap.phases.map((phase) => ({
            ...phase,
            steps: phase.steps.map((s) => {
              if (s.id === stepId) {
                return { ...s, ...updatedStepData };
              }
              return s;
            })
          }));

          const updated = evaluateJourneyInstance(
            { ...evaluatedRoadmap, phases: updatedPhases },
            vaultDocs
          );

          if (onUpdateRoadmap) onUpdateRoadmap(updated);
        }}
      />

      {/* OFFICIAL RESOURCE LAUNCHER MODAL */}
      {selectedLauncherStep && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Building2 className="w-4 h-4" />
                <span>Official Government Resource Launcher</span>
              </div>
              <button
                onClick={() => setSelectedLauncherStep(null)}
                className="text-white/40 hover:text-white text-xs font-bold px-2 py-1 bg-white/5 rounded cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{selectedLauncherStep.title}</h3>
              <p className="text-xs text-white/70 mt-1">{selectedLauncherStep.purpose || selectedLauncherStep.whyRequired}</p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1 font-mono">
              <div className="text-white/60">Department: <strong className="text-white">{selectedLauncherStep.dept}</strong></div>
              <div className="text-white/60">Portal: <strong className="text-amber-400">{selectedLauncherStep.portal}</strong></div>
            </div>

            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
              <strong>Official Portal Guarantee:</strong> All submissions, fee payments, and statutory document uploads are safely processed directly on official government servers.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedLauncherStep(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <a
                href={selectedLauncherStep.officialLaunchUrl || `https://${selectedLauncherStep.portal}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setSelectedLauncherStep(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                Launch {selectedLauncherStep.portal} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
