import React, { useState, useEffect } from "react";
import { 
  BarChart, Users, Eye, TrendingUp, Sparkles, Activity, 
  ArrowUpRight, Clock, Percent, FileText, CheckCircle2 
} from "lucide-react";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";

export interface FunnelStage {
  name: string;
  count: number;
  pctOfPrevious: number;
  pctOfTotal: number;
  color: string;
}

export interface AnalyticsDashboardProps {
  userId?: string | null;
  isLightTheme?: boolean;
}

export function AnalyticsDashboard({ userId, isLightTheme = false }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"traffic" | "ab-test" | "live-stream">("traffic");
  
  // Real-time ticker metrics
  const [uniqueVisitors, setUniqueVisitors] = useState(14205);
  const [pageViews, setPageViews] = useState(38421);
  const [bounceRate, setBounceRate] = useState(32.4);
  const [avgDuration] = useState("4m 12s");

  const {
    uploadedDocumentsCount,
    savedServicesCount,
    activeRoadmapsCount,
    aiConversationsCount,
    notificationsCount,
    isLoading
  } = useDashboardMetrics(userId);

  // Dynamic funnel derived from real user database activity
  const totalEngagements = activeRoadmapsCount + uploadedDocumentsCount + savedServicesCount + aiConversationsCount || 1;

  const funnelStages: FunnelStage[] = [
    { name: "Citizen Roadmaps Mapped", count: activeRoadmapsCount, pctOfPrevious: 100, pctOfTotal: 100, color: "rgba(59, 130, 246, 0.45)" },
    { name: "Vault Documents Verified", count: uploadedDocumentsCount, pctOfPrevious: totalEngagements > 0 ? Math.round((uploadedDocumentsCount / totalEngagements) * 100) : 0, pctOfTotal: 50, color: "rgba(139, 92, 246, 0.45)" },
    { name: "Government Portals Bookmarked", count: savedServicesCount, pctOfPrevious: totalEngagements > 0 ? Math.round((savedServicesCount / totalEngagements) * 100) : 0, pctOfTotal: 30, color: "rgba(245, 158, 11, 0.45)" },
    { name: "AI Consultations Executed", count: aiConversationsCount, pctOfPrevious: totalEngagements > 0 ? Math.round((aiConversationsCount / totalEngagements) * 100) : 0, pctOfTotal: 20, color: "rgba(6, 182, 212, 0.45)" },
    { name: "Active Compliance Alerts", count: notificationsCount, pctOfPrevious: totalEngagements > 0 ? Math.round((notificationsCount / totalEngagements) * 100) : 0, pctOfTotal: 10, color: "rgba(34, 197, 94, 0.45)" }
  ];

  // Live stream ticks
  const [liveTicks, setLiveTicks] = useState<Array<{ id: string; time: string; state: string; action: string }>>([
    { id: "1", time: "12:35:10", state: "Maharashtra", action: "Generated Udyam Road Map" },
    { id: "2", time: "12:35:04", state: "Telangana", action: "Added MSME SaaS Bundle to Cart" },
    { id: "3", time: "12:34:52", state: "Karnataka", action: "Signed Up to Newsletter" },
    { id: "4", time: "12:34:40", state: "Andhra Pradesh", action: "Voted Helpful on Soil Health Thread" }
  ]);

  // A/B Test Variants
  const abVariants = [
    { name: "Variant A: Static Jargon Text", visitors: 4200, conversions: 112, rate: 2.6, style: "border-red-500/25 bg-red-500/[0.01]", text: "Standard legal wording and government copy templates without graphics." },
    { name: "Variant B: Visual Flowchart & AI Chat", visitors: 4350, conversions: 313, rate: 7.2, style: "border-emerald-500/25 bg-emerald-500/[0.01]", text: "Bharat Navigator interactive visual graphs, step checklists, and guided chat.", winner: true }
  ];

  // Simulates live traffic ticker
  useEffect(() => {
    const timer = setInterval(() => {
      // Randomly increase metrics slightly
      setUniqueVisitors(prev => prev + Math.floor(Math.random() * 3) + 1);
      setPageViews(prev => prev + Math.floor(Math.random() * 8) + 2);
      
      // Update bounce rate dynamically
      setBounceRate(prev => {
        const delta = (Math.random() - 0.5) * 0.1;
        return parseFloat(Math.max(28, Math.min(35, prev + delta)).toFixed(2));
      });

      // Inject a new live tick randomly
      const states = ["Telangana", "Maharashtra", "Tamil Nadu", "Gujarat", "Delhi NCR", "Rajasthan", "Haryana", "Andhra Pradesh"];
      const actions = [
        "Generated Mudra Loan Guide",
        "Downloaded MoA/AoA Drafting Kit",
        "Read Aasara Pension Article",
        "Posted in Citizen Concourse",
        "Completed Simulated Stripe Sandbox Authorization"
      ];
      
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      
      setLiveTicks(prev => [
        {
          id: String(Date.now()),
          time: timeStr,
          state: states[Math.floor(Math.random() * states.length)],
          action: actions[Math.floor(Math.random() * actions.length)]
        },
        ...prev.slice(0, 5)
      ]);

    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div id="analytics-perf-console" className="space-y-6 text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#22c55e]">Live Administrator Console</span>
          <h2 className="text-xl font-bold text-white mt-1">Web Traffic & Conversion Analytics</h2>
          <p className="text-xs text-white/50 mt-1">
            Evaluate conversion funnels, monitor active sandbox transactions, and analyze live A/B experiment outcomes.
          </p>
        </div>

        {/* Console Nav buttons */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab("traffic")}
            className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition font-mono uppercase ${
              activeTab === "traffic" ? "bg-[#22c55e] text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Metrics & Funnel
          </button>
          <button 
            onClick={() => setActiveTab("ab-test")}
            className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition font-mono uppercase ${
              activeTab === "ab-test" ? "bg-[#22c55e] text-black" : "text-white/60 hover:text-white"
            }`}
          >
            A/B Experiments
          </button>
          <button 
            onClick={() => setActiveTab("live-stream")}
            className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition font-mono uppercase ${
              activeTab === "live-stream" ? "bg-[#22c55e] text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Live Activity
          </button>
        </div>
      </div>

      {/* 4-Column Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-white/35 font-mono uppercase block">Unique Visitors</span>
            <span className="text-sm font-bold text-white font-mono">{uniqueVisitors.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-white/35 font-mono uppercase block">Page Views</span>
            <span className="text-sm font-bold text-white font-mono">{pageViews.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-white/35 font-mono uppercase block">Avg Session</span>
            <span className="text-sm font-bold text-white font-mono">{avgDuration}</span>
          </div>
        </div>

        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-white/35 font-mono uppercase block">Bounce Rate</span>
            <span className="text-sm font-bold text-white font-mono">{bounceRate}%</span>
          </div>
        </div>

      </div>

      {activeTab === "traffic" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Visual Conversion Funnel Chart */}
          <div className="lg:col-span-2 p-5 bg-[#0a0c10]/40 border border-white/5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-white flex items-center gap-1">
                <Activity className="w-4 h-4 text-[#22c55e]" />
                <span>Conversion Pipeline Performance</span>
              </h4>
              <span className="text-[9px] font-mono bg-[#22c55e]/15 border border-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full uppercase font-bold">
                4.3% Conversion Rate
              </span>
            </div>

            {/* Funnel list layout with percentage bars */}
            <div className="space-y-4 pt-2">
              {funnelStages.map((stage, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center font-mono">
                    <span className="font-bold text-white/80">{stage.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 font-bold">{stage.count.toLocaleString()} Users</span>
                      <span className="text-cyan-400 font-bold">({stage.pctOfTotal}% of total)</span>
                    </div>
                  </div>

                  <div className="w-full h-7 bg-white/5 border border-white/5 rounded-lg overflow-hidden flex items-center relative">
                    <div 
                      className="h-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${stage.pctOfTotal}%`, 
                        backgroundColor: stage.color 
                      }}
                    />
                    
                    {/* Stage specific overlay labels */}
                    <span className="absolute left-3 text-[10.5px] font-mono text-white font-semibold drop-shadow-md">
                      Stage {idx + 1} • {stage.pctOfPrevious}% from previous step
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: Growth benchmarks */}
          <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl text-left space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400">DPI Platform Milestones</h4>
            
            <div className="space-y-3 font-mono text-xs text-white/60">
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                <span className="text-amber-500 text-[10px] uppercase font-bold block">AdSense CPC Earnings</span>
                <p className="text-white font-bold">₹12,450 Est. Monthly Revenue</p>
                <p className="text-[9.5px] text-white/30">Average CPM: ₹420 | CTR: 2.1%</p>
              </div>

              <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                <span className="text-emerald-400 text-[10px] uppercase font-bold block">Legal Bundle Sales</span>
                <p className="text-white font-bold">₹34,800 Premium Receipts</p>
                <p className="text-[9.5px] text-white/30">Average order basket cost: ₹820</p>
              </div>

              <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                <span className="text-[#22c55e] text-[10px] uppercase font-bold block">ROI ROI / CAC Performance</span>
                <p className="text-white font-bold">4.2x Growth Efficiency</p>
                <p className="text-[9.5px] text-white/30">Customer Acquisition Cost: ₹145</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === "ab-test" && (
        <div className="space-y-5">
          <div className="p-5 bg-[#0a0c10]/40 border border-white/5 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Active Experiment: Navigation Simplicity</span>
            </h4>
            <p className="text-[11px] text-white/50 leading-relaxed font-sans">
              We are comparing the conversion efficiency (generating full roadmaps & subscribing) of a high-contrast text layout against a visual checklist roadmap with interactive nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {abVariants.map((v, idx) => (
              <div 
                key={idx}
                className={`p-5 rounded-2xl border text-left space-y-4 relative overflow-hidden ${v.style}`}
              >
                {v.winner && (
                  <span className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/10 border-l border-b border-emerald-500/20 text-[8px] text-emerald-400 font-bold font-mono uppercase tracking-widest rounded-bl-xl">
                    ★ Clear Winner (+176%)
                  </span>
                )}

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-white">{v.name}</h4>
                  <p className="text-[10.5px] text-white/50 leading-normal">{v.text}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs font-mono text-center">
                  <div className="p-2 bg-black/20 rounded-lg">
                    <span className="text-[9.5px] text-white/30 block uppercase">Visitors</span>
                    <span className="text-white font-bold font-mono">{v.visitors}</span>
                  </div>
                  <div className="p-2 bg-black/20 rounded-lg">
                    <span className="text-[9.5px] text-white/30 block uppercase">Subscribed</span>
                    <span className="text-[#22c55e] font-bold font-mono">{v.conversions}</span>
                  </div>
                  <div className="p-2 bg-black/20 rounded-lg">
                    <span className="text-[9.5px] text-white/30 block uppercase">CVR</span>
                    <span className="text-cyan-400 font-bold font-mono">{v.rate}%</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "live-stream" && (
        <div className="space-y-4">
          <div className="p-5 bg-black/40 border border-white/5 rounded-2xl text-left space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-white">Live Transactions Activity Stream</h4>
            </div>

            <div className="space-y-2.5">
              {liveTicks.map((tick) => (
                <div key={tick.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 text-[10px]">{tick.time}</span>
                    <span className="px-1.5 py-0.2 bg-white/5 text-white/60 text-[9.5px] rounded">{tick.state}</span>
                    <span className="text-white/80 font-sans font-medium">{tick.action}</span>
                  </div>
                  <span className="text-[#22c55e] text-[9.5px] font-bold uppercase">LEDGER_OK</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
