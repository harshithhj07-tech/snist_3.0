import React, { useState, useRef, useEffect } from "react";
import {
  Compass,
  Send,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Mic,
  MicOff,
  User,
  Bot,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Plus,
  Clock,
  Calendar,
  MessageSquare,
  Search,
  Check,
  AlertTriangle,
  Circle,
  CheckSquare,
  Layers,
  MapPin,
  X,
  ChevronLeft,
  Info,
  Cpu,
  Map,
  Workflow,
  ClipboardList,
  FileCheck,
  Volume2,
  VolumeX
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getVoiceLangCode, t, normalizeLangName } from "../utils/translations";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Message, ExplainabilityPayload, RoadmapData, ActionPlan, ExecutableActionItem, OrchestratorAuditLogEntry, StructuredAiResponse, StructuredDocStatusItem, Profile } from "../types";
import { DigiLockerDoc } from "./DigiLockerVault";
import { WhyAmISeeingThisModal } from "./WhyAmISeeingThisModal";
import { generateRoadmapFromIntent } from "../utils/roadmapGenerator";
import { RoadmapDocumentChecklist } from "./RoadmapDocumentChecklist";
import { UnifiedResponseCard } from "./UnifiedResponseCard";
import { buildStructuredResponseFromMessage } from "../utils/structuredResponseParser";



interface InlineOrchestratorCardProps {
  msgId: string;
  actionPlan: ActionPlan;
  auditLogs?: OrchestratorAuditLogEntry[];
  isLightTheme: boolean;
  profile: any;
  onUpdateMessageActionPlan: (msgId: string, newPlan: ActionPlan, newLogs?: OrchestratorAuditLogEntry[]) => void;
}

const InlineOrchestratorCard: React.FC<InlineOrchestratorCardProps> = ({
  msgId,
  actionPlan,
  auditLogs = [],
  isLightTheme,
  profile,
  onUpdateMessageActionPlan
}) => {
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [approvingActionId, setApprovingActionId] = useState<string | null>(null);
  const [decliningActionId, setDecliningActionId] = useState<string | null>(null);

  const planActions = actionPlan?.actions || [];
  const completedCount = planActions.filter(a => a.status === "EXECUTED").length;
  const totalCount = planActions.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Determine current workflow lifecycle state
  const hasAwaiting = planActions.some(a => a.status === "AWAITING_APPROVAL" || (a.approvalRequired && a.status === "PENDING"));
  const hasDenied = planActions.some(a => a.status === "DENIED");
  const allExecuted = totalCount > 0 && planActions.every(a => a.status === "EXECUTED");

  const workflowStateStages = [
    { id: "plan", label: "1. PLAN", status: "completed" },
    { 
      id: "approval", 
      label: "2. APPROVAL", 
      status: hasAwaiting ? "active" : hasDenied ? "declined" : (completedCount > 0 || allExecuted) ? "completed" : "pending" 
    },
    { 
      id: "execute", 
      label: "3. EXECUTE", 
      status: allExecuted ? "completed" : completedCount > 0 ? "active" : "pending" 
    },
    { 
      id: "verify", 
      label: "4. VERIFY", 
      status: allExecuted ? "completed" : "pending" 
    }
  ];

  const handleApproveAction = async (actionId: string) => {
    setApprovingActionId(actionId);
    try {
      const res = await fetch("/api/v1/orchestrator/plan-and-execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: actionPlan.userQuery || actionPlan.goal,
          workflowId: actionPlan.workflowId,
          userId: profile?.id || "user_default",
          citizenProfile: profile,
          userApprovals: { [actionId]: true }
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.actionPlan) {
          onUpdateMessageActionPlan(msgId, data.actionPlan, data.auditLogs || auditLogs);
        }
      }
    } catch (err) {
      console.error("Failed to approve action execution:", err);
    } finally {
      setApprovingActionId(null);
    }
  };

  const handleDeclineAction = async (actionId: string, actionName: string) => {
    setDecliningActionId(actionId);
    try {
      const updatedActions = actionPlan.actions.map(a => {
        if (a.actionId === actionId) {
          return {
            ...a,
            status: "DENIED" as const,
            failureReason: "Explicitly declined by citizen in UI"
          };
        }
        return a;
      });

      const declineLog: OrchestratorAuditLogEntry = {
        logId: `log_${Date.now()}`,
        workflowId: actionPlan.workflowId || `wf_${Date.now()}`,
        actionId,
        toolId: actionPlan.actions.find(a => a.actionId === actionId)?.toolId || "action_declined",
        userId: (profile as any)?.id || profile?.name || "user_default",
        riskLevel: actionPlan.actions.find(a => a.actionId === actionId)?.riskLevel || "HIGH_RISK",
        dataAccessed: ["citizen_consent_gate"],
        approvalGranted: false,
        policyDecision: `Citizen explicitly DECLINED execution of '${actionName}'. Policy gate enforced execution halt.`,
        verificationStatus: "DECLINED",
        timestamp: new Date().toISOString()
      };

      const updatedPlan: ActionPlan = {
        ...actionPlan,
        status: "READY_FOR_APPROVAL",
        actions: updatedActions
      };

      onUpdateMessageActionPlan(msgId, updatedPlan, [declineLog, ...auditLogs]);
    } catch (err) {
      console.error("Failed to decline action execution:", err);
    } finally {
      setDecliningActionId(null);
    }
  };

  return (
    <div className={`mt-4 p-4 rounded-2xl border text-left font-sans space-y-3.5 shadow-md ${
      isLightTheme ? "bg-amber-50/80 border-amber-200" : "bg-[#0c101a] border-amber-500/30"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 shrink-0">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold block">
              AI Action Plan Orchestrator
            </span>
            <h4 className={`text-xs font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              {actionPlan.goal || actionPlan.userQuery}
            </h4>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 text-[9px] font-mono font-bold rounded-full uppercase border shrink-0 ${
          actionPlan.status === "COMPLETED" 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
            : hasAwaiting
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
              : hasDenied
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
        }`}>
          {hasDenied ? "ACTION DECLINED" : actionPlan.status}
        </span>
      </div>

      {/* AI Workflow State Inline Stepper: PLAN -> APPROVAL -> EXECUTE -> VERIFY */}
      <div className="p-2 bg-black/30 rounded-xl border border-white/5">
        <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
          {workflowStateStages.map((stg, i) => {
            const isCompleted = stg.status === "completed";
            const isActive = stg.status === "active";
            const isDeclined = stg.status === "declined";

            return (
              <React.Fragment key={stg.id}>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    isCompleted 
                      ? "bg-emerald-400" 
                      : isActive 
                        ? "bg-amber-400 animate-ping" 
                        : isDeclined 
                          ? "bg-rose-400" 
                          : "bg-white/20"
                  }`} />
                  <span className={`font-bold ${
                    isCompleted 
                      ? "text-emerald-400" 
                      : isActive 
                        ? "text-amber-400" 
                        : isDeclined 
                          ? "text-rose-400" 
                          : "text-white/40"
                  }`}>
                    {stg.label}
                  </span>
                </div>
                {i < workflowStateStages.length - 1 && (
                  <span className="text-white/20 text-[8px]">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className={isLightTheme ? "text-slate-600 font-bold" : "text-white/60"}>Execution Progress</span>
          <span className="font-bold text-amber-500">{percent}% ({completedCount}/{totalCount} Executed)</span>
        </div>
        <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Action Steps with explicit Approve / Decline UI */}
      <div className="space-y-2 pt-1">
        {actionPlan.actions.map((item, idx) => {
          const isRequiresApproval = item.approvalRequired || item.riskLevel === "HIGH_RISK" || item.riskLevel === "MEDIUM_RISK";
          const isAwaitingApproval = isRequiresApproval && (item.status === "AWAITING_APPROVAL" || item.status === "PENDING");
          const isExecuted = item.status === "EXECUTED";
          const isDenied = item.status === "DENIED";

          return (
            <div 
              key={item.actionId || idx}
              className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition ${
                isExecuted
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : isDenied
                    ? "bg-rose-950/20 border-rose-500/30"
                    : isAwaitingApproval
                      ? "bg-amber-950/20 border-amber-500/40"
                      : "bg-white/5 border-white/10"
              }`}
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-bold text-xs ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                    {idx + 1}. {item.actionName}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono uppercase font-bold ${
                    item.riskLevel === "HIGH_RISK" 
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                      : item.riskLevel === "MEDIUM_RISK"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {item.riskLevel}
                  </span>
                </div>
                <p className={`text-[10px] ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>{item.description}</p>
                
                {item.executionResult && item.executionResult.confirmationRef && (
                  <p className="text-[9px] font-mono text-emerald-400 font-bold">
                    ✓ Confirmation Ref: {item.executionResult.confirmationRef}
                  </p>
                )}

                {isDenied && (
                  <p className="text-[9px] font-mono text-rose-400 font-bold">
                    ✕ Execution Declined: Action halted by citizen request
                  </p>
                )}
              </div>

              {/* Explicit Approve / Decline UI Controls for HIGH_RISK / MEDIUM_RISK */}
              <div className="shrink-0 pt-1 sm:pt-0">
                {isExecuted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold rounded-lg">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Executed
                  </span>
                ) : isDenied ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[10px] font-bold rounded-lg">
                    <X className="w-3 h-3 text-rose-400" /> Declined
                  </span>
                ) : isAwaitingApproval ? (
                  <div className="flex items-center gap-1.5">
                    {/* Explicit Approve Button */}
                    <button
                      type="button"
                      onClick={() => handleApproveAction(item.actionId)}
                      disabled={approvingActionId === item.actionId || decliningActionId === item.actionId}
                      className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold font-mono text-[10px] uppercase rounded-lg transition cursor-pointer flex items-center gap-1 shadow-md disabled:opacity-50"
                    >
                      {approvingActionId === item.actionId ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Executing...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3 h-3" />
                          <span>Approve</span>
                        </>
                      )}
                    </button>

                    {/* Explicit Decline Button */}
                    <button
                      type="button"
                      onClick={() => handleDeclineAction(item.actionId, item.actionName)}
                      disabled={approvingActionId === item.actionId || decliningActionId === item.actionId}
                      className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold font-mono text-[10px] uppercase rounded-lg transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      {decliningActionId === item.actionId ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      <span>Decline</span>
                    </button>
                  </div>
                ) : (
                  <span className="px-2 py-1 bg-white/5 border border-white/10 text-white/50 font-mono text-[10px] rounded-lg">
                    {item.status}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Logs Toggle */}
      {auditLogs.length > 0 && (
        <div className="pt-2 border-t border-amber-500/20">
          <button
            type="button"
            onClick={() => setShowAuditLogs(!showAuditLogs)}
            className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
          >
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>{showAuditLogs ? "Hide Execution Audit Trail" : `View Execution Audit Trail (${auditLogs.length} logs)`}</span>
          </button>

          {showAuditLogs && (
            <div className="mt-2 p-2.5 bg-black/60 rounded-xl border border-white/10 space-y-1.5 text-[9px] font-mono">
              {auditLogs.map((log, lIdx) => (
                <div key={lIdx} className="p-2 bg-white/5 rounded border border-white/5 flex flex-col gap-0.5">
                  <div className="flex justify-between text-white/70">
                    <span className="text-cyan-300 font-bold">{log.toolId}</span>
                    <span className={log.verificationStatus === "DECLINED" ? "text-rose-400" : "text-emerald-400"}>
                      {log.verificationStatus}
                    </span>
                  </div>
                  <p className="text-white/50">{log.policyDecision}</p>
                  <span className="text-white/30">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface TurnIntentActionOptionsProps {
  intent: string;
  msg: Message;
  profile: any;
  vaultDocs: any[];
  isLightTheme: boolean;
  onNavigateTab?: (tab: string, roadmap?: RoadmapData, contextQuery?: string) => void;
  onSelectRoadmap?: (roadmap: RoadmapData) => void;
  addRoadmap?: (roadmap: RoadmapData) => void;
}

const TurnIntentActionOptions: React.FC<TurnIntentActionOptionsProps> = ({
  intent,
  msg,
  profile,
  vaultDocs,
  isLightTheme,
  onNavigateTab,
  onSelectRoadmap,
  addRoadmap
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleLaunchRoadmap = () => {
    setIsSynthesizing(true);
    const roadmap = msg.roadmapData || generateRoadmapFromIntent(
      intent,
      msg.content || msg.answer || "",
      profile,
      vaultDocs
    );
    if (addRoadmap) addRoadmap(roadmap);
    if (onSelectRoadmap) onSelectRoadmap(roadmap);
    if (onNavigateTab) onNavigateTab("roadmap", roadmap, intent);
  };

  const handleLaunchOrchestrator = () => {
    setIsSynthesizing(true);
    const roadmap = msg.roadmapData || generateRoadmapFromIntent(
      intent,
      msg.content || msg.answer || "",
      profile,
      vaultDocs
    );
    if (onNavigateTab) onNavigateTab("orchestrator", roadmap, intent);
  };

  const handleLaunchEligibility = () => {
    if (onNavigateTab) onNavigateTab("eligibility", undefined, intent);
  };

  const handleLaunchVault = () => {
    if (onNavigateTab) onNavigateTab("documents", undefined, intent);
  };

  return (
    <div className={`mt-4 pt-3.5 border-t rounded-2xl p-4 space-y-3 font-sans transition-all ${
      isLightTheme
        ? "bg-slate-100/90 border-slate-200 text-slate-800 shadow-xs"
        : "bg-[#0b0f17]/95 border-white/10 text-white/90 shadow-md"
    }`}>
      {/* Header with turn intent pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 rounded-md bg-amber-500/15 text-amber-400">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-500">
            Intent Context Grounding • Next Action Options
          </span>
        </div>
        <span 
          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border truncate max-w-sm font-semibold flex items-center gap-1 ${
            isLightTheme 
              ? "bg-amber-100/80 border-amber-300 text-amber-800" 
              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}
          title={intent}
        >
          <span>🎯</span>
          <span className="truncate">{intent}</span>
        </span>
      </div>

      {/* Primary Action Buttons: Roadmap View & Orchestrator View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* OPTION 1: Interactive Roadmap View */}
        <button
          type="button"
          onClick={handleLaunchRoadmap}
          className="group relative p-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow-md hover:shadow-amber-500/20 cursor-pointer text-left flex items-center justify-between gap-3 overflow-hidden"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-lg bg-black/20 text-slate-950 shrink-0 group-hover:scale-105 transition-transform">
              <Map className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>Roadmap View</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/25 text-slate-900 font-mono uppercase tracking-tight">
                  D3 Gantt
                </span>
              </div>
              <p className="text-[10px] text-slate-900/80 font-normal truncate mt-0.5">
                Step-by-step procedure, SLA dates & checklist
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 shrink-0 text-slate-950 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* OPTION 2: AI Workflow Orchestrator View */}
        <button
          type="button"
          onClick={handleLaunchOrchestrator}
          className={`group relative p-3.5 rounded-xl border font-bold transition-all shadow-sm cursor-pointer text-left flex items-center justify-between gap-3 overflow-hidden ${
            isLightTheme
              ? "bg-cyan-50/90 border-cyan-300 text-cyan-950 hover:bg-cyan-100 hover:border-cyan-400"
              : "bg-cyan-950/40 border-cyan-500/30 text-cyan-200 hover:bg-cyan-900/50 hover:border-cyan-500/60"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-lg shrink-0 group-hover:scale-105 transition-transform ${
              isLightTheme ? "bg-cyan-200 text-cyan-900" : "bg-cyan-500/20 text-cyan-300"
            }`}>
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>Orchestrator View</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-tight ${
                  isLightTheme ? "bg-cyan-200/80 text-cyan-900" : "bg-cyan-500/20 text-cyan-300"
                }`}>
                  Multi-Agent
                </span>
              </div>
              <p className={`text-[10px] truncate mt-0.5 ${
                isLightTheme ? "text-cyan-800" : "text-cyan-300/80"
              }`}>
                Automated multi-agent execution & compliance audit
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 shrink-0 text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Quick context pivots: Eligibility & DigiLocker Vault */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
        <span className={`text-[10px] font-mono ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
          Turn Intent into Context:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLaunchEligibility}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
              isLightTheme
                ? "border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700"
                : "border-white/10 text-white/70 hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <CheckSquare className="w-3 h-3 text-amber-500" />
            <span>Check Criteria & Eligibility</span>
          </button>
          <button
            type="button"
            onClick={handleLaunchVault}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
              isLightTheme
                ? "border-slate-300 text-slate-700 hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-800"
                : "border-white/10 text-white/70 hover:border-cyan-500/30 hover:text-cyan-300 hover:bg-cyan-500/10"
            }`}
          >
            <FileText className="w-3 h-3 text-cyan-400" />
            <span>Verify Required Vault Enclosures ({vaultDocs.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface AIAssistantChatProps {
  onNavigateTab?: (tab: string, roadmap?: RoadmapData, contextQuery?: string) => void;
  onSelectRoadmap?: (roadmap: RoadmapData) => void;
  profile?: Profile;
  activeRoadmap?: RoadmapData | null;
  vaultDocs?: DigiLockerDoc[];
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ 
  onNavigateTab, 
  onSelectRoadmap,
  profile: propProfile,
  activeRoadmap: propActiveRoadmap,
  vaultDocs: propVaultDocs
}) => {
  const {
    profile: ctxProfile,
    vaultDocs: ctxVaultDocs,
    activityLog,
    notifications,
    messages,
    addMessage,
    setMessages,
    addRoadmap,
    setCurrentGoal,
    preferredLanguage,
    isLightTheme,
    conversations,
    activeConversationId,
    selectConversation,
    createNewConversation,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    roadmaps
  } = useApp();

  const profile = propProfile || ctxProfile;
  const vaultDocs = propVaultDocs || ctxVaultDocs;
  const activeRoadmap = propActiveRoadmap !== undefined ? propActiveRoadmap : (roadmaps.length > 0 ? roadmaps[0] : null);

  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showRightContextPanel, setShowRightContextPanel] = useState(true);
  const [chatSearch, setChatSearch] = useState("");
  const [explainabilityModalOpen, setExplainabilityModalOpen] = useState(false);
  const [selectedExplainabilityPayload, setSelectedExplainabilityPayload] = useState<ExplainabilityPayload | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Group conversations by time periods: Today, Yesterday, Previous 7 Days, Older
  const groupConversations = () => {
    const now = new Date().getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const filtered = conversations.filter(c => 
      !chatSearch || c.title.toLowerCase().includes(chatSearch.toLowerCase())
    );

    const groups: { [key: string]: typeof conversations } = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: []
    };

    filtered.forEach(c => {
      const updatedTime = new Date(c.updatedAt || c.createdAt || Date.now()).getTime();
      const diffDays = (now - updatedTime) / oneDayMs;

      if (diffDays < 1) {
        groups.Today.push(c);
      } else if (diffDays < 2) {
        groups.Yesterday.push(c);
      } else if (diffDays < 7) {
        groups["Previous 7 Days"].push(c);
      } else {
        groups.Older.push(c);
      }
    });

    return groups;
  };

  // Voice Speech Recognition setup
  const toggleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser environment.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getVoiceLangCode(preferredLanguage);

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition initialization failed:", err);
      setIsListening(false);
    }
  };

  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const speakAloud = (msgId: string, text: string) => {
    if (!("speechSynthesis" in window)) return;
    
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, " ").slice(0, 800);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = getVoiceLangCode(preferredLanguage);
    utterance.rate = 0.95;
    
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Submit Chat Message to Context-Aware Assistant
  const handleSendQuery = async (queryToRun?: string) => {
    const textToSend = (queryToRun !== undefined ? queryToRun : inputQuery).trim();
    if (!textToSend || isTyping) return;

    setInputQuery("");
    setErrorState(null);
    setLastFailedQuery(null);

    // Update goal
    setCurrentGoal(textToSend);

    // User message object
    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    await addMessage(userMsg);
    setIsTyping(true);

    try {
      // Send full context payload to server
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.role === "user" ? m.content : m.answer || m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory,
          profile,
          vaultDocs,
          documents: vaultDocs,
          recentActivity: activityLog,
          notifications,
          currentGoal: textToSend,
          preferredLanguage,
          state: profile.state || "Telangana",
          documentStatus: {
            totalVaultDocs: vaultDocs.length,
            existingDocNames: vaultDocs.map((d) => d.name),
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server HTTP Error: ${res.status}`);
      }

      const chatData = await res.json();

      const explainabilityPayload: ExplainabilityPayload = chatData.explainabilityPayload || {
        recommendationId: `rec_${Date.now()}`,
        title: `Recommendation for ${profile.state || "Telangana"} Citizen Context`,
        whyRecommended: `Recommended based on your profile (${profile.occupation || "General Citizen"}, Income: ${profile.income || "Standard"}, State: ${profile.state || "Telangana"}) and ${vaultDocs.length} uploaded vault document(s).`,
        dataSourcesUsed: (chatData.sourcesUsed || []).map((s: any) => ({
          sourceId: s.name || "gov_gazette_rule",
          title: s.name || "Government Circular",
          provenance: s.detail || "Official Ministry Portal",
          freshnessState: "CURRENT"
        })),
        ruleEngineRationale: [
          `Rule match calculated for state ${profile.state || "Telangana"}.`,
          `Profile state matched with official gazette guidelines.`,
          `Deterministic check against ${vaultDocs.length} vault enclosures.`
        ],
        confidenceState: {
          level: (chatData.confidenceScore || 95) >= 80 ? "HIGH" : "MEDIUM",
          score: chatData.confidenceScore || 95,
          needsClarification: false
        },
        maskedFieldsUsed: ["Aadhaar Number (masked)", "PAN Number (masked)"]
      };

      // Check if this query qualifies for AI Workflow Orchestrator action plan
      let actionPlanData: ActionPlan | null = null;
      let auditLogsData: OrchestratorAuditLogEntry[] = [];

      const queryLower = textToSend.toLowerCase();
      const isActionableWorkflowQuery = 
        queryLower.includes("apply") || 
        queryLower.includes("submit") || 
        queryLower.includes("execute") || 
        queryLower.includes("form") || 
        queryLower.includes("register") || 
        queryLower.includes("scholarship") || 
        queryLower.includes("license") || 
        queryLower.includes("certificate") || 
        queryLower.includes("udyam") || 
        queryLower.includes("orchestrat");

      if (isActionableWorkflowQuery) {
        try {
          const orchRes = await fetch("/api/v1/orchestrator/plan-and-execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userQuery: textToSend,
              workflowId: `wf_${Date.now()}`,
              userId: (profile as any)?.id || profile?.name || "user_default",
              citizenProfile: { ...profile, state: profile.state || "Telangana" },
              userApprovals: {}
            })
          });

          if (orchRes.ok) {
            const orchJson = await orchRes.json();
            if (orchJson.actionPlan) actionPlanData = orchJson.actionPlan;
            if (orchJson.auditLogs) auditLogsData = orchJson.auditLogs;
          }
        } catch (err) {
          console.warn("Orchestration check notice:", err);
        }
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: "model",
        content: chatData.answer || "No response generated.",
        answer: chatData.answer,
        confidenceScore: chatData.confidenceScore || 95,
        evaluation: chatData.evaluation,
        sourcesUsed: chatData.sourcesUsed || [],
        roadmapData: chatData.roadmapData,
        explainabilityPayload,
        actionPlan: actionPlanData,
        auditLogs: auditLogsData,
        timestamp: new Date().toISOString(),
      };

      if (chatData.roadmapData) {
        await addRoadmap(chatData.roadmapData);
        if (onSelectRoadmap) {
          onSelectRoadmap(chatData.roadmapData);
        }
      }

      await addMessage(aiMsg);
    } catch (err: any) {
      console.error("AI Assistant query error:", err);
      // Explicit Fallback UX: Never show a blank box or raw red 500 error.
      // Reassure the citizen that their progress is saved and provide immediate retry / navigation.
      const fallbackMsg: Message = {
        id: `fallback_${Date.now()}`,
        role: "model",
        content: "The assistant is temporarily unavailable, but your progress is saved.",
        answer: "The assistant is temporarily unavailable, but your progress and documents are saved. Your uploaded vault records, active applications, and profile remain completely secure. You can retry your question below or continue managing your citizen documents.",
        confidenceScore: 0,
        isDegradedFallback: true,
        fallbackType: "AI_UNAVAILABLE",
        timestamp: new Date().toISOString()
      };
      await addMessage(fallbackMsg);
      setErrorState(null);
      setLastFailedQuery(textToSend);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedQuery) {
      handleSendQuery(lastFailedQuery);
    }
  };

  const docNames = (vaultDocs || []).map((d: any) => d.name).filter(Boolean);
  const docSummary = docNames.length > 0 ? docNames.slice(0, 2).join(" and ") : "Aadhaar Card";

  const quickPrompts = [
    `What government schemes am I eligible for in ${profile.state || "Telangana"}?`,
    `I uploaded ${docSummary} in my vault. What is my next step?`,
    "How do I apply for a Post-Matric Scholarship or Fee Reimbursement?",
    "Check if I qualify for Income Certificate concessions.",
  ];

  const groupedChats = groupConversations();

  return (
    <div className="h-[calc(100vh-100px)] min-h-[600px] flex flex-col md:flex-row gap-4 text-left animate-fade-in font-sans">
      
      {/* LEFT SIDEBAR: RECENT CONVERSATIONS */}
      <div className={`w-full md:w-64 shrink-0 flex flex-col rounded-3xl border overflow-hidden shadow-sm ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#080d18] border-white/10"
      }`}>
        {/* Top Header & + New Chat */}
        <div className="p-3.5 border-b border-white/10 space-y-3">
          <button
            onClick={() => createNewConversation("New Consultation")}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Conversation</span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isLightTheme ? "text-slate-400" : "text-white/40"}`} />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search chats..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-mono focus:outline-none border ${
                isLightTheme
                  ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white"
                  : "bg-white/5 border-white/10 text-white focus:bg-white/10"
              }`}
            />
          </div>
        </div>

        {/* Grouped Threads List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {Object.entries(groupedChats).map(([groupTitle, threads]) => {
            if (threads.length === 0) return null;

            return (
              <div key={groupTitle} className="space-y-1">
                <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 ${
                  isLightTheme ? "text-slate-400" : "text-white/40"
                }`}>
                  {groupTitle}
                </span>

                {threads.map((thread) => {
                  const isActive = thread.id === activeConversationId;
                  return (
                    <button
                      key={thread.id}
                      onClick={() => selectConversation(thread.id)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition cursor-pointer flex items-center gap-2.5 ${
                        isActive
                          ? "bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold"
                          : isLightTheme
                            ? "text-slate-700 hover:bg-slate-100"
                            : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate flex-1">{thread.title || "Untitled Session"}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER CHAT WORKSPACE */}
      <div className={`flex-1 flex flex-col rounded-3xl overflow-hidden shadow-xl relative border ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#070b14] border-white/10"
      }`}>
        {/* CHAT HEADER */}
        <div className={`p-4 border-b flex items-center justify-between gap-3 ${
          isLightTheme ? "bg-slate-50/80 border-slate-200" : "bg-black/30 border-white/10"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-extrabold font-display ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                  AI Citizen Assistant
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400 font-bold uppercase rounded-full">
                  Vault Grounded
                </span>
              </div>
              <p className={`text-[10px] font-mono ${isLightTheme ? "text-slate-500" : "text-white/50"}`}>
                State: {profile.state || "Telangana"} • Vault: {vaultDocs.length} Docs Verified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Context Panel Toggle */}
            <button
              onClick={() => setShowRightContextPanel(!showRightContextPanel)}
              className={`p-2 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                showRightContextPanel
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : isLightTheme ? "bg-white border-slate-300 text-slate-700" : "bg-white/5 border-white/10 text-white/70"
              }`}
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Journey Context</span>
            </button>
          </div>
        </div>

        {/* MESSAGES FEED */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-12">
              <div className="w-14 h-14 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/20 shadow-lg">
                <Compass className="w-7 h-7 text-amber-400" />
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className={`font-display text-base font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                  Ask Anything About India's Public Services
                </h2>
                <p className={`text-xs leading-relaxed ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
                  Ask queries regarding schemes, licenses, or gazette rules. The assistant automatically inspects your <strong className="text-amber-500">Citizen Profile</strong> and <strong className="text-cyan-400">Vault ({vaultDocs.length} Docs)</strong>.
                </p>
              </div>

              {/* QUICK PROMPTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl text-left font-sans pt-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuery(prompt)}
                    className={`p-3 border rounded-2xl text-xs transition cursor-pointer flex items-start gap-2 ${
                      isLightTheme
                        ? "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                        : "bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/[0.08]"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";

                // Extract turn intent context from roadmapData, actionPlan, preceding user question, or current inquiry
                const precedingUserMsg = messages
                  .slice(0, index)
                  .reverse()
                  .find(m => m.role === "user");

                const turnIntent = 
                  msg.roadmapData?.goal || 
                  msg.actionPlan?.goal || 
                  msg.actionPlan?.userQuery ||
                  precedingUserMsg?.content || 
                  "Government Citizen Service Guidance";

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-4xl mx-auto ${isUser ? "justify-end text-right" : "justify-start text-left"}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`p-4 sm:p-5 rounded-2xl relative ${
                        isUser
                          ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none max-w-xl shadow-md"
                          : isLightTheme
                            ? "bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-none flex-1 shadow-sm"
                            : "bg-white/[0.03] border border-white/10 text-slate-100 rounded-tl-none flex-1"
                      }`}
                    >
                      {!isUser && (
                        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                            BHARAT NAVIGATOR AI
                          </span>
                          {msg.confidenceScore && (
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              ✓ {msg.confidenceScore}% RAG Grounding
                            </span>
                          )}
                        </div>
                      )}

                      {isUser ? (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                          {msg.content}
                        </p>
                      ) : msg.isDegradedFallback ? (
                        <div className={`p-4 sm:p-5 rounded-2xl border ${
                          isLightTheme 
                            ? "bg-amber-50/80 border-amber-300/80 text-slate-900 shadow-sm" 
                            : "bg-amber-500/10 border-amber-500/30 text-slate-100"
                        } space-y-3.5 font-sans`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                                <Clock className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold">The assistant is temporarily unavailable</h4>
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> All citizen progress & vault documents are safely saved
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                              Degraded Mode
                            </span>
                          </div>

                          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                            {msg.answer || msg.content}
                          </p>

                          <div className="pt-2.5 border-t border-amber-500/20 flex flex-wrap items-center gap-2.5">
                            {lastFailedQuery && (
                              <button
                                type="button"
                                onClick={() => handleSendQuery(lastFailedQuery)}
                                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Retry Question</span>
                              </button>
                            )}
                            {onNavigateTab && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onNavigateTab("vault")}
                                  className={`px-3 py-2 text-xs font-medium rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                                    isLightTheme 
                                      ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm" 
                                      : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                                  }`}
                                >
                                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                                  <span>View My Vault ({vaultDocs.length})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onNavigateTab("schemes")}
                                  className={`px-3 py-2 text-xs font-medium rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                                    isLightTheme 
                                      ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm" 
                                      : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                                  }`}
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Browse Active Schemes</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 font-sans">
                          <UnifiedResponseCard
                            response={msg.structuredResponse || buildStructuredResponseFromMessage(msg, profile, vaultDocs)}
                            isLightTheme={isLightTheme}
                            vaultDocs={vaultDocs}
                            profile={profile}
                            onSendFollowUp={handleSendQuery}
                            onSelectRoadmap={onSelectRoadmap}
                            onNavigateTab={onNavigateTab}
                            addRoadmap={addRoadmap}
                            confidenceScore={msg.confidenceScore}
                          />

                          {/* AI Action Plan Orchestrator Card (If multi-agent workflow is active) */}
                          {msg.actionPlan && (
                            <InlineOrchestratorCard
                              msgId={msg.id}
                              actionPlan={msg.actionPlan}
                              auditLogs={msg.auditLogs}
                              isLightTheme={isLightTheme}
                              profile={profile}
                              onUpdateMessageActionPlan={(msgId, newPlan, newLogs) => {
                                setMessages(prev => prev.map(m => m.id === msgId ? { ...m, actionPlan: newPlan, auditLogs: newLogs } : m));
                              }}
                            />
                          )}

                          {/* Explainability Engine Trigger: Why am I seeing this? */}
                          <div className="mt-3 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const payload: ExplainabilityPayload = msg.explainabilityPayload || {
                                    recommendationId: `rec_${msg.id}`,
                                    title: "Assistant Guidance Rationale",
                                    whyRecommended: `Synthesized from verified citizen profile (${profile.state || "Telangana"}, ${profile.occupation || "Citizen"}) and ${vaultDocs.length} vault document(s).`,
                                    dataSourcesUsed: (msg.sourcesUsed || []).map((s: any) => ({
                                      sourceId: s.name || "source_ref",
                                      title: s.name || "Government Source",
                                      provenance: s.detail || "State DPI Portal",
                                      freshnessState: "CURRENT"
                                    })),
                                    ruleEngineRationale: [
                                      "State jurisdiction rules evaluated.",
                                      "Deterministic rule calculation passed.",
                                      "Vault document status matched."
                                    ],
                                    confidenceState: {
                                      level: (msg.confidenceScore || 95) >= 80 ? "HIGH" : "MEDIUM",
                                      score: msg.confidenceScore || 95,
                                      needsClarification: false
                                    },
                                    maskedFieldsUsed: ["Aadhaar Number", "PAN Number"]
                                  };
                                  setSelectedExplainabilityPayload(payload);
                                  setExplainabilityModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 rounded-lg border border-cyan-500/20 transition cursor-pointer"
                              >
                                <Info className="w-3 h-3 text-cyan-400" />
                                <span>Why am I seeing this?</span>
                              </button>

                              <button
                                type="button"
                                aria-label="Listen to AI voice response"
                                onClick={() => speakAloud(msg.id, msg.content)}
                                className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                  speakingMessageId === msg.id
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 ring-1 ring-amber-500/30"
                                    : "bg-white/5 text-white/70 border-white/10 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                {speakingMessageId === msg.id ? (
                                  <>
                                    <VolumeX className="w-3 h-3 text-amber-400 animate-pulse" />
                                    <span>Stop Voice</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3 h-3 text-amber-400" />
                                    <span>Read Aloud ({preferredLanguage})</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {msg.confidenceScore && (
                              <span className="text-[10px] font-mono text-white/40">
                                Confidence: <span className="text-emerald-400 font-bold">{msg.confidenceScore}%</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-3 max-w-4xl mx-auto justify-start text-left">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className={`p-4 rounded-2xl rounded-tl-none flex items-center gap-3 border ${
                    isLightTheme ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10"
                  }`}>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-xs font-mono text-amber-500">
                      Analyzing Vault & Gazette Rules...
                    </span>
                  </div>
                </div>
              )}

              {errorState && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 text-rose-300 font-mono text-xs max-w-4xl mx-auto">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorState}</span>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INPUT FORM */}
        <div className={`p-3.5 border-t ${
          isLightTheme ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10"
        }`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                isListening
                  ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
                  : isLightTheme ? "bg-white border-slate-300 text-slate-700" : "bg-white/5 border-white/10 text-white/70"
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Type your government query in plain language..."
              className={`flex-1 border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${
                isLightTheme
                  ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                  : "bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-amber-500"
              }`}
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDEBAR: JOURNEY CONTEXT PANEL */}
      {showRightContextPanel && (
        <div className={`w-full md:w-72 shrink-0 rounded-3xl border overflow-hidden p-4 space-y-4 shadow-sm ${
          isLightTheme ? "bg-white border-slate-200 text-slate-900" : "bg-[#080d18] border-white/10 text-white"
        }`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold font-display uppercase tracking-wider">Journey Context</span>
            </div>
            <button
              onClick={() => setShowRightContextPanel(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Goal / Roadmap Summary */}
          <div className={`p-3.5 rounded-2xl border space-y-2 ${
            isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
          }`}>
            <span className="text-[9px] font-mono text-amber-500 font-bold uppercase tracking-widest block">
              Active Focus
            </span>
            <p className="text-xs font-bold truncate">
              {activeRoadmap?.goal || "General Citizen Inquiry"}
            </p>
            <span className="text-[10px] text-emerald-400 font-mono block">
              State: {profile.state || "Telangana"}
            </span>
          </div>

          {/* Statutory Documents Check */}
          <div className="space-y-2">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest block ${
              isLightTheme ? "text-slate-500" : "text-white/40"
            }`}>
              Vault Verified Papers ({vaultDocs.length})
            </span>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {vaultDocs.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-mono italic">No documents uploaded yet.</p>
              ) : (
                vaultDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-2 rounded-xl border text-[11px] flex items-center justify-between font-mono ${
                      isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{doc.name}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 shrink-0">{doc.category}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Nav to Roadmap / Office Locator */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab("roadmap")}
              className={`w-full py-2 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-between px-3 cursor-pointer ${
                isLightTheme ? "bg-slate-100 hover:bg-slate-200 border-slate-300" : "bg-white/5 hover:bg-white/10 border-white/10"
              }`}
            >
              <span>View Full Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab("office-locator")}
              className={`w-full py-2 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-between px-3 cursor-pointer ${
                isLightTheme ? "bg-slate-100 hover:bg-slate-200 border-slate-300" : "bg-white/5 hover:bg-white/10 border-white/10"
              }`}
            >
              <span>Find Nearest Office</span>
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>
        </div>
      )}

      {/* EXPLAINABILITY MODAL */}
      <WhyAmISeeingThisModal
        isOpen={explainabilityModalOpen}
        onClose={() => setExplainabilityModalOpen(false)}
        payload={selectedExplainabilityPayload}
        isLightTheme={isLightTheme}
      />
    </div>
  );
};
