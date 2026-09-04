import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  BookOpen, 
  FileText, 
  Users, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Database, 
  ChevronRight,
  UserCheck,
  ShieldAlert,
  ArrowLeft,
  Award
} from "lucide-react";
import { Profile, RoadmapData } from "../types";
import { GovernmentRAGView } from "./GovernmentRAGView";
import SecurityHardeningView from "./SecurityHardeningView";
import { GoldenJourneyImpactDashboard } from "./GoldenJourneyImpactDashboard";
import Phase10AuditFundingView from "./Phase10AuditFundingView";

interface AdminPanelViewProps {
  userRole: "Visitor" | "Verified Expert" | "Premium Elite" | "Admin";
  profile: Profile;
  isLightTheme: boolean;
  vaultDocs: any[];
  savedRoadmaps: RoadmapData[];
  onNavigateTab: (tab: string) => void;
  setIsOcrOpen: (open: boolean) => void;
  onUpdateRole?: (newRole: "Visitor" | "Verified Expert" | "Premium Elite" | "Admin") => void;
}

export function AdminPanelView({
  userRole,
  profile,
  isLightTheme,
  vaultDocs,
  savedRoadmaps,
  onNavigateTab,
  setIsOcrOpen,
  onUpdateRole
}: AdminPanelViewProps) {
  const [adminTab, setAdminTab] = useState<"rag" | "audit" | "user-lookup" | "golden-journey" | "phase10">("rag");
  const [searchUserId, setSearchUserId] = useState("");
  const [searchedUserResult, setSearchedUserResult] = useState<{
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    lastActive: string;
  } | null>(null);

  const isAdmin = userRole === "Admin";

  const handleSearchUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUserId.trim()) return;
    
    // Simulate user lookup by ID
    setSearchedUserResult({
      id: searchUserId.trim(),
      email: `${searchUserId.trim().toLowerCase()}@citizen.gov.in`,
      name: `Citizen Record (${searchUserId.trim()})`,
      role: "Verified Expert",
      status: "Active / Identity Verified",
      lastActive: "Today at 10:42 AM"
    });
  };

  if (!isAdmin) {
    return (
      <div className={`p-8 rounded-3xl border text-center space-y-6 max-w-2xl mx-auto my-12 shadow-2xl ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#0c1017] border-white/10"
      }`}>
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold">
            403 Forbidden Access
          </span>
          <h2 className={`text-2xl font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
            Admin Panel Restricted
          </h2>
          <p className={`text-xs max-w-md mx-auto leading-relaxed ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
            Access to this administrative console is restricted to authenticated government administrators and compliance officers with an active Admin role assignment.
          </p>
        </div>

        {/* Demo role toggle helper for testing admin access */}
        <div className={`p-4 rounded-xl border text-left space-y-3 ${
          isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-500 uppercase">Role Verification Toggle</span>
            <span className="text-[10px] font-mono text-white/40">Current Role: {userRole}</span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed">
            If you are evaluating or testing administrator features, switch your user profile role to "Admin" below:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => onUpdateRole && onUpdateRole("Admin")}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Switch to Admin Role</span>
            </button>
            <button
              onClick={() => onNavigateTab("home")}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Citizen Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Admin Panel Header */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0d121c] border-white/10 shadow-2xl"
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-[9px] font-bold rounded uppercase">
                Government Admin Panel
              </span>
              <span className="text-xs font-mono text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Active Session
              </span>
            </div>
            <h1 className={`text-xl font-bold mt-1 ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              Knowledge Base Management & Compliance Audit
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onUpdateRole && (
            <button
              onClick={() => onUpdateRole("Visitor")}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold font-mono rounded-lg transition cursor-pointer"
            >
              Exit Admin Mode
            </button>
          )}
        </div>
      </div>

      {/* Admin Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
        <button
          onClick={() => setAdminTab("rag")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
            adminTab === "rag"
              ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/10"
              : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Knowledge Base & Sources</span>
        </button>

        <button
          onClick={() => setAdminTab("audit")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
            adminTab === "audit"
              ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/10"
              : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Audit Logs & RBAC Roles</span>
        </button>

        <button
          onClick={() => setAdminTab("user-lookup")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
            adminTab === "user-lookup"
              ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/10"
              : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Lookup by ID</span>
        </button>

        <button
          onClick={() => setAdminTab("golden-journey")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
            adminTab === "golden-journey"
              ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/10"
              : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Golden Journey & Scale Evaluation</span>
        </button>

        <button
          onClick={() => setAdminTab("phase10")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
            adminTab === "phase10"
              ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/10"
              : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Phase 10 Final IP & Funding Gate</span>
        </button>
      </div>

      {/* Admin Content Area */}
      {adminTab === "phase10" && (
        <Phase10AuditFundingView />
      )}
      {adminTab === "golden-journey" && (
        <GoldenJourneyImpactDashboard isLightTheme={isLightTheme} />
      )}
      {adminTab === "rag" && (
        <GovernmentRAGView
          isLightTheme={isLightTheme}
          profile={profile}
          vaultDocs={vaultDocs}
          roadmaps={savedRoadmaps}
          onNavigateTab={onNavigateTab}
          onOpenUploadModal={() => setIsOcrOpen(true)}
          onStartRoadmap={() => onNavigateTab("assistant")}
        />
      )}

      {adminTab === "audit" && (
        <SecurityHardeningView />
      )}

      {adminTab === "user-lookup" && (
        <div className={`p-6 rounded-2xl border space-y-6 ${
          isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0d121c] border-white/10 shadow-2xl"
        }`}>
          <div className="space-y-1">
            <h3 className={`text-base font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              User Lookup & Profile Compliance Inspection
            </h3>
            <p className={`text-xs ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
              Query specific citizen records by unique User ID for security review and support verification. Browse-all directory listing is disabled per privacy regulations.
            </p>
          </div>

          <form onSubmit={handleSearchUser} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Enter User ID (e.g., usr_8921)"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-mono outline-none transition ${
                  isLightTheme 
                    ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500" 
                    : "bg-white/5 border-white/10 text-white focus:border-amber-500"
                }`}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Lookup User
            </button>
          </form>

          {searchedUserResult && (
            <div className={`p-5 rounded-xl border space-y-4 ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
            }`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-amber-500 uppercase font-bold">Query Result</span>
                  <h4 className={`text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                    {searchedUserResult.name}
                  </h4>
                </div>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded font-mono text-[10px]">
                  {searchedUserResult.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-white/40 text-[10px] uppercase">User ID</span>
                  <p className="text-white font-bold">{searchedUserResult.id}</p>
                </div>
                <div>
                  <span className="text-white/40 text-[10px] uppercase">Email</span>
                  <p className="text-white font-bold truncate">{searchedUserResult.email}</p>
                </div>
                <div>
                  <span className="text-white/40 text-[10px] uppercase">Assigned Role</span>
                  <p className="text-amber-400 font-bold">{searchedUserResult.role}</p>
                </div>
                <div>
                  <span className="text-white/40 text-[10px] uppercase">Last Activity</span>
                  <p className="text-white font-bold">{searchedUserResult.lastActive}</p>
                </div>
              </div>

              {/* RBAC Role Re-Assignment Controls */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-amber-500 uppercase font-bold block">RBAC Role Re-Assignment</span>
                  <p className="text-[11px] text-white/50">Modify access privileges and permissions matrix for this citizen.</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={searchedUserResult.role === "Admin" || searchedUserResult.role === "administrator" ? "administrator" : searchedUserResult.role.toLowerCase().replace(" ", "_")}
                    onChange={async (e) => {
                      const newRoleValue = e.target.value;
                      const roleDisplayMap: Record<string, string> = {
                        citizen: "Citizen",
                        administrator: "Admin",
                        knowledge_manager: "Knowledge Manager",
                        support_operator: "Support Operator"
                      };
                      const displayRole = roleDisplayMap[newRoleValue] || newRoleValue;
                      
                      setSearchedUserResult(prev => prev ? { ...prev, role: displayRole } : null);
                      if (onUpdateRole) {
                        onUpdateRole(displayRole as any);
                      }
                      
                      try {
                        await fetch("/api/v1/security/audit", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            userId: searchedUserResult.id,
                            role: "administrator",
                            eventType: "RBAC_MUTATION",
                            action: "ROLE_REASSIGNED",
                            resource: `user_${searchedUserResult.id}`,
                            details: `Reassigned RBAC role for user '${searchedUserResult.id}' to '${displayRole}'.`
                          })
                        });
                      } catch (err) {
                        // ignore
                      }
                    }}
                    className="bg-[#08090a] border border-white/20 text-white text-xs font-mono rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="citizen">citizen (Standard Citizen Access)</option>
                    <option value="administrator">administrator (Full Admin Console Access)</option>
                    <option value="knowledge_manager">knowledge_manager (RAG Corpus Management)</option>
                    <option value="support_operator">support_operator (User Support & Verification)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
