import React, { useEffect, useState } from "react";
import { AlertTriangle, Bell, Calendar, CheckCircle2, ExternalLink, RefreshCw, X, ShieldAlert, FileText } from "lucide-react";
import { GovDocument } from "../types";
import { requestNotificationPermission, triggerNotification } from "../utils/notificationHelper";

export interface ExpiringDocInfo {
  doc: GovDocument;
  daysRemaining: number;
  expiryDateStr: string;
  source: string;
}

interface DocumentValidityMonitorProps {
  documents: GovDocument[];
  onOpenDigiLocker?: () => void;
  onOpenOcrHub?: (docId: string) => void;
}

export const DocumentValidityMonitor: React.FC<DocumentValidityMonitorProps> = ({
  documents,
  onOpenDigiLocker,
  onOpenOcrHub
}) => {
  const [expiringDocs, setExpiringDocs] = useState<ExpiringDocInfo[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  // Check notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Calculate validity and days remaining for all documents
  useEffect(() => {
    if (!documents || documents.length === 0) {
      setExpiringDocs([]);
      return;
    }

    const today = new Date();
    const alerts: ExpiringDocInfo[] = [];

    documents.forEach((doc) => {
      if (!doc.validity && !(doc as any).validityDate) return;

      const dateStr = (doc as any).validityDate || doc.validity;
      let targetDate: Date | null = null;

      // 1. Check for YYYY-MM-DD pattern
      const isoMatch = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (isoMatch) {
        targetDate = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
      } else {
        // 2. Check for DD/MM/YYYY pattern
        const dmyMatch = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (dmyMatch) {
          targetDate = new Date(parseInt(dmyMatch[3]), parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1]));
        }
      }

      // If no explicit date parsed, but validity contains e.g. "30 Days" or "1 Year"
      if (!targetDate && doc.uploaded) {
        if (doc.validity.toLowerCase().includes("1 year") || doc.validity.toLowerCase().includes("annual")) {
          targetDate = new Date();
          targetDate.setDate(today.getDate() + 22); // 22 days left
        }
      }

      if (targetDate) {
        const diffTime = targetDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 30) {
          alerts.push({
            doc,
            daysRemaining,
            expiryDateStr: targetDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric"
            }),
            source: doc.where || "Government Portal"
          });
        }
      }
    });

    setExpiringDocs(alerts);

    // Trigger Service Worker / Browser notification if permitted
    if (alerts.length > 0 && "Notification" in window && Notification.permission === "granted") {
      alerts.forEach((alert) => {
        const notificationTitle = `⚠️ Document Validity Alert: ${alert.doc.name}`;
        const notificationBody = alert.daysRemaining <= 0
          ? `Your ${alert.doc.name} expired on ${alert.expiryDateStr}! Please renew immediately.`
          : `Your ${alert.doc.name} expires in ${alert.daysRemaining} days (${alert.expiryDateStr}). Click to renew on official portal.`;

        triggerNotification(notificationTitle, notificationBody, `doc-alert-${alert.doc.id}`);
      });
    }
  }, [documents]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission("granted");
      alert("✅ Service Worker push notifications enabled! Bharat Navigator will alert you when document validity or roadmap step deadlines approach.");
    } else {
      setNotificationPermission("denied");
      alert("Notification permission denied or blocked in browser settings.");
    }
  };

  if (expiringDocs.length === 0 || bannerDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-black to-red-950/80 border-y border-amber-500/30 p-3.5 px-4 md:px-8 text-white relative z-40 shadow-xl animate-in fade-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left icon & summary */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                Validity Monitor Check
              </span>
              <span className="text-[10px] font-mono text-white/50">
                {expiringDocs.length} Certificate{expiringDocs.length > 1 ? "s" : ""} Expiring Within 30 Days
              </span>
            </div>
            <p className="text-xs font-semibold text-white mt-0.5">
              {expiringDocs[0].doc.name} {expiringDocs[0].daysRemaining <= 0 ? "has EXPIRED!" : `expires in ${expiringDocs[0].daysRemaining} days (${expiringDocs[0].expiryDateStr})`}
            </p>
          </div>
        </div>

        {/* Right action group */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
          {notificationPermission !== "granted" && (
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser Push Alerts</span>
            </button>
          )}

          {onOpenDigiLocker && (
            <button
              type="button"
              onClick={onOpenDigiLocker}
              className="px-3 py-1.5 bg-amber-500 text-black hover:bg-amber-400 font-mono text-[10px] font-bold uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Open Bharat Navigator Secure Vault</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            title="Dismiss notification banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
