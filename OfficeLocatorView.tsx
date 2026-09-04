import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Navigation, 
  Search, 
  Phone, 
  Mail, 
  Clock, 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  User, 
  Compass, 
  Filter, 
  Sparkles,
  Building2,
  Car,
  CheckCircle2,
  LocateFixed
} from "lucide-react";
import { 
  GovernmentOffice, 
  searchNearbyOffices, 
  REAL_GOVERNMENT_OFFICES 
} from "../services/officeLocatorService";
import { Profile } from "../types";

interface OfficeLocatorViewProps {
  isLightTheme: boolean;
  profile?: Profile;
  roadmaps?: any[];
  activeRoadmapTitle?: string;
  onNavigateTab?: (tab: string) => void;
}

export const OfficeLocatorView: React.FC<OfficeLocatorViewProps> = ({
  isLightTheme,
  profile,
  roadmaps = [],
  activeRoadmapTitle,
  onNavigateTab
}) => {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(profile?.city || profile?.district || profile?.state || "Hyderabad");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [offices, setOffices] = useState<GovernmentOffice[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<GovernmentOffice | null>(null);

  // Auto detect GPS location on mount
  useEffect(() => {
    handleDetectGps();
  }, []);

  // Re-run office search when location or query or category changes
  useEffect(() => {
    const results = searchNearbyOffices(
      userCoords?.lat,
      userCoords?.lng,
      searchQuery,
      selectedCategory
    );
    setOffices(results);
    if (results.length > 0 && !selectedOffice) {
      setSelectedOffice(results[0]);
    }
  }, [userCoords, searchQuery, selectedCategory]);

  const handleDetectGps = () => {
    if ("geolocation" in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setGpsLoading(false);
        },
        (err) => {
          console.warn("GPS Location access denied/failed, falling back to profile city.", err);
          setGpsLoading(false);
        },
        { timeout: 8000 }
      );
    }
  };

  const activeRoadmap = activeRoadmapTitle || (roadmaps.length > 0 ? roadmaps[0].title || roadmaps[0].serviceName : null);

  return (
    <div className="space-y-6 text-left font-sans animate-fade-in">
      {/* Top Hero Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border relative overflow-hidden transition-all ${
        isLightTheme
          ? "bg-gradient-to-br from-blue-500/10 via-indigo-100/30 to-white border-blue-200 shadow-sm"
          : "bg-gradient-to-br from-[#0c1322] via-[#09101d] to-black border-blue-500/20 shadow-2xl"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-400" /> Intelligent Office Locator
              </span>
              <span className="text-[10px] font-mono text-white/40">• GPS & Travel SLA Engine</span>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isLightTheme ? "text-slate-900" : "text-white"
            }`}>
              Government Authority & Seva Kendra Finder
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${
              isLightTheme ? "text-slate-600" : "text-slate-300"
            }`}>
              Find nearest Passport Seva Kendras, MeeSeva / CSC portals, RTO offices, and GST Seva Kendras with verified addresses, working hours, officer phone helplines, and turn-by-turn directions.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleDetectGps}
              disabled={gpsLoading}
              className={`w-full md:w-auto px-5 py-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 ${
                isLightTheme
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold"
              }`}
            >
              <LocateFixed className={`w-4 h-4 ${gpsLoading ? "animate-spin" : ""}`} />
              <span>{gpsLoading ? "Detecting GPS..." : userCoords ? "GPS Active" : "Auto-Detect My GPS"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROADMAP INTEGRATION BANNER */}
      {activeRoadmap && (
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isLightTheme ? "bg-amber-50/80 border-amber-200" : "bg-amber-500/[0.05] border-amber-500/20"
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Compass className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider block">
                Active Citizen Roadmap Recommendation
              </span>
              <h3 className={`text-xs sm:text-sm font-bold ${isLightTheme ? "text-amber-950" : "text-amber-200"}`}>
                Required Office for Roadmap: "{activeRoadmap}"
              </h3>
              <p className={`text-xs ${isLightTheme ? "text-amber-900/80" : "text-amber-300/70"}`}>
                Automated location matching highlights the nearest verified authority for physical biometric capture, document verification, or license collection.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (activeRoadmap.toLowerCase().includes("passport")) setSelectedCategory("Passport");
              else if (activeRoadmap.toLowerCase().includes("license") || activeRoadmap.toLowerCase().includes("rto")) setSelectedCategory("RTO");
              else if (activeRoadmap.toLowerCase().includes("gst") || activeRoadmap.toLowerCase().includes("tax")) setSelectedCategory("GST & Tax");
              else setSelectedCategory("Municipality & Revenue");
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
          >
            Filter Nearest Office
          </button>
        </div>
      )}

      {/* SEARCH BAR & CATEGORY FILTERS */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
      }`}>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* City / Keyword Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by City, State, Pincode or Department (e.g., Hyderabad, Delhi, Bangalore, Ameerpet)"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isLightTheme
                  ? "bg-slate-100 text-slate-900 border border-slate-200"
                  : "bg-black/50 text-white border border-white/10"
              }`}
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-white/40 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`py-2.5 px-3 rounded-xl text-xs font-mono font-semibold focus:outline-none w-full sm:w-auto ${
                isLightTheme ? "bg-slate-100 text-slate-800 border border-slate-200" : "bg-black/50 text-white border border-white/10"
              }`}
            >
              <option value="All">All Office Categories</option>
              <option value="Passport">Passport Seva Kendra (PSK)</option>
              <option value="MeeSeva / CSC">MeeSeva / CSC Centre</option>
              <option value="RTO">RTO (Transport)</option>
              <option value="GST & Tax">GST Seva Kendra</option>
              <option value="Municipality & Revenue">Municipality & Revenue</option>
              <option value="Aadhaar & Banking">Aadhaar & Banking</option>
            </select>
          </div>
        </div>

        {/* Quick Location Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-mono text-white/40 uppercase whitespace-nowrap">Major Hubs:</span>
          {["Hyderabad", "Delhi", "Bangalore", "Mumbai"].map((city) => (
            <button
              key={city}
              onClick={() => setSearchQuery(city)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer border ${
                searchQuery.toLowerCase() === city.toLowerCase()
                  ? isLightTheme
                    ? "bg-blue-500 text-white border-blue-600 font-bold"
                    : "bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold"
                  : isLightTheme
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* OFFICE RESULTS & DETAIL INSPECTOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Office Cards List */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
              isLightTheme ? "text-slate-700" : "text-white/70"
            }`}>
              Nearby Government Offices ({offices.length} Found)
            </span>
            {userCoords && (
              <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> GPS Distance Calculated
              </span>
            )}
          </div>

          {offices.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border space-y-2 ${
              isLightTheme ? "bg-white border-slate-200" : "bg-[#0c1017] border-white/10 text-white/40"
            }`}>
              <Building2 className="w-10 h-10 mx-auto text-white/20" />
              <p className="text-xs font-mono">No government offices found matching "{searchQuery}". Try selecting another city or category above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offices.map((office) => (
                <div
                  key={office.id}
                  onClick={() => setSelectedOffice(office)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative overflow-hidden group ${
                    selectedOffice?.id === office.id
                      ? isLightTheme
                        ? "bg-blue-50/90 border-blue-400 shadow-md ring-1 ring-blue-300"
                        : "bg-blue-500/10 border-blue-500/50 shadow-2xl ring-1 ring-blue-500/30"
                      : isLightTheme
                        ? "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 shadow-sm"
                        : "bg-[#0c1017] border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold rounded uppercase">
                          {office.category}
                        </span>
                        <span className={`text-[10px] font-mono ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                          {office.department}
                        </span>
                      </div>
                      <h3 className={`text-sm sm:text-base font-bold tracking-tight ${
                        isLightTheme ? "text-slate-900" : "text-white"
                      }`}>
                        {office.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                      <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-emerald-500" />
                        {office.distanceKm} km
                      </span>
                      <span className={`text-[11px] flex items-center gap-1 ${
                        isLightTheme ? "text-slate-500" : "text-white/40"
                      }`}>
                        <Car className="w-3 h-3 text-blue-400" />
                        ~{office.estimatedDriveMins} mins
                      </span>
                    </div>
                  </div>

                  <p className={`text-xs ${isLightTheme ? "text-slate-600" : "text-slate-300"}`}>
                    <strong className="font-semibold">{office.address}, {office.city}, {office.state} - {office.pincode}</strong>
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {office.availableServices.slice(0, 3).map((svc, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          isLightTheme ? "bg-slate-100 text-slate-700" : "bg-white/5 text-white/70"
                        }`}
                      >
                        ✓ {svc}
                      </span>
                    ))}
                  </div>

                  <div className={`pt-3 border-t flex flex-wrap items-center justify-between text-xs gap-2 ${
                    isLightTheme ? "border-slate-200" : "border-white/5"
                  }`}>
                    <span className={`text-[11px] flex items-center gap-1 ${
                      isLightTheme ? "text-slate-500" : "text-white/40"
                    }`}>
                      <Clock className="w-3 h-3 text-amber-500" />
                      {office.workingHours}
                    </span>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Get Directions</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Selected Office Deep Inspector */}
        <div className="space-y-4">
          {selectedOffice ? (
            <div className={`p-6 rounded-2xl border space-y-5 sticky top-6 ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0c1017] border-white/10"
            }`}>
              <div className="border-b border-white/5 pb-3 space-y-1">
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                  Selected Authority Office Inspector
                </span>
                <h2 className={`text-base font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                  {selectedOffice.name}
                </h2>
                <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-white/50"}`}>
                  {selectedOffice.department}
                </p>
              </div>

              {/* Contact & Hours Info Grid */}
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <span className={`text-[10px] font-mono uppercase block font-bold ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                    Physical Address & Pincode:
                  </span>
                  <p className={`font-medium ${isLightTheme ? "text-slate-800" : "text-slate-200"}`}>
                    {selectedOffice.address}, {selectedOffice.city}, {selectedOffice.state} - {selectedOffice.pincode}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className={`text-[10px] font-mono uppercase block font-bold ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                    Working Hours:
                  </span>
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    isLightTheme ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  }`}>
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-semibold text-[11px]">{selectedOffice.workingHours}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className={`text-[10px] font-mono uppercase block font-bold ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                    Nodal Officer In Charge:
                  </span>
                  <div className="flex items-center gap-2 font-medium text-slate-200">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span className={isLightTheme ? "text-slate-800" : "text-white"}>{selectedOffice.officerInCharge}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className={`text-[10px] font-mono uppercase block font-bold ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                    Official Helpline Contact:
                  </span>
                  <div className="space-y-1 font-mono text-[11px]">
                    <a href={`tel:${selectedOffice.phone}`} className="flex items-center gap-2 text-blue-400 hover:underline">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedOffice.phone}</span>
                    </a>
                    <a href={`mailto:${selectedOffice.email}`} className="flex items-center gap-2 text-blue-400 hover:underline">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedOffice.email}</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className={`text-[10px] font-mono uppercase block font-bold ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                    Available Onsite Services:
                  </span>
                  <div className="space-y-1">
                    {selectedOffice.availableServices.map((svc, i) => (
                      <div key={i} className={`p-2 rounded-lg text-[11px] border flex items-center gap-1.5 ${
                        isLightTheme ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-white/80"
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{svc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOffice.lat},${selectedOffice.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Navigate on Google Maps</span>
                  </a>

                  <a
                    href={selectedOffice.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                      isLightTheme
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white/80"
                    }`}
                  >
                    <span>Visit Official .gov.in Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-8 text-center rounded-2xl border space-y-2 ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-black/30 border-white/5 text-white/40"
            }`}>
              <Building2 className="w-8 h-8 mx-auto text-white/20" />
              <p className="text-xs font-mono">Select an office from the list to inspect contact details, working hours, and services.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
