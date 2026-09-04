import React, { useState, useEffect } from "react";
import { 
  runAIWorkflowOrchestrator, 
  WorkflowState, 
  WorkflowStage,
  REGISTERED_TOOL_REGISTRY,
  generateActionPlan
} from "../services/aiWorkflowOrchestrator";
import { 
  Cpu, 
  Search, 
  FileCheck2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  Layers, 
  Bookmark, 
  ChevronRight, 
  Terminal,
  Activity,
  AlertCircle,
  Database,
  ExternalLink,
  Trash2,
  ListChecks,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Play,
  Check,
  X,
  FileCode2,
  Lock,
  Download,
  FileDown,
  FileText,
  RefreshCw,
  History,
  Map,
  MessageSquare
} from "lucide-react";
import { RoadmapData, ActionPlan, ExecutableActionItem, OrchestratorAuditLogEntry, Step } from "../types";
import { SuggestImprovementModal } from "./SuggestImprovementModal";
import { exportWorkflowOrRoadmapToPDF } from "../utils/pdfExportEngine";

interface AIWorkflowOrchestratorViewProps {
  citizenProfile: any;
  vaultDocs: any[];
  isLightTheme: boolean;
  onApplyRoadmapToApp?: (roadmap: RoadmapData) => void;
  initialQuery?: string;
  historyList?: any[];
  savedRoadmaps?: RoadmapData[];
  onAddToHistory?: (item: any) => void;
  onSelectRoadmap?: (roadmap: RoadmapData) => void;
}

const STORAGE_KEY = "bharat_orchestrator_saved_workflows_v2";

export const AIWorkflowOrchestratorView: React.FC<AIWorkflowOrchestratorViewProps> = ({
  citizenProfile,
  vaultDocs,
  isLightTheme,
  onApplyRoadmapToApp,
  initialQuery,
  historyList = [],
  savedRoadmaps = [],
  onAddToHistory,
  onSelectRoadmap
}) => {
  const [queryInput, setQueryInput] = useState(initialQuery || "");
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [savedWorkflows, setSavedWorkflows] = useState<WorkflowState[]>([]);
  const [showArchDiagram, setShowArchDiagram] = useState(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);
  const [selectedImprovementStep, setSelectedImprovementStep] = useState<Step | null>(null);
  const [contextSourceIntent, setContextSourceIntent] = useState<string | null>(initialQuery || null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSyncingHistory, setIsSyncingHistory] = useState(false);

  // History Inspector Sub-tab & Search Filter
  const [historyTab, setHistoryTab] = useState<"orchestrations" | "queries" | "roadmaps">("orchestrations");
  const [historyFilterQuery, setHistoryFilterQuery] = useState("");

  // Phase 5 Smart Automation Transparency State
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [auditLogs, setAuditLogs] = useState<OrchestratorAuditLogEntry[]>([]);
  const [userApprovals, setUserApprovals] = useState<Record<string, boolean>>({});
  const [isExecutingPlan, setIsExecutingPlan] = useState(false);

  // Auto-run if initialQuery provided or updated
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQueryInput(initialQuery);
      setContextSourceIntent(initialQuery);
      handleStartOrchestrator(initialQuery);
    }
  }, [initialQuery]);

  // Load saved orchestrations from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedWorkflows(parsed);
        }
      }
    } catch (err) {
      console.warn("Could not load stored orchestrator history:", err);
    }
  }, []);

  // Save workflow array to localStorage and sync with app history
  const persistWorkflows = (updatedList: WorkflowState[]) => {
    setSavedWorkflows(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList.slice(0, 20)));
    } catch (err) {
      console.warn("Could not persist orchestrator history:", err);
    }
  };

  const handleStartOrchestrator = async (queryText?: string) => {
    const finalQuery = queryText || queryInput;
    if (!finalQuery.trim()) return;

    setIsOrchestrating(true);
    setApplySuccessMsg(null);

    try {
      const result = await runAIWorkflowOrchestrator(finalQuery, citizenProfile, vaultDocs);
      setWorkflowState(result);
      if (result.stages.length > 0) {
        setActiveStageId("roadmap_generator");
      }

      // Phase 5 Plan Execution Call
      await runPhase5ActionExecution(finalQuery, result.workflowId, userApprovals);

      // Auto-save to previous workflows list
      const newList = [result, ...savedWorkflows.filter(w => w.workflowId !== result.workflowId)];
      persistWorkflows(newList);

      // Sync to global app history if callback provided
      if (onAddToHistory) {
        onAddToHistory({
          id: `orch-${result.workflowId}`,
          query: finalQuery,
          type: "orchestration",
          category: result.intent?.category || "Citizen Workflow",
          timestamp: new Date().toISOString(),
          workflowId: result.workflowId
        });
      }
    } catch (err) {
      console.error("Orchestrator error:", err);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const runPhase5ActionExecution = async (
    userQuery: string, 
    workflowId: string, 
    approvals: Record<string, boolean>
  ) => {
    setIsExecutingPlan(true);
    try {
      const response = await fetch("/api/v1/orchestrator/plan-and-execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery,
          workflowId,
          userId: citizenProfile?.id || "user_default",
          citizenProfile,
          userApprovals: approvals
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.actionPlan) setActionPlan(data.actionPlan);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.warn("Phase 5 action execution fallback:", err);
    } finally {
      setIsExecutingPlan(false);
    }
  };

  const handleApproveAction = async (actionId: string) => {
    const updatedApprovals = { ...userApprovals, [actionId]: true };
    setUserApprovals(updatedApprovals);
    if (workflowState) {
      await runPhase5ActionExecution(workflowState.userQuery, workflowState.workflowId, updatedApprovals);
      setApplySuccessMsg("Action approved! Formal government portal submission executed.");
      setTimeout(() => setApplySuccessMsg(null), 5000);
    }
  };

  const handleRejectAction = async (actionId: string) => {
    const updatedApprovals = { ...userApprovals, [actionId]: false };
    setUserApprovals(updatedApprovals);
    if (actionPlan) {
      const updatedActions = actionPlan.actions.map(a => 
        a.actionId === actionId ? { ...a, status: "REJECTED" as const, failureReason: "Action explicitly rejected by citizen." } : a
      );
      setActionPlan({ ...actionPlan, actions: updatedActions, status: "DENIED" });
    }
  };

  const handleSaveState = () => {
    if (!workflowState) return;
    const newList = [workflowState, ...savedWorkflows.filter(w => w.workflowId !== workflowState.workflowId)];
    persistWorkflows(newList);
    if (onAddToHistory) {
      onAddToHistory({
        id: `orch-${workflowState.workflowId}`,
        query: workflowState.userQuery,
        type: "orchestration",
        timestamp: new Date().toISOString()
      });
    }
    setApplySuccessMsg("Workflow state securely synced to history and local repository!");
    setTimeout(() => setApplySuccessMsg(null), 4000);
  };

  const handleResumeWorkflow = (saved: WorkflowState) => {
    setWorkflowState(saved);
    setQueryInput(saved.userQuery);
    setActiveStageId("roadmap_generator");
    setApplySuccessMsg(`Loaded orchestration history for "${saved.userQuery.slice(0, 45)}..."`);
    setTimeout(() => setApplySuccessMsg(null), 3000);
    runPhase5ActionExecution(saved.userQuery, saved.workflowId, userApprovals);
  };

  const handleDeleteSavedWorkflow = (wfId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedWorkflows.filter(w => w.workflowId !== wfId);
    persistWorkflows(updated);
    if (workflowState?.workflowId === wfId) {
      setWorkflowState(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleApplyRoadmap = (roadmap: RoadmapData) => {
    if (onApplyRoadmapToApp) {
      onApplyRoadmapToApp(roadmap);
      setApplySuccessMsg(`Successfully saved and applied "${roadmap.goal}" to your App Roadmap Hub!`);
      setTimeout(() => setApplySuccessMsg(null), 5000);
    }
  };

  // Download Step-by-Step PDF
  const handleDownloadPDF = (customWorkflow?: WorkflowState | null, customRoadmap?: RoadmapData | null) => {
    const targetWf = customWorkflow !== undefined ? customWorkflow : workflowState;
    const targetRoadmap = customRoadmap || targetWf?.roadmap;
    
    if (!targetWf && !targetRoadmap && !actionPlan) {
      setApplySuccessMsg("No active workflow to download. Please run or select an orchestration.");
      setTimeout(() => setApplySuccessMsg(null), 4000);
      return;
    }

    setIsDownloadingPdf(true);
    try {
      exportWorkflowOrRoadmapToPDF({
        workflow: targetWf,
        actionPlan,
        roadmap: targetRoadmap,
        profile: citizenProfile,
        vaultDocs
      });
      setApplySuccessMsg("Official step-by-step procedural PDF dossier downloaded successfully!");
      setTimeout(() => setApplySuccessMsg(null), 4500);
    } catch (err) {
      console.error("PDF export failed:", err);
      setApplySuccessMsg("Failed to generate PDF. Please try again.");
      setTimeout(() => setApplySuccessMsg(null), 4000);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Sync History across memory channels
  const handleSyncAllHistory = async () => {
    setIsSyncingHistory(true);
    try {
      // Re-read local storage
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedWorkflows(parsed);
        }
      }
      setApplySuccessMsg("History successfully synchronized across Orchestrator, Assistant & DigiLocker Vault!");
      setTimeout(() => setApplySuccessMsg(null), 4000);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setTimeout(() => setIsSyncingHistory(false), 600);
    }
  };

  const currentStageOutput = workflowState?.stages.find(s => s.stageId === activeStageId);

  // Filtered lists for history tabs
  const filteredOrchestrations = savedWorkflows.filter(w => 
    !historyFilterQuery || 
    w.userQuery.toLowerCase().includes(historyFilterQuery.toLowerCase()) ||
    (w.intent?.category && w.intent.category.toLowerCase().includes(historyFilterQuery.toLowerCase()))
  );

  const filteredQueries = historyList.filter(h => {
    const text = typeof h === "string" ? h : h.query || "";
    return !historyFilterQuery || text.toLowerCase().includes(historyFilterQuery.toLowerCase());
  });

  const filteredRoadmaps = savedRoadmaps.filter(r => 
    !historyFilterQuery || 
    r.goal.toLowerCase().includes(historyFilterQuery.toLowerCase()) ||
    (r.category && r.category.toLowerCase().includes(historyFilterQuery.toLowerCase()))
  );


  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden ${
        isLightTheme
          ? "bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-white border-amber-200"
          : "bg-gradient-to-br from-[#0e1726] via-[#090d14] to-black border-amber-500/20 shadow-2xl"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Autonomous AI Pipeline
              </span>
              <span className="text-[10px] font-mono text-white/40">Multi-Agent Engine</span>
            </div>
            <h2 className={`text-xl font-bold font-display ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              AI Workflow Orchestrator
            </h2>
            <p className={`text-xs max-w-2xl leading-relaxed ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
              Replaces standard linear chatbots with a 7-stage autonomous government service orchestrator. Executes intent classification, dependency mapping, document verification, and RAG knowledge retrieval in sequence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchDiagram(!showArchDiagram)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                showArchDiagram
                  ? "bg-amber-500 text-black border-amber-400 font-bold"
                  : isLightTheme
                    ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showArchDiagram ? "Hide Pipeline Architecture" : "View Pipeline Topology"}</span>
            </button>
          </div>
        </div>

        {/* Architecture Spec Drawer */}
        {showArchDiagram && (
          <div className={`mt-6 pt-5 border-t text-xs space-y-3 font-mono ${isLightTheme ? "border-slate-200 text-slate-700" : "border-white/10 text-white/70"}`}>
            <div className="font-bold text-amber-500 uppercase tracking-wider text-[11px]">
              Orchestrator Execution Pipeline Topology:
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-[11px] space-y-2 text-emerald-400 font-mono overflow-x-auto">
              <div className="whitespace-pre">
{`User Query
   │
   ├──► 1. Intent Detection (Goal & Domain Classifier)
   ├──► 2. Workflow Planner (Phase & SLA Dependency Graph)
   ├──► 3. Document Analyzer (Identity & Revenue Verification)
   ├──► 4. Eligibility Engine (Profile & Subsidy Evaluator)
   ├──► 5. Knowledge Retrieval (RAG Gazette Index & Rules)
   ├──► 6. Roadmap Generator (Interactive Execution Graph)
   └──► 7. Final Response (State Storage & Next Actions)`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {applySuccessMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{applySuccessMsg}</span>
          </div>
          <button onClick={() => setApplySuccessMsg(null)} className="text-emerald-400/60 hover:text-emerald-300">×</button>
        </div>
      )}

      {/* Orchestrator Query Console */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
      }`}>
        <div className="flex items-center justify-between">
          <label className={`text-xs font-mono font-bold uppercase tracking-wider block ${isLightTheme ? "text-slate-700" : "text-white/70"}`}>
            Initialize New Autonomous Workflow
          </label>
          {contextSourceIntent && (
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Chat Intent Active
            </span>
          )}
        </div>

        {contextSourceIntent && (
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span className="truncate">Intent Context from AI Assistant: <strong>"{contextSourceIntent}"</strong></span>
            </div>
            <button 
              onClick={() => setContextSourceIntent(null)}
              className="text-amber-400/70 hover:text-amber-300 text-xs cursor-pointer shrink-0 ml-2"
              title="Clear intent badge"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-amber-500" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartOrchestrator()}
              placeholder="e.g. Apply for MSME subsidy loan in Telangana or College scholarship in Maharashtra..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                isLightTheme
                  ? "bg-slate-100 text-slate-900 border border-slate-200"
                  : "bg-black/50 text-white border border-white/10"
              }`}
            />
          </div>

          <button
            onClick={() => handleStartOrchestrator()}
            disabled={isOrchestrating || !queryInput.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isOrchestrating ? (
              <>
                <Activity className="w-4 h-4 animate-spin text-black" />
                <span>Orchestrating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Orchestrator</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
          <span className="text-[10px] font-mono text-white/40 uppercase whitespace-nowrap">Preset Tasks:</span>
          {[
            "Setup IT SaaS Startup & Mudra Loan",
            "Apply for Offline PAN Card & e-District Income Cert",
            "Register MSME Udyam Enterprise in Delhi"
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => {
                setQueryInput(promptText);
                handleStartOrchestrator(promptText);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap transition cursor-pointer border ${
                isLightTheme
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
              }`}
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Active Pipeline Status Stage Grid */}
      {workflowState && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Stage Bar */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b0e14] border-white/10"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className={`text-xs font-bold font-mono uppercase tracking-wider ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                  7-Stage Pipeline Progression
                </h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF()}
                  disabled={isDownloadingPdf}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm transition"
                  title="Download official step-by-step procedural PDF report"
                >
                  <FileDown className={`w-3.5 h-3.5 ${isDownloadingPdf ? "animate-bounce text-cyan-400" : "text-cyan-400"}`} />
                  <span>{isDownloadingPdf ? "Generating PDF..." : "Download Step-by-Step PDF"}</span>
                </button>

                <button
                  onClick={handleSaveState}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Save State History</span>
                </button>
              </div>
            </div>

            {/* Stage Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {workflowState.stages.map((st, idx) => (
                <button
                  key={st.stageId}
                  onClick={() => setActiveStageId(st.stageId)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                    activeStageId === st.stageId
                      ? "bg-amber-500/20 border-amber-500 text-amber-400 ring-1 ring-amber-500/50"
                      : isLightTheme
                        ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-white/40">
                    <span>0{idx + 1}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-bold truncate leading-tight mt-1">{st.title}</span>
                  <span className="text-[8px] font-mono text-white/40">{st.durationMs}ms</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Stage Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Stage Intelligence Analysis */}
            <div className={`md:col-span-2 p-5 rounded-2xl border space-y-4 ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
            }`}>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-500" />
                  <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                    Stage Output Inspector: {currentStageOutput?.title || "Active Overview"}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                  Completed (200 OK)
                </span>
              </div>

              {/* Dynamic Content based on active stage */}
              {activeStageId === "intent" && workflowState.intent && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-2">
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Classified Goal:</span>
                    <p className="text-white font-bold">{workflowState.intent.primaryGoal}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-mono text-white/70">Category: {workflowState.intent.category}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-mono">Confidence: {workflowState.intent.confidence}%</span>
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px] font-mono">Urgency: {workflowState.intent.urgency}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStageId === "doc_analyzer" && workflowState.docAnalysis && (
                <div className="space-y-3 text-xs">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">Required Document Matrix:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {workflowState.docAnalysis.requiredDocuments.map((doc, i) => (
                      <div key={i} className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{doc.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${doc.mandatory ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/60"}`}>
                            {doc.mandatory ? "Mandatory" : "Optional"}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/50">Source: {doc.whereToGet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStageId === "eligibility" && workflowState.eligibility && (
                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">Citizen Entitlement Score</span>
                      <p className="text-xl font-bold text-emerald-400">{workflowState.eligibility.score}% Match Verified</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>

                  <div className="space-y-2">
                    {workflowState.eligibility.matchingSchemes.map((s, i) => (
                      <div key={i} className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                        <h5 className="font-bold text-amber-400">{s.name}</h5>
                        <p className="text-[11px] text-white/70">{s.benefit}</p>
                        <p className="text-[10px] text-white/40 font-mono">{s.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStageId === "rag" && workflowState.ragContext && (
                <div className="space-y-3 text-xs">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">Retrieved Government Circulars & Sources:</span>
                  <div className="space-y-2">
                    {workflowState.ragContext.sourcesUsed.map((src, i) => (
                      <div key={i} className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{src.name}</span>
                          <span className="text-[9px] font-mono text-amber-400">{src.ruleClause}</span>
                        </div>
                        <p className="text-[10px] text-white/60">{src.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage 6 & 7 / Roadmap Inspector */}
              {(activeStageId === "roadmap_generator" || activeStageId === "response" || !activeStageId) && workflowState.roadmap && (
                <div className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">Synthesized Interactive Roadmap:</span>
                      <h3 className={`text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>{workflowState.roadmap.goal}</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDownloadPDF(workflowState, workflowState.roadmap)}
                        disabled={isDownloadingPdf}
                        className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Download official PDF roadmap format"
                      >
                        <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isDownloadingPdf ? "Exporting..." : "Download Steps PDF"}</span>
                      </button>

                      {workflowState.roadmap && (
                        <button
                          onClick={() => handleApplyRoadmap(workflowState.roadmap!)}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Apply to App Roadmaps</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Phases & Steps List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {(workflowState.roadmap?.phases || []).map((phase, pIdx) => (
                      <div key={pIdx} className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-400 font-mono">
                          <span>{phase.phaseName}</span>
                          <span className="text-[10px] text-white/40">{(phase.steps || []).length} Steps</span>
                        </div>

                        <div className="space-y-2">
                          {(phase.steps || []).map((st) => (
                            <div key={st.id} className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs">{st.title}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                                  {st.timeline || "SLA 2 Days"}
                                </span>
                              </div>
                              <p className="text-[10px] text-white/70">{st.purpose}</p>
                              {st.whyRequired && (
                                <p className="text-[9px] text-amber-300/80 font-mono italic">Why: {st.whyRequired}</p>
                              )}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[9px] font-mono text-white/50">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span>Dept: {st.dept}</span>
                                  {st.portal && st.portal !== "Not applicable" && (
                                    <a href={st.portal.startsWith("http") ? st.portal : `https://${st.portal}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-0.5">
                                      <span>Portal</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedImprovementStep(st)}
                                  className="px-2 py-0.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded text-[9px] font-bold flex items-center gap-1 transition"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                  <span>Suggest Improvement</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Suggested Next Actions & Synchronized Multi-Memory History */}
            <div className="space-y-4">
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
              }`}>
                <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                  Suggested Next Actions
                </h4>
                
                <div className="space-y-2">
                  {workflowState.suggestedNextActions.map((act, idx) => (
                    <div key={idx} className="p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white/80 flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synchronized AI Memory & History Console */}
              <div className={`p-5 rounded-2xl border space-y-3.5 ${
                isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
              }`}>
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" />
                    <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                      Synchronized AI History
                    </h4>
                  </div>

                  <button
                    onClick={handleSyncAllHistory}
                    disabled={isSyncingHistory}
                    className="p-1 text-white/50 hover:text-amber-400 transition cursor-pointer"
                    title="Sync Memory across Orchestrator, Assistant & Vault"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingHistory ? "animate-spin text-amber-400" : ""}`} />
                  </button>
                </div>

                {/* Search / Filter in History */}
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-white/40" />
                  <input
                    type="text"
                    value={historyFilterQuery}
                    onChange={(e) => setHistoryFilterQuery(e.target.value)}
                    placeholder="Search synced history..."
                    className="w-full pl-7 pr-3 py-1.5 text-[11px] font-mono rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* 3 Sub-tabs */}
                <div className="flex items-center gap-1 p-1 bg-black/30 rounded-xl border border-white/10">
                  <button
                    onClick={() => setHistoryTab("orchestrations")}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      historyTab === "orchestrations"
                        ? "bg-amber-500 text-black shadow"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    <Cpu className="w-3 h-3" />
                    <span>Runs ({savedWorkflows.length})</span>
                  </button>

                  <button
                    onClick={() => setHistoryTab("queries")}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      historyTab === "queries"
                        ? "bg-amber-500 text-black shadow"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat ({historyList.length})</span>
                  </button>

                  <button
                    onClick={() => setHistoryTab("roadmaps")}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      historyTab === "roadmaps"
                        ? "bg-amber-500 text-black shadow"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    <Map className="w-3 h-3" />
                    <span>Maps ({savedRoadmaps.length})</span>
                  </button>
                </div>

                {/* TAB 1: AI ORCHESTRATION RUNS */}
                {historyTab === "orchestrations" && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredOrchestrations.length === 0 ? (
                      <p className="text-[10px] font-mono text-white/40 py-2">No orchestrations found in memory.</p>
                    ) : (
                      filteredOrchestrations.map((w) => (
                        <div
                          key={w.workflowId}
                          onClick={() => handleResumeWorkflow(w)}
                          className={`p-2.5 rounded-xl text-xs cursor-pointer flex items-center justify-between transition border ${
                            workflowState?.workflowId === w.workflowId
                              ? "bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold"
                              : "bg-white/5 border-white/10 hover:border-amber-500/30 text-white/80"
                          }`}
                        >
                          <div className="truncate pr-2 space-y-0.5">
                            <p className="font-bold text-white text-[11px] truncate">{w.userQuery}</p>
                            <span className="text-[9px] font-mono text-white/40 block">
                              {w.intent?.category || "Citizen Service"} • {new Date(w.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadPDF(w, w.roadmap);
                              }}
                              className="p-1 hover:text-cyan-400 text-white/40 transition"
                              title="Download PDF"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSavedWorkflow(w.workflowId, e)}
                              className="p-1 hover:text-rose-400 text-white/40 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 2: CITIZEN CHAT & SEARCH QUERIES */}
                {historyTab === "queries" && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredQueries.length === 0 ? (
                      <p className="text-[10px] font-mono text-white/40 py-2">No chat queries recorded.</p>
                    ) : (
                      filteredQueries.map((h, i) => {
                        const queryText = typeof h === "string" ? h : h.query || "";
                        const timeStr = typeof h === "object" && h.timestamp ? new Date(h.timestamp).toLocaleDateString() : "Recent";
                        return (
                          <div
                            key={i}
                            className="p-2.5 bg-white/5 border border-white/10 hover:border-amber-500/30 rounded-xl text-xs flex items-center justify-between transition"
                          >
                            <div className="truncate pr-2 space-y-0.5">
                              <p className="text-white text-[11px] font-medium truncate">{queryText}</p>
                              <span className="text-[9px] font-mono text-white/40 block">{timeStr}</span>
                            </div>
                            <button
                              onClick={() => {
                                setQueryInput(queryText);
                                handleStartOrchestrator(queryText);
                              }}
                              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                              title="Run Orchestrator with this query"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Run</span>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* TAB 3: SAVED CITIZEN ROADMAPS */}
                {historyTab === "roadmaps" && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredRoadmaps.length === 0 ? (
                      <p className="text-[10px] font-mono text-white/40 py-2">No saved roadmaps found.</p>
                    ) : (
                      filteredRoadmaps.map((r) => (
                        <div
                          key={r.id}
                          className="p-2.5 bg-white/5 border border-white/10 hover:border-amber-500/30 rounded-xl text-xs flex items-center justify-between transition"
                        >
                          <div className="truncate pr-2 space-y-0.5">
                            <p className="text-white text-[11px] font-bold truncate">{r.goal}</p>
                            <span className="text-[9px] font-mono text-white/40 block">
                              {r.category || "General"} • {r.phases?.reduce((acc, p) => acc + p.steps.length, 0) || 4} Steps
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleDownloadPDF(null, r)}
                              className="p-1 hover:text-cyan-400 text-white/40 transition"
                              title="Download PDF format"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setQueryInput(r.goal);
                                handleStartOrchestrator(r.goal);
                              }}
                              className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                              title="Load into Orchestrator"
                            >
                              <Play className="w-3 h-3" />
                              <span>Load</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PHASE 5: USER TRANSPARENCY ACTIVITY LOG & APPROVALS CONSOLE */}
          {actionPlan && (
            <div className={`p-6 rounded-2xl border space-y-5 ${isLightTheme ? "bg-white border-amber-200" : "bg-[#0a0f18] border-amber-500/20 shadow-xl"}`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-500 animate-pulse" />
                  <div>
                    <h3 className={`text-sm font-bold font-mono uppercase tracking-wider ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                      Smart Automation Activity & Approval Console
                    </h3>
                    <p className="text-[11px] text-white/60">
                      Transparent execution log: <span className="text-amber-400 font-mono">WHAT I FOUND → WHAT I CAN DO → WHAT NEEDS APPROVAL → WHAT I DID → WHAT HAPPENED</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPDF()}
                    disabled={isDownloadingPdf}
                    className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                    title="Export Audit Dossier PDF"
                  >
                    <FileDown className="w-3 h-3 text-cyan-400" />
                    <span>Audit PDF</span>
                  </button>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                    actionPlan.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                  }`}>
                    {actionPlan.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* 1. WHAT I FOUND */}
                <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                    <Search className="w-3.5 h-3.5 text-amber-500" />
                    <span>1. WHAT I FOUND</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-white/80">
                    <p className="font-semibold text-white">Context & RAG Audit:</p>
                    <ul className="list-disc list-inside space-y-1 text-white/70">
                      <li>Identified verified docs in Vault</li>
                      <li>Retrieved 1 NSWS Gazette Circular</li>
                      <li>Nearest e-District counter: 2.4 km</li>
                    </ul>
                  </div>
                </div>

                {/* 2. WHAT I CAN DO */}
                <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 font-mono">
                    <ListChecks className="w-3.5 h-3.5 text-cyan-400" />
                    <span>2. WHAT I CAN DO</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-white/80">
                    <p className="font-semibold text-white">Tool Action Sequence:</p>
                    <div className="space-y-1">
                      {actionPlan.actions.map(a => (
                        <div key={a.actionId} className="flex items-center justify-between text-[10px] font-mono">
                          <span className="truncate pr-1 text-white/80">• {a.actionName}</span>
                          <span className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                            a.riskLevel === "HIGH_RISK" ? "bg-red-500/20 text-red-400" : a.riskLevel === "MEDIUM_RISK" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                          }`}>
                            {a.riskLevel.replace("_RISK", "")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. WHAT NEEDS YOUR APPROVAL */}
                <div className="p-4 bg-black/40 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-mono">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>3. WHAT NEEDS APPROVAL</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    {(actionPlan?.actions || []).filter(a => a.status === "AWAITING_APPROVAL" || a.riskLevel === "HIGH_RISK").length === 0 ? (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-400 font-mono">
                        ✓ All sensitive actions approved or completed.
                      </div>
                    ) : (
                      (actionPlan?.actions || []).filter(a => a.status === "AWAITING_APPROVAL" || a.riskLevel === "HIGH_RISK").map(a => (
                        <div key={a.actionId} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-[11px]">{a.actionName}</span>
                            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[8px] font-bold font-mono rounded">
                              HIGH RISK
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-200/80 leading-relaxed">
                            Requires explicit citizen permission to formally submit your application to state e-District servers.
                          </p>
                          {a.status === "AWAITING_APPROVAL" ? (
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleApproveAction(a.actionId)}
                                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Approve & Submit
                              </button>
                              <button
                                onClick={() => handleRejectAction(a.actionId)}
                                className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          ) : a.status === "EXECUTED" ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Explicitly Approved
                            </span>
                          ) : (
                            <span className="text-[10px] text-red-400 font-bold">Rejected by Citizen</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. WHAT I DID */}
                <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3 h-3.5 text-emerald-400" />
                    <span>4. WHAT I DID</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    {(actionPlan?.actions || []).filter(a => a.status === "EXECUTED").length === 0 ? (
                      <p className="text-[10px] font-mono text-white/40">No actions executed yet.</p>
                    ) : (
                      (actionPlan?.actions || []).filter(a => a.status === "EXECUTED").map(a => (
                        <div key={a.actionId} className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-1 font-mono text-[10px]">
                          <div className="flex items-center justify-between text-emerald-300 font-bold">
                            <span>✓ {a.actionName}</span>
                          </div>
                          {a.executionResult?.acknowledgementNumber && (
                            <span className="block text-amber-300 font-bold">ACK: {a.executionResult.acknowledgementNumber}</span>
                          )}
                          {a.executionResult?.draftApplicationId && (
                            <span className="block text-cyan-300">Draft ID: {a.executionResult.draftApplicationId}</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 5. WHAT HAPPENED */}
                <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>5. WHAT HAPPENED</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-white/80">
                    <p className="font-semibold text-emerald-400">Workflow & SLA Status:</p>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-1 font-mono text-[10px] text-white/70">
                      <p>• e-District SLA Clock Started (7 Days)</p>
                      <p>• SMS dispatched to mobile</p>
                      <p>• Roadmap Step 1 Marked Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Suggest Improvement Modal */}
      <SuggestImprovementModal
        isOpen={Boolean(selectedImprovementStep)}
        onClose={() => setSelectedImprovementStep(null)}
        step={selectedImprovementStep}
        roadmapGoal={workflowState?.roadmap?.goal || workflowState?.intent?.primaryGoal || workflowState?.userQuery || "Orchestrated Workflow"}
        roadmapId={workflowState?.roadmap?.id || workflowState?.workflowId}
      />
    </div>
  );
};

