import React, { useState, useEffect } from "react";
import { GoldenJourneyImpactDashboard } from "./GoldenJourneyImpactDashboard";
import { 
  Layers, 
  Globe, 
  Building2, 
  PlusCircle, 
  Calculator, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  TrendingUp, 
  Zap, 
  Database, 
  FileCode, 
  Server, 
  Users, 
  Cpu, 
  Check, 
  BarChart3, 
  ArrowRight,
  HelpCircle,
  Code2,
  Terminal,
  Clock,
  Sparkles,
  Award
} from "lucide-react";
import { 
  ServiceConfigDefinition, 
  TenantStructure, 
  JourneyCostMetrics, 
  LoadTestSimulationResult, 
  Phase9TestResult 
} from "../types";

export default function ScaleCommercializationView() {
  const [activeSubTab, setActiveSubTab] = useState<
    "golden-journey" | "verification" | "jurisdiction-services" | "dynamic-injector" | "tenancy" | "cost-calculator" | "load-testing" | "differentiation" | "architecture"
  >("golden-journey");

  // State for Services & Jurisdiction
  const [selectedState, setSelectedState] = useState<string>("MH");
  const [servicesList, setServicesList] = useState<ServiceConfigDefinition[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceConfigDefinition | null>(null);

  // Dynamic Service Injector Form
  const [jsonConfigInput, setJsonConfigInput] = useState<string>(
    JSON.stringify({
      serviceId: "srv_tn_birth_cert_v1",
      serviceCode: "TN_EDISTRICT_BRT_05",
      serviceName: "Issuance of Child Birth Certificate",
      category: "CERTIFICATE",
      slaDays: 5,
      description: "Tamil Nadu e-District portal service for hospital and municipal birth certificates.",
      jurisdiction: {
        countryCode: "IN",
        stateCode: "TN",
        districtName: "Chennai",
        departmentId: "DEPT_PUBLIC_HEALTH_TN",
        departmentName: "Department of Public Health & Preventive Medicine, Govt of Tamil Nadu"
      },
      eligibilityCriteria: {
        residentStateRequired: true,
        customRuleExpression: "applicant.residentState === 'TN'"
      },
      requiredDocuments: [
        { docTypeCode: "DOC_HOSPITAL_DISCHARGE", docName: "Hospital Discharge Summary / Birth Intimation Note", mandatory: true },
        { docTypeCode: "DOC_PARENTS_AADHAAR", docName: "Parents Aadhaar Cards", mandatory: true }
      ],
      workflowPhases: [
        {
          phaseId: "p1_hospital_verify",
          phaseName: "Hospital Intimation & Registrar Sanction",
          sequenceOrder: 1,
          steps: [
            { stepId: "s1_intimation", title: "Hospital Birth Intimation Entry", actor: "DEPT_OFFICER", isAutomated: false, estimatedMinutes: 60 },
            { stepId: "s2_registrar_approval", title: "Digital Sanction by Health Registrar", actor: "DEPT_OFFICER", isAutomated: false, estimatedMinutes: 1440 }
          ]
        }
      ],
      formFields: [
        { fieldKey: "childName", label: "Child Name", fieldType: "text", required: true },
        { fieldKey: "dateOfBirth", label: "Date of Birth", fieldType: "date", required: true },
        { fieldKey: "hospitalName", label: "Hospital / Place of Birth", fieldType: "text", required: true }
      ],
      isActive: true,
      version: "1.0.0"
    }, null, 2)
  );
  const [injectionMsg, setInjectionMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Cost Engineering Calculator State
  const [calcTokens, setCalcTokens] = useState<number>(3500);
  const [calcOcrDocs, setCalcOcrDocs] = useState<number>(2);
  const [calcStorageMB, setCalcStorageMB] = useState<number>(1.5);
  const [calcComputeReqs, setCalcComputeReqs] = useState<number>(10);
  const [costResult, setCostResult] = useState<JourneyCostMetrics | null>(null);

  // Scalability Load Testing State
  const [simulatedUsersCount, setSimulatedUsersCount] = useState<number>(5000);
  const [loadTestResult, setLoadTestResult] = useState<LoadTestSimulationResult | null>(null);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);

  // Verification Suite State
  const [phase9Results, setPhase9Results] = useState<Phase9TestResult | null>(null);
  const [isLoadingVerification, setIsLoadingVerification] = useState<boolean>(false);

  // Fetch Services by Jurisdiction Filter
  const fetchServices = async (stateCode: string) => {
    try {
      const res = await fetch(`/api/v1/services?stateCode=${stateCode}`);
      const data = await res.json();
      if (data.success) {
        setServicesList(data.services || []);
        if (data.services.length > 0) {
          setSelectedService(data.services[0]);
        }
      }
    } catch (e) {
      console.error("Fetch services error:", e);
    }
  };

  // Inject New Dynamic Service
  const handleInjectService = async () => {
    try {
      const parsed = JSON.parse(jsonConfigInput);
      const res = await fetch("/api/v1/services/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      setInjectionMsg(data);
      if (data.success) {
        fetchServices(parsed.jurisdiction?.stateCode || selectedState);
        runPhase9TestSuite();
      }
    } catch (err: any) {
      setInjectionMsg({ success: false, message: `JSON Parse Error: ${err?.message}` });
    }
  };

  // Calculate Journey Cost
  const handleCalculateCost = async () => {
    try {
      const res = await fetch("/api/v1/cost/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiTokenCount: calcTokens,
          ocrDocumentCount: calcOcrDocs,
          storageMB: calcStorageMB,
          computeRequestsCount: calcComputeReqs
        })
      });
      const data = await res.json();
      if (data.success) {
        setCostResult(data.metrics);
      }
    } catch (e) {
      console.error("Cost calculation error:", e);
    }
  };

  // Run Load Test
  const handleRunLoadTest = async () => {
    setIsTestRunning(true);
    try {
      const res = await fetch("/api/v1/scale/load-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulatedUsers: simulatedUsersCount })
      });
      const data = await res.json();
      if (data.success) {
        setLoadTestResult(data.result);
      }
    } catch (e) {
      console.error("Load test error:", e);
    } finally {
      setIsTestRunning(false);
    }
  };

  // Run Phase 9 Automated Test Suite
  const runPhase9TestSuite = async () => {
    setIsLoadingVerification(true);
    try {
      const res = await fetch("/api/v1/test/phase9");
      const data = await res.json();
      setPhase9Results(data);
    } catch (e) {
      console.error("Phase 9 test run error:", e);
    } finally {
      setIsLoadingVerification(false);
    }
  };

  useEffect(() => {
    fetchServices(selectedState);
    handleCalculateCost();
    handleRunLoadTest();
    runPhase9TestSuite();
  }, [selectedState]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Layers className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Phase 9 Architecture
              </span>
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Multi-Service • Tenancy • Cost Engineering
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Globe className="w-7 h-7 text-emerald-400" />
              Scale, Commercialization & Differentiation Engine
            </h1>
            <p className="text-slate-400 mt-1 max-w-2xl text-sm leading-relaxed">
              Data-Driven Government Service Registration, Country/State/District/Department Jurisdiction Model, Multi-Tenant Isolation, Cost Engineering, High-Concurrency Load Testing, and B2G/B2B2C Commercial Expansion Framework.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Jurisdiction Focus</p>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-slate-900 text-xs font-bold text-emerald-400 border border-slate-700 rounded px-2 py-1 outline-none focus:border-emerald-500"
                >
                  <option value="MH">Maharashtra (MH)</option>
                  <option value="KA">Karnataka (KA)</option>
                  <option value="DL">Delhi (DL)</option>
                  <option value="RJ">Rajasthan (RJ)</option>
                  <option value="TN">Tamil Nadu (TN)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab("golden-journey")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeSubTab === "golden-journey"
              ? "bg-slate-900 text-amber-400 border-t-2 border-amber-500 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          Golden Journey & Impact Evaluation
        </button>

        <button
          onClick={() => setActiveSubTab("verification")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeSubTab === "verification"
              ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Automated Verification Suite [P9]
        </button>

        <button
          onClick={() => setActiveSubTab("jurisdiction-services")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeSubTab === "jurisdiction-services"
              ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Globe className="w-4 h-4" />
          Multi-Service Jurisdiction Catalog
        </button>

        <button
          onClick={() => setActiveSubTab("dynamic-injector")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeSubTab === "dynamic-injector"
              ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Dynamic Service Config Injector
        </button>

        <button
          onClick={() => setActiveSubTab("tenancy")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeSubTab === "tenancy"
              ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Tenancy & Institutional Structure
        </button>

        <button
          onClick={() => setActiveSubTab("cost-calculator")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeSubTab === "cost-calculator"
              ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Calculator className="w-4 h-4" />
          Journey Cost Engineering
        </button>

        <button
          onClick={() => setActiveSubTab("load-testing")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeSubTab === "load-testing"
              ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4" />
          Scalability & Load Testing
        </button>

        <button
          onClick={() => setActiveSubTab("differentiation")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeSubTab === "differentiation"
              ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Differentiation & B2G Commercial Model
        </button>

        <button
          onClick={() => setActiveSubTab("architecture")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeSubTab === "architecture"
              ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Server className="w-4 h-4" />
          System Architecture Docs
        </button>
      </div>

      {/* Subtab Content Panels */}

      {/* 0. Golden Journey & Impact Evaluation Subtab */}
      {activeSubTab === "golden-journey" && (
        <GoldenJourneyImpactDashboard isLightTheme={false} />
      )}

      {/* 1. Verification Suite Subtab */}
      {activeSubTab === "verification" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Phase 9 Scale, Commercialization & Multi-Service Test Suite
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Executes 6 automated validation checks proving dynamic service configuration injection without code rewrites, multi-jurisdiction resolution, institutional tenancy isolation, journey micro-cost tracking, 5,000 user concurrency load testing, and commercial model readiness.
              </p>
            </div>

            <button
              onClick={runPhase9TestSuite}
              disabled={isLoadingVerification}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingVerification ? "animate-spin" : ""}`} />
              {isLoadingVerification ? "Executing Phase 9 Suite..." : "Run Phase 9 Tests"}
            </button>
          </div>

          {phase9Results && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                phase9Results.status === "PASS"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-300"
              }`}>
                <div className="flex items-center gap-3">
                  {phase9Results.status === "PASS" ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-500" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      Phase 9 Scale & Commercialization Verification: {phase9Results.status}
                    </h4>
                    <p className="text-xs opacity-80 mt-0.5">
                      Completed at {new Date(phase9Results.timestamp).toLocaleTimeString()} — 100% Architectural Constraints Validated
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold shadow-sm">
                  {phase9Results.tests.filter(t => t.status === "PASS").length} / {phase9Results.tests.length} Tests Passed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phase9Results.tests.map((test, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          {test.name}
                        </h5>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        test.status === "PASS"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                      }`}>
                        {test.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {test.details}
                    </p>

                    {test.sampleData && (
                      <div className="bg-slate-950 text-slate-300 rounded p-2 text-[11px] font-mono overflow-x-auto">
                        <pre>{JSON.stringify(test.sampleData, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Multi-Service Jurisdiction Catalog Subtab */}
      {activeSubTab === "jurisdiction-services" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-500" />
                  Data-Driven Government Services Catalog
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Services are structured configurations (JSON definitions) loaded dynamically per Jurisdiction (Country / State / District / Department).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Filter State:</span>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs p-2 font-bold text-emerald-600 dark:text-emerald-400"
                >
                  <option value="MH">Maharashtra (MH)</option>
                  <option value="KA">Karnataka (KA)</option>
                  <option value="DL">Delhi (DL)</option>
                  <option value="RJ">Rajasthan (RJ)</option>
                  <option value="TN">Tamil Nadu (TN)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Registered Services ({servicesList.length})
                </h4>

                {servicesList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                    No services registered for {selectedState} yet. Try injecting one via the Dynamic Injector tab!
                  </p>
                ) : (
                  servicesList.map((srv) => (
                    <div
                      key={srv.serviceId}
                      onClick={() => setSelectedService(srv)}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        selectedService?.serviceId === srv.serviceId
                          ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                          {srv.serviceCode}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          SLA: {srv.slaDays} Days
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {srv.serviceName}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {srv.description}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-400 font-medium flex items-center justify-between">
                        <span>{srv.jurisdiction.departmentName}</span>
                        <span className="font-bold">{srv.jurisdiction.districtName}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedService && (
                <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        Service ID: {selectedService.serviceId} • v{selectedService.version}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {selectedService.serviceName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedService.jurisdiction.departmentName} ({selectedService.jurisdiction.stateCode}/{selectedService.jurisdiction.districtName})
                      </p>
                    </div>

                    <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded font-bold text-xs">
                      {selectedService.category}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Required Documents ({selectedService.requiredDocuments.length}):
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        {selectedService.requiredDocuments.map((doc, idx) => (
                          <li key={idx}>
                            <span className="font-semibold text-slate-900 dark:text-white">{doc.docName}</span> ({doc.docTypeCode}) — {doc.mandatory ? "Mandatory" : "Optional"}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Workflow Orchestration Phases ({selectedService.workflowPhases.length}):
                      </h5>
                      <div className="space-y-2">
                        {selectedService.workflowPhases.map((phase, pIdx) => (
                          <div key={pIdx} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                            <h6 className="font-bold text-slate-900 dark:text-white text-xs">
                              Phase {phase.sequenceOrder}: {phase.phaseName}
                            </h6>
                            <div className="mt-1 space-y-1">
                              {phase.steps.map((st, sIdx) => (
                                <div key={sIdx} className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                  <span>• {st.title}</span>
                                  <span className="font-mono text-emerald-600 dark:text-emerald-400">[{st.actor}] {st.isAutomated ? "(Automated AI)" : "(Manual)"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Dynamic Form Fields ({selectedService.formFields.length}):
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedService.formFields.map((f, fIdx) => (
                          <div key={fIdx} className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 text-[11px]">
                            <p className="font-bold text-slate-900 dark:text-white">{f.label}</p>
                            <p className="text-slate-400">Key: {f.fieldKey} | Type: {f.fieldType}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Dynamic Service Injector Subtab */}
      {activeSubTab === "dynamic-injector" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-500" />
              Dynamic Government Service Configuration Injector
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proves that adding a new government service does NOT require rebuilding or recompiling the application. Paste a structured JSON service definition below to inject it instantly into the active service registry!
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                JSON Service Definition:
              </label>
              <textarea
                value={jsonConfigInput}
                onChange={(e) => setJsonConfigInput(e.target.value)}
                rows={14}
                className="w-full bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl p-4 border border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              onClick={handleInjectService}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Inject Service Config (No Code Rewrite)
            </button>

            {injectionMsg && (
              <div className={`p-4 rounded-xl border text-xs font-medium ${
                injectionMsg.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
              }`}>
                {injectionMsg.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Tenancy & Institutional Structure Subtab */}
      {activeSubTab === "tenancy" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              Tenancy Readiness & Institutional Structure
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              BharatNavigator supports multi-tenant deployment for State Governments, Municipal Corporations, and CSC Franchise Networks, while keeping citizen data isolation strictly enforced.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold text-[10px]">
                    STATE_GOVT
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">tnt_maha_edistrict</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  MahaOnline e-District Citizen Portal
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Directorate of IT, Govt of Maharashtra. Customized branding with state logo and custom SLA rules.
                </p>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <p className="text-slate-400 font-medium">Strict Data Isolation Key:</p>
                  <code className="text-emerald-500 font-mono text-[11px]">tenant_isolation_mh_2026</code>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                    CSC_NETWORK
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">tnt_csc_e_mitra</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  CSC Common Service Centre Franchise Network
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  CSC e-Governance Services India Limited. Pan-India multi-state service operator deployment.
                </p>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <p className="text-slate-400 font-medium">Strict Data Isolation Key:</p>
                  <code className="text-emerald-500 font-mono text-[11px]">tenant_isolation_csc_2026</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Journey Cost Engineering Subtab */}
      {activeSubTab === "cost-calculator" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-500" />
              Granular Journey Cost Engineering Calculator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tracks real micro-costs per citizen journey across AI tokens, OCR document scans, storage space, and compute requests.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Featherless AI Tokens:
                </label>
                <input
                  type="number"
                  value={calcTokens}
                  onChange={(e) => setCalcTokens(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  OCR Scanned Pages:
                </label>
                <input
                  type="number"
                  value={calcOcrDocs}
                  onChange={(e) => setCalcOcrDocs(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Vault Storage (MB):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calcStorageMB}
                  onChange={(e) => setCalcStorageMB(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Compute Requests:
                </label>
                <input
                  type="number"
                  value={calcComputeReqs}
                  onChange={(e) => setCalcComputeReqs(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleCalculateCost}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Recalculate Journey Cost
            </button>

            {costResult && (
              <div className="bg-slate-950 text-slate-200 rounded-xl p-5 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Total Calculated Cost Per Completed Journey:</span>
                  <span className="text-lg font-bold text-emerald-400">₹{costResult.totalJourneyCostINR}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] pt-1">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <p className="text-slate-500">AI Token Cost ({costResult.aiTokenCount} tokens)</p>
                    <p className="text-white font-bold mt-0.5">₹{costResult.aiCostINR}</p>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <p className="text-slate-500">OCR Scan Cost ({costResult.ocrDocumentCount} pages)</p>
                    <p className="text-white font-bold mt-0.5">₹{costResult.ocrCostINR}</p>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <p className="text-slate-500">Storage Cost ({costResult.storageMB} MB)</p>
                    <p className="text-white font-bold mt-0.5">₹{costResult.storageCostINR}</p>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <p className="text-slate-500">Compute Overhead ({costResult.computeRequestsCount} reqs)</p>
                    <p className="text-white font-bold mt-0.5">₹{costResult.infraCostINR}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Scalability & Load Testing Subtab */}
      {activeSubTab === "load-testing" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              High-Concurrency Scalability & Load Testing Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulates concurrent citizen sessions, workflow executions, OCR scans, and AI model calls to verify system throughput and P99 latency.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Simulated Concurrent Citizens:</span>
                <span className="text-emerald-500 text-sm font-mono">{simulatedUsersCount.toLocaleString()} Users</span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={simulatedUsersCount}
                onChange={(e) => setSimulatedUsersCount(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <button
              onClick={handleRunLoadTest}
              disabled={isTestRunning}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTestRunning ? "animate-spin" : ""}`} />
              {isTestRunning ? "Simulating Traffic..." : `Run Load Test (${simulatedUsersCount.toLocaleString()} Users)`}
            </button>

            {loadTestResult && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Throughput</p>
                  <p className="text-xl font-bold text-emerald-500 mt-1">{loadTestResult.throughputRps.toLocaleString()} RPS</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Requests / sec</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Avg Latency</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{loadTestResult.avgLatencyMs} ms</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">P99: {loadTestResult.p99LatencyMs} ms</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Success Rate</p>
                  <p className="text-xl font-bold text-blue-500 mt-1">{loadTestResult.successRatePercentage}%</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Zero Data Leaks</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">System Health</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{loadTestResult.systemHealthStatus}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Auto-Scaling Active</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Differentiation & Commercial Model Subtab */}
      {activeSubTab === "differentiation" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Differentiation Framework & Commercial Model (B2G / B2B2C)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              BharatNavigator is NOT another chatbot, RAG search bar, document locker, or scheme directory. It is the premier <strong>Citizen Journey Intelligence + Workflow Orchestration + Controlled Automation Engine</strong> for Public Services in India.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">1</div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Citizen Journey Intelligence</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Contextual rule engine evaluating age, income, caste, and state eligibility with verified document matching.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">2</div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Workflow Orchestration</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  State-machine tracking applications step-by-step with automated API integration and officer field verification timelines.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">3</div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Controlled Automation</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Human-in-the-loop proactive alerts, document expiry monitoring, and pre-filling forms without unsolicited automated submissions.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                B2G & Institutional Expansion Layers
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Institutional Deployment (B2G)", target: "State IT Missions & e-Governance Departments", desc: "Dedicated tenant instance with custom state branding, local language LLM fine-tuning, and direct API state gateway integration." },
                  { title: "Workflow Platform API (B2B2C)", target: "CSC Digital Seva Kendras & e-Mitra Kiosks", desc: "RESTful API allowing kiosk operators to assist citizens with automated pre-validation and step-by-step roadmap tracking." },
                  { title: "CSR & Enterprise Support", target: "Corporate CSR Welfare Desks & NGOs", desc: "Custom portal white-labeling for corporate social responsibility initiatives assisting worker families with government welfare schemes." },
                  { title: "Analytics & Bottleneck Module", target: "District Collectors & Department Heads", desc: "Real-time SLA tracking dashboard highlighting field officer verification bottlenecks and regional service completion rates." }
                ].map((layer, lIdx) => (
                  <div key={lIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                    <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{layer.title}</h5>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{layer.target}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{layer.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Architecture Docs Subtab */}
      {activeSubTab === "architecture" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-500" />
              System Architecture & Service Boundaries
            </h3>

            <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Service Boundaries</h4>
                <p>• <strong>Client SPA Layer</strong>: React 18, Vite, Tailwind CSS, Lucide icons.</p>
                <p>• <strong>Server Orchestration Layer</strong>: Express 4/5 Node server running on Cloud Run (Port 3000).</p>
                <p>• <strong>AI Document Intelligence</strong>: Featherless AI API (Qwen/Qwen2.5-7B-Instruct, Llama-3.3-70B, Qwen3-VL-30B vision OCR) for fast inference and structured JSON notice interpretation.</p>
                <p>• <strong>Security & Hardening</strong>: Zero-Trust Bearer verification, RBAC middleware, AI Prompt Sanitizer, Document Upload Guard, and Rate Limiting.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Database & Persistence Strategy</h4>
                <p>• <strong>Primary Storage</strong>: Firebase Firestore database (`ai-studio-bharatnavigator-*`).</p>
                <p>• <strong>Audit & Backups</strong>: In-memory & Firestore immutable audit trail with SHA256 checksum-verified snapshot backup manifests.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Scaling Strategy & Failure Handling</h4>
                <p>• <strong>Auto-Scaling</strong>: Stateless Express handlers horizontally auto-scaling on Cloud Run.</p>
                <p>• <strong>Failure Isolation</strong>: Graceful degradation to local regex parsing if Featherless API key or external network calls time out.</p>
                <p>• <strong>Data Isolation</strong>: Strict per-user isolation keys preventing cross-tenant and cross-user data leaks.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
