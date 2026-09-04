import React, { useState, useEffect } from "react";
import { Profile, UnifiedCitizenContext, StructuredCitizenIntent, RequirementMatchItem, ExplainabilityPayload, Phase2TestResult } from "../types";
import { buildUnifiedCitizenContext, extractStructuredCitizenIntent, evaluateRequirementMatching, buildExplainabilityPayload } from "../services/citizenIntelligenceEngine";
import { evaluateCitizenEligibility, CONFIGURABLE_GOVERNMENT_RULES } from "../services/eligibilityRulesEngine";
import { WhyAmISeeingThisModal } from "./WhyAmISeeingThisModal";
import { 
  Cpu, 
  ShieldCheck, 
  Search, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  UserCheck, 
  FileText, 
  MapPin, 
  ChevronRight, 
  Lock, 
  Sparkles,
  Layers,
  Zap,
  Activity
} from "lucide-react";

interface CitizenIntelligenceViewProps {
  profile: Profile;
  vaultDocs: any[];
  roadmaps: any[];
  isLightTheme?: boolean;
}

export const CitizenIntelligenceView: React.FC<CitizenIntelligenceViewProps> = ({
  profile,
  vaultDocs,
  roadmaps,
  isLightTheme = false
}) => {
  const [queryInput, setQueryInput] = useState("I am relocating from Delhi to Mumbai to start an MSME business");
  const [context, setContext] = useState<UnifiedCitizenContext | null>(null);
  const [intent, setIntent] = useState<StructuredCitizenIntent | null>(null);
  const [requirementMatches, setRequirementMatches] = useState<RequirementMatchItem[]>([]);
  const [explainabilityModalPayload, setExplainabilityModalPayload] = useState<ExplainabilityPayload | null>(null);
  const [testResults, setTestResults] = useState<Phase2TestResult | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [isLoadingEngine, setIsLoadingEngine] = useState(false);
  const [selectedSchemeIndex, setSelectedSchemeIndex] = useState(0);

  // Initialize context and evaluate engines
  useEffect(() => {
    runEnginePipeline(queryInput);
  }, [profile, vaultDocs, roadmaps]);

  const runEnginePipeline = (currentQuery: string) => {
    setIsLoadingEngine(true);
    
    // 1. Context Engine
    const unifiedCtx = buildUnifiedCitizenContext("user_auth_101", profile, vaultDocs, roadmaps);
    setContext(unifiedCtx);

    // 2. Intent Engine
    const extractedIntent = extractStructuredCitizenIntent(currentQuery, unifiedCtx);
    setIntent(extractedIntent);

    // 3. Requirement Matching Engine
    const currentRule = CONFIGURABLE_GOVERNMENT_RULES[selectedSchemeIndex] || CONFIGURABLE_GOVERNMENT_RULES[0];
    const matches = evaluateRequirementMatching(currentRule, profile, vaultDocs);
    setRequirementMatches(matches);

    setIsLoadingEngine(false);
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    runEnginePipeline(queryInput);
  };

  const handleRunPhase2Test = async () => {
    setIsLoadingTest(true);
    try {
      const res = await fetch("/api/v1/test/phase2");
      const data = await res.json();
      setTestResults(data);
    } catch (err) {
      console.error("Error running Phase 2 test suite:", err);
    } finally {
      setIsLoadingTest(false);
    }
  };

  const handleOpenExplainability = (schemeIdx: number) => {
    const rule = CONFIGURABLE_GOVERNMENT_RULES[schemeIdx];
    const payload = buildExplainabilityPayload(`rec_${schemeIdx}`, rule.schemeName, profile, vaultDocs, rule);
    setExplainabilityModalPayload(payload);
  };

  const currentRule = CONFIGURABLE_GOVERNMENT_RULES[selectedSchemeIndex];

  return (
    <div className={`p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans ${isLightTheme ? "text-slate-900" : "text-white"}`}>
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl ${
        isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#0b1320] border-cyan-500/30"
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> PHASE 2 — CITIZEN INTELLIGENCE ENGINE
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-mono font-bold uppercase">
              5 ENGINES CONNECTED
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight">
            Contextual Intelligence Control Center
          </h1>
          <p className="text-xs text-white/60 font-mono">
            Unifying Profile Context, Natural Intent Engine, Deterministic Eligibility Calculation, Requirement Matching, and Explainability.
          </p>
        </div>

        <button
          onClick={handleRunPhase2Test}
          disabled={isLoadingTest}
          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs rounded-xl flex items-center gap-2 transition shadow-lg cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTest ? "animate-spin" : ""}`} />
          <span>{isLoadingTest ? "Executing Test Suite..." : "Run Phase 2 Test Suite"}</span>
        </button>
      </div>

      {/* Test Suite Results if executed */}
      {testResults && (
        <div className={`p-5 rounded-2xl border space-y-4 shadow-xl animate-fade-in ${
          testResults.status === "PASS"
            ? isLightTheme ? "bg-emerald-50 border-emerald-200" : "bg-emerald-950/20 border-emerald-500/30"
            : isLightTheme ? "bg-rose-50 border-rose-200" : "bg-rose-950/20 border-rose-500/30"
        }`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-5 h-5 ${testResults.status === "PASS" ? "text-emerald-400" : "text-rose-400"}`} />
              <h3 className="text-sm font-bold font-mono uppercase">
                Phase 2 Verification Suite Results — {testResults.status}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-white/50">{testResults.timestamp}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {testResults.tests.map((t, idx) => (
              <div key={idx} className={`p-3 rounded-xl border space-y-1.5 text-xs font-mono ${
                t.status === "PASS" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-rose-500/10 border-rose-500/20 text-rose-300"
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>{t.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] ${t.status === "PASS" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-[11px] text-white/70 leading-normal">{t.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Natural Query Input for Intent Engine Testing */}
      <div className={`p-5 rounded-2xl border space-y-3 shadow-lg ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#0b1320] border-white/10"
      }`}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Engine 2: Natural Query Intent Processor
          </label>
          <span className="text-[10px] font-mono text-white/40">Try: "Relocating to Bangalore", "Starting a Mudra MSME business"</span>
        </div>

        <form onSubmit={handleQuerySubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Describe your citizen situation or inquiry in natural language..."
            className={`flex-1 px-4 py-3 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 transition ${
              isLightTheme ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black/40 border-white/20 text-white"
            }`}
          />
          <button
            type="submit"
            disabled={isLoadingEngine}
            className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Process Intent
          </button>
        </form>
      </div>

      {/* Grid Layout of the 5 Connected Engines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Engine 1: Unified Citizen Context Engine */}
        <div className={`p-5 rounded-2xl border space-y-4 shadow-xl ${
          isLightTheme ? "bg-white border-slate-200" : "bg-[#0b1320] border-white/10"
        }`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase text-cyan-400">
                Engine 1: Citizen Context Engine
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-mono font-bold flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> PRIVACY MASKED
            </span>
          </div>

          {context && (
            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10px] text-white/40 block">Citizen Profile</span>
                  <span className="font-bold text-white block">{context.profile.name || "Default Citizen"}</span>
                  <span className="text-[10px] text-cyan-300">Age: {context.profile.age || 28} | {context.profile.state || "Telangana"}</span>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10px] text-white/40 block">Secure Vault Documents</span>
                  <span className="font-bold text-emerald-400 block">{context.vaultDocs.length} Verified Records</span>
                  <span className="text-[10px] text-white/60">DigiLocker Synced</span>
                </div>
              </div>

              <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Data Minimization & Sanitization Log
                </span>
                <div className="space-y-1 text-[11px] text-white/70">
                  {context.privacyMaskedFields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Engine 2: Structured Intent Processor Engine */}
        <div className={`p-5 rounded-2xl border space-y-4 shadow-xl ${
          isLightTheme ? "bg-white border-slate-200" : "bg-[#0b1320] border-white/10"
        }`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold uppercase text-amber-400">
                Engine 2: Intent Engine Output
              </h3>
            </div>
            {intent && (
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                intent.confidence === "HIGH" 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {intent.confidence} CONFIDENCE ({Math.round(intent.confidenceScore * 100)}%)
              </span>
            )}
          </div>

          {intent && (
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">Classified Life Event</span>
                <span className="text-sm font-bold text-white block">{intent.lifeEvent}</span>
                <span className="text-[10px] text-white/60">Primary Intent Key: {intent.primaryIntent}</span>
              </div>

              {intent.locationChange.isRelocating && (
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Location Shift Detected:</span>
                  <span className="font-bold text-cyan-400">
                    {intent.locationChange.fromState || "Current"} ➔ {intent.locationChange.toState || "Target State"}
                  </span>
                </div>
              )}

              {intent.clarificationPrompts.length > 0 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1 text-blue-300">
                  <span className="text-[10px] font-bold uppercase block flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" /> Gentle Clarification Prompts (Low Confidence Guardrail)
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {intent.clarificationPrompts.map((cp, idx) => (
                      <li key={idx}>{cp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Engine 3 & 4: Deterministic Eligibility & Requirement Matching Engine */}
        <div className={`p-5 rounded-2xl border space-y-4 lg:col-span-2 shadow-xl ${
          isLightTheme ? "bg-white border-slate-200" : "bg-[#0b1320] border-white/10"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold uppercase text-emerald-400">
                Engines 3 & 4: Deterministic Eligibility & Requirement Matching Matrix
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSchemeIndex}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setSelectedSchemeIndex(idx);
                  const rule = CONFIGURABLE_GOVERNMENT_RULES[idx];
                  setRequirementMatches(evaluateRequirementMatching(rule, profile, vaultDocs));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border focus:outline-none ${
                  isLightTheme ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-black/60 border-white/20 text-white"
                }`}
              >
                {CONFIGURABLE_GOVERNMENT_RULES.map((rule, idx) => (
                  <option key={rule.id} value={idx}>
                    {rule.schemeName}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleOpenExplainability(selectedSchemeIndex)}
                className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Explain Selection
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] text-white/40 uppercase">Selected Government Scheme</span>
                <span className="font-bold text-white block text-sm">{currentRule.schemeName}</span>
                <span className="text-[11px] text-cyan-300">{currentRule.department}</span>
              </div>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-[11px]">
                <span className="font-bold">Benefit:</span> {currentRule.grantOrBenefit}
              </div>
            </div>

            {/* Requirement Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 text-[10px] uppercase">
                    <th className="py-2.5 px-3">Prerequisite Document</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Vault Status & Reason</th>
                    <th className="py-2.5 px-3">Official Gazette Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {requirementMatches.map((match, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition">
                      <td className="py-3 px-3 font-bold text-white">
                        {match.requirementName}
                        {match.mandatory && <span className="ml-1 text-rose-400 text-[10px]">*Mandatory</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          match.status === "AVAILABLE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                          match.status === "EXPIRED" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                          "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}>
                          {match.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-white/70 text-[11px]">
                        {match.reason}
                      </td>
                      <td className="py-3 px-3">
                        {match.provenance ? (
                          <div className="space-y-0.5 text-[10px]">
                            <span className="text-cyan-400 font-bold block">{match.provenance.title}</span>
                            <span className="text-white/40 block">{match.provenance.pageSectionRef}</span>
                          </div>
                        ) : (
                          <span className="text-white/30 text-[10px]">Registry Linked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Explainability Modal */}
      <WhyAmISeeingThisModal
        isOpen={Boolean(explainabilityModalPayload)}
        onClose={() => setExplainabilityModalPayload(null)}
        payload={explainabilityModalPayload}
        isLightTheme={isLightTheme}
      />
    </div>
  );
};
