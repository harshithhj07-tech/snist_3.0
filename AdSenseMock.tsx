import React, { useState } from "react";
import { Sparkles, ExternalLink, ShieldCheck } from "lucide-react";

interface AdCampaign {
  id: string;
  title: string;
  description: string;
  advertiser: string;
  cta: string;
  url: string;
}

const CAMPAIGNS: AdCampaign[] = [
  {
    id: "mudra-loan-ad",
    title: "Need Mudra Business Capital?",
    description: "Apply online for collateral-free MSME business loans up to ₹10 Lakhs. Fast approval tracking via SIDBI verified partners.",
    advertiser: "PMMY SIDBI Partner Portal",
    cta: "Check Eligibility",
    url: "https://mudra.org.in"
  },
  {
    id: "startup-india-tax",
    title: "80-IAC Startup Income Tax Holiday",
    description: "Incorporate your SaaS or Tech enterprise and apply for 3 years of 100% tax exemption. Read official guidelines.",
    advertiser: "DPIIT, Govt of India",
    cta: "Apply For Exemption",
    url: "https://www.startupindia.gov.in"
  },
  {
    id: "digital-signature-sale",
    title: "Class 3 DSC (Digital Signature) — ₹499",
    description: "Get verified class-3 digital signature for online company registration, e-tendering, and GST filing in 2 hours.",
    advertiser: "e-Mudhra Authorized CA",
    cta: "Generate DSC",
    url: "https://e-mudhra.com"
  }
];

export function AdSenseMock() {
  const [activeCampaign, setActiveCampaign] = useState<AdCampaign>(
    CAMPAIGNS[Math.floor(Math.random() * CAMPAIGNS.length)]
  );

  const handleNextAd = () => {
    const currentIndex = CAMPAIGNS.findIndex(c => c.id === activeCampaign.id);
    const nextIndex = (currentIndex + 1) % CAMPAIGNS.length;
    setActiveCampaign(CAMPAIGNS[nextIndex]);
  };

  return (
    <div id="mock-adsense-container" className="my-5 p-4 bg-[#0a0d13] border border-amber-500/10 rounded-xl relative overflow-hidden text-left group">
      {/* Background visual accents */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition duration-300" />
      
      {/* Ad Tag Badge */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-bold font-mono tracking-widest uppercase rounded border border-amber-500/20">
            Sponsored Ad
          </span>
          <span className="text-[9px] text-white/30 font-mono tracking-tight flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure DPI Partner
          </span>
        </div>
        <button 
          onClick={handleNextAd}
          className="text-[9px] text-white/30 hover:text-white font-mono cursor-pointer transition"
          title="Rotate active campaign"
        >
          [Next Campaign ↻]
        </button>
      </div>

      <div className="space-y-1.5 relative z-10">
        <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition flex items-center gap-1">
          {activeCampaign.title}
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
        </h4>
        <p className="text-[10.5px] text-white/60 leading-normal">
          {activeCampaign.description}
        </p>
        
        <div className="pt-2 flex items-center justify-between gap-4">
          <span className="text-[9px] text-white/30 font-mono truncate">
            Ad by {activeCampaign.advertiser}
          </span>
          <a 
            href={activeCampaign.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-cyan-400 hover:text-cyan-300 hover:underline shrink-0"
          >
            <span>{activeCampaign.cta}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
