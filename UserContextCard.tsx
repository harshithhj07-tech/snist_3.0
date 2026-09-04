import React from "react";
import { CitizenProfile } from "../../types";
import { User, ShieldCheck } from "lucide-react";

interface UserContextCardProps {
  profile: CitizenProfile;
  isCollapsed?: boolean;
  isLightTheme?: boolean;
  onOpenProfile?: () => void;
}

export const UserContextCard: React.FC<UserContextCardProps> = ({
  profile,
  isCollapsed = false,
  isLightTheme = false,
  onOpenProfile,
}) => {
  const name = profile.fullName?.trim() || profile.name?.trim() || "Citizen User";
  const state = profile.state?.trim() || "Telangana";
  const rawDistrict = profile.district?.trim() || profile.city?.trim() || "Hyderabad";
  const district = (state.toLowerCase() === "bihar" && rawDistrict.toLowerCase().includes("hyderabad"))
    ? "Patna"
    : (state.toLowerCase() === "telangana" && rawDistrict.toLowerCase().includes("patna"))
      ? "Hyderabad"
      : rawDistrict;
  const completionPercentage = (profile as any).profileCompletionPercentage || (profile.profileCompleted ? 100 : 82);

  // Initials for avatar
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CU";

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={onOpenProfile}
        title={`${name} (${state} • ${district}) - Profile ${completionPercentage}% complete`}
        className={`w-full py-2 flex flex-col items-center justify-center gap-1 rounded-xl transition cursor-pointer border ${
          isLightTheme
            ? "bg-slate-200/50 border-slate-300 text-slate-800 hover:bg-slate-200"
            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
        }`}
      >
        <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-[10px] flex items-center justify-center">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenProfile}
      className={`w-full p-2.5 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer group focus-visible:ring-2 focus-visible:ring-amber-500 ${
        isLightTheme
          ? "bg-slate-200/60 border-slate-300 hover:bg-slate-200 text-slate-800"
          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-white"
      }`}
    >
      {/* Avatar Image or Initials */}
      <div className="relative shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center shadow-inner overflow-hidden">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center text-black" title="Verified Identity Context">
          <ShieldCheck className="w-2.5 h-2.5 text-black" />
        </div>
      </div>

      {/* Citizen Details */}
      <div className="flex-1 min-w-0">
        <h4 className={`text-xs font-bold truncate leading-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
          {name}
        </h4>

        <p className={`text-[10px] truncate leading-normal mt-0.5 ${isLightTheme ? "text-slate-500" : "text-white/50"}`}>
          {state} • {district}
        </p>
      </div>
    </button>
  );
};
