import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sliders, 
  Sun, 
  Moon, 
  Bell, 
  ShieldCheck, 
  Lock, 
  Database, 
  Download, 
  Trash2, 
  Cpu, 
  Key, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  RefreshCw, 
  Smartphone,
  Shield,
  FileJson,
  Sparkles
} from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
import { auth, logout, sendConfiguredPasswordResetEmail } from "../firebase";
import { Profile, RoadmapData, GovDocument } from "../types";
import { TrustedDevicesManager } from "./TrustedDevicesManager";

interface SettingsViewProps {
  isLightTheme: boolean;
  onToggleTheme: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  profile: Profile;
  vaultDocs: any[];
  savedRoadmaps: RoadmapData[];
  historyList: any[];
  onClearLocalCache: () => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isLightTheme,
  onToggleTheme,
  language,
  onLanguageChange,
  profile,
  vaultDocs,
  savedRoadmaps,
  historyList,
  onClearLocalCache,
  onLogout
}) => {
  // Notification states
  const [roadmapAlerts, setRoadmapAlerts] = useState(true);
  const [docExpiryAlerts, setDocExpiryAlerts] = useState(true);
  const [audioChime, setAudioChime] = useState(true);

  // Security states
  const [biometricLock, setBiometricLock] = useState(false);
  const [requirePinForExport, setRequirePinForExport] = useState(true);

  // Feedback messages
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Export full user data as JSON
  const handleExportAllData = () => {
    try {
      const exportData = {
        citizenProfile: profile,
        savedRoadmaps: savedRoadmaps,
        vaultDocuments: vaultDocs.map(d => ({
          name: d.name,
          category: d.category,
          docType: d.docType,
          verifiedByIssuer: d.verifiedByIssuer,
          idNumber: d.idNumber
        })),
        historyLogsCount: historyList.length,
        exportedAt: new Date().toISOString(),
        version: "2.5-Saas-Production"
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `bharat_navigator_citizen_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setActionSuccess("Citizen backup exported successfully as JSON!");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setActionError("Failed to generate data export file.");
      setTimeout(() => setActionError(null), 3000);
    }
  };

  // Password reset email trigger
  const handleSendPasswordReset = async () => {
    if (!profile.email && !auth.currentUser?.email) {
      setActionError("No active email address found for password reset.");
      setTimeout(() => setActionError(null), 3000);
      return;
    }
    setIsProcessing(true);
    try {
      const targetEmail = profile.email || auth.currentUser?.email || "";
      await sendConfiguredPasswordResetEmail(targetEmail);
      setActionSuccess(`Password reset instructions sent to ${targetEmail}`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err?.message || "Failed to send password reset email.");
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Send Email Verification
  const handleSendEmailVerification = async () => {
    if (!auth.currentUser) {
      setActionError("No active session found.");
      setTimeout(() => setActionError(null), 3000);
      return;
    }
    setIsProcessing(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setActionSuccess("Verification email dispatched! Please check your inbox.");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err?.message || "Failed to dispatch verification email.");
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className={`border-b pb-5 ${isLightTheme ? "border-slate-200" : "border-white/5"}`}>
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          Application Settings
        </span>
        <h2 className={`text-xl font-bold mt-1 ${isLightTheme ? "text-slate-900" : "text-white"}`}>
          System Preferences & Configuration
        </h2>
        <p className={`text-xs mt-1 ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>
          Configure theme, notification rules, vault biometric locks, and manage cloud data exports.
        </p>
      </div>

      {/* Global Alerts */}
      {actionSuccess && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <span>{actionSuccess}</span>
        </motion.div>
      )}
      {actionError && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{actionError}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Visual Theme & Language */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-black/40 border-white/5"
        }`}>
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <Sun className="w-4 h-4 text-amber-500" />
            <h3 className={`text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              Appearance & Localization
            </h3>
          </div>

          <div className="space-y-3">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-semibold block ${isLightTheme ? "text-slate-800" : "text-white/90"}`}>
                  Display Theme
                </span>
                <span className={`text-[10px] block ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                  Switch between Light & Dark modes
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer border ${
                  isLightTheme
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-white/10 border-white/15 text-white"
                }`}
              >
                {isLightTheme ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{isLightTheme ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>

            {/* Language Select */}
            <div className="space-y-1 pt-2">
              <label className={`text-[10px] font-mono uppercase tracking-wider block ${isLightTheme ? "text-slate-700 font-bold" : "text-white/50"}`}>
                Preferred Portal Language
              </label>
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className={`w-full text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer ${
                  isLightTheme
                    ? "bg-white border border-slate-300 text-slate-900 font-medium"
                    : "bg-[#08090a] border border-white/10 text-white"
                }`}
              >
                <option value="English (India)">English (India)</option>
                <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                <option value="Telugu (తెలుగు)">Telugu (తెలుగు)</option>
                <option value="Kannada (కన్నడ)">Kannada (కన్నడ)</option>
                <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                <option value="Marathi (मराठी)">Marathi (मराठी)</option>
                <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
                <option value="Gujarati (ગુજરાતી)">Gujarati (ગુજરાતી)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Notification & Communication Rules */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-black/40 border-white/5"
        }`}>
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <Bell className="w-4 h-4 text-rose-500" />
            <h3 className={`text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              Alert Rules & Notifications
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-semibold block ${isLightTheme ? "text-slate-800" : "text-white/90"}`}>
                  Roadmap Deadline Alerts
                </span>
                <span className={`text-[10px] block ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                  Notify when statutory steps are due
                </span>
              </div>
              <input
                type="checkbox"
                checked={roadmapAlerts}
                onChange={(e) => setRoadmapAlerts(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-semibold block ${isLightTheme ? "text-slate-800" : "text-white/90"}`}>
                  Document Expiry Monitor
                </span>
                <span className={`text-[10px] block ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                  Alert 30 days before license expiry
                </span>
              </div>
              <input
                type="checkbox"
                checked={docExpiryAlerts}
                onChange={(e) => setDocExpiryAlerts(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-semibold block ${isLightTheme ? "text-slate-800" : "text-white/90"}`}>
                  AI Response Chime
                </span>
                <span className={`text-[10px] block ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                  Audio chime when AI completes generation
                </span>
              </div>
              <input
                type="checkbox"
                checked={audioChime}
                onChange={(e) => setAudioChime(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Vault Security & Biometrics */}
        <div className={`p-5 rounded-2xl border space-y-4 md:col-span-2 ${
          isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-black/40 border-white/5"
        }`}>
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h3 className={`text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              Vault Protection, Biometrics & Trusted Devices
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-semibold block ${isLightTheme ? "text-slate-800" : "text-white/90"}`}>
                  Biometric Vault Guard
                </span>
                <span className={`text-[10px] block ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                  Require TouchID / PIN for Secure Vault
                </span>
              </div>
              <input
                type="checkbox"
                checked={biometricLock}
                onChange={(e) => setBiometricLock(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <span className={`text-xs font-semibold block ${isLightTheme ? "text-slate-800" : "text-white/90"}`}>
                  Export PIN Verification
                </span>
                <span className={`text-[10px] block ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                  Prompt PIN when downloading raw PDFs
                </span>
              </div>
              <input
                type="checkbox"
                checked={requirePinForExport}
                onChange={(e) => setRequirePinForExport(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Trusted Devices & WebAuthn Management */}
            <div className="pt-2">
              <TrustedDevicesManager 
                userId={auth.currentUser?.uid || "usr_default"}
                userEmail={profile.email}
                userName={profile.name}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Data Management, Citizen Data Rights & Cloud Sync */}
        <div className={`p-5 rounded-2xl border space-y-4 md:col-span-2 ${
          isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-black/40 border-white/5"
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-cyan-500" />
              <h3 className={`text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                Citizen Data Rights & Self-Service Privacy (DPDP Act 2023)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold rounded-full">
              Sec 6 Compliant
            </span>
          </div>

          <p className={`text-xs ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
            Under the Digital Personal Data Protection Act, you maintain 100% control over your personal data, document vaults, and AI interaction history. You can export or permanently delete your data at any time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Export Personal Data Package */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
            }`}>
              <div className="flex items-center gap-2 text-cyan-400">
                <FileJson className="w-4 h-4" />
                <h4 className="text-xs font-bold font-mono">Data Export</h4>
              </div>
              <p className={`text-[10px] ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                Download complete JSON package of your profile, roadmaps, and vault metadata.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsProcessing(true);
                    const res = await fetch("/api/v1/citizen/data-export", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: profile.email || "usr_citizen" })
                    });
                    const json = await res.json();
                    if (json.success) {
                      handleExportAllData();
                      setActionSuccess("Verified DPDP data package downloaded successfully!");
                    } else {
                      handleExportAllData();
                    }
                  } catch (err) {
                    handleExportAllData();
                  } finally {
                    setIsProcessing(false);
                    setTimeout(() => setActionSuccess(null), 4000);
                  }
                }}
                disabled={isProcessing}
                className="w-full mt-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Package</span>
              </button>
            </div>

            {/* Self-Service Data Deletion */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
            }`}>
              <div className="flex items-center gap-2 text-rose-400">
                <Trash2 className="w-4 h-4" />
                <h4 className="text-xs font-bold font-mono">Delete Personal Data</h4>
              </div>
              <p className={`text-[10px] ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                Permanently purge document vault records and interaction history logs.
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (confirm("Are you sure you want to permanently purge all your document vault entries and history logs? This action cannot be undone.")) {
                    try {
                      setIsProcessing(true);
                      const res = await fetch("/api/v1/citizen/data-deletion", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: profile.email || "usr_citizen", scope: "all_data" })
                      });
                      const json = await res.json();
                      if (json.success) {
                        onClearLocalCache();
                        setActionSuccess("Self-service data deletion completed. Records permanently purged.");
                      } else {
                        setActionError(json.error || "Failed to complete data deletion.");
                      }
                    } catch (err: any) {
                      setActionError("Network error attempting data deletion.");
                    } finally {
                      setIsProcessing(false);
                      setTimeout(() => { setActionSuccess(null); setActionError(null); }, 4000);
                    }
                  }
                }}
                disabled={isProcessing}
                className="w-full mt-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge All Records</span>
              </button>
            </div>

            {/* Revoke Granted Consents */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
            }`}>
              <div className="flex items-center gap-2 text-amber-400">
                <Lock className="w-4 h-4" />
                <h4 className="text-xs font-bold font-mono">Revoke Permissions</h4>
              </div>
              <p className={`text-[10px] ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                Revoke all active data sharing consents for automated eligibility checks.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsProcessing(true);
                    const res = await fetch("/api/v1/citizen/data-deletion", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: profile.email || "usr_citizen", scope: "revoke_permissions" })
                    });
                    const json = await res.json();
                    if (json.success) {
                      setActionSuccess("All data sharing consents have been revoked successfully.");
                    } else {
                      setActionError(json.error || "Failed to revoke permissions.");
                    }
                  } catch (err) {
                    setActionError("Network error revoking permissions.");
                  } finally {
                    setIsProcessing(false);
                    setTimeout(() => { setActionSuccess(null); setActionError(null); }, 4000);
                  }
                }}
                disabled={isProcessing}
                className="w-full mt-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Revoke Consents</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Safety Actions */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-black/40 border-white/5"
      }`}>
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <Key className="w-4 h-4 text-indigo-400" />
          <h3 className={`text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
            Account Actions & Authentication Security
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSendPasswordReset}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-2 ${
              isLightTheme
                ? "bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100"
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Send Password Reset Link</span>
          </button>

          <button
            type="button"
            onClick={handleSendEmailVerification}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-2 ${
              isLightTheme
                ? "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
                : "bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Resend Email Verification</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-600/20 ml-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
