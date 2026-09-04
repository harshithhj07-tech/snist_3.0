import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Search, 
  Lock, 
  MapPin, 
  Layers, 
  Zap, 
  Cpu, 
  BellRing, 
  User, 
  Database, 
  ChevronRight, 
  ExternalLink, 
  Menu, 
  X, 
  AlertTriangle, 
  ArrowUpRight, 
  Bot, 
  FileCheck, 
  Building2, 
  Check, 
  HelpCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface LandingPageProps {
  isLightTheme: boolean;
  onOpenAuth: (mode?: "login" | "signup") => void;
  onExploreDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  isLightTheme,
  onOpenAuth,
  onExploreDemo
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedOrchestratorNode, setSelectedOrchestratorNode] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Scroll detection for header navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);

    // Check prefers-reduced-motion
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPrefersReducedMotion(true);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Interactive Solution Flow steps
  const solutionSteps = [
    {
      title: "1. Citizen Intent",
      short: "Plain Language Query",
      desc: "Ask any query in Hindi, English, Telugu, Marathi, or Tamil without knowing complex government terminology.",
      icon: Search,
      tag: "Natural Language"
    },
    {
      title: "2. AI Gazette Search",
      short: "Grounding on Gazettes",
      desc: "Our RAG engine queries 100+ indexed official gazettes, rules, and SLAs from .gov.in sources.",
      icon: Database,
      tag: "Vector Search"
    },
    {
      title: "3. Context Synthesis",
      short: "Profile & State Filter",
      desc: "Automatically checks your state jurisdiction, income category, and MSME/Citizen profile rules.",
      icon: User,
      tag: "Context Rules"
    },
    {
      title: "4. Vault Audit",
      short: "Document Requirement Check",
      desc: "Cross-references your DigiLocker Vault to verify if required Aadhaar, PAN, or Income files exist.",
      icon: FileCheck,
      tag: "Vault Verification"
    },
    {
      title: "5. Eligibility Calc",
      short: "Rule Evaluation",
      desc: "Synthesizes eligibility probability and flags exact missing documents with zero guesswork.",
      icon: ShieldCheck,
      tag: "Probability Engine"
    },
    {
      title: "6. Custom Roadmap",
      short: "Actionable Milestones",
      desc: "Generates step-by-step checklist with SLA turn-around times, costs, and prerequisite order.",
      icon: Layers,
      tag: "Workflow SLA"
    },
    {
      title: "7. Next Action",
      short: "Official Seva Dispatch",
      desc: "Provides direct links to official .gov.in portals and nearest physical Passport / MeeSeva office.",
      icon: ArrowUpRight,
      tag: "Official Redirection"
    }
  ];

  return (
    <div className={`min-h-screen w-full font-sans overflow-x-hidden ${
      isLightTheme ? "bg-[#f8fafc] text-slate-900" : "bg-[#050811] text-white"
    }`}>
      {/* HEADER / NAVIGATION BAR */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? isLightTheme
            ? "bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] py-3"
            : "bg-[#060a13]/70 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] py-3"
          : "bg-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-0.5 shadow-lg group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition duration-500" />
              </div>
            </div>
            <div>
              <span className={`text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5 font-display ${
                isLightTheme ? "text-slate-900" : "text-white"
              }`}>
                BHARAT <span className="text-amber-500 font-mono font-bold">NAVIGATOR</span>
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-500/80 block -mt-1">
                AI Citizen Gateway
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-mono font-semibold uppercase tracking-wider">
            {[
              { id: "product", label: "Product" },
              { id: "how-it-works", label: "How It Works" },
              { id: "ai-orchestrator", label: "AI Architecture" },
              { id: "journey", label: "Citizen Journey" },
              { id: "security", label: "Security" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`transition cursor-pointer ${
                  isLightTheme 
                    ? "text-slate-600 hover:text-slate-900" 
                    : "text-slate-300 hover:text-amber-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onOpenAuth("login")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                isLightTheme
                  ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                  : "border-white/15 text-white hover:bg-white/10"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth("signup")}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl border ${
              isLightTheme ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-white/10 border-white/15 text-white"
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className={`md:hidden px-4 pt-4 pb-6 space-y-3 border-b shadow-2xl animate-fade-in ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#080d18] border-white/10"
          }`}>
            <div className="flex flex-col space-y-2 text-xs font-mono font-bold uppercase tracking-wider">
              {[
                { id: "product", label: "Product" },
                { id: "how-it-works", label: "How It Works" },
                { id: "ai-orchestrator", label: "AI Architecture" },
                { id: "journey", label: "Citizen Journey" },
                { id: "security", label: "Security" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left py-2 px-3 rounded-lg hover:bg-amber-500/10 hover:text-amber-400"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth("login"); }}
                className="w-full py-2.5 rounded-xl text-xs font-mono font-bold border border-white/20 text-white"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth("signup"); }}
                className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.header>

      {/* HERO SECTION WITH GALAXY STARFIELD BACKGROUND */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Galaxy Star Image Background Surface */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <img
            src="/deep_starfield.jpg"
            alt="Monochrome Starfield Galaxy Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-105 filter brightness-95 contrast-110 animate-star-drift animate-star-twinkle"
          />
          {/* Subtle Dark Gradient Overlay for Contrast & Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050811]/80 via-[#060b17]/70 to-[#050811]/90 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent z-10 pointer-events-none" />
          
          {/* Ambient Glowing Orbs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/30 rounded-full blur-[140px] z-10 pointer-events-none"
          />
        </div>

        {/* Hero Content Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20 space-y-8 my-auto">
          {/* Top Pill Tagline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 text-[11px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.5)] backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>UNDERSTAND • ORGANIZE • NAVIGATE • ACT</span>
          </motion.div>

          {/* Hero Main Titles */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 max-w-4xl mx-auto"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-none font-display drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              Navigate India's Digital Services <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]">
                With Intelligence.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300/90 max-w-2xl mx-auto leading-relaxed font-normal">
              Transform complex government information, gazette notifications, and state requirements into personalized, actionable citizen journeys.
            </p>
          </motion.div>

          {/* Primary & Secondary Action CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <button
              onClick={() => onOpenAuth("signup")}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:shadow-[0_0_50px_rgba(245,158,11,0.9)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 blur-md group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </button>

            <button
              onClick={() => scrollToSection("how-it-works")}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/15 font-bold text-xs uppercase tracking-wider rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Explore Architecture</span>
            </button>
          </motion.div>

          {/* Trust Banner Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
            className="pt-10 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-3xl mx-auto"
          >
            {[
              { title: "100+ Gazettes", sub: "Indexed .gov.in Sources" },
              { title: "768d Vector RAG", sub: "Grounding Engine" },
              { title: "DigiLocker Integration", sub: "Verified Document Vault" },
              { title: "AES-256 Encrypted", sub: "Local Sovereignty" }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-3 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl space-y-0.5 shadow-[0_4px_16px_0_rgba(0,0,0,0.1)] transition-all duration-500 hover:bg-white/[0.05] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:border-amber-500/30 cursor-default"
              >
                <span className="text-xs font-mono font-bold text-amber-400 block">{stat.title}</span>
                <span className="text-[10px] text-slate-400 font-medium block">{stat.sub}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PROBLEM SECTION (#problem) */}
      <section id="problem" className={`py-20 border-t ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#070b14] border-white/10"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest px-2.5 py-1 bg-amber-500/10 rounded border border-amber-500/20">
              The Citizen Problem
            </span>
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              Fragmented Portals. Confusing Gazettes.
            </h2>
            <p className={`text-xs sm:text-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
              Navigating government services currently forces citizens through dozens of disconnected portals, unreadable PDFs, and rejected applications.
            </p>
          </motion.div>

          {/* Problem vs Solution Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Fragmented Reality Box */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className={`p-6 sm:p-8 rounded-2xl border space-y-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${
              isLightTheme ? "bg-red-50/70 border-red-200" : "bg-red-500/[0.05] border-red-500/20"
            }`}>
              <div className="flex items-center gap-2 text-red-500 font-mono font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>The Fragmented Citizen Experience</span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  "Disconnected state & central portals (Parivahan, Passport, MeeSeva, GST)",
                  "Legal gazette notifications written in obscure bureaucratic jargon",
                  "Scattered physical certificates without automated expiry or validity tracking",
                  "Multiple rejected applications due to unknown prerequisite criteria"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10 transition-colors duration-300 hover:bg-red-500/10">
                    <span className="text-red-500 font-bold shrink-0">✕</span>
                    <span className={isLightTheme ? "text-slate-800" : "text-slate-300"}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bharat Navigator Unified Solution Box */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className={`p-6 sm:p-8 rounded-2xl border space-y-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${
              isLightTheme ? "bg-amber-50/70 border-amber-200" : "bg-amber-500/[0.06] border-amber-500/20"
            }`}>
              <div className="flex items-center gap-2 text-amber-500 font-mono font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>The Bharat Navigator Unified Experience</span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  "Single conversational gateway for any central or state government query",
                  "Grounded AI synthesis translating gazette clauses into plain action plans",
                  "DigiLocker integrated Secure Vault with masked document identifiers",
                  "Step-by-step personalized roadmaps with exact SLA timeframes & office finders"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 transition-colors duration-300 hover:bg-amber-500/20">
                    <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className={isLightTheme ? "text-slate-900 font-medium" : "text-slate-200"}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOLUTION / HOW IT WORKS SECTION (#how-it-works) */}
      <section id="how-it-works" className={`py-20 border-t ${
        isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#050811] border-white/10"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest px-2.5 py-1 bg-amber-500/10 rounded border border-amber-500/20">
              Interactive Solution Flow
            </span>
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              From Intent To Official Resolution
            </h2>
            <p className={`text-xs sm:text-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
              Tap any step below to reveal how our AI Citizen Gateway handles complex workflows seamlessly.
            </p>
          </motion.div>

          {/* Step Selector Horizontal Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2"
          >
            {solutionSteps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3 rounded-xl border text-left transition-all duration-500 cursor-pointer space-y-1.5 backdrop-blur-sm ${
                    isActive
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] font-bold scale-[1.02]"
                      : isLightTheme
                        ? "bg-white/60 border-slate-200 text-slate-700 hover:bg-slate-100"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                    <span className="text-[9px] font-mono opacity-60">0{idx + 1}</span>
                  </div>
                  <span className="text-xs font-bold block truncate">{step.short}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Selected Step Expanded Detail Inspector */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeStep}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] ${
                isLightTheme ? "bg-white/80 border-slate-200" : "bg-[#090f1d]/80 border-white/10"
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                    {solutionSteps[activeStep].tag}
                  </span>
                  <h3 className={`text-xl font-bold font-display ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                    {solutionSteps[activeStep].title}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isLightTheme ? "text-slate-600" : "text-slate-300"}`}>
                    {solutionSteps[activeStep].desc}
                  </p>
                </div>

                <button
                  onClick={() => onOpenAuth("signup")}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:shadow-[0_0_35px_rgba(245,158,11,0.9)] transition-all duration-300 hover:scale-105 flex items-center gap-2 cursor-pointer shrink-0 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 blur-md group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
                  <span className="relative z-10">Try This Step</span>
                  <ArrowRight className="w-4 h-4 relative z-10" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CORE PRODUCT SUITE (#product) */}
      <section id="product" className={`py-20 border-t ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#070b14] border-white/10"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest px-2.5 py-1 bg-amber-500/10 rounded border border-amber-500/20">
              Core Product Suite
            </span>
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              Organized Around The Citizen Journey
            </h2>
            <p className={`text-xs sm:text-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
              Five pillars designed to guide you from initial inquiry to physical verification and official completion.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {[
              {
                pillar: "UNDERSTAND",
                desc: "Natural Language & OCR",
                items: ["AI Citizen Assistant", "Document OCR Extractor", "Gazette Clause Summarizer"],
                icon: Bot
              },
              {
                pillar: "ORGANIZE",
                desc: "Verified Data Vault",
                items: ["DigiLocker Integration", "AES-256 Masked Storage", "Citizen Profile Rules"],
                icon: Lock
              },
              {
                pillar: "PLAN",
                desc: "Eligibility & Roadmaps",
                items: ["Dynamic Eligibility Engine", "AI Workflow Orchestrator", "SLA Timelines & Costs"],
                icon: Layers
              },
              {
                pillar: "ACT",
                desc: "Official Execution",
                items: ["GPS Office & Seva Finder", "Official .gov.in Portals", "Prerequisite Checklists"],
                icon: Building2
              },
              {
                pillar: "REMEMBER",
                desc: "Proactive Tracking",
                items: ["Document Expiry Alerts", "Actionable Reminders", "History & Bookmarks"],
                icon: BellRing
              }
            ].map((col, idx) => {
              const Icon = col.icon;
              return (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                  }}
                  className={`p-5 rounded-2xl border space-y-4 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${
                    isLightTheme
                      ? "bg-white/60 border-slate-200 hover:border-amber-400 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      : "bg-white/[0.02] border-white/10 hover:border-amber-500/60 hover:bg-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                      {col.pillar}
                    </span>
                    <Icon className="w-4 h-4 text-amber-400" />
                  </div>

                  <p className={`text-xs font-bold ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                    {col.desc}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {col.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-2 text-[11px]">
                        <Check className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className={isLightTheme ? "text-slate-600" : "text-slate-300"}>{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* AI ORCHESTRATOR ARCHITECTURE VISUALIZATION (#ai-orchestrator) */}
      <section id="ai-orchestrator" className={`py-20 border-t ${
        isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#050811] border-white/10"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest px-2.5 py-1 bg-amber-500/10 rounded border border-amber-500/20">
              Technical Architecture
            </span>
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              The AI Orchestrator Engine
            </h2>
            <p className={`text-xs sm:text-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
              Context-aware synthesis connecting citizen profile, document vault, and official vector knowledge bases.
            </p>
          </div>

          {/* Interactive Architecture Diagram */}
          <div className={`p-6 sm:p-10 rounded-3xl border relative overflow-hidden ${
            isLightTheme ? "bg-white border-slate-200 shadow-md" : "bg-[#080d1a] border-white/10"
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
              {/* Left Column: INPUTS */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block text-center lg:text-left">
                  Context Inputs
                </span>
                {[
                  "Citizen Profile (State, Income, Role)",
                  "DigiLocker Vault Documents",
                  "OCR Extracted Passbook/Certificate Metadata",
                  "768d Grounded Gazette Vector KB"
                ].map((input, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedOrchestratorNode(`Input: ${input}`)}
                    className={`p-3.5 rounded-xl border text-xs font-mono transition cursor-pointer flex items-center justify-between ${
                      selectedOrchestratorNode?.includes(input)
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                        : isLightTheme
                          ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span>{input}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                ))}
              </div>

              {/* Center Column: CENTRAL ORCHESTRATOR NODE */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-600/20 border border-amber-500/40 text-center space-y-4 shadow-2xl relative">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
                  <Cpu className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                    BHARAT AI ORCHESTRATOR
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400 block font-bold">
                    Grounded Neural AI Engine + RAG
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Synthesizes user context with gazette laws to calculate eligibility & build actionable workflows.
                </p>
              </div>

              {/* Right Column: OUTPUTS */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block text-center lg:text-right">
                  Actionable Outputs
                </span>
                {[
                  "Contextual Step-by-Step Guidance",
                  "Exact Missing Document Checklist",
                  "Automated SLA & Official Cost Breakdown",
                  "Nearest Seva Kendra Office Navigation"
                ].map((output, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedOrchestratorNode(`Output: ${output}`)}
                    className={`p-3.5 rounded-xl border text-xs font-mono transition cursor-pointer flex items-center justify-between ${
                      selectedOrchestratorNode?.includes(output)
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold"
                        : isLightTheme
                          ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{output}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REAL CITIZEN JOURNEY CASE STUDY (#journey) */}
      <section id="journey" className={`py-20 border-t ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#070b14] border-white/10"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest px-2.5 py-1 bg-amber-500/10 rounded border border-amber-500/20">
              Real Citizen Journey
            </span>
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              From Notification To Action Plan
            </h2>
            <p className={`text-xs sm:text-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
              See how Bharat Navigator processes a real government notice step-by-step.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className={`p-6 sm:p-8 rounded-3xl border space-y-6 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] ${
              isLightTheme ? "bg-slate-50/80 border-slate-200" : "bg-[#0c1017]/80 border-white/10"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "Stage 1", label: "Upload Notice PDF", status: "Completed ✓", color: "text-emerald-400" },
                { step: "Stage 2", label: "OCR Intelligence", status: "Processed ✓", color: "text-emerald-400" },
                { step: "Stage 3", label: "Vault Audit", status: "Income Cert Missing ⚠", color: "text-amber-400" },
                { step: "Stage 4", label: "Seva Kendra Nav", status: "MeeSeva 3.2km ->", color: "text-blue-400" }
              ].map((st, idx) => (
                <div key={idx} className="p-4 bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl space-y-1 transition-all duration-300 hover:bg-black/50 hover:scale-[1.02]">
                  <span className="text-[10px] font-mono text-white/40 block">{st.step}</span>
                  <h4 className="text-xs font-bold text-white">{st.label}</h4>
                  <span className={`text-[11px] font-mono font-bold ${st.color}`}>{st.status}</span>
                </div>
              ))}
            </div>

            <div className="p-5 bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-mono text-amber-400 font-bold">Actionable Journey Guidance:</span>
                <span className="text-[10px] font-mono text-white/40">Verified Grounding</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                "Based on uploaded PMAY Housing Subsidy Notice, you meet income eligibility (&lt;₹12.5L/yr). Your Aadhaar and Bank Passbook are verified in DigiLocker Vault. However, an updated <strong>Income Certificate</strong> is required. Visit MeeSeva Banjara Hills (3.2 km away) or apply online on MeeSeva portal."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECURITY & PRIVACY (#security) */}
      <section id="security" className={`py-20 border-t ${
        isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#050811] border-white/10"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest px-2.5 py-1 bg-amber-500/10 rounded border border-amber-500/20">
              Security & Sovereignty
            </span>
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              Built On Trust, Encryption & Sovereignty
            </h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "Client-Side ID Masking",
                desc: "Aadhaar, PAN, and Bank details are masked by default (XXXX-XXXX-1234) before display.",
                icon: ShieldCheck
              },
              {
                title: "Zero Unapproved Sharing",
                desc: "Your uploaded documents reside strictly within your personal DigiLocker Vault & Firebase container.",
                icon: Lock
              },
              {
                title: "Session Biometric Guard",
                desc: "Automatic inactive session timeout and biometric PIN challenge before viewing sensitive records.",
                icon: BellRing
              }
            ].map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <motion.div 
                  key={idx} 
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                  }}
                  className={`p-6 rounded-2xl border space-y-3 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${
                    isLightTheme ? "bg-white/80 border-slate-200" : "bg-[#080d1a]/80 border-white/10 hover:bg-[#080d1a]"
                  }`}
                >
                  <Icon className="w-6 h-6 text-amber-400" />
                  <h3 className={`text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>{sec.title}</h3>
                  <p className={`text-xs leading-relaxed ${isLightTheme ? "text-slate-600" : "text-slate-300"}`}>{sec.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <footer className={`py-12 border-t relative overflow-hidden ${
        isLightTheme ? "bg-white border-slate-200 text-slate-700" : "bg-[#04060c] border-white/10 text-white/70"
      }`}>
        {/* Subtle blur background element for footer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10"
        >
          <div className="space-y-2">
            <h3 className={`text-xl font-bold font-display ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              Start Navigating Your Digital Citizen Journey Today
            </h3>
            <p className="text-xs text-amber-500 font-mono">
              Grounded .gov.in Knowledge • Verified DigiLocker Vault • Office Locator
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenAuth("signup")}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:shadow-[0_0_50px_rgba(245,158,11,0.9)] transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 blur-md group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
              <span className="relative z-10">Get Started Now</span>
            </button>
          </div>

          <div className="text-[10px] font-mono text-slate-500 pt-6 border-t border-white/5">
            © 2026 Bharat Navigator. Built for Indian Citizens. Grounded on Official Government Information.
          </div>
        </motion.div>
      </footer>
    </div>
  );
};
