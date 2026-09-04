import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Laptop,
  Tablet,
  Key,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Lock,
  Fingerprint,
  AlertTriangle,
  Globe,
  Clock,
  Info,
  Power,
  Ban,
  Cpu,
  Check,
  X
} from "lucide-react";
import {
  TrustedDeviceCredential,
  getStoredTrustedDevices,
  revokeDeviceCredential,
  revokeAllOtherDevices,
  registerBiometricCredential
} from "../utils/webauthn";

interface TrustedDevicesManagerProps {
  userId: string;
  userEmail?: string;
  userName?: string;
  onDeviceRevoked?: () => void;
}

export const TrustedDevicesManager: React.FC<TrustedDevicesManagerProps> = ({
  userId,
  userEmail = "user@bharatnavigator.gov.in",
  userName = "Bharat Citizen",
  onDeviceRevoked
}) => {
  const [devices, setDevices] = useState<TrustedDeviceCredential[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "revoked">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deviceToRevoke, setDeviceToRevoke] = useState<TrustedDeviceCredential | null>(null);
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);
  const [isRegisteringNew, setIsRegisteringNew] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: "success" | "info" | "warning" } | null>(null);

  useEffect(() => {
    loadDevices();
  }, [userId]);

  const loadDevices = () => {
    const loaded = getStoredTrustedDevices(userId);
    setDevices(loaded);
  };

  const handleRevokeSingle = (device: TrustedDeviceCredential) => {
    setDeviceToRevoke(device);
  };

  const confirmRevokeSingle = () => {
    if (!deviceToRevoke) return;
    const updated = revokeDeviceCredential(userId, deviceToRevoke.id);
    setDevices(updated);
    setDeviceToRevoke(null);
    setNotificationMsg({
      text: `Successfully revoked WebAuthn passkey for "${deviceToRevoke.deviceName}". That device can no longer access the Document Vault.`,
      type: "warning"
    });
    if (onDeviceRevoked) onDeviceRevoked();
  };

  const confirmRevokeAllOthers = () => {
    const updated = revokeAllOtherDevices(userId);
    setDevices(updated);
    setShowRevokeAllConfirm(false);
    setNotificationMsg({
      text: "All secondary devices and passkeys have been revoked. Only this active session remains authorized.",
      type: "warning"
    });
    if (onDeviceRevoked) onDeviceRevoked();
  };

  const handleRegisterNewPasskey = async () => {
    setIsRegisteringNew(true);
    try {
      const success = await registerBiometricCredential(userId, userEmail, userName);
      if (success) {
        // Add a new device entry to list
        const newDevice: TrustedDeviceCredential = {
          id: `dev-new-${Date.now()}`,
          deviceName: `New Passkey (${navigator.platform || "Device"} / ${getBrowserName()})`,
          deviceType: detectDeviceType(),
          browser: getBrowserName(),
          os: navigator.platform || "Unknown OS",
          ipAddress: "103.21.124.89 (Current Session)",
          location: "New Delhi, India",
          registeredAt: "Just now",
          lastUsedAt: "Just now",
          rawId: `FIDO2_PASSKEY_${Date.now()}`,
          credentialIdDisplay: `pk_live_${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 8)}`,
          isCurrentDevice: true,
          status: "active"
        };
        const updated = [newDevice, ...devices];
        setDevices(updated);
        localStorage.setItem(`bharat_vault_devices_${userId}`, JSON.stringify(updated));
        setNotificationMsg({
          text: "New FIDO2 biometric passkey successfully registered for this device!",
          type: "success"
        });
      }
    } catch (err: any) {
      console.warn("Passkey registration notice:", err);
      setNotificationMsg({
        text: err.message || "Failed to register new passkey.",
        type: "info"
      });
    } finally {
      setIsRegisteringNew(false);
    }
  };

  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg")) return "Edge";
    return "Browser";
  };

  const detectDeviceType = (): "mobile" | "desktop" | "tablet" | "security_key" => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("ipad") || ua.includes("tablet")) return "tablet";
    if (ua.includes("mobi") || ua.includes("iphone") || ua.includes("android")) return "mobile";
    return "desktop";
  };

  const getDeviceIcon = (type: TrustedDeviceCredential["deviceType"]) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="w-5 h-5 text-cyan-400" />;
      case "tablet":
        return <Tablet className="w-5 h-5 text-indigo-400" />;
      case "security_key":
        return <Key className="w-5 h-5 text-amber-400" />;
      default:
        return <Laptop className="w-5 h-5 text-blue-400" />;
    }
  };

  const activeCount = devices.filter(d => d.status === "active").length;
  const revokedCount = devices.filter(d => d.status === "revoked").length;

  const filteredDevices = devices.filter(d => {
    const matchesFilter =
      filter === "all" ? true : filter === "active" ? d.status === "active" : d.status === "revoked";
    const matchesSearch =
      d.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.os.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.browser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.credentialIdDisplay.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {notificationMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border text-xs font-mono flex items-center justify-between gap-3 ${
              notificationMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : notificationMsg.type === "warning"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-blue-500/10 border-blue-500/30 text-blue-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{notificationMsg.text}</span>
            </div>
            <button
              onClick={() => setNotificationMsg(null)}
              className="text-white/40 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER CARD */}
      <div className="p-6 sm:p-8 bg-[#0b0f19] border border-blue-500/30 rounded-3xl space-y-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5" />
                FIDO2 WebAuthn Registry
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {activeCount} Active Passkeys
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Manage Trusted Devices & Passkeys
            </h2>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
              Review all devices hardware-enrolled for biometric unlock. Revoke credentials from stolen, obsolete, or unrecognized hardware instantly.
            </p>
          </div>

          {/* TOP ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleRegisterNewPasskey}
              disabled={isRegisteringNew}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isRegisteringNew ? "Enrolling Passkey..." : "Enroll New Device Passkey"}</span>
            </button>

            {activeCount > 1 && (
              <button
                onClick={() => setShowRevokeAllConfirm(true)}
                className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Revoke All Other Devices</span>
              </button>
            )}
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 font-mono text-xs">
          <div className="p-3 bg-black/40 border border-white/5 rounded-2xl">
            <span className="text-[10px] text-white/40 block uppercase">Total Passkeys</span>
            <strong className="text-sm font-bold text-white mt-0.5 block">{devices.length} Registered</strong>
          </div>

          <div className="p-3 bg-black/40 border border-white/5 rounded-2xl">
            <span className="text-[10px] text-white/40 block uppercase">Active Devices</span>
            <strong className="text-sm font-bold text-emerald-400 mt-0.5 block">{activeCount} Authorized</strong>
          </div>

          <div className="p-3 bg-black/40 border border-white/5 rounded-2xl">
            <span className="text-[10px] text-white/40 block uppercase">Revoked Tokens</span>
            <strong className="text-sm font-bold text-red-400 mt-0.5 block">{revokedCount} Disabled</strong>
          </div>

          <div className="p-3 bg-black/40 border border-white/5 rounded-2xl">
            <span className="text-[10px] text-white/40 block uppercase">Current Device</span>
            <strong className="text-sm font-bold text-cyan-400 mt-0.5 block truncate">
              {navigator.platform || "Active Session"}
            </strong>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0b0f19] border border-white/10 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search devices by name, OS, browser, or credential ID..."
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "active", "revoked"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition cursor-pointer ${
                filter === tab
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-white/5 text-white/60 hover:text-white border border-white/10"
              }`}
            >
              {tab} {tab === "active" ? `(${activeCount})` : tab === "revoked" ? `(${revokedCount})` : `(${devices.length})`}
            </button>
          ))}

          <button
            onClick={loadDevices}
            className="p-2 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-xl transition cursor-pointer"
            title="Refresh device list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DEVICE LIST */}
      <div className="space-y-4">
        {filteredDevices.length === 0 ? (
          <div className="p-8 bg-[#0b0f19] border border-white/10 rounded-3xl text-center space-y-3">
            <Laptop className="w-10 h-10 text-white/30 mx-auto" />
            <h3 className="text-sm font-bold text-white font-mono">No matching trusted devices found</h3>
            <p className="text-xs text-white/50">Try adjusting your search filter or enroll a new WebAuthn passkey.</p>
          </div>
        ) : (
          filteredDevices.map(device => {
            const isRevoked = device.status === "revoked";
            return (
              <div
                key={device.id}
                className={`p-5 bg-[#0b0f19] border rounded-3xl space-y-4 transition ${
                  isRevoked
                    ? "border-red-500/20 bg-red-950/5 opacity-75"
                    : device.isCurrentDevice
                    ? "border-blue-500/40 bg-blue-950/10 shadow-lg"
                    : "border-white/10 hover:border-blue-500/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-3 rounded-2xl border shrink-0 ${
                        isRevoked
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : device.isCurrentDevice
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-white/5 border-white/10 text-white/70"
                      }`}
                    >
                      {getDeviceIcon(device.deviceType)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-white font-mono">{device.deviceName}</h3>

                        {device.isCurrentDevice && (
                          <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                            This Device (Active)
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            isRevoked
                              ? "text-red-400 bg-red-500/10 border-red-500/20"
                              : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          }`}
                        >
                          {isRevoked ? "Revoked" : "Authorized"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60 font-mono">
                        <span>OS: {device.os}</span>
                        <span>Browser: {device.browser}</span>
                        {device.location && <span>Location: {device.location}</span>}
                      </div>
                    </div>
                  </div>

                  {/* REVOKE ACTION BUTTON */}
                  <div className="shrink-0 flex items-center gap-2">
                    {!isRevoked && !device.isCurrentDevice && (
                      <button
                        onClick={() => handleRevokeSingle(device)}
                        className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke Credential</span>
                      </button>
                    )}

                    {!isRevoked && device.isCurrentDevice && (
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Primary Hardware Credential</span>
                      </span>
                    )}

                    {isRevoked && (
                      <span className="text-xs font-mono text-red-400/80 bg-red-500/5 px-3 py-1.5 rounded-xl border border-red-500/10 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        <span>Access Blocked</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* EXPANDED TECHNICAL DETAILS */}
                <div className="p-3.5 bg-black/40 border border-white/5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] text-white/70">
                  <div>
                    <span className="text-white/40 block text-[10px]">Credential ID:</span>
                    <span className="text-white font-bold break-all">{device.credentialIdDisplay}</span>
                  </div>

                  <div>
                    <span className="text-white/40 block text-[10px]">Registered On:</span>
                    <span>{device.registeredAt}</span>
                  </div>

                  <div>
                    <span className="text-white/40 block text-[10px]">Last Used:</span>
                    <span className={isRevoked ? "text-red-400" : "text-emerald-400"}>{device.lastUsedAt}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONFIRM SINGLE REVOCATION MODAL */}
      <AnimatePresence>
        {deviceToRevoke && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0f19] border border-red-500/40 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative text-left"
            >
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Revoke WebAuthn Passkey?</h3>
                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  Are you sure you want to revoke access for <strong className="text-white">{deviceToRevoke.deviceName}</strong>?
                </p>
                <p className="text-xs text-red-400/90 font-mono bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  Warning: The hardware security key or passkey on this device will immediately be invalidated and cannot unlock encrypted documents.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeviceToRevoke(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 font-mono text-xs rounded-xl border border-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRevokeSingle}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-xl transition cursor-pointer shadow-lg"
                >
                  Revoke Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM REVOKE ALL OTHER DEVICES MODAL */}
      <AnimatePresence>
        {showRevokeAllConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0f19] border border-red-500/40 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative text-left"
            >
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400">
                <Power className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Revoke All Other Devices?</h3>
                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  This action will invalidate all passkeys and biometric registrations on all other laptops, phones, and hardware keys.
                </p>
                <p className="text-xs text-amber-300 font-mono bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  Only your current active session ({navigator.platform || "Current Device"}) will remain authorized.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRevokeAllConfirm(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 font-mono text-xs rounded-xl border border-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRevokeAllOthers}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-xl transition cursor-pointer shadow-lg"
                >
                  Revoke All Others
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
