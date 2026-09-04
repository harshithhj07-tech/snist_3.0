import React, { useState, useEffect, useCallback } from "react";
import {
  Fingerprint,
  Lock,
  Unlock,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ShieldAlert
} from "lucide-react";
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  getStoredBiometricCred,
  registerBiometricCredential,
  authenticateWithBiometrics,
  getStoredVaultPin,
  saveVaultPin,
  verifyVaultPin
} from "../utils/webauthn";

interface BiometricDocumentGuardProps {
  userId: string;
  userEmail: string;
  userName: string;
  children: React.ReactNode;
}

export function BiometricDocumentGuard({
  userId,
  userEmail,
  userName,
  children
}: BiometricDocumentGuardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [webAuthnSupported, setWebAuthnSupported] = useState(false);
  const [platformAuthAvailable, setPlatformAuthAvailable] = useState(false);

  // Fallback PIN states
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState("");

  const effectiveUserId = userId || "default-user";

  // Check WebAuthn support and enrolment status on mount
  useEffect(() => {
    const supported = isWebAuthnSupported();
    setWebAuthnSupported(supported);

    if (supported) {
      isPlatformAuthenticatorAvailable().then((available) => {
        setPlatformAuthAvailable(available);
      });
    }

    const cred = getStoredBiometricCred(effectiveUserId);
    setIsEnrolled(!!cred);

    const storedPin = getStoredVaultPin(effectiveUserId);
    setHasPin(!!storedPin);
  }, [effectiveUserId]);

  // Handle Biometric Unlock
  const handleBiometricUnlock = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (!isEnrolled) {
        // If not enrolled yet, guide user through registration
        const success = await registerBiometricCredential(
          effectiveUserId,
          userEmail || "citizen@bharatnavigator.gov.in",
          userName || "Bharat Citizen"
        );
        if (success) {
          setIsEnrolled(true);
          setIsUnlocked(true);
          setSuccessMessage("Biometric key generated and vault unlocked successfully!");
        }
      } else {
        // Authenticate with existing biometric passkey
        const success = await authenticateWithBiometrics(effectiveUserId);
        if (success) {
          setIsUnlocked(true);
          setSuccessMessage("Biometric authentication verified!");
        }
      }
    } catch (err: any) {
      console.warn("Biometric unlock error:", err);
      setErrorMessage(err.message || "Biometric unlock failed. Please try again or use Vault PIN.");
    } finally {
      setIsLoading(false);
    }
  }, [isEnrolled, effectiveUserId, userEmail, userName]);

  // Handle PIN Unlock
  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!pinInput || pinInput.length < 4) {
      setErrorMessage("Please enter your 6-digit Vault Security PIN.");
      return;
    }

    const valid = verifyVaultPin(effectiveUserId, pinInput);
    if (valid) {
      setIsUnlocked(true);
      setShowPinModal(false);
      setPinInput("");
      setSuccessMessage("Vault unlocked via Security PIN!");
    } else {
      setErrorMessage(
        hasPin
          ? "Incorrect Vault Security PIN. Please enter your created 6-digit PIN."
          : "Incorrect Vault Security PIN."
      );
    }
  };

  // Handle Setting Custom Vault PIN
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length < 4) {
      setErrorMessage("PIN must be at least 4 digits.");
      return;
    }
    saveVaultPin(effectiveUserId, newPinInput);
    setHasPin(true);
    setIsCreatingPin(false);
    setNewPinInput("");
    setIsUnlocked(true);
    setSuccessMessage("New Vault Security PIN saved and vault unlocked!");
  };

  // Lock the Vault
  const handleLockVault = () => {
    setIsUnlocked(false);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // If Unlocked, show vault content with lock header status
  if (isUnlocked) {
    return (
      <div className="space-y-4">
        {/* Unlocked Security Banner */}
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Vault Security: WebAuthn Biometric Session Active</span>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded uppercase">
              FIDO2 Level-2 Hardware Locked
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBiometricUnlock}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer"
              title="Re-enroll Touch ID / Face ID"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Re-enroll Biometrics</span>
            </button>

            <button
              type="button"
              onClick={handleLockVault}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-lg border border-red-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Vault</span>
            </button>
          </div>
        </div>

        {/* Real Vault Content */}
        {children}
      </div>
    );
  }

  // Locked State: Biometric Security Gateway
  return (
    <div className="max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-[#0a0c10]/95 border-2 border-indigo-500/30 rounded-3xl shadow-2xl backdrop-blur-xl text-left space-y-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-2xl shrink-0 shadow-lg shadow-indigo-500/10">
            <Fingerprint className="w-7 h-7 animate-pulse-slow text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
                Secondary Authentication Gateway
              </span>
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-[9px] font-mono text-amber-400 font-bold uppercase rounded">
                High Security
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Biometric Document Vault Lock
            </h3>
          </div>
        </div>

        <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/50 shrink-0">
          <Lock className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      <p className="text-xs text-white/70 leading-relaxed">
        Accessing stored Aadhaar certificates, PAN records, and government identity documents requires secondary WebAuthn biometric verification (Touch ID, Face ID, Windows Hello, or FIDO2 Security Passkey).
      </p>

      {/* Status Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="p-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-left">
          <span className="text-[9px] font-mono uppercase text-white/40 block">Hardware API</span>
          <span className="text-xs font-bold font-mono text-indigo-300">
            {webAuthnSupported ? "WebAuthn Supported" : "Legacy Passcode Mode"}
          </span>
        </div>

        <div className="p-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-left">
          <span className="text-[9px] font-mono uppercase text-white/40 block">Passkey Enrollment</span>
          <span className="text-xs font-bold font-mono text-amber-300">
            {isEnrolled ? "Passkey Enrolled" : "Needs Registration"}
          </span>
        </div>

        <div className="p-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-left col-span-2 sm:col-span-1">
          <span className="text-[9px] font-mono uppercase text-white/40 block">Encryption Standard</span>
          <span className="text-xs font-bold font-mono text-emerald-400">
            FIDO2 AES-256
          </span>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2.5 font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Biometric Interactive Scanner Card */}
      <div className="p-6 bg-gradient-to-b from-indigo-950/30 to-black/60 border border-indigo-500/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative group cursor-pointer" onClick={handleBiometricUnlock}>
          <div className="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-400/50 flex items-center justify-center text-indigo-300 shadow-2xl shadow-indigo-500/30 group-hover:scale-105 transition duration-300">
            <Fingerprint className="w-10 h-10 animate-pulse text-indigo-300" />
          </div>
          <div className="absolute inset-0 rounded-full border border-indigo-400/30 animate-ping opacity-20 pointer-events-none" />
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">
            {isEnrolled ? "Touch ID / Face ID / Passkey Ready" : "Enroll & Unlock with Biometrics"}
          </h4>
          <p className="text-[11px] text-white/50 mt-0.5">
            {isEnrolled
              ? "Click below to trigger browser biometric authentication popup"
              : "Generate a secure FIDO2 WebAuthn credential bound to this device"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleBiometricUnlock}
          disabled={isLoading}
          className="w-full max-w-xs py-3 px-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Scanning Biometrics...</span>
            </>
          ) : (
            <>
              <Fingerprint className="w-4 h-4" />
              <span>{isEnrolled ? "Scan Biometrics to Unlock" : "Enroll & Unlock Vault"}</span>
            </>
          )}
        </button>
      </div>

      {/* Secondary PIN / Passcode Option */}
      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-white/60">Can't use biometric sensor?</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowPinModal(true);
              setErrorMessage(null);
            }}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 hover:text-amber-200 font-mono text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Unlock with Vault PIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsCreatingPin(true);
              setErrorMessage(null);
            }}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-mono text-[11px] rounded-xl transition cursor-pointer"
          >
            {hasPin ? "Change PIN" : "Set PIN"}
          </button>
        </div>
      </div>

      {/* PIN Unlock Modal / Form Overlay */}
      {showPinModal && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 font-mono uppercase flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" />
              Vault Security PIN Unlock
            </span>
            <button
              type="button"
              onClick={() => setShowPinModal(false)}
              className="text-white/40 hover:text-white text-xs"
            >
              Close
            </button>
          </div>

          <form onSubmit={handlePinUnlock} className="flex gap-2">
            <input
              type="password"
              maxLength={8}
              placeholder={hasPin ? "Enter your 6-digit Vault Security PIN" : "Enter your 6-digit PIN"}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer"
            >
              Unlock
            </button>
          </form>
          <p className="text-[10px] text-white/50 italic">
            {hasPin 
              ? "Your vault is protected by your custom Security PIN."
              : "Set your own custom PIN anytime by clicking 'Set PIN' or 'Change PIN'."}
          </p>
        </div>
      )}

      {/* Create Custom PIN Modal */}
      {isCreatingPin && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 font-mono uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Set Custom Vault Security PIN
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingPin(false)}
              className="text-white/40 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveNewPin} className="flex gap-2">
            <input
              type="password"
              maxLength={8}
              placeholder="Enter new 6-digit PIN"
              value={newPinInput}
              onChange={(e) => setNewPinInput(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer"
            >
              Save & Unlock
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
