import React from "react";
import {
  UserCheck,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Bell,
  Plus,
  Compass,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  Activity,
  Zap,
  ChevronRight,
  Database,
  RefreshCw,
  FolderPlus,
  HelpCircle
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { DigiLockerDoc } from "./DigiLockerVault";

interface DashboardCardsGridProps {
  onNavigateTab?: (tab: string) => void;
  onOpenAddDocModal?: () => void;
}

export const DashboardCardsGrid: React.FC<DashboardCardsGridProps> = ({
  onNavigateTab,
  onOpenAddDocModal,
}) => {
  const {
    profile,
    vaultDocs,
    notifications,
    activityLog,
    roadmaps,
    isLoadingData,
    refreshUserData,
    profileCompletionPercentage,
    verifiedDocsCount,
    pendingDocsCount,
    upcomingExpiryCount,
    unreadNotificationsCount,
    isLightTheme,
  } = useApp();

  const docs = vaultDocs || [];
  const rms = roadmaps || [];
  const logs = activityLog || [];

  const isVaultEmpty = docs.length === 0;

  // Generate dynamic AI Suggestions based on live user data
  const aiSuggestions = (() => {
    const suggestions: { id: string; title: string; desc: string; actionText: string; tab: string }[] = [];

    // Aadhaar check
    const hasAadhaar = docs.some(
      (d) => d.name?.toLowerCase().includes("aadhaar") || d.docType?.toLowerCase().includes("aadhaar")
    );

    if (hasAadhaar) {
      suggestions.push({
        id: "sug_aadhaar",
        title: "Aadhaar e-KYC Ready",
        desc: "Aadhaar Card is verified in your Secure Vault. You are eligible for direct portal registrations.",
        actionText: "View Vault",
        tab: "documents",
      });
    } else {
      suggestions.push({
        id: "sug_no_aadhaar",
        title: "Upload Aadhaar Card",
        desc: "Add your Aadhaar Card to unlock automated e-KYC and faster government scheme applications.",
        actionText: "+ Add Aadhaar",
        tab: "documents",
      });
    }

    // Income certificate check
    const hasIncomeCert = docs.some(
      (d) => d.name?.toLowerCase().includes("income") || d.docType?.toLowerCase().includes("income")
    );
    if (!hasIncomeCert) {
      suggestions.push({
        id: "sug_income",
        title: "Missing Income Certificate",
        desc: `Upload Income Certificate to check eligibility for fee concessions and subsidy schemes in ${profile.state || "your state"}.`,
        actionText: "Add Document",
        tab: "documents",
      });
    }

    // Profile completeness check
    if (profileCompletionPercentage < 80) {
      suggestions.push({
        id: "sug_profile",
        title: "Complete Citizen Profile",
        desc: `Your Citizen Profile is ${profileCompletionPercentage}% complete. Update missing details for precise scheme matching.`,
        actionText: "Update Profile",
        tab: "profile",
      });
    }

    // Roadmap check
    if (rms.length === 0) {
      suggestions.push({
        id: "sug_roadmap",
        title: "Generate Compliance Roadmap",
        desc: "Consult the AI Assistant to generate a state-specific legal and application roadmap.",
        actionText: "Ask AI Assistant",
        tab: "assistant",
      });
    }

    return suggestions;
  })();

  if (isLoadingData) {
    return (
      <div className="space-y-4 text-left">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
          <Database className="w-4 h-4 animate-spin text-amber-400" />
          <span>Calculating live authenticated user metrics...</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border animate-pulse h-28 ${
                isLightTheme ? "bg-slate-200/50 border-slate-300" : "bg-white/[0.02] border-white/5"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-800" : "text-white"}`}>
            Live Citizen Operations Dashboard
          </h3>
          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-bold uppercase rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Authenticated User Data</span>
          </span>
        </div>

        <button
          onClick={() => refreshUserData()}
          className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
            isLightTheme
              ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
          title="Re-query authenticated Firestore state"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Sync Data</span>
        </button>
      </div>

      {/* QUICK ACTIONS TOOLBAR */}
      <div className="p-4 bg-[#0b0f19] border border-blue-500/20 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider font-bold text-blue-400">
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            <span>Quick Actions</span>
          </span>
          <span className="text-white/40 text-[10px]">Real-Time Portal Tools</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 font-mono text-xs">
          <button
            onClick={() => {
              if (onOpenAddDocModal) onOpenAddDocModal();
              else if (onNavigateTab) onNavigateTab("documents");
            }}
            className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Doc</span>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab("profile")}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab("assistant")}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab("eligibility")}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Eligibility</span>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab("roadmap")}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Roadmaps</span>
          </button>
        </div>
      </div>

      {/* EMPTY VAULT / NEW USER ONBOARDING BANNER */}
      {isVaultEmpty && (
        <div className="p-6 bg-[#0b0f19] border border-dashed border-amber-500/40 rounded-3xl space-y-4 text-left relative overflow-hidden shadow-2xl">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                Welcome to Bharat Navigator
              </span>
              <h2 className="text-xl font-bold text-white">Get Started with Your Citizen Operations Setup</h2>
              <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
                Your authenticated workspace is initialized. Follow these 3 simple onboarding steps to configure your citizen account, secure your official documents, and generate custom legal roadmaps.
              </p>
            </div>

            <button
              onClick={() => {
                if (onOpenAddDocModal) onOpenAddDocModal();
                else if (onNavigateTab) onNavigateTab("documents");
              }}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-mono text-xs font-extrabold uppercase rounded-2xl shadow-xl transition cursor-pointer shrink-0 flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Upload First Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/10 font-mono text-xs">
            <div
              onClick={() => onNavigateTab && onNavigateTab("profile")}
              className="p-3 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-amber-500/40 transition cursor-pointer space-y-1"
            >
              <div className="flex justify-between items-center text-amber-400 font-bold">
                <span>1. Citizen Profile</span>
                <span>{profileCompletionPercentage}%</span>
              </div>
              <p className="text-[11px] text-white/50 leading-snug">Fill age, state ({profile.state}), occupation, and income details.</p>
            </div>

            <div
              onClick={() => {
                if (onOpenAddDocModal) onOpenAddDocModal();
                else if (onNavigateTab) onNavigateTab("documents");
              }}
              className="p-3 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-amber-500/40 transition cursor-pointer space-y-1"
            >
              <div className="flex justify-between items-center text-cyan-400 font-bold">
                <span>2. Secure Vault</span>
                <span>0 Docs</span>
              </div>
              <p className="text-[11px] text-white/50 leading-snug">Upload PDF/Images into AES-256 encrypted storage.</p>
            </div>

            <div
              onClick={() => onNavigateTab && onNavigateTab("assistant")}
              className="p-3 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-amber-500/40 transition cursor-pointer space-y-1"
            >
              <div className="flex justify-between items-center text-emerald-400 font-bold">
                <span>3. AI Compliance</span>
                <span>Active</span>
              </div>
              <p className="text-[11px] text-white/50 leading-snug">Consult AI assistant for state-specific application rules.</p>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CALCULATED DASHBOARD METRICS CARDS (6 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CARD 1: Citizen Profile Completion */}
        <div
          onClick={() => onNavigateTab && onNavigateTab("profile")}
          className="p-5 bg-[#0b0f19] border border-emerald-500/20 hover:border-emerald-500/40 rounded-3xl space-y-3 transition group cursor-pointer shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Live Calculated
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono uppercase font-bold text-white/50">Citizen Profile Completion</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">{profileCompletionPercentage}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${profileCompletionPercentage}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-white/60 flex items-center justify-between font-mono">
            <span>Name: {profile.name || "Citizen"}</span>
            <span className="text-emerald-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
              Edit <ChevronRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* CARD 2: Documents Stored */}
        <div
          onClick={() => onNavigateTab && onNavigateTab("documents")}
          className="p-5 bg-[#0b0f19] border border-blue-500/20 hover:border-blue-500/40 rounded-3xl space-y-3 transition group cursor-pointer shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-blue-400">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              Secure Vault
            </span>
          </div>

          <div>
            <span className="text-xs font-mono uppercase font-bold text-white/50 block">Documents Stored</span>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">{docs.length} Files</div>
          </div>

          <p className="text-[11px] text-white/60 flex items-center justify-between font-mono">
            <span>AES-256 Encrypted</span>
            <span className="text-blue-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* CARD 3: Verified Documents */}
        <div
          onClick={() => onNavigateTab && onNavigateTab("documents")}
          className="p-5 bg-[#0b0f19] border border-cyan-500/20 hover:border-cyan-500/40 rounded-3xl space-y-3 transition group cursor-pointer shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-cyan-400">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              Verified
            </span>
          </div>

          <div>
            <span className="text-xs font-mono uppercase font-bold text-white/50 block">Verified Documents</span>
            <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">{verifiedDocsCount} Verified</div>
          </div>

          <p className="text-[11px] text-white/60 flex items-center justify-between font-mono">
            <span>Issuer & Neural Verified</span>
            <span className="text-cyan-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
              Inspect <ChevronRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* CARD 4: Pending Documents */}
        <div
          onClick={() => onNavigateTab && onNavigateTab("documents")}
          className="p-5 bg-[#0b0f19] border border-amber-500/20 hover:border-amber-500/40 rounded-3xl space-y-3 transition group cursor-pointer shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-amber-400">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Field Review
            </span>
          </div>

          <div>
            <span className="text-xs font-mono uppercase font-bold text-white/50 block">Pending Documents</span>
            <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">{pendingDocsCount} Pending</div>
          </div>

          <p className="text-[11px] text-white/60 flex items-center justify-between font-mono">
            <span>Missing Fields / Low Confidence</span>
            <span className="text-amber-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
              Review <ChevronRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* CARD 5: Upcoming Expiry */}
        <div
          onClick={() => onNavigateTab && onNavigateTab("documents")}
          className="p-5 bg-[#0b0f19] border border-rose-500/20 hover:border-rose-500/40 rounded-3xl space-y-3 transition group cursor-pointer shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-rose-400">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Validity SLA
            </span>
          </div>

          <div>
            <span className="text-xs font-mono uppercase font-bold text-white/50 block">Upcoming Expiry</span>
            <div className="text-2xl font-extrabold text-rose-400 font-mono mt-1">{upcomingExpiryCount} Alerts</div>
          </div>

          <p className="text-[11px] text-white/60 flex items-center justify-between font-mono">
            <span>Validities Expiring Soon</span>
            <span className="text-rose-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
              Monitor <ChevronRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* CARD 6: Unread Notifications */}
        <div
          onClick={() => onNavigateTab && onNavigateTab("notifications")}
          className="p-5 bg-[#0b0f19] border border-indigo-500/20 hover:border-indigo-500/40 rounded-3xl space-y-3 transition group cursor-pointer shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-indigo-400">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              System Alerts
            </span>
          </div>

          <div>
            <span className="text-xs font-mono uppercase font-bold text-white/50 block">Unread Notifications</span>
            <div className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">{unreadNotificationsCount} Unread</div>
          </div>

          <p className="text-[11px] text-white/60 flex items-center justify-between font-mono">
            <span>SLA & Compliance Notifications</span>
            <span className="text-indigo-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
              Open Centre <ChevronRight className="w-3 h-3" />
            </span>
          </p>
        </div>
      </div>

      {/* TWO COLUMN LOWER SECTION: RECENT UPLOADS & RECENT ACTIVITY & AI SUGGESTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: RECENT UPLOADS & RECENT ACTIVITY */}
        <div className="space-y-6">
          {/* RECENT UPLOADS WIDGET */}
          <div className="p-6 bg-[#0b0f19] border border-white/10 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Recent Uploads</span>
              </h3>
              <button
                onClick={() => onNavigateTab && onNavigateTab("documents")}
                className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Vault</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {docs.length === 0 ? (
              <div className="py-8 text-center space-y-2 font-mono text-xs text-white/40 border border-dashed border-white/10 rounded-2xl">
                <p>No documents uploaded yet.</p>
                <button
                  onClick={() => {
                    if (onOpenAddDocModal) onOpenAddDocModal();
                    else if (onNavigateTab) onNavigateTab("documents");
                  }}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl transition cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {docs.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 bg-white/[0.02] border border-white/5 hover:border-blue-500/30 rounded-2xl flex items-center justify-between gap-3 transition"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {doc.category}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">{doc.name}</h4>
                      </div>
                      <p className="text-[11px] text-white/50 font-mono truncate">{doc.issuer} • {doc.idNumber}</p>
                    </div>

                    <button
                      onClick={() => onNavigateTab && onNavigateTab("documents")}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-mono transition cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT ACTIVITY FEED */}
          <div className="p-6 bg-[#0b0f19] border border-white/10 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Recent Activity Log</span>
              </h3>
              <span className="text-[10px] font-mono text-white/40">Event-Driven Stream</span>
            </div>

            {logs.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-white/40 border border-dashed border-white/10 rounded-2xl">
                No recent activity logged in this session.
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {logs.slice(0, 5).map((act) => (
                  <div key={act.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span>{act.title}</span>
                      <span className="text-[10px] text-white/40 font-normal">{act.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-white/60">{act.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC CONTEXT-AWARE AI SUGGESTIONS */}
        <div className="space-y-6">
          <div className="p-6 bg-[#0b0f19] border border-amber-500/30 rounded-3xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Context-Aware AI Suggestions</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-400/70 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Live Analysis
              </span>
            </div>

            <div className="space-y-3">
              {aiSuggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-4 bg-amber-500/[0.03] border border-amber-500/20 hover:border-amber-500/40 rounded-2xl space-y-2 transition"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>{sug.title}</span>
                    </h4>
                    <button
                      onClick={() => onNavigateTab && onNavigateTab(sug.tab)}
                      className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-mono transition cursor-pointer"
                    >
                      {sug.actionText}
                    </button>
                  </div>
                  <p className="text-[11px] text-white/70 leading-relaxed font-sans">{sug.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
