import React, { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCheck, 
  X, 
  CheckCircle2, 
  ExternalLink,
  Inbox,
  Clock,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Sliders,
  Check,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileCheck2,
  KeyRound,
  ShieldCheck,
  Ban
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProactiveNotification, VaultDocumentModel, RoadmapData, UserNotificationPreferences } from "../types";
import { useApp } from "../context/AppContext";

interface NotificationCentreProps {
  userId: string;
  isOpen?: boolean;
  onClose?: () => void;
  onNavigateTab?: (tab: string) => void;
  onUnreadCountChange?: (count: number) => void;
  isLightTheme?: boolean;
  isEmbedded?: boolean;
  vaultDocs?: VaultDocumentModel[];
  activeRoadmaps?: RoadmapData[];
}

export const NotificationCentre: React.FC<NotificationCentreProps> = ({
  userId,
  isOpen = true,
  onClose,
  onNavigateTab,
  onUnreadCountChange,
  isLightTheme = false,
  isEmbedded = false,
  vaultDocs = [],
  activeRoadmaps = [],
}) => {
  const { consents, updateConsentPermission } = useApp();
  const [notifications, setNotifications] = useState<ProactiveNotification[]>([]);
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read" | "urgent" | "consent" | "preferences">("all");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    loadNotifications();
    loadPreferences();
  }, [userId]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/proactive/notifications?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        const list: ProactiveNotification[] = data.notifications || [];
        setNotifications(list);
        const unread = list.filter(n => n.lifecycleState === "UNREAD").length;
        if (onUnreadCountChange) onUnreadCountChange(unread);
      }
    } catch (err) {
      console.error("Failed to load proactive notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const res = await fetch(`/api/v1/proactive/preferences?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) setPreferences(data.preferences);
      }
    } catch (err) {
      console.warn("Failed to load notification preferences:", err);
    }
  };

  const handleToggleRead = async (notif: ProactiveNotification) => {
    try {
      await fetch("/api/v1/proactive/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notif.id || notif.notificationId })
      });
      const targetId = notif.id || notif.notificationId;
      const updatedList = notifications.map(n => 
        (n.id === targetId || n.notificationId === targetId)
          ? { ...n, lifecycleState: (n.lifecycleState === "UNREAD" ? "READ" : "UNREAD") as any } 
          : n
      );
      setNotifications(updatedList);
      const unread = updatedList.filter(n => n.lifecycleState === "UNREAD").length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
    } catch (err) {
      console.error("Failed to toggle read state:", err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadItems = notifications.filter(n => n.lifecycleState === "UNREAD");
    for (const item of unreadItems) {
      try {
        await fetch("/api/v1/proactive/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: item.id || item.notificationId })
        });
      } catch (err) {
        console.warn("Failed to mark item read:", err);
      }
    }
    const updatedList = notifications.map(n => ({ ...n, lifecycleState: "READ" as any }));
    setNotifications(updatedList);
    if (onUnreadCountChange) onUnreadCountChange(0);
  };

  const handleTriggerCheck = async () => {
    setLoading(true);
    setStatusMsg("Running proactive event scheduler across Vault & Workflows...");
    try {
      const res = await fetch("/api/v1/proactive/trigger-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, vaultDocs, activeRoadmaps })
      });
      if (res.ok) {
        const data = await res.json();
        setStatusMsg(`Scheduler check completed! ${data.generatedCount || 0} new notifications generated.`);
        await loadNotifications();
      }
    } catch (err) {
      console.error("Failed to trigger check:", err);
      setStatusMsg("Proactive check failed.");
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleToggleChannel = async (channel: keyof UserNotificationPreferences["channels"]) => {
    if (!preferences) return;
    const updatedChannels = { ...preferences.channels, [channel]: !preferences.channels[channel] };
    const updated = { ...preferences, channels: updatedChannels };
    setPreferences(updated);
    savePreferences(updated);
  };

  const handleToggleCategory = async (category: keyof UserNotificationPreferences["categories"]) => {
    if (!preferences) return;
    const updatedCategories = { ...preferences.categories, [category]: !preferences.categories[category] };
    const updated = { ...preferences, categories: updatedCategories };
    setPreferences(updated);
    savePreferences(updated);
  };

  const savePreferences = async (prefs: UserNotificationPreferences) => {
    try {
      await fetch("/api/v1/proactive/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, preferences: prefs })
      });
    } catch (e) {
      console.warn("Save preferences failed:", e);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return n.lifecycleState === "UNREAD";
    if (filter === "read") return n.lifecycleState !== "UNREAD";
    if (filter === "urgent") return n.priority === "URGENT" || n.priority === "DEADLINE" || n.priority === "ACTION_REQUIRED";
    return true;
  });

  const unreadCount = notifications.filter(n => n.lifecycleState === "UNREAD").length;

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Just now";
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSecs < 60) return "Just now";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const getPriorityBadge = (priority: ProactiveNotification["priority"]) => {
    switch (priority) {
      case "DEADLINE":
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> DEADLINE</span>;
      case "URGENT":
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1"><ShieldAlert className="w-2.5 h-2.5" /> URGENT</span>;
      case "ACTION_REQUIRED":
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> ACTION REQUIRED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> INFO</span>;
    }
  };

  // Content rendering function used by both full screen and drawer modes
  const renderContent = () => (
    <div className="flex flex-col h-full">
      {/* Header Bar */}
      <div className={`p-5 border-b flex items-center justify-between ${
        isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/10"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                Proactive Notification Centre
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-mono font-bold rounded-full">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
              Event Engine Alerts & Sovereign Cross-Journey Consent Controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerCheck}
            disabled={loading}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs font-mono font-bold text-rose-400 transition cursor-pointer flex items-center gap-1.5"
            title="Run Proactive Scheduler Check"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Checking..." : "Trigger Check"}</span>
          </button>

          {onClose && !isEmbedded && (
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isLightTheme ? "hover:bg-slate-200 text-slate-600" : "hover:bg-white/10 text-white/60 hover:text-white"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="px-5 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
        isLightTheme ? "bg-slate-100/50 border-slate-200" : "bg-white/[0.01] border-white/5"
      }`}>
        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5 font-mono text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === "all" ? "bg-rose-500 text-white font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === "unread" ? "bg-rose-500 text-white font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("urgent")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === "urgent" ? "bg-rose-500 text-white font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            Urgent Action
          </button>
          <button
            onClick={() => setFilter("consent")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              filter === "consent" ? "bg-amber-500 text-black font-bold" : "text-amber-400 hover:text-amber-300"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Consent Controls ({consents.length})</span>
          </button>
          <button
            onClick={() => setFilter("preferences")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              filter === "preferences" ? "bg-rose-500 text-white font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>

        {unreadCount > 0 && filter !== "preferences" && filter !== "consent" && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Notification Body / List, Consent Controls, or Preferences */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {filter === "consent" ? (
          <div className="space-y-6 max-w-3xl mx-auto py-2">
            {/* DPDP Act Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-200">DPDP Citizen Data Sovereignty Control</h4>
                <p className="mt-1 text-amber-300/80 leading-relaxed">
                  Under India's Digital Personal Data Protection (DPDP) Act, cross-journey access to your DigiLocker Vault documents requires explicit citizen consent. Toggling ALLOW or DENY controls real-time permission state across workflows.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {consents.map((item) => {
                const isAllowed = item.status === "ALLOWED";
                const isDenied = item.status === "DENIED";

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isAllowed
                        ? isLightTheme ? "bg-emerald-50 border-emerald-200" : "bg-emerald-950/20 border-emerald-500/30"
                        : isDenied
                        ? isLightTheme ? "bg-rose-50 border-rose-200" : "bg-rose-950/20 border-rose-500/30"
                        : isLightTheme ? "bg-amber-50 border-amber-200" : "bg-amber-950/20 border-amber-500/30"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          isAllowed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                          isDenied ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" :
                          "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-xs font-bold text-amber-400 font-mono">{item.journeyName}</span>
                      </div>
                      <h4 className={`text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                        Requested Document: <span className="text-rose-400">{item.requestedDocType}</span>
                      </h4>
                      <p className={`text-xs ${isLightTheme ? "text-slate-600" : "text-white/70"}`}>
                        {item.purpose}
                      </p>
                      <span className="text-[10px] font-mono text-white/40 block">
                        Last Updated: {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateConsentPermission(item.id, "ALLOWED")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                          isAllowed
                            ? "bg-emerald-500 text-black shadow-lg"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>ALLOW</span>
                      </button>

                      <button
                        onClick={() => updateConsentPermission(item.id, "DENIED")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                          isDenied
                            ? "bg-rose-500 text-white shadow-lg"
                            : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>DENY</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : filter === "preferences" ? (
          <div className="space-y-6 max-w-2xl mx-auto py-2">
            <div className={`p-5 rounded-2xl border ${
              isLightTheme ? "bg-white border-slate-200" : "bg-white/[0.02] border-white/10"
            } space-y-4`}>
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Settings className="w-4 h-4 text-rose-500" />
                <h4 className={`text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                  Notification Delivery Channels
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleToggleChannel("sms")}
                  className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    preferences?.channels.sms 
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      : "bg-black/20 border-white/5 text-white/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-xs font-bold">SMS Toast</span>
                  </div>
                  {preferences?.channels.sms && <Check className="w-4 h-4 text-rose-400" />}
                </button>

                <button
                  onClick={() => handleToggleChannel("email")}
                  className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    preferences?.channels.email 
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      : "bg-black/20 border-white/5 text-white/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs font-bold">Email Digest</span>
                  </div>
                  {preferences?.channels.email && <Check className="w-4 h-4 text-rose-400" />}
                </button>

                <button
                  onClick={() => handleToggleChannel("in_app")}
                  className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    preferences?.channels.in_app 
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      : "bg-black/20 border-white/5 text-white/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold">In-App Banner</span>
                  </div>
                  {preferences?.channels.in_app && <Check className="w-4 h-4 text-rose-400" />}
                </button>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${
              isLightTheme ? "bg-white border-slate-200" : "bg-white/[0.02] border-white/10"
            } space-y-4`}>
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h4 className={`text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                  Category Subscriptions
                </h4>
              </div>

              <div className="space-y-2">
                {[
                  { key: "vault", label: "DigiLocker Vault & Expiry Warnings", desc: "Alerts when certificates approach 30/15-day expiration." },
                  { key: "workflow", label: "Compliance Roadmap & SLA Deadlines", desc: "Notifies when department SLA targets or roadmap steps are due." },
                  { key: "eligibility", label: "Scheme Eligibility & Quota Matches", desc: "Proactive matches when new citizen welfare quotas open up." },
                  { key: "system", label: "System Security & Action Failures", desc: "Real-time authentication and automated workflow execution alerts." },
                ].map((item) => {
                  const isSubbed = preferences?.categories[item.key as keyof UserNotificationPreferences["categories"]];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleCategory(item.key as keyof UserNotificationPreferences["categories"])}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                        isSubbed
                          ? "bg-white/[0.03] border-white/10"
                          : "bg-black/20 border-white/5 opacity-60"
                      }`}
                    >
                      <div>
                        <span className={`text-xs font-bold block ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                          {item.label}
                        </span>
                        <span className={`text-[10px] ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                          {item.desc}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSubbed ? "bg-rose-500 border-rose-500 text-white" : "border-white/20"
                      }`}>
                        {isSubbed && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="py-20 text-center text-white/40 text-xs font-mono space-y-3">
            <div className="animate-spin w-7 h-7 border-2 border-rose-500 border-t-transparent rounded-full mx-auto" />
            <p>Syncing proactive citizen notification stream...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Inbox className={`w-12 h-12 mx-auto ${isLightTheme ? "text-slate-300" : "text-white/20"}`} />
            <p className={`text-xs font-mono ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
              No notifications found matching filter criteria.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = notif.lifecycleState === "UNREAD";
            const targetId = notif.id || notif.notificationId;
            const isAuditExpanded = expandedAuditId === targetId;

            return (
              <div
                key={targetId}
                className={`p-4 rounded-2xl border transition flex flex-col gap-2.5 ${
                  isUnread
                    ? isLightTheme
                      ? "bg-rose-50/60 border-rose-200 shadow-sm"
                      : "bg-rose-950/20 border-rose-500/30"
                    : isLightTheme
                      ? "bg-slate-50 border-slate-200 opacity-80"
                      : "bg-white/[0.02] border-white/5 opacity-80"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(notif.priority)}
                    <span className="text-[10px] font-mono text-white/40 uppercase">
                      {notif.category}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono flex items-center gap-1 ${
                    isLightTheme ? "text-slate-400" : "text-white/40"
                  }`}>
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>

                <h4 className={`text-sm font-bold font-sans ${
                  isLightTheme ? "text-slate-900" : "text-white"
                }`}>
                  {notif.title}
                </h4>
                <p className={`text-xs leading-relaxed ${
                  isLightTheme ? "text-slate-600" : "text-white/70"
                }`}>
                  {notif.message}
                </p>

                {/* Audit Trail Expandable Accordion */}
                {notif.auditTrail && notif.auditTrail.length > 0 && (
                  <div className="mt-1 pt-2 border-t border-white/5">
                    <button
                      onClick={() => setExpandedAuditId(isAuditExpanded ? null : targetId)}
                      className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Lock className="w-3 h-3" />
                      <span>{isAuditExpanded ? "Hide Audit Trail" : `Lifecycle Audit Trail (${notif.auditTrail.length} Events)`}</span>
                      {isAuditExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isAuditExpanded && (
                      <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 font-mono text-[10px]">
                        {notif.auditTrail.map((entry, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2 text-white/60">
                            <span className="font-bold text-amber-400">[{entry.state}]</span>
                            <span className="flex-1 text-white/70">{entry.details}</span>
                            <span className="text-white/30 shrink-0">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2.5 border-t border-white/5 mt-1">
                  <button
                    onClick={() => handleToggleRead(notif)}
                    className="text-[11px] font-mono text-rose-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isUnread ? "Mark as Read" : "Mark as Unread"}</span>
                  </button>

                  {notif.actionText && (
                    <button
                      onClick={() => {
                        if (onNavigateTab) {
                          if (notif.actionUrl?.includes("vault") || notif.actionUrl?.includes("documents")) onNavigateTab("documents");
                          else if (notif.actionUrl?.includes("roadmap")) onNavigateTab("roadmap");
                          else if (notif.actionUrl?.includes("office")) onNavigateTab("office-locator");
                          else onNavigateTab("notifications");
                        }
                        if (onClose) onClose();
                      }}
                      className="px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold rounded-xl hover:bg-rose-500/30 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{notif.actionText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // If embedded in main view layout
  if (isEmbedded) {
    return (
      <div className={`w-full rounded-3xl border shadow-2xl overflow-hidden min-h-[600px] text-left ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#0d1117] border-white/10"
      }`}>
        {renderContent()}
      </div>
    );
  }

  // Slide-over drawer mode
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 380, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`w-full max-w-lg border-l h-full flex flex-col shadow-2xl ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#0d1117] border-white/10"
          }`}
        >
          {renderContent()}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

