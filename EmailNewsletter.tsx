import React, { useState, useEffect } from "react";
import { 
  Mail, Send, Check, Users, Sparkles, AlertCircle, 
  BarChart, Target, FileText, Settings, Play, CheckCircle2 
} from "lucide-react";
import { getFirebaseAppData, saveFirebaseAppData } from "../utils/firebaseDb";

export interface NewsletterCampaign {
  id: string;
  name: string;
  subject: string;
  targetSegment: string;
  subscribersCount: number;
  openRate: string;
  status: "Draft" | "Queued" | "Delivered";
}

export interface EmailNewsletterProps {
  isLightTheme?: boolean;
  userId?: string;
}

export function EmailNewsletter({ isLightTheme = false, userId = "default-user" }: EmailNewsletterProps) {
  const [subEmail, setSubEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"subscribe" | "campaigns" | "subscriber-stats">("subscribe");

  // Campaigns list
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([
    {
      id: "camp-1",
      name: "Welcome Onboarding Sequence",
      subject: "Welcome to Bharat Navigator — Secure Udyam & Mudra filing details!",
      targetSegment: "All New Registrations",
      subscribersCount: 14205,
      openRate: "78.4%",
      status: "Delivered"
    },
    {
      id: "camp-2",
      name: "Agricultural Subsidy Bulletin AP/KA",
      subject: "New organic inputs & NABARD compost grants unlocked for 2026",
      targetSegment: "Farmers & Agriculture Group",
      subscribersCount: 4210,
      openRate: "62.1%",
      status: "Delivered"
    },
    {
      id: "camp-3",
      name: "GST Invoice Filing Checklist Draft",
      subject: "Is your MSME compliant? July 2026 quarterly GSTR-1 deadlines",
      targetSegment: "Business Owners",
      subscribersCount: 8523,
      openRate: "0.0%",
      status: "Draft"
    }
  ]);

  // Load persistent campaigns from Firestore
  useEffect(() => {
    async function loadCampaigns() {
      const stored = await getFirebaseAppData(userId, "newsletter_campaigns");
      if (stored && Array.isArray(stored) && stored.length > 0) {
        setCampaigns(stored);
      }
    }
    loadCampaigns();
  }, [userId]);

  const persistCampaigns = (updated: NewsletterCampaign[]) => {
    setCampaigns(updated);
    saveFirebaseAppData(userId, "newsletter_campaigns", updated);
  };

  // Campaign builder fields
  const [newCampName, setNewCampName] = useState("");
  const [newCampSubject, setNewCampSubject] = useState("");
  const [newCampSegment, setNewCampSegment] = useState("All Citizens");
  const [newCampBody, setNewCampBody] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubSuccess(true);
      setSubEmail("");
      
      // Update subscriber stats of sequence
      const updated = campaigns.map(c => {
        if (c.id === "camp-1") {
          return { ...c, subscribersCount: c.subscribersCount + 1 };
        }
        return c;
      });
      persistCampaigns(updated);

      setTimeout(() => setSubSuccess(false), 6000);
    }, 1200);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim() || !newCampSubject.trim()) return;

    const segmentMap: Record<string, number> = {
      "All Citizens": 14205,
      "SME Business Owners": 8523,
      "Agricultural Farmers": 4210,
      "Senior Pensioners": 1472
    };

    const newCamp: NewsletterCampaign = {
      id: `camp-${Date.now()}`,
      name: newCampName.trim(),
      subject: newCampSubject.trim(),
      targetSegment: newCampSegment,
      subscribersCount: segmentMap[newCampSegment] || 14205,
      openRate: "0.0%",
      status: "Draft"
    };

    setCampaigns(prev => [newCamp, ...prev]);
    setNewCampName("");
    setNewCampSubject("");
    setNewCampBody("");
    alert("Newsletter draft campaign generated and queued!");
  };

  const triggerLaunchCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: "Delivered", openRate: "65.4%" };
      }
      return c;
    }));
    alert("Campaign transmitted instantly to designated citizen channels!");
  };

  return (
    <div id="newsletter-marketing-desk" className="space-y-6 text-left">
      
      {/* Header Panel */}
      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-5 ${
        isLightTheme ? "border-slate-200" : "border-white/5"
      }`}>
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#22c55e]">Email & Growth Hub</span>
          <h2 className={`text-xl font-bold mt-1 ${isLightTheme ? "text-slate-900" : "text-white"}`}>Marketing Campaigns & Subscriber CRM</h2>
          <p className={`text-xs mt-1 ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>
            Build mailing lists, manage automated welcome sequences, and view engagement charts.
          </p>
        </div>

        {/* Local Tab Switcher */}
        <div className={`flex p-1 rounded-xl border font-mono text-[10px] ${
          isLightTheme ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/5"
        }`}>
          <button 
            onClick={() => setActiveTab("subscribe")}
            className={`px-3 py-1.5 font-bold rounded-lg transition uppercase ${
              activeTab === "subscribe" 
                ? "bg-[#22c55e] text-black shadow-sm" 
                : isLightTheme 
                  ? "text-slate-600 hover:text-slate-900" 
                  : "text-white/60 hover:text-white"
            }`}
          >
            Mailing List
          </button>
          <button 
            onClick={() => setActiveTab("campaigns")}
            className={`px-3 py-1.5 font-bold rounded-lg transition uppercase ${
              activeTab === "campaigns" 
                ? "bg-[#22c55e] text-black shadow-sm" 
                : isLightTheme 
                  ? "text-slate-600 hover:text-slate-900" 
                  : "text-white/60 hover:text-white"
            }`}
          >
            Campaign Builder
          </button>
          <button 
            onClick={() => setActiveTab("subscriber-stats")}
            className={`px-3 py-1.5 font-bold rounded-lg transition uppercase ${
              activeTab === "subscriber-stats" 
                ? "bg-[#22c55e] text-black shadow-sm" 
                : isLightTheme 
                  ? "text-slate-600 hover:text-slate-900" 
                  : "text-white/60 hover:text-white"
            }`}
          >
            Analytics Segment
          </button>
        </div>
      </div>

      {activeTab === "subscribe" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Landing Subscription Card */}
          <div className={`lg:col-span-2 p-6 rounded-2xl relative overflow-hidden space-y-5 border ${
            isLightTheme 
              ? "bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/50 border-slate-200 shadow-sm" 
              : "bg-gradient-to-br from-[#0c1310] via-[#080a08] to-[#120f0a] border-white/5"
          }`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-green-600" />
            
            <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/25 text-[#22c55e] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h3 className={`text-base font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>Join the Bharat Gazette Newsletter</h3>
              <p className={`text-xs leading-relaxed ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>
                Stay updated on weekly interest rate cuts for MSME Mudra loans, regional tax holidays, and state agricultural subsidy application portals in India.
              </p>
            </div>

            {subSuccess ? (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-emerald-600 text-xs rounded-xl flex items-center gap-3 font-semibold">
                <Check className="w-5 h-5 shrink-0 stroke-[3px]" />
                <div className="leading-relaxed">
                  <p className="font-bold">Subscription Secured!</p>
                  <p className="text-[10px] text-emerald-700 font-medium">Check your inbox for our automated Welcome Onboarding Sequence checklist.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex gap-2 relative">
                  <input 
                    type="email"
                    required
                    placeholder="Enter your citizen email address..."
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    className={`flex-1 text-xs rounded-xl px-4 py-3 focus:outline-none ${
                      isLightTheme 
                        ? "bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 shadow-sm font-medium" 
                        : "bg-black/40 border border-white/10 text-white placeholder-white/25 focus:border-amber-500/40"
                    }`}
                  />
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? "Syncing..." : "Subscribe"}
                  </button>
                </div>
                <p className={`text-[9.5px] font-mono text-center ${isLightTheme ? "text-slate-500 font-medium" : "text-white/30"}`}>
                  🛡️ Zero spam. Direct, grounded notifications vetted under central DPI protocol laws.
                </p>
              </form>
            )}
          </div>

          {/* Right sidebar quick stats */}
          <div className={`p-5 rounded-2xl text-left space-y-4 border ${
            isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.01] border-white/5"
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-600">Subscriber Growth</h4>
            <div className={`space-y-2.5 text-xs font-mono ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
              <div className="flex justify-between">
                <span>Active Emails:</span>
                <span className={`font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>14,205 Citizens</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Open Rate:</span>
                <span className="text-[#22c55e] font-bold">78.4% Engagement</span>
              </div>
              <div className="flex justify-between">
                <span>Weekly Growth:</span>
                <span className="text-cyan-600 font-bold">+284 Subscribers</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === "campaigns" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Campaign List & Creator */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Create campaign draft form */}
            <form onSubmit={handleCreateCampaign} className={`p-5 rounded-2xl space-y-4 text-xs border ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0a0c10]/40 border-white/5"
            }`}>
              <span className="text-[10px] font-mono text-[#22c55e] uppercase tracking-widest block font-bold">GENERATE EMAIL BLAST</span>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-[10px] font-mono uppercase ${isLightTheme ? "text-slate-700 font-bold" : "text-white/50"}`}>Internal Camp Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Q3 MSME Tax Alert"
                    value={newCampName}
                    onChange={(e) => setNewCampName(e.target.value)}
                    className={`w-full rounded-lg p-2.5 focus:outline-none ${
                      isLightTheme 
                        ? "bg-white border border-slate-300 text-slate-900 font-medium shadow-sm" 
                        : "bg-black/40 border border-white/10 text-white"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[10px] font-mono uppercase ${isLightTheme ? "text-slate-700 font-bold" : "text-white/50"}`}>Target Segment</label>
                  <select 
                    value={newCampSegment}
                    onChange={(e) => setNewCampSegment(e.target.value)}
                    className={`w-full rounded-lg p-2.5 focus:outline-none cursor-pointer ${
                      isLightTheme 
                        ? "bg-white border border-slate-300 text-slate-900 font-medium shadow-sm" 
                        : "bg-black/40 border border-white/10 text-white"
                    }`}
                  >
                    <option className={isLightTheme ? "bg-white text-slate-900" : "bg-[#08090a]"} value="All Citizens">All Citizens (14,205)</option>
                    <option className={isLightTheme ? "bg-white text-slate-900" : "bg-[#08090a]"} value="SME Business Owners">SME Business Owners (8,523)</option>
                    <option className={isLightTheme ? "bg-white text-slate-900" : "bg-[#08090a]"} value="Agricultural Farmers">Agricultural Farmers (4,210)</option>
                    <option className={isLightTheme ? "bg-white text-slate-900" : "bg-[#08090a]"} value="Senior Pensioners">Senior Pensioners (1,472)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-mono uppercase ${isLightTheme ? "text-slate-700 font-bold" : "text-white/50"}`}>Subject Line *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Immediate Notice: Income limits updated under G.O. 42"
                  value={newCampSubject}
                  onChange={(e) => setNewCampSubject(e.target.value)}
                  className={`w-full rounded-lg p-2.5 focus:outline-none ${
                    isLightTheme 
                      ? "bg-white border border-slate-300 text-slate-900 font-medium shadow-sm" 
                      : "bg-black/40 border border-white/10 text-white"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-mono uppercase ${isLightTheme ? "text-slate-700 font-bold" : "text-white/50"}`}>Campaign HTML / Body Text</label>
                <textarea 
                  rows={4}
                  placeholder="Dear Citizen, please be informed of the state office changes..."
                  value={newCampBody}
                  onChange={(e) => setNewCampBody(e.target.value)}
                  className={`w-full rounded-lg p-2.5 focus:outline-none font-sans leading-relaxed ${
                    isLightTheme 
                      ? "bg-white border border-slate-300 text-slate-900 font-medium shadow-sm" 
                      : "bg-black/40 border border-white/10 text-white"
                  }`}
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold font-mono uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer"
              >
                Generate Draft Campaign
              </button>
            </form>

            {/* Campaign card listings */}
            <div className="space-y-3">
              <h4 className={`text-xs font-bold uppercase font-mono pl-1 ${isLightTheme ? "text-slate-900" : "text-white"}`}>Outbound Campaign Log</h4>
              
              {campaigns.map((camp) => (
                <div key={camp.id} className={`p-4 rounded-xl space-y-3 text-xs leading-normal border ${
                  isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.01] border-white/5"
                }`}>
                  <div className={`flex items-center justify-between border-b pb-2 ${isLightTheme ? "border-slate-200" : "border-white/5"}`}>
                    <h5 className={`font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>{camp.name}</h5>
                    
                    {camp.status === "Delivered" ? (
                      <span className="px-2 py-0.5 bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-[8px] rounded font-mono uppercase font-bold">
                        Delivered
                      </span>
                    ) : (
                      <div className="flex gap-1.5 items-center">
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[8px] rounded font-mono uppercase font-bold">
                          Draft
                        </span>
                        <button 
                          onClick={() => triggerLaunchCampaign(camp.id)}
                          className="px-2 py-0.5 bg-cyan-600 text-white text-[8.5px] rounded font-mono font-bold uppercase cursor-pointer hover:bg-cyan-700 shadow-sm"
                        >
                          Send Outbound
                        </button>
                      </div>
                    )}
                  </div>

                  <p className={`text-[11px] leading-normal font-sans ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>
                    Subject: <strong className={isLightTheme ? "text-slate-800" : "text-white/80"}>"{camp.subject}"</strong>
                  </p>

                  <div className={`pt-2 flex items-center justify-between text-[10px] font-mono border-t ${
                    isLightTheme ? "border-slate-200 text-slate-500 font-medium" : "border-white/5 text-white/40"
                  }`}>
                    <span>Segment: <strong className={isLightTheme ? "text-slate-800" : "text-white/60"}>{camp.targetSegment}</strong></span>
                    <span>Recipients: <strong className={isLightTheme ? "text-slate-800" : "text-white/60"}>{camp.subscribersCount}</strong></span>
                    {camp.status === "Delivered" && (
                      <span>Open Rate: <strong className="text-emerald-600 font-bold">{camp.openRate}</strong></span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right sidebar details */}
          <div className="space-y-6">
            <div className={`p-5 rounded-2xl text-left space-y-3 border ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.01] border-white/5"
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-600 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> Outbound Automation
              </h4>
              <p className={`text-[10.5px] leading-relaxed font-sans ${isLightTheme ? "text-slate-600" : "text-white/40"}`}>
                Our onboarding auto-responder is active. New newsletter subscribers instantly receive the PDF summary of their active roadmap to increase offline action conversion!
              </p>
            </div>
          </div>

        </div>
      )}

      {activeTab === "subscriber-stats" && (
        <div className="space-y-5">
          <div className={`p-5 rounded-2xl space-y-4 border ${
            isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0a0c10]/40 border-white/5"
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${isLightTheme ? "text-slate-900" : "text-white"}`}>Mailing List Segments</h4>
            
            <div className="space-y-3">
              <div className={`p-3 rounded-xl text-xs font-mono border ${
                isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.01] border-white/5"
              }`}>
                <div className={`flex justify-between items-center ${isLightTheme ? "text-slate-800" : "text-white/80"}`}>
                  <span className="font-bold">Segment A: Micro-Enterprise / SMEs</span>
                  <span className="font-semibold">8,523 Subscribers (60%)</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden mt-2 ${isLightTheme ? "bg-slate-200" : "bg-white/5"}`}>
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 w-3/5" />
                </div>
              </div>

              <div className={`p-3 rounded-xl text-xs font-mono border ${
                isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.01] border-white/5"
              }`}>
                <div className={`flex justify-between items-center ${isLightTheme ? "text-slate-800" : "text-white/80"}`}>
                  <span className="font-bold">Segment B: Farmers / Agriculture Units</span>
                  <span className="font-semibold">4,210 Subscribers (30%)</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden mt-2 ${isLightTheme ? "bg-slate-200" : "bg-white/5"}`}>
                  <div className="h-full bg-gradient-to-r from-green-500 to-green-300 w-[30%]" />
                </div>
              </div>

              <div className={`p-3 rounded-xl text-xs font-mono border ${
                isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.01] border-white/5"
              }`}>
                <div className={`flex justify-between items-center ${isLightTheme ? "text-slate-800" : "text-white/80"}`}>
                  <span className="font-bold">Segment C: Pensioners & Welfare Seekers</span>
                  <span className="font-semibold">1,472 Subscribers (10%)</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden mt-2 ${isLightTheme ? "bg-slate-200" : "bg-white/5"}`}>
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-300 w-[10%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
