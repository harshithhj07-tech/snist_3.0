import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck2, 
  FileWarning, 
  ExternalLink, 
  History as HistoryIcon, 
  RefreshCw, 
  ChevronRight, 
  Award, 
  Trash2, 
  Upload,
  Clock,
  ShieldCheck,
  Building2,
  FileText,
  UserCheck,
  Zap,
  ListChecks,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { Profile, EligibilityCheckResult } from "../types";
import { 
  getFirebaseUserEligibilityChecks, 
  saveFirebaseUserEligibilityCheck, 
  deleteFirebaseUserEligibilityCheck 
} from "../utils/firebaseDb";
import { evaluateCitizenEligibility, CONFIGURABLE_GOVERNMENT_RULES } from "../services/eligibilityRulesEngine";

interface DynamicEligibilityCheckerProps {
  userId: string;
  profile: Profile;
  vaultDocs?: any[];
  roadmaps?: any[];
  isLightTheme?: boolean;
  onOpenUploadModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const DynamicEligibilityChecker: React.FC<DynamicEligibilityCheckerProps> = ({
  userId,
  profile,
  vaultDocs = [],
  roadmaps = [],
  isLightTheme = false,
  onOpenUploadModal,
  onNavigateTab
}) => {
  const [currentResult, setCurrentResult] = useState<EligibilityCheckResult | null>(null);
  const [history, setHistory] = useState<EligibilityCheckResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<EligibilityCheckResult | null>(null);
  const [evaluationError, setEvaluationError] = useState<{
    message: string;
    reason: string;
    canRetry: boolean;
  } | null>(null);

  // Load history from Firestore on mount/userId change
  useEffect(() => {
    if (userId) {
      loadEligibilityHistory();
    }
  }, [userId]);

  const loadEligibilityHistory = async () => {
    try {
      const savedChecks = await getFirebaseUserEligibilityChecks(userId);
      setHistory(savedChecks);
    } catch (err) {
      console.error("Failed to load eligibility check history:", err);
    }
  };

  // AUTOMATIC RECALCULATION: Triggered automatically whenever Profile or Vault Docs change!
  const computedEligibility = useMemo(() => {
    return evaluateCitizenEligibility(profile, vaultDocs, roadmaps, CONFIGURABLE_GOVERNMENT_RULES);
  }, [
    profile.name,
    profile.age,
    profile.income,
    profile.state,
    profile.district,
    profile.occupation,
    profile.caste,
    profile.education,
    profile.landHolding,
    profile.bplStatus,
    profile.disabilityStatus,
    profile.maritalStatus,
    profile.residenceType,
    vaultDocs,
    roadmaps
  ]);

  // Sync auto-calculated result into active display
  useEffect(() => {
    if (computedEligibility) {
      if (currentResult && currentResult.id === computedEligibility.id && currentResult.applicationReadiness === computedEligibility.applicationReadiness) {
        return;
      }

      const checkResult: EligibilityCheckResult = {
        id: computedEligibility.id,
        timestamp: computedEligibility.timestamp,
        profileSnapshot: computedEligibility.profileSnapshot,
        eligibilityScore: computedEligibility.applicationReadiness,
        applicationReadiness: computedEligibility.applicationReadiness,
        statusSummary: computedEligibility.statusSummary,
        eligibleServices: computedEligibility.eligibleServices,
        likelyEligibleSchemes: computedEligibility.likelyEligibleSchemes,
        missingRequirements: computedEligibility.missingRequirements,
        eligibleSchemes: computedEligibility.eligibleServices.map(s => ({
          name: s.name,
          department: s.department,
          grantOrBenefit: s.grantOrBenefit,
          matchingReason: s.matchingReason,
          requiredDocuments: s.requiredDocuments,
          portalUrl: s.portalUrl
        })),
        requiredDocuments: computedEligibility.eligibleServices.flatMap(s => s.requiredDocuments.map(d => ({
          name: d,
          category: "Prerequisite",
          mandatory: true,
          whereToGet: "Government Portal / Office"
        }))),
        missingDocuments: computedEligibility.missingDocuments,
        recommendedServices: computedEligibility.eligibleServices.map(s => ({
          name: s.name,
          description: s.grantOrBenefit,
          portalUrl: s.portalUrl
        })),
        priorityRecommendations: computedEligibility.priorityRecommendations
      };

      setCurrentResult(checkResult);
      if (userId && userId !== "usr_default") {
        saveFirebaseUserEligibilityCheck(userId, checkResult.id, checkResult).catch(() => {});
      }
    }
  }, [computedEligibility, userId]);

  const handleRunEligibilityCheck = async () => {
    setLoading(true);
    setEvaluationError(null);
    setActiveTab("current");
    try {
      const response = await fetch("/api/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, vaultDocs })
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.message || errPayload.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setEvaluationError(null);

      const newCheckResult: EligibilityCheckResult = {
        id: `eligibility-${Date.now()}`,
        timestamp: new Date().toISOString(),
        profileSnapshot: {
          name: profile.name,
          state: profile.state,
          district: profile.district,
          income: profile.income,
          occupation: profile.occupation,
          caste: profile.caste,
          age: profile.age
        },
        eligibilityScore: data.eligibilityScore ?? computedEligibility.applicationReadiness,
        applicationReadiness: computedEligibility.applicationReadiness,
        statusSummary: data.statusSummary || computedEligibility.statusSummary,
        eligibleServices: computedEligibility.eligibleServices,
        likelyEligibleSchemes: computedEligibility.likelyEligibleSchemes,
        missingRequirements: computedEligibility.missingRequirements,
        eligibleSchemes: data.eligibleSchemes || [],
        requiredDocuments: data.requiredDocuments || [],
        missingDocuments: computedEligibility.missingDocuments,
        recommendedServices: data.recommendedServices || [],
        priorityRecommendations: computedEligibility.priorityRecommendations
      };

      setCurrentResult(newCheckResult);
      if (userId) {
        await saveFirebaseUserEligibilityCheck(userId, newCheckResult.id, newCheckResult);
        setHistory(prev => [newCheckResult, ...prev]);
      }
    } catch (error: any) {
      console.error("Error evaluating eligibility via server:", error);
      // Explicit Fallback UX: Clearly distinguish "we couldn't determine eligibility right now, try again" from "you are not eligible"
      setEvaluationError({
        message: "We couldn't determine automated eligibility right now. Please try again.",
        reason: "The welfare eligibility server is momentarily busy or unreachable. IMPORTANT: This does NOT mean you are ineligible for welfare benefits. Your profile information and vault documents remain active and secure.",
        canRetry: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistoryItem = async (checkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== checkId));
    if (currentResult?.id === checkId) {
      const remaining = history.filter(item => item.id !== checkId);
      setCurrentResult(remaining.length > 0 ? remaining[0] : null);
    }
    await deleteFirebaseUserEligibilityCheck(userId, checkId);
  };

  const activeDisplay = selectedHistoryItem || currentResult;

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left font-sans transition-colors duration-200">
      {/* Hero Header Banner */}
      <div 
        className={`p-6 sm:p-8 rounded-2xl relative overflow-hidden transition-all duration-200 ${
          isLightTheme 
            ? "bg-white border-l-4 border-l-amber-500 border border-slate-200/90 shadow-sm" 
            : "bg-[#0c1017] border-l-4 border-l-amber-500 border border-white/10 shadow-2xl"
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-full uppercase tracking-wider ${
                isLightTheme 
                  ? "bg-amber-50 text-amber-800 border border-amber-200" 
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}>
                Configurable Eligibility Rules Engine
              </span>
              <span className={`text-xs font-mono ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                • Auto-Recalculated on Profile & Vault Changes
              </span>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isLightTheme ? "text-slate-900" : "text-white"
            }`}>
              Production Citizen Welfare Eligibility Engine
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${
              isLightTheme ? "text-slate-600" : "text-slate-300"
            }`}>
              Continuously evaluates <strong className={isLightTheme ? "text-slate-900" : "text-white"}>{profile.name || "Citizen"}</strong>'s profile ({profile.age || 28} Yrs, {profile.income || "Below ₹2.5L"}, {profile.state || "India"}) and DigiLocker Vault ({vaultDocs.length} Docs) against active government rules.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleRunEligibilityCheck}
              disabled={loading}
              className={`w-full md:w-auto px-6 py-3.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 ${
                isLightTheme
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                  : "bg-amber-500 hover:bg-amber-400 text-slate-950"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Re-Evaluating Engine Rules...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Force Deep AI Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${
          isLightTheme ? "border-slate-200" : "border-white/10"
        }`}>
          <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${
            isLightTheme ? "bg-slate-100/80 border-slate-200" : "bg-white/[0.03] border-white/5"
          }`}>
            <button
              onClick={() => {
                setActiveTab("current");
                setSelectedHistoryItem(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 cursor-pointer ${
                activeTab === "current"
                  ? isLightTheme
                    ? "bg-white text-amber-700 font-bold shadow-sm border border-slate-200"
                    : "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                  : isLightTheme
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    : "text-white/60 hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Active Engine Evaluation</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 cursor-pointer ${
                activeTab === "history"
                  ? isLightTheme
                    ? "bg-white text-amber-700 font-bold shadow-sm border border-slate-200"
                    : "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                  : isLightTheme
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    : "text-white/60 hover:text-white"
              }`}
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>Evaluation History ({history.length})</span>
            </button>
          </div>

          {activeDisplay && (
            <span className={`text-xs font-mono ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
              Auto-Calculated: {new Date(activeDisplay.timestamp).toLocaleTimeString("en-IN")}
            </span>
          )}
        </div>
      </div>

      {/* Explicit Fallback UX: Distinguish scan pause from ineligibility */}
      {evaluationError && (
        <div className={`p-5 rounded-2xl border ${
          isLightTheme 
            ? "bg-amber-50/90 border-amber-300 text-slate-900 shadow-sm" 
            : "bg-amber-500/10 border-amber-500/30 text-white"
        } space-y-3`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {evaluationError.message}
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold">
                    Scan Paused
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {evaluationError.reason}
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Showing local cached rules evaluation below so your eligibility workflow is never interrupted.</span>
                </div>
              </div>
            </div>
            {evaluationError.canRetry && (
              <button
                type="button"
                onClick={handleRunEligibilityCheck}
                disabled={loading}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Retry Scan</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === "history" ? (
        <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
          isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
        }`}>
          <h2 className={`text-base font-bold tracking-tight mb-4 flex items-center gap-2 ${
            isLightTheme ? "text-slate-900" : "text-white"
          }`}>
            <HistoryIcon className="w-4 h-4 text-amber-500" />
            <span>Saved Eligibility Evaluation Records</span>
          </h2>

          {history.length === 0 ? (
            <div className={`py-12 text-center text-xs space-y-2 ${
              isLightTheme ? "text-slate-500" : "text-white/40"
            }`}>
              <p>No previous evaluation records found in Firestore.</p>
              <p className="text-[11px]">Evaluation updates automatically as you update profile or vault documents.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((check) => (
                <div
                  key={check.id}
                  onClick={() => {
                    setSelectedHistoryItem(check);
                    setActiveTab("current");
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    selectedHistoryItem?.id === check.id || currentResult?.id === check.id
                      ? isLightTheme
                        ? "bg-amber-50/80 border-amber-300 shadow-sm text-slate-900"
                        : "bg-amber-500/10 border-amber-500/30 text-white"
                      : isLightTheme
                        ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                        : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] text-white/80"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                        {check.statusSummary}
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold rounded-full">
                        Readiness: {check.applicationReadiness ?? check.eligibilityScore}%
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 text-xs ${
                      isLightTheme ? "text-slate-500" : "text-white/40"
                    }`}>
                      <span>State: {check.profileSnapshot.state || profile.state}</span>
                      <span>•</span>
                      <span>Income: {check.profileSnapshot.income || profile.income}</span>
                      <span>•</span>
                      <span>{new Date(check.timestamp).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => handleDeleteHistoryItem(check.id, e)}
                      className={`p-1.5 rounded-lg transition ${
                        isLightTheme 
                          ? "text-rose-600 hover:bg-rose-50" 
                          : "text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10"
                      }`}
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className={`w-4 h-4 ${isLightTheme ? "text-slate-400" : "text-white/30"}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeDisplay ? (
        <div className="space-y-6">
          {/* CITIZEN PROFILE EVALUATION SNAPSHOT BAR */}
          <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 text-xs ${
            isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/5"
          }`}>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span className={`font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                Evaluated Profile:
              </span>
              <span className={isLightTheme ? "text-slate-600" : "text-white/70"}>
                {profile.name || "Citizen"} • {profile.age || 28} Yrs • {profile.gender || "All"} • {profile.state || "Delhi"} • {profile.income || "Below ₹2.5L"} • {profile.occupation || "Self Employed"} • {profile.caste || "General"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold rounded uppercase">
                Vault Docs: {vaultDocs.length} Verified
              </span>
            </div>
          </div>

          {/* APPLICATION READINESS METRIC CARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
            }`}>
              <span className={`text-[11px] font-mono uppercase tracking-wider block font-bold ${
                isLightTheme ? "text-slate-500" : "text-white/40"
              }`}>
                Application Readiness
              </span>

              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold font-mono ${
                  (activeDisplay.applicationReadiness ?? activeDisplay.eligibilityScore) >= 80 
                    ? "text-emerald-500" 
                    : "text-amber-500"
                }`}>
                  {activeDisplay.applicationReadiness ?? activeDisplay.eligibilityScore}%
                </span>
                <span className={`text-xs font-mono font-semibold ${
                  (activeDisplay.applicationReadiness ?? activeDisplay.eligibilityScore) >= 80 ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {(activeDisplay.applicationReadiness ?? activeDisplay.eligibilityScore) >= 80 ? "High Qualification" : "Moderate Readiness"}
                </span>
              </div>

              <div className={`w-full rounded-full h-2 overflow-hidden ${
                isLightTheme ? "bg-slate-100" : "bg-white/5"
              }`}>
                <div 
                  className={`h-full transition-all duration-1000 ${
                    (activeDisplay.applicationReadiness ?? activeDisplay.eligibilityScore) >= 80 ? "bg-emerald-500" : "bg-amber-500"
                  }`} 
                  style={{ width: `${activeDisplay.applicationReadiness ?? activeDisplay.eligibilityScore}%` }} 
                />
              </div>
            </div>

            <div className={`md:col-span-2 p-6 rounded-2xl border transition-all flex flex-col justify-center space-y-2 ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
            }`}>
              <span className={`text-xs font-mono uppercase tracking-wider block font-bold flex items-center gap-1.5 ${
                isLightTheme ? "text-amber-700" : "text-amber-400"
              }`}>
                <ShieldCheck className="w-4 h-4" />
                <span>Engine Policy Evaluation Summary</span>
              </span>
              <p className={`text-xs sm:text-sm leading-relaxed ${
                isLightTheme ? "text-slate-700" : "text-slate-300"
              }`}>
                {activeDisplay.statusSummary}
              </p>
            </div>
          </div>

          {/* PRIORITY RECOMMENDATIONS */}
          {activeDisplay.priorityRecommendations && activeDisplay.priorityRecommendations.length > 0 && (
            <div className={`p-5 rounded-2xl border transition-all space-y-3 ${
              isLightTheme ? "bg-amber-50/60 border-amber-200" : "bg-amber-500/[0.04] border-amber-500/20"
            }`}>
              <h3 className={`text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 ${
                isLightTheme ? "text-amber-900" : "text-amber-300"
              }`}>
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Priority Action Recommendations</span>
              </h3>
              <ul className="space-y-2">
                {activeDisplay.priorityRecommendations.map((rec, i) => (
                  <li key={i} className={`text-xs flex items-start gap-2 ${
                    isLightTheme ? "text-slate-700" : "text-slate-200"
                  }`}>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION 1: ELIGIBLE SERVICES */}
          <div className="space-y-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLightTheme ? "text-slate-900" : "text-white"
            }`}>
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Eligible Public Services & Schemes ({activeDisplay.eligibleServices?.length || activeDisplay.eligibleSchemes?.length || 0})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(activeDisplay.eligibleServices && activeDisplay.eligibleServices.length > 0
                ? activeDisplay.eligibleServices
                : activeDisplay.eligibleSchemes
              ).map((service: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`p-5 rounded-xl border transition-all space-y-3 relative overflow-hidden ${
                    isLightTheme 
                      ? "bg-white border-slate-200 hover:border-emerald-300 shadow-sm" 
                      : "bg-[#0c1017] border-white/10 hover:border-emerald-500/30"
                  }`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  
                  <div className="flex justify-between items-start gap-3 pl-2">
                    <div>
                      <h4 className={`text-sm font-bold tracking-tight ${
                        isLightTheme ? "text-slate-900" : "text-white"
                      }`}>
                        {service.name}
                      </h4>
                      <span className={`text-xs block mt-0.5 ${
                        isLightTheme ? "text-slate-500" : "text-white/40"
                      }`}>
                        {service.department}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold rounded uppercase shrink-0">
                      100% Eligible
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg text-xs font-semibold pl-2 ${
                    isLightTheme ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  }`}>
                    🎁 Benefit: {service.grantOrBenefit}
                  </div>

                  <p className={`text-xs leading-relaxed pl-2 ${
                    isLightTheme ? "text-slate-600" : "text-slate-300"
                  }`}>
                    <strong className={`block text-[11px] uppercase tracking-wider mb-0.5 ${
                      isLightTheme ? "text-slate-500" : "text-white/40"
                    }`}>
                      Matching Justification:
                    </strong>
                    {service.matchingReason}
                  </p>

                  <div className={`pt-3 border-t flex items-center justify-between text-xs pl-2 ${
                    isLightTheme ? "border-slate-200" : "border-white/5"
                  }`}>
                    <span className={`text-[11px] flex items-center gap-1 ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                      <Clock className="w-3 h-3 text-blue-500" />
                      SLA: {service.slaDays || 7} Days
                    </span>

                    <a
                      href={service.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        isLightTheme
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
                          : "bg-white/5 hover:bg-emerald-500/20 text-emerald-400 border border-white/10"
                      }`}
                    >
                      <span>Apply Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: LIKELY ELIGIBLE SCHEMES */}
          {activeDisplay.likelyEligibleSchemes && activeDisplay.likelyEligibleSchemes.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                isLightTheme ? "text-slate-900" : "text-white"
              }`}>
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Likely Eligible Schemes ({activeDisplay.likelyEligibleSchemes.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDisplay.likelyEligibleSchemes.map((scheme, idx) => (
                  <div 
                    key={idx} 
                    className={`p-5 rounded-xl border transition-all space-y-3 relative overflow-hidden ${
                      isLightTheme 
                        ? "bg-amber-50/30 border-amber-200 hover:border-amber-300" 
                        : "bg-amber-500/[0.02] border-amber-500/20"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className={`text-sm font-bold tracking-tight ${
                          isLightTheme ? "text-slate-900" : "text-white"
                        }`}>
                          {scheme.name}
                        </h4>
                        <span className={`text-xs block mt-0.5 ${
                          isLightTheme ? "text-slate-500" : "text-white/40"
                        }`}>
                          {scheme.department}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold rounded uppercase shrink-0">
                        Likely Eligible
                      </span>
                    </div>

                    <p className={`text-xs ${isLightTheme ? "text-slate-600" : "text-slate-300"}`}>
                      <strong>Benefit:</strong> {scheme.grantOrBenefit}
                    </p>

                    <div className={`p-3 rounded-lg text-xs space-y-1 ${
                      isLightTheme ? "bg-amber-100/70 text-amber-950" : "bg-amber-500/10 text-amber-200"
                    }`}>
                      <p><strong>Gap:</strong> {scheme.missingConditionReason}</p>
                      <p><strong>Action to Qualify:</strong> {scheme.actionToQualify}</p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <a
                        href={scheme.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
                      >
                        <span>Check Guidelines Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: MISSING REQUIREMENTS & MISSING VAULT DOCUMENTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Missing Profile Requirements */}
            <div className={`p-6 rounded-2xl border transition-all space-y-4 ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
            }`}>
              <h3 className={`text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 ${
                isLightTheme ? "text-slate-900" : "text-white"
              }`}>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Profile Criteria Gaps ({activeDisplay.missingRequirements?.length || 0})</span>
              </h3>

              {(!activeDisplay.missingRequirements || activeDisplay.missingRequirements.length === 0) ? (
                <div className="py-6 text-center space-y-2 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                  <p>Your demographic profile satisfies all basic policy criteria!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeDisplay.missingRequirements.map((req, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        req.severity === "High"
                          ? isLightTheme ? "bg-rose-50 border-rose-200" : "bg-rose-500/[0.04] border-rose-500/20"
                          : isLightTheme ? "bg-amber-50 border-amber-200" : "bg-amber-500/[0.04] border-amber-500/20"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                          {req.schemeName}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                          req.severity === "High" ? "bg-rose-500/20 text-rose-700 dark:text-rose-300" : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        }`}>
                          {req.criterion} Gap
                        </span>
                      </div>
                      <p className={`text-[11px] ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
                        Your profile ({req.currentValue}) does not satisfy required policy value ({req.requiredValue}).
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Documents in Secure Vault */}
            <div className={`p-6 rounded-2xl border transition-all space-y-4 ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 ${
                  isLightTheme ? "text-rose-700" : "text-rose-300"
                }`}>
                  <FileWarning className="w-4 h-4 text-rose-500" />
                  <span>Missing Vault Documents ({activeDisplay.missingDocuments?.length || 0})</span>
                </h3>

                {onOpenUploadModal && (activeDisplay.missingDocuments?.length || 0) > 0 && (
                  <button
                    onClick={onOpenUploadModal}
                    className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Missing</span>
                  </button>
                )}
              </div>

              {(!activeDisplay.missingDocuments || activeDisplay.missingDocuments.length === 0) ? (
                <div className="py-6 text-center space-y-2 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                  <p>All prerequisite documents are present in your Bharat Navigator Vault!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeDisplay.missingDocuments.map((doc, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border space-y-1 text-xs ${
                        isLightTheme ? "bg-rose-50/50 border-rose-200" : "bg-rose-500/[0.03] border-rose-500/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${isLightTheme ? "text-rose-900" : "text-rose-200"}`}>
                          {doc.name}
                        </span>
                        <span className="px-2 py-0.5 bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px] font-mono font-bold rounded">
                          {doc.priority} Priority
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>
                        {doc.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
