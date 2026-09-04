import React, { useState, useEffect } from "react";
import { 
  queryGovernmentRAG, 
  RAGQueryResult, 
  GOVERNMENT_RAG_ARCHITECTURE, 
  ACTIVE_GOVERNMENT_SOURCES,
  KnowledgeSource 
} from "../services/governmentRAG";
import { 
  BookOpen, 
  Search, 
  Database, 
  FolderTree, 
  ExternalLink, 
  ShieldCheck, 
  Terminal, 
  Code2, 
  Filter, 
  Layers, 
  FileText, 
  Sparkles,
  CheckCircle2,
  Table,
  User,
  FileCheck,
  Compass,
  ArrowRight,
  Upload,
  AlertCircle,
  Clock,
  History,
  PlusCircle,
  Edit3,
  RefreshCw,
  Check,
  XCircle,
  ShieldAlert,
  Calendar,
  Building2,
  Tag
} from "lucide-react";
import { 
  Profile, 
  GovernmentSource, 
  GovernmentSourceVersion, 
  RetrievedChunkProvenance, 
  Phase1TestResult,
  FreshnessState,
  VerificationStatus,
  SourceConfidenceLabel
} from "../types";

interface GovernmentRAGViewProps {
  isLightTheme: boolean;
  profile?: Profile;
  vaultDocs?: any[];
  roadmaps?: any[];
  onNavigateTab?: (tab: string) => void;
  onOpenUploadModal?: () => void;
  onStartRoadmap?: (serviceName: string) => void;
}

export const GovernmentRAGView: React.FC<GovernmentRAGViewProps> = ({ 
  isLightTheme,
  profile,
  vaultDocs = [],
  roadmaps = [],
  onNavigateTab,
  onOpenUploadModal,
  onStartRoadmap
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isQuerying, setIsQuerying] = useState(false);
  const [ragResult, setRagResult] = useState<RAGQueryResult | null>(null);
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "corpus" | "admin" | "architecture">("search");

  // Admin Registry Management State
  const [registrySources, setRegistrySources] = useState<GovernmentSource[]>([]);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(false);
  const [freshnessFilter, setFreshnessFilter] = useState<string>("All");
  const [selectedVersionHistory, setSelectedVersionHistory] = useState<GovernmentSourceVersion[]>([]);
  const [activeVersionSourceId, setActiveVersionSourceId] = useState<string | null>(null);
  const [isVersionDrawerOpen, setIsVersionDrawerOpen] = useState(false);

  // Add/Edit Source Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Partial<GovernmentSource> | null>(null);
  const [formData, setFormData] = useState<Partial<GovernmentSource>>({});

  // Verification Suite Test State
  const [testResult, setTestResult] = useState<Phase1TestResult | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const fetchRegistry = async () => {
    setIsLoadingRegistry(true);
    try {
      const res = await fetch("/api/v1/sources");
      if (res.ok) {
        const data = await res.json();
        setRegistrySources(data.sources || []);
      }
    } catch (err) {
      console.warn("Error fetching sources registry:", err);
    } finally {
      setIsLoadingRegistry(false);
    }
  };

  useEffect(() => {
    if (activeTab === "corpus" || activeTab === "admin") {
      fetchRegistry();
    }
  }, [activeTab]);

  const handleSearch = async (queryToRun?: string) => {
    const q = (queryToRun !== undefined ? queryToRun : searchQuery).trim();
    if (!q) return;
    setIsQuerying(true);
    try {
      const res = await queryGovernmentRAG(q, selectedCategory, profile?.state || "All");
      setRagResult(res);
      if (res.sources && res.sources.length > 0) {
        setSelectedSource(res.sources[0]);
      } else {
        setSelectedSource(null);
      }
    } catch (err) {
      console.error("RAG Query Error:", err);
    } finally {
      setIsQuerying(false);
    }
  };

  const runPhase1Verification = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch("/api/v1/test/phase1");
      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch (err) {
      console.error("Verification test error:", err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSource(null);
    setFormData({
      title: "",
      department: "",
      ministry: "Union Government of India",
      service: "",
      state: "Central / All India",
      district: "All Districts",
      sourceUrl: "https://india.gov.in",
      documentUrl: "https://india.gov.in",
      sourceType: "circular",
      effectiveFrom: new Date().toISOString().split("T")[0],
      effectiveUntil: "2029-12-31",
      clauseReference: "Section 1",
      category: "Government Procedures",
      fullRuleText: "",
      summary: "",
      tags: ["official", "gazette"]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (src: GovernmentSource) => {
    setEditingSource(src);
    setFormData({ ...src });
    setIsModalOpen(true);
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSource && editingSource.sourceId) {
        // Update source
        const res = await fetch(`/api/v1/sources/${editingSource.sourceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            changedBy: profile?.name || "Admin",
            changeReason: "Admin Portal Source Edit"
          })
        });
        if (res.ok) {
          fetchRegistry();
          setIsModalOpen(false);
        }
      } else {
        // Create source
        const res = await fetch("/api/v1/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          fetchRegistry();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Save source error:", err);
    }
  };

  const handleViewVersionHistory = async (sourceId: string) => {
    setActiveVersionSourceId(sourceId);
    setIsVersionDrawerOpen(true);
    try {
      const res = await fetch(`/api/v1/sources/${sourceId}/versions`);
      if (res.ok) {
        const data = await res.json();
        setSelectedVersionHistory(data.versions || []);
      }
    } catch (err) {
      console.error("Fetch versions error:", err);
    }
  };

  const getFreshnessBadge = (state?: FreshnessState) => {
    switch (state) {
      case "CURRENT":
        return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> CURRENT</span>;
      case "REVIEW_REQUIRED":
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> REVIEW REQUIRED</span>;
      case "STALE":
        return <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" /> STALE</span>;
      case "EXPIRED":
        return <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1"><XCircle className="w-2.5 h-2.5" /> EXPIRED</span>;
      default:
        return <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-[9px] font-mono font-bold uppercase">VERIFIED</span>;
    }
  };

  const getConfidenceBadge = (label?: SourceConfidenceLabel) => {
    switch (label) {
      case "Verified":
        return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> Verified</span>;
      case "Partially verified":
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Partially Verified</span>;
      case "Unverified":
        return <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" /> Unverified</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in font-sans pb-12">
      {/* Top Header */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden ${
        isLightTheme
          ? "bg-gradient-to-br from-cyan-500/10 via-blue-100/30 to-white border-cyan-200"
          : "bg-gradient-to-br from-[#091522] via-[#070d17] to-black border-cyan-500/20 shadow-2xl"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Phase 1: Source-Grounded Knowledge
              </span>
              <span className="text-[10px] font-mono text-white/40">Zero Hallucination Gazette Registry</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold font-display ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              Government Knowledge Infrastructure
            </h2>
            <p className={`text-xs max-w-2xl leading-relaxed ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
              Grounded, verifiable official guidelines with full provenance tracking, freshness evaluation, and immutable audit logs.
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {[
              { id: "search", label: "NL Search & RAG", icon: Search },
              { id: "corpus", label: "Source Registry", icon: FileText },
              { id: "admin", label: "Knowledge Management", icon: ShieldAlert },
              { id: "architecture", label: "RAG Specs", icon: FolderTree }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-cyan-500 text-black border-cyan-400 font-bold shadow-md"
                      : isLightTheme
                        ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 1: RAG SEARCH & PROVENANCE INSPECTOR */}
      {activeTab === "search" && (
        <div className="space-y-6">
          {/* Query Bar */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
          }`}>
            <label className={`text-xs font-mono font-bold uppercase tracking-wider block ${isLightTheme ? "text-slate-700" : "text-white/70"}`}>
              Search Government Policy, Schemes, or Procedures
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-cyan-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. Can banks demand collateral for Mudra loans? or NSWS Single Window Rules"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                    isLightTheme
                      ? "bg-slate-100 text-slate-900 border border-slate-200"
                      : "bg-black/50 text-white border border-white/10"
                  }`}
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-mono font-semibold focus:outline-none ${
                    isLightTheme ? "bg-slate-100 text-slate-800 border border-slate-200" : "bg-black/50 text-white border border-white/10"
                  }`}
                >
                  <option value="All">All Categories</option>
                  <option value="Scheme Rules">Scheme Rules</option>
                  <option value="Citizen Services">Citizen Services</option>
                  <option value="Government Procedures">Government Procedures</option>
                  <option value="Workflow Rules">Workflow Rules</option>
                  <option value="FAQ">FAQ</option>
                </select>

                <button
                  onClick={() => handleSearch()}
                  disabled={isQuerying}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-black font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isQuerying ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-black" />
                      <span>Retrieving...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>Search RAG</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Sample Queries */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-white/40 uppercase block">Verified Sample Queries:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  "Can banks demand collateral for Mudra loans?",
                  "NSWS commercial clearance mandate",
                  "e-District certificate QR code validity",
                  "Free Udyam MSME registration rules",
                  "DigiLocker IT Act Section 6A legal parity"
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchQuery(q);
                      handleSearch(q);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap transition cursor-pointer border ${
                      isLightTheme
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RAG Search Results */}
          {ragResult ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Grounded Answer & Citation List */}
              <div className="md:col-span-2 space-y-4">
                {/* Fallback Warning / Grounded Answer Header */}
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  ragResult.fallbackTriggered
                    ? isLightTheme ? "bg-amber-50 border-amber-300" : "bg-amber-500/10 border-amber-500/30"
                    : isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
                }`}>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      {ragResult.fallbackTriggered ? "Zero-Hallucination Fallback" : "Source-Grounded Response"}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      {ragResult.fallbackTriggered ? "No matching registry source" : `Grounded on ${ragResult.sources.length} source(s)`}
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm leading-relaxed ${isLightTheme ? "text-slate-800" : "text-white/90"}`}>
                    {ragResult.summaryResponse}
                  </p>

                  {/* Freshness Summary Bar */}
                  {ragResult.freshnessSummary && !ragResult.fallbackTriggered && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[10px] font-mono text-white/50">
                      <span>Source Health:</span>
                      <span className="text-emerald-400 font-bold">{ragResult.freshnessSummary.current} CURRENT</span>
                      {ragResult.freshnessSummary.reviewRequired > 0 && <span className="text-amber-400 font-bold">{ragResult.freshnessSummary.reviewRequired} REVIEW REQUIRED</span>}
                      {ragResult.freshnessSummary.expired > 0 && <span className="text-rose-400 font-bold">{ragResult.freshnessSummary.expired} EXPIRED</span>}
                    </div>
                  )}
                </div>

                {/* Retrieved Sources Citation Cards */}
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
                }`}>
                  <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                    Retrieved Gazette Citations & Provenance ({ragResult.sources.length})
                  </h4>

                  <div className="space-y-3">
                    {ragResult.sources.map((src) => (
                      <div
                        key={src.id}
                        onClick={() => setSelectedSource(src)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition space-y-2 ${
                          selectedSource?.id === src.id
                            ? "bg-cyan-500/10 border-cyan-500 text-white ring-1 ring-cyan-500/30"
                            : isLightTheme
                              ? "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            {getFreshnessBadge(src.freshnessState)}
                            {getConfidenceBadge(src.confidenceLabel || src.provenance?.confidenceLabel)}
                            <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-[9px] font-mono font-bold uppercase">
                              {src.category}
                            </span>
                            {src.provenance?.version && (
                              <span className="px-1.5 py-0.5 bg-white/10 text-white/60 rounded text-[9px] font-mono">
                                v{src.provenance.version}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">
                            {Math.round(src.relevanceScore * 100)}% match
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-white">{src.title}</h5>
                        <p className="text-[11px] text-white/60 line-clamp-2">{src.summary}</p>

                        <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-white/40 border-t border-white/5">
                          <span>{src.clauseReference}</span>
                          <span className="text-amber-400">{src.department}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Deep Provenance Inspector */}
              <div className="space-y-4">
                {selectedSource && selectedSource.provenance ? (
                  <div className={`p-5 rounded-2xl border space-y-4 ${
                    isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
                  }`}>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        Verified Source Provenance
                      </span>
                      <div className="flex items-center gap-2">
                        {getFreshnessBadge(selectedSource.provenance.freshnessState)}
                        {getConfidenceBadge(selectedSource.confidenceLabel || selectedSource.provenance?.confidenceLabel)}
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <h5 className="font-bold text-white text-sm">{selectedSource.provenance.title}</h5>
                        <p className="text-[11px] text-amber-400 font-mono mt-0.5">{selectedSource.provenance.department}</p>
                        <p className="text-[10px] text-white/50 font-mono">{selectedSource.provenance.ministry}</p>
                      </div>

                      <div className="p-3 bg-black/50 rounded-xl border border-white/10 space-y-2 font-mono text-[11px]">
                        <span className="text-[9px] text-white/40 uppercase block">Verbatim Clause Text:</span>
                        <p className="text-cyan-300 leading-relaxed">{selectedSource.fullRuleText}</p>
                      </div>

                      <div className="space-y-1.5 font-mono text-[10px] bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex justify-between">
                          <span className="text-white/40">Clause Reference:</span>
                          <span className="text-white font-bold">{selectedSource.provenance.pageSectionRef}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Source Version:</span>
                          <span className="text-cyan-400 font-bold">v{selectedSource.provenance.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Effective Boundary:</span>
                          <span className="text-white">{selectedSource.provenance.effectiveFrom} to {selectedSource.provenance.effectiveUntil}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Last Verified Date:</span>
                          <span className="text-emerald-400">{new Date(selectedSource.provenance.lastVerifiedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <a
                        href={selectedSource.provenance.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg"
                      >
                        <span>Open Official Portal ({selectedSource.provenance.sourceUrl})</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className={`p-6 rounded-2xl border text-center space-y-2 ${
                    isLightTheme ? "bg-slate-50 border-slate-200" : "bg-black/30 border-white/5 text-white/40"
                  }`}>
                    <BookOpen className="w-8 h-8 mx-auto text-white/20" />
                    <p className="text-xs font-mono">Select a citation to inspect provenance details</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`p-12 text-center rounded-2xl border space-y-4 ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
            }`}>
              <BookOpen className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className={`text-base font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                  Grounded Government Knowledge Search
                </h3>
                <p className={`text-xs ${isLightTheme ? "text-slate-600" : "text-slate-300"}`}>
                  Enter a query above to retrieve official gazette circulars, verified rules, and complete provenance details.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SOURCE REGISTRY (CORPUS) */}
      {activeTab === "corpus" && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
        }`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-3 flex-wrap gap-2">
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-800" : "text-white"}`}>
              Registered Government Sources ({registrySources.length})
            </h3>
            <button
              onClick={fetchRegistry}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs font-mono rounded-lg border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingRegistry ? "animate-spin" : ""}`} />
              <span>Refresh Registry</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registrySources.map((item) => (
              <div key={item.sourceId} className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getFreshnessBadge(item.freshnessState)}
                    <span className="px-1.5 py-0.5 bg-white/10 text-white/60 rounded text-[9px] font-mono">v{item.version}</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">{item.clauseReference}</span>
                </div>

                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                <p className="text-[11px] text-amber-400 font-mono">{item.department}</p>
                <p className="text-[11px] text-white/60">{item.summary}</p>
                
                <div className="p-2.5 bg-white/5 rounded-lg font-mono text-[10px] text-cyan-300">
                  {item.fullRuleText}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-white/40">
                  <span>Effective: {item.effectiveFrom} to {item.effectiveUntil}</span>
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                    <span>Portal Link</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADMIN KNOWLEDGE MANAGEMENT & VERIFICATION SUITE */}
      {activeTab === "admin" && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className={`text-sm font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                  Government Source Management & Versioning Control
                </h3>
                <p className="text-xs text-white/60">
                  Internal administrative workflow to manage official sources, issue version updates, and run verification audits.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register New Source</span>
                </button>

                <button
                  onClick={runPhase1Verification}
                  disabled={isRunningTests}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <CheckCircle2 className={`w-4 h-4 ${isRunningTests ? "animate-spin" : ""}`} />
                  <span>Run Phase 1 Verification Suite</span>
                </button>
              </div>
            </div>

            {/* Test Suite Verification Results Panel */}
            {testResult && (
              <div className={`p-4 rounded-xl border space-y-3 text-xs ${
                testResult.status === "PASS"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Phase 1 Standing Verification Results ({testResult.status})
                  </span>
                  <span className="text-[10px] font-mono text-white/40">{testResult.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                  {testResult.tests.map((t, idx) => (
                    <div key={idx} className="p-2.5 bg-black/40 border border-white/10 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{t.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          t.status === "PASS" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/70">{t.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Registry Management Table */}
          <div className={`p-5 rounded-2xl border space-y-4 overflow-x-auto ${
            isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
          }`}>
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-[10px] uppercase">
                  <th className="py-2.5 px-3">Source ID / Title</th>
                  <th className="py-2.5 px-3">Department & Ministry</th>
                  <th className="py-2.5 px-3">Status & Freshness</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Effective Dates</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrySources.map((src) => (
                  <tr key={src.sourceId} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3">
                      <span className="text-cyan-400 font-bold block">{src.sourceId}</span>
                      <span className="text-white font-medium">{src.title}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-amber-400 block">{src.department}</span>
                      <span className="text-white/40 text-[10px]">{src.ministry}</span>
                    </td>
                    <td className="py-3 px-3">
                      {getFreshnessBadge(src.freshnessState)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-white/10 text-white rounded font-bold">v{src.version}</span>
                    </td>
                    <td className="py-3 px-3 text-white/60 text-[10px]">
                      {src.effectiveFrom} to {src.effectiveUntil}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(src)}
                        className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded hover:bg-cyan-500/30 transition cursor-pointer"
                      >
                        Edit / Update
                      </button>
                      <button
                        onClick={() => handleViewVersionHistory(src.sourceId)}
                        className="px-2.5 py-1 bg-white/10 text-white/80 border border-white/10 rounded hover:bg-white/20 transition cursor-pointer"
                      >
                        Audit History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ARCHITECTURE SPECS */}
      {activeTab === "architecture" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
            }`}>
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <FolderTree className="w-4 h-4 text-cyan-400" />
                <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                  Folder Structure & RAG Modules
                </h4>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {GOVERNMENT_RAG_ARCHITECTURE.folderStructure.map((f, i) => (
                  <div key={i} className="p-2.5 bg-black/40 border border-white/10 rounded-xl space-y-0.5">
                    <span className="font-bold text-amber-400">{f.path}</span>
                    <p className="text-[10px] text-white/60">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-5 rounded-2xl border space-y-4 ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
            }`}>
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Table className="w-4 h-4 text-cyan-400" />
                <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                  Phase 1 Database Schemas
                </h4>
              </div>

              <div className="space-y-4">
                {GOVERNMENT_RAG_ARCHITECTURE.dbSchema.map((tbl, i) => (
                  <div key={i} className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-2 text-xs font-mono">
                    <span className="font-bold text-cyan-400 block">Table: {tbl.tableName}</span>
                    <div className="space-y-1">
                      {tbl.columns.map((col, cIdx) => (
                        <div key={cIdx} className="flex items-center justify-between text-[10px] border-b border-white/5 pb-1">
                          <span className="text-white font-semibold">{col.name}</span>
                          <span className="text-amber-400">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SOURCE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1017] border border-cyan-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                {editingSource ? `Edit Source: ${editingSource.sourceId} (Will bump version to v${(editingSource.version || 1) + 1})` : "Register New Government Source"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveSource} className="space-y-3 font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/60 block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/60 block mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.department || ""}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/60 block mb-1">Ministry</label>
                  <input
                    type="text"
                    value={formData.ministry || ""}
                    onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/60 block mb-1">Clause Reference</label>
                  <input
                    type="text"
                    value={formData.clauseReference || ""}
                    onChange={(e) => setFormData({ ...formData, clauseReference: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/60 block mb-1">Source URL (.gov.in)</label>
                  <input
                    type="url"
                    value={formData.sourceUrl || ""}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/60 block mb-1">Effective Until Date</label>
                  <input
                    type="date"
                    value={formData.effectiveUntil || ""}
                    onChange={(e) => setFormData({ ...formData, effectiveUntil: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/60 block mb-1">Summary</label>
                <textarea
                  rows={2}
                  value={formData.summary || ""}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/60 block mb-1">Full Verbatim Rule Text *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.fullRuleText || ""}
                  onChange={(e) => setFormData({ ...formData, fullRuleText: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-cyan-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl"
                >
                  Save & Commit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: VERSION HISTORY */}
      {isVersionDrawerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-[#0c1017] border-l border-white/10 max-w-lg w-full h-full p-6 space-y-4 font-mono overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">
                Audit Trail History ({activeVersionSourceId})
              </h3>
              <button onClick={() => setIsVersionDrawerOpen(false)} className="text-white/40 hover:text-white">✕</button>
            </div>

            {selectedVersionHistory.length === 0 ? (
              <p className="text-xs text-white/40">No prior historical snapshots recorded for this source.</p>
            ) : (
              <div className="space-y-3">
                {selectedVersionHistory.map((v) => (
                  <div key={v.versionId} className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-cyan-400 font-bold">
                      <span>{v.versionId}</span>
                      <span className="text-[10px] text-white/40">{new Date(v.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-white/70">Reason: {v.changeReason} (by {v.changedBy})</p>
                    <div className="p-2 bg-white/5 rounded text-[10px] text-amber-300">
                      Title: {v.snapshot.title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
