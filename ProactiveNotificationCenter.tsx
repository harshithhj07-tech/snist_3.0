import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  RefreshCw, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Sliders, 
  ExternalLink,
  History,
  Lock,
  Sparkles
} from "lucide-react";
import { 
  ProactiveNotification, 
  UserNotificationPreferences, 
  NotificationPriority, 
  NotificationCategory, 
  VaultDocumentModel, 
  RoadmapData 
} from "../types";

interface ProactiveNotificationCenterProps {
  userId?: string;
  vaultDocs?: VaultDocumentModel[];
  activeRoadmaps?: RoadmapData[];
  isLightTheme?: boolean;
}

export const ProactiveNotificationCenter: React.FC<ProactiveNotificationCenterProps> = ({
  userId = "user_default",
  vaultDocs = [],
  activeRoadmaps = [],
  isLightTheme = false
}) => {
  const [notifications, setNotifications] = useState<ProactiveNotification[]>([]);
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "urgent" | "action" | "preferences">("all");
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Fetch Notifications & Preferences on Mount
  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/v1/proactive/notifications?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) setNotifications(data.notifications);
      }
    } catch (e) {
      console.warn("Failed to fetch notifications:", e);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch(`/api/v1/proactive/preferences?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) setPreferences(data.preferences);
      }
    } catch (e) {
      console.warn("Failed to fetch preferences:", e);
    }
  };

  const handleRunProactiveCheck = async () => {
    setIsLoading(true);
    setStatusMsg("Running proactive background scheduler check across Vault & Workflows...");
    try {
      const res = await fetch("/api/v1/proactive/trigger-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, vaultDocs, activeRoadmaps })
      });
      if (res.ok) {
        const data = await res.json();
        setStatusMsg(`Scheduler check completed! ${data.generatedCount} new real proactive notifications generated.`);
        fetchNotifications();
      }
    } catch (e) {
      setStatusMsg("Proactive check failed.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    try {
      await fetch("/api/v1/proactive/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId })
      });
      fetchNotifications();
    } catch (e) {
      console.warn("Mark read failed:", e);
    }
  };

  const handleActionTaken = async (notificationId: string) => {
    try {
      await fetch("/api/v1/proactive/action-taken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId })
      });
      setStatusMsg("Action recorded! Event lifecycle updated to ACTION_TAKEN.");
      fetchNotifications();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e) {
      console.warn("Action taken failed:", e);
    }
  };

  const handleTogglePreferenceChannel = async (channel: keyof UserNotificationPreferences["channels"]) => {
    if (!preferences) return;
    const updatedChannels = { ...preferences.channels, [channel]: !preferences.channels[channel] };
    const updated = { ...preferences, channels: updatedChannels };
    setPreferences(updated);
    savePreferences(updated);
  };

  const handleTogglePreferenceCategory = async (category: keyof UserNotificationPreferences["categories"]) => {
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
      console.warn("Failed to save preferences:", e);
    }
  };

  const unreadCount = notifications.filter(n => n.lifecycleState === "DELIVERED").length;
  const urgentCount = notifications.filter(n => n.priority === "URGENT" || n.priority === "DEADLINE").length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "urgent") return n.priority === "URGENT" || n.priority === "DEADLINE";
    if (activeTab === "action") return n.priority === "ACTION_REQUIRED" || n.lifecycleState === "DELIVERED";
    return true;
  });

  const getPriorityStyle = (priority: NotificationPriority) => {
    switch (priority) {
      case "DEADLINE":
        return {
          cardBg: isLightTheme ? "bg-rose-50/90 border-rose-300" : "bg-rose-950/20 border-rose-500/40 shadow-rose-900/20",
          badgeBg: "bg-rose-500 text-white font-bold animate-pulse",
          icon: <Clock className="w-4 h-4 text-rose-500 animate-spin-slow" />,
          titleColor: isLightTheme ? "text-rose-900" : "text-rose-300"
        };
      case "URGENT":
        return {
          cardBg: isLightTheme ? "bg-amber-50/90 border-amber-300" : "bg-amber-950/20 border-amber-500/40 shadow-amber-900/20",
          badgeBg: "bg-amber-500 text-black font-bold",
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
          titleColor: isLightTheme ? "text-amber-900" : "text-amber-300"
        };
      case "ACTION_REQUIRED":
        return {
          cardBg: isLightTheme ? "bg-cyan-50/90 border-cyan-300" : "bg-cyan-950/20 border-cyan-500/40 shadow-cyan-900/20",
          badgeBg: "bg-cyan-500 text-black font-bold",
          icon: <ShieldAlert className="w-4 h-4 text-cyan-400" />,
          titleColor: isLightTheme ? "text-cyan-900" : "text-cyan-300"
        };
      default:
        return {
          cardBg: isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10",
          badgeBg: "bg-slate-700 text-slate-200",
          icon: <Info className="w-4 h-4 text-indigo-400" />,
          titleColor: isLightTheme ? "text-slate-900" : "text-white"
        };
    }
  };

  return (
    <div className={`p-6 rounded-2xl border space-y-6 text-left transition-all ${
      isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b0f19] border-white/10 text-white shadow-xl"
    }`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl">
            <Bell className="w-5 h-5 text-amber-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-base font-bold font-mono tracking-tight flex items-center gap-2">
              Proactive Notification & Event Engine
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded-full border border-emerald-500/30">
                LIVE DETERMINISTIC
              </span>
            </h2>
            <p className="text-xs text-white/60">
              Proactively surfacing real changes in documents, workflow steps, and SLAs without manual checking.
            </p>
          </div>
        </div>

        {/* Proactive Check Button */}
        <button
          onClick={handleRunProactiveCheck}
          disabled={isLoading}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Run Proactive Scheduler Check
        </button>
      </div>

      {/* Status Message */}
      {statusMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-mono flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "all" ? "bg-amber-500 text-black" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <span>All Notifications</span>
            <span className="px-1.5 py-0.2 bg-black/20 text-[10px] rounded-full">{notifications.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("urgent")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "urgent" ? "bg-rose-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Urgent & Deadlines</span>
            {urgentCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-900 text-white text-[10px] rounded-full font-extrabold">{urgentCount}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("action")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "action" ? "bg-cyan-500 text-black" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Action Required</span>
          </button>
        </div>

        <button
          onClick={() => setActiveTab("preferences")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "preferences" ? "bg-slate-700 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>User Preferences</span>
        </button>
      </div>

      {/* Preferences Content */}
      {activeTab === "preferences" && preferences ? (
        <div className="p-5 bg-black/40 border border-white/10 rounded-xl space-y-6 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-wider mb-1">
              Notification Channel & Category Preferences
            </h3>
            <p className="text-xs text-white/60">
              Control which notification channels and categories are active. The Proactive Engine strictly respects these preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Channels */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" /> Delivery Channels
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { id: "in_app", label: "In-App Bell UI", icon: <Bell className="w-3.5 h-3.5 text-amber-400" /> },
                  { id: "sms", label: "SMS Alerts", icon: <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> },
                  { id: "email", label: "Email Notifications", icon: <Mail className="w-3.5 h-3.5 text-blue-400" /> },
                  { id: "whatsapp", label: "WhatsApp Messaging", icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> }
                ].map(item => (
                  <label key={item.id} className="flex items-center justify-between p-2 bg-black/30 rounded-lg cursor-pointer hover:bg-white/5 transition">
                    <div className="flex items-center gap-2 font-mono">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.channels[item.id as keyof UserNotificationPreferences["channels"]]}
                      onChange={() => handleTogglePreferenceChannel(item.id as any)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" /> Notification Categories
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { id: "vault", label: "Vault & Document Expiry", desc: "Expiring document warnings & OCR ingestions" },
                  { id: "workflow", label: "Workflow Requirements", desc: "Step completions, blocks & approval gates" },
                  { id: "deadlines", label: "SLA & Timelines", desc: "e-District 7-day SLA countdowns & nodal escalations" },
                  { id: "eligibility", label: "Eligibility Updates", desc: "Newly qualified welfare scheme recommendations" },
                  { id: "system", label: "System & Gazette", desc: "Official government gazette directive releases" }
                ].map(item => (
                  <label key={item.id} className="flex items-center justify-between p-2 bg-black/30 rounded-lg cursor-pointer hover:bg-white/5 transition">
                    <div>
                      <p className="font-mono font-bold text-white">{item.label}</p>
                      <p className="text-[10px] text-white/50">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.categories[item.id as keyof UserNotificationPreferences["categories"]]}
                      onChange={() => handleTogglePreferenceCategory(item.id as any)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Notifications List */
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center bg-white/5 border border-white/10 rounded-xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-mono text-white/70">No proactive notifications found matching filter.</p>
              <p className="text-[11px] text-white/40">Click 'Run Proactive Scheduler Check' to evaluate real vault docs & roadmaps.</p>
            </div>
          ) : (
            filteredNotifications.map(n => {
              const style = getPriorityStyle(n.priority);
              const isAuditExpanded = expandedAuditId === n.notificationId;

              return (
                <div
                  key={n.notificationId}
                  className={`p-4 rounded-xl border transition-all ${style.cardBg}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">{style.icon}</div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-xs font-bold font-mono ${style.titleColor}`}>
                            {n.title}
                          </h4>
                          <span className={`px-2 py-0.2 rounded text-[9px] uppercase font-mono ${style.badgeBg}`}>
                            {n.priority}
                          </span>
                          <span className="px-2 py-0.2 bg-white/10 text-white/70 text-[9px] uppercase font-mono rounded">
                            {n.category}
                          </span>
                        </div>

                        <p className="text-xs text-white/80 leading-relaxed">
                          {n.message}
                        </p>

                        {/* Delivered Channels */}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] text-white/40 font-mono">Delivered via:</span>
                          <div className="flex items-center gap-1 text-[9px] font-mono text-amber-300/80">
                            {n.channelsDelivered.map(ch => (
                              <span key={ch} className="px-1.5 py-0.2 bg-black/30 border border-white/10 rounded">
                                {ch.replace("_", "-")}
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] text-white/30 font-mono">• {new Date(n.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        {n.lifecycleState !== "ACTION_TAKEN" && n.actionText && (
                          <button
                            onClick={() => handleActionTaken(n.notificationId)}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] rounded-lg transition cursor-pointer flex items-center gap-1"
                          >
                            <span>{n.actionText}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}

                        {n.lifecycleState === "ACTION_TAKEN" && (
                          <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold rounded-lg flex items-center gap-1">
                            <Check className="w-3 h-3" /> Action Recorded
                          </span>
                        )}

                        {n.lifecycleState === "DELIVERED" && (
                          <button
                            onClick={() => handleMarkRead(n.notificationId)}
                            className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white/80 text-[10px] rounded-lg transition cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>

                      {/* Audit Trail Toggle */}
                      <button
                        onClick={() => setExpandedAuditId(isAuditExpanded ? null : n.notificationId)}
                        className="text-[10px] text-amber-400/80 hover:text-amber-300 font-mono flex items-center gap-1 transition cursor-pointer"
                      >
                        <History className="w-3 h-3" />
                        <span>Audit History ({n.auditTrail.length})</span>
                        {isAuditExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Audit Trail Section */}
                  {isAuditExpanded && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2 animate-fade-in text-[10px] font-mono">
                      <p className="text-amber-400 font-bold uppercase tracking-wider">
                        Notification Lifecycle Audit Log:
                      </p>
                      <div className="space-y-1 bg-black/40 p-2.5 rounded-lg border border-white/5">
                        {n.auditTrail.map((log, idx) => (
                          <div key={idx} className="flex items-center justify-between text-white/70">
                            <span className="font-bold text-amber-300">{log.state}</span>
                            <span className="text-white/50">{log.details}</span>
                            <span className="text-white/30">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
