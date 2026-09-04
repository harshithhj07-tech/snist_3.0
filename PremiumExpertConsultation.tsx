import React, { useState, useEffect } from "react";
import { 
  motion, AnimatePresence 
} from "motion/react";
import { 
  User, CheckCircle2, AlertTriangle, X, ShieldCheck, HelpCircle, 
  Sparkles, Clock, ArrowRight, CornerDownRight, Info, BookOpen, 
  FileText, Check, Plus, Trash2, UploadCloud, Eye, ExternalLink, 
  Briefcase, Award, Star, MapPin, Calendar, MessageSquare, 
  Video, Phone, Send, FileCheck2, Loader2, Download, AlertCircle, ChevronRight, Scale
} from "lucide-react";
import { Profile, GovDocument } from "../types";

export interface Expert {
  id: string;
  name: string;
  area: string;
  experience: number;
  location: string;
  rating: number;
  reviews: number;
  credentials: string;
  avatarColor: string;
  availability: string;
}

export interface ConsultationRequest {
  id: string;
  date: string;
  title: string;
  details: string;
  category: string;
  priority: "Standard" | "Priority" | "Urgent";
  status: "Submitted" | "Expert Assigned" | "Response Received" | "Closed";
  expert: Expert;
  channel: "Video Call" | "Phone Call" | "Written Opinion";
  preferredDate: string;
  preferredTime: string;
  attachments: string[];
  opinion?: {
    summary: string;
    analysis: string;
    legalProvisions: string[];
    actionPlan: string[];
    disclaimer: string;
    resolvedAt: string;
  };
  messages?: Array<{
    id: string;
    sender: "user" | "expert";
    content: string;
    timestamp: string;
  }>;
}

const EXPERTS: Expert[] = [
  {
    id: "exp-1",
    name: "Advocate Meenakshi Sundaram",
    area: "Corporate Law & MSME Compliance",
    experience: 14,
    location: "New Delhi, Delhi",
    rating: 4.9,
    reviews: 184,
    credentials: "LL.M, Bar Council of Delhi, Ex-Legal Consultant to Ministry of MSME",
    avatarColor: "from-amber-500 to-yellow-600",
    availability: "Available Today"
  },
  {
    id: "exp-2",
    name: "Dr. Arisudan Sharma",
    area: "Tax, GST Audits & Subsidies",
    experience: 16,
    location: "Mumbai, Maharashtra",
    rating: 4.8,
    reviews: 210,
    credentials: "FCA, Ph.D in Taxation Law, Expert Panelist at Chamber of Commerce",
    avatarColor: "from-blue-500 to-indigo-600",
    availability: "Available Tomorrow"
  },
  {
    id: "exp-3",
    name: "Priya Gopalan",
    area: "Intellectual Property & Trademarks",
    experience: 9,
    location: "Bengaluru, Karnataka",
    rating: 4.9,
    reviews: 96,
    credentials: "Patent Agent IN/PA-3042, Specialized in SaaS & Startup Safeguards",
    avatarColor: "from-emerald-500 to-teal-600",
    availability: "Available Today"
  },
  {
    id: "exp-4",
    name: "Harpreet Singh Sodhi",
    area: "Labor Compliance & Factory Licensing",
    experience: 12,
    location: "Chandigarh, Punjab",
    rating: 4.7,
    reviews: 142,
    credentials: "B.A. LL.B (Hons.), Expert in EPFO & Labor Dispute Resolution",
    avatarColor: "from-purple-500 to-pink-600",
    availability: "Available in 2 Days"
  }
];

const SEED_REQUESTS: ConsultationRequest[] = [
  {
    id: "B-CON-4901",
    date: "2026-07-10 11:30 AM",
    title: "GST Notice under Section 16(4) on Input Tax Credit mismatch",
    details: "Received a department notice regarding ITC mismatches between GSTR-2B and GSTR-3B for FY 2024-25. The vendor filed late GSTR-1, so our credit was reflected in a later tax period. Department is demanding interest on the claimed credit.",
    category: "Tax, GST & Audits",
    priority: "Priority",
    status: "Response Received",
    expert: EXPERTS[1], // Dr. Arisudan Sharma
    channel: "Written Opinion",
    preferredDate: "2026-07-11",
    preferredTime: "02:00 PM - 03:00 PM",
    attachments: ["GSTR_Notice_16_4.pdf", "Vendor_Invoice_Receipt.pdf"],
    opinion: {
      summary: "The demand for interest on late vendor-uploaded credit can be defended. The Hon'ble Supreme Court and various High Courts have established that credit cannot be denied to an innocent buyer solely on vendor's procedural delays if tax is paid.",
      analysis: "Under Section 16(4), credit must be taken before the due date of filing September return of the succeeding FY. Since your vendor delayed but filed before the ultimate audit closure, the credit remains legally intact. However, to avoid immediate recovery proceedings, a detailed formal reply with invoice reconciliation is required.",
      legalProvisions: [
        "Section 16(2)(c) of CGST Act: Tax actually paid to government",
        "Section 16(4) limitation timeline conditions",
        "Diya Agencies v. State Tax Officer (Kerala High Court guidelines on vendor failures)"
      ],
      actionPlan: [
        "Download GSTR-2A/2B ledger mismatch summary sheet",
        "Prepare certificate of confirmation from vendor confirming they paid tax on invoice",
        "Submit formal written reply in Form GST DRC-06 within 15 days of notice date"
      ],
      disclaimer: "This expert advice is based on facts submitted. Standard legal process requires actual verification of bank ledger credits.",
      resolvedAt: "2026-07-11 04:15 PM"
    },
    messages: [
      {
        id: "msg-1",
        sender: "user",
        content: "Thank you Dr. Sharma. Will the tax officer accept the vendor certificate or do we need to undergo a full appeal?",
        timestamp: "2026-07-11 05:00 PM"
      },
      {
        id: "msg-2",
        sender: "expert",
        content: "Hello! Usually, the jurisdictional Superintendent accepts a signed ledger and CA-verified declaration from the vendor as satisfying Section 16(2)(c). A formal appeal to the Commissioner is only needed if they issue an adverse DRC-07 order.",
        timestamp: "2026-07-11 05:12 PM"
      }
    ]
  },
  {
    id: "B-CON-3102",
    date: "2026-07-14 03:45 PM",
    title: "Drafting custom co-founder agreement with vesting clause",
    details: "Need advice on drafting a standard tech-startup co-founder agreement. We have 3 co-founders, looking for a 4-year vesting schedule with a 1-year cliff. What happens if a co-founder leaves early under bad-leaver vs good-leaver conditions?",
    category: "Corporate Law & MSME Compliance",
    priority: "Standard",
    status: "Expert Assigned",
    expert: EXPERTS[0], // Advocate Meenakshi Sundaram
    channel: "Video Call",
    preferredDate: "2026-07-16",
    preferredTime: "11:00 AM - 11:30 AM",
    attachments: ["Startup_Outline_Draft.docx"],
    messages: []
  }
];

interface PremiumExpertConsultationProps {
  isLightTheme: boolean;
  profile: Profile;
  documentsList: GovDocument[];
  onClose?: () => void;
}

export const PremiumExpertConsultation: React.FC<PremiumExpertConsultationProps> = ({
  isLightTheme,
  profile,
  documentsList,
  onClose
}) => {
  const [requests, setRequests] = useState<ConsultationRequest[]>(SEED_REQUESTS);

  const [activeSubTab, setActiveSubTab] = useState<"book" | "my-requests">("book");
  const [selectedExpert, setSelectedExpert] = useState<Expert>(EXPERTS[0]);
  const [category, setCategory] = useState("Corporate Law & MSME Compliance");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState<"Standard" | "Priority" | "Urgent">("Standard");
  const [channel, setChannel] = useState<"Video Call" | "Phone Call" | "Written Opinion">("Written Opinion");
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [preferredTime, setPreferredTime] = useState("10:00 AM - 11:00 AM");
  const [attachedDocIds, setAttachedDocIds] = useState<string[]>([]);
  const [customFileNames, setCustomFileNames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Active selected request in Tracker tab
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
  const [followUpMsg, setFollowUpMsg] = useState("");
  const [sendingFollowUp, setSendingFollowUp] = useState(false);

  // File drag-and-drop state
  const [dragActive, setDragActive] = useState(false);

  // Handle local state submission
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) {
      alert("Please provide a Title and description for your complex legal query.");
      return;
    }

    setSubmitting(true);

    // Simulate verified triage and routing
    setTimeout(() => {
      const newRequest: ConsultationRequest = {
        id: `B-CON-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }),
        title,
        details,
        category,
        priority,
        status: "Submitted",
        expert: selectedExpert,
        channel,
        preferredDate,
        preferredTime,
        attachments: [
          ...attachedDocIds.map(id => documentsList.find(d => d.id === id)?.name || id),
          ...customFileNames
        ],
        messages: []
      };

      const updated = [newRequest, ...requests];
      setRequests(updated);
      setSubmitting(false);
      setSuccessMessage(newRequest.id);
      
      // Auto transition to tracking state for simulation
      setTimeout(() => {
        // Auto update Submitted case to "Expert Assigned" after 8 seconds
        setRequests(prevRequests => 
          prevRequests.map(r => r.id === newRequest.id ? { ...r, status: "Expert Assigned" } : r)
        );
      }, 8000);

      // Clear form
      setTitle("");
      setDetails("");
      setAttachedDocIds([]);
      setCustomFileNames([]);
    }, 1500);
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpMsg.trim() || !selectedRequest) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: "user" as const,
      content: followUpMsg,
      timestamp: "Just Now"
    };

    const updatedRequest = {
      ...selectedRequest,
      messages: [...(selectedRequest.messages || []), newMessage]
    };

    // Update main request list
    const updatedRequestsList = requests.map(r => r.id === selectedRequest.id ? updatedRequest : r);
    setRequests(updatedRequestsList);
    setSelectedRequest(updatedRequest);
    setFollowUpMsg("");
    setSendingFollowUp(true);

    // Simulated response from Expert in 3 seconds
    setTimeout(() => {
      const expertReply = {
        id: `msg-${Date.now() + 1}`,
        sender: "expert" as const,
        content: `Thank you for details. Under Indian laws, this is a highly typical case. I've noted down your comments and will address them explicitly in our consultation docket. Let's make sure we have your Udyam Certificate ready during the call!`,
        timestamp: "Just Now"
      };

      const finalRequest = {
        ...updatedRequest,
        messages: [...updatedRequest.messages!, expertReply]
      };

      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? finalRequest : r));
      setSelectedRequest(finalRequest);
      setSendingFollowUp(false);
    }, 2500);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileName = e.dataTransfer.files[0].name;
      setCustomFileNames(prev => [...prev, fileName]);
    }
  };

  const toggleDocAttachment = (docId: string) => {
    setAttachedDocIds(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const getPriorityBadgeColor = (p: string) => {
    switch (p) {
      case "Urgent": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "Priority": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default: return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    }
  };

  const getStatusBadgeColor = (s: string) => {
    switch (s) {
      case "Response Received": return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "Expert Assigned": return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "Submitted": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default: return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
    }
  };

  const getFeeForPriority = (p: string) => {
    switch (p) {
      case "Urgent": return 2499;
      case "Priority": return 1499;
      default: return 999;
    }
  };

  return (
    <div className={`p-1 space-y-6 text-left`}>
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/10">
              <Scale className="w-5 h-5" />
            </div>
            <h1 className={`text-xl font-bold tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              Premium Expert Legal Consultation
            </h1>
          </div>
          <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
            Secure legally-binding manual reviews, corporate dispute assistance, and fast SLA compliance resolution from verified Indian High Court advocates.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 shrink-0 self-stretch md:self-auto">
          <button
            onClick={() => { setActiveSubTab("book"); setSuccessMessage(null); }}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeSubTab === "book" 
                ? "bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/10" 
                : `${isLightTheme ? "text-slate-600 hover:text-slate-900" : "text-white/60 hover:text-white"}`
            }`}
          >
            Request Consultation
          </button>
          <button
            onClick={() => { setActiveSubTab("my-requests"); setSuccessMessage(null); }}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-medium rounded-lg transition-all relative ${
              activeSubTab === "my-requests" 
                ? "bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/10" 
                : `${isLightTheme ? "text-slate-600 hover:text-slate-900" : "text-white/60 hover:text-white"}`
            }`}
          >
            My Requests Tracker
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-black">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === "book" ? (
          <motion.div
            key="book-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* LEFT COLUMN: Request Form */}
            <div className="lg:col-span-8 space-y-6">
              {successMessage ? (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-6 rounded-2xl border text-center space-y-4 ${
                    isLightTheme ? "bg-green-50 border-green-200" : "bg-green-950/10 border-green-500/20"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                      Expert Consultation Docket Created!
                    </h3>
                    <p className={`text-xs ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
                      Case reference ID is <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono font-semibold text-amber-500">{successMessage}</code>.
                    </p>
                  </div>
                  <p className={`text-xs max-w-md mx-auto ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                    Your legal query has been secured and dispatched directly to <strong>{selectedExpert.name}</strong>. An initial notification with the schedule and checklist will appear in your tracking console shortly.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setActiveSubTab("my-requests");
                        const req = requests.find(r => r.id === successMessage);
                        if (req) setSelectedRequest(req);
                        setSuccessMessage(null);
                      }}
                      className="px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-xl hover:bg-amber-400 transition"
                    >
                      Track Consultation Status
                    </button>
                    <button
                      onClick={() => setSuccessMessage(null)}
                      className={`px-4 py-2 text-xs rounded-xl border transition ${
                        isLightTheme ? "border-slate-200 hover:bg-slate-50" : "border-white/10 hover:bg-white/5"
                      }`}
                    >
                      Request Another
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="space-y-6">
                  {/* Expert Picker */}
                  <div className="space-y-3">
                    <label className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-600" : "text-white/40"}`}>
                      1. Select Your Assigned Advocate
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {EXPERTS.map((expert) => {
                        const isSelected = selectedExpert.id === expert.id;
                        return (
                          <div
                            key={expert.id}
                            onClick={() => setSelectedExpert(expert)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between h-full ${
                              isSelected 
                                ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/20" 
                                : isLightTheme
                                  ? "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50"
                                  : "border-white/5 bg-[#0b0e14]/40 hover:bg-[#0b0e14]/80"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${expert.avatarColor} flex items-center justify-center text-[10px] font-bold text-white font-mono`}>
                                    {expert.name.split(" ").slice(-1)[0][0]}
                                  </div>
                                  <div>
                                    <h4 className={`text-xs font-bold leading-none ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                                      {expert.name}
                                    </h4>
                                    <span className="text-[10px] font-medium text-amber-500">{expert.area}</span>
                                  </div>
                                </div>
                                {isSelected && (
                                  <span className="p-1 rounded-full bg-amber-500 text-black">
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}
                              </div>

                              <p className={`text-[10px] line-clamp-2 ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                                {expert.credentials}
                              </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-3 text-[10px] font-mono">
                              <span className="text-white/30">{expert.experience} Yrs Exp • {expert.location.split(",")[0]}</span>
                              <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                <Star className="w-3 h-3 fill-yellow-500" />
                                <span>{expert.rating}</span>
                                <span className="text-white/30">({expert.reviews})</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Consultation Specifications */}
                  <div className="space-y-4">
                    <label className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-600" : "text-white/40"}`}>
                      2. Consultation Specifications
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Query Category */}
                      <div className="space-y-1.5 text-left">
                        <span className={`text-[11px] font-semibold ${isLightTheme ? "text-slate-700" : "text-white/70"}`}>Query Category</span>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                            isLightTheme 
                              ? "bg-white border-slate-200 text-slate-800" 
                              : "bg-[#0b0e14] border-white/10 text-white"
                          }`}
                        >
                          <option>Corporate Law & MSME Compliance</option>
                          <option>Tax, GST & Audits</option>
                          <option>Intellectual Property & Trademarks</option>
                          <option>Labor Compliance & Factory Licensing</option>
                          <option>Government Subsidies & Grants</option>
                        </select>
                      </div>

                      {/* Consultation Channel */}
                      <div className="space-y-1.5 text-left">
                        <span className={`text-[11px] font-semibold ${isLightTheme ? "text-slate-700" : "text-white/70"}`}>Preferred Channel</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: "Written Opinion", label: "Written", icon: FileText },
                            { value: "Video Call", label: "Video Call", icon: Video },
                            { value: "Phone Call", label: "Phone", icon: Phone }
                          ].map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => setChannel(item.value as any)}
                                className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition ${
                                  channel === item.value
                                    ? "border-amber-500 bg-amber-500/5 text-amber-500"
                                    : isLightTheme
                                      ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                                      : "border-white/10 bg-[#0b0e14] hover:bg-white/5 text-white/60"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Priority Level */}
                      <div className="space-y-1.5 text-left md:col-span-1">
                        <span className={`text-[11px] font-semibold ${isLightTheme ? "text-slate-700" : "text-white/70"}`}>Priority Level</span>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as any)}
                          className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                            isLightTheme 
                              ? "bg-white border-slate-200 text-slate-800" 
                              : "bg-[#0b0e14] border-white/10 text-white"
                          }`}
                        >
                          <option value="Standard">Standard (24-48h SLA)</option>
                          <option value="Priority">Priority (12-24h SLA)</option>
                          <option value="Urgent">Urgent (4h Critical SLA)</option>
                        </select>
                      </div>

                      {/* Preferred Date */}
                      <div className="space-y-1.5 text-left">
                        <span className={`text-[11px] font-semibold ${isLightTheme ? "text-slate-700" : "text-white/70"}`}>Preferred Slot Date</span>
                        <input
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none focus:border-amber-500 ${
                            isLightTheme 
                              ? "bg-white border-slate-200 text-slate-800" 
                              : "bg-[#0b0e14] border-white/10 text-white"
                          }`}
                        />
                      </div>

                      {/* Preferred Time */}
                      <div className="space-y-1.5 text-left">
                        <span className={`text-[11px] font-semibold ${isLightTheme ? "text-slate-700" : "text-white/70"}`}>Preferred Time Window</span>
                        <select
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                            isLightTheme 
                              ? "bg-white border-slate-200 text-slate-800" 
                              : "bg-[#0b0e14] border-white/10 text-white"
                          }`}
                        >
                          <option>10:00 AM - 11:30 AM</option>
                          <option>12:00 PM - 01:30 PM</option>
                          <option>02:30 PM - 04:00 PM</option>
                          <option>04:30 PM - 06:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Legal Query Content */}
                  <div className="space-y-4">
                    <label className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-600" : "text-white/40"}`}>
                      3. Query Details
                    </label>

                    <div className="space-y-3">
                      <div className="space-y-1.5 text-left">
                        <span className={`text-[11px] font-semibold ${isLightTheme ? "text-slate-700" : "text-white/70"}`}>Case Subject / Title</span>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. GST Input Tax Credit Denial Notice or Patenting local Agri-tech IoT sensor"
                          className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                            isLightTheme 
                              ? "bg-white border-slate-200 text-slate-800" 
                              : "bg-[#0b0e14] border-white/10 text-white"
                          }`}
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <span className={`text-[11px] font-semibold ${isLightTheme ? "text-slate-700" : "text-white/70"}`}>Detailed Legal / Compliance Question</span>
                        <textarea
                          required
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          rows={4}
                          placeholder="Provide the exact sequence of events, notices received, reference numbers, or drafting goals. Mention if this is an active litigation, statutory demand notice or business dispute."
                          className={`w-full text-xs p-3.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                            isLightTheme 
                              ? "bg-white border-slate-200 text-slate-800" 
                              : "bg-[#0b0e14] border-white/10 text-white"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documents Linking */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-600" : "text-white/40"}`}>
                        4. Attach Evidence & Legal Notices
                      </label>
                      <span className="text-[10px] font-mono text-[#22c55e]">DPI Secure Vault Link</span>
                    </div>

                    {/* App Document list linkage */}
                    {documentsList.length > 0 && (
                      <div className="space-y-2">
                        <span className={`text-[10px] font-medium block ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                          Select from previously uploaded Documents Hub files:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {documentsList.map((doc) => {
                            const isAttached = attachedDocIds.includes(doc.id);
                            return (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => toggleDocAttachment(doc.id)}
                                className={`px-3 py-2 rounded-xl text-[10px] font-medium border flex items-center gap-2 transition-all ${
                                  isAttached
                                    ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                    : isLightTheme
                                      ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                      : "bg-[#0b0e14] border-white/5 text-white/70 hover:bg-white/5"
                                }`}
                              >
                                <FileCheck2 className={`w-3.5 h-3.5 ${isAttached ? "text-amber-500" : "text-white/30"}`} />
                                <span>{doc.name}</span>
                                {isAttached && <span className="bg-amber-500 text-black px-1 rounded text-[8px] font-bold">Linked</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Drag and Drop local file mock */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                        dragActive 
                          ? "border-amber-500 bg-amber-500/5" 
                          : isLightTheme 
                            ? "border-slate-200 bg-slate-50/50 hover:bg-slate-50" 
                            : "border-white/10 bg-[#0b0e14]/20 hover:bg-[#0b0e14]/40"
                      }`}
                    >
                      <UploadCloud className="w-8 h-8 text-white/30 mx-auto mb-2" />
                      <p className={`text-xs font-semibold ${isLightTheme ? "text-slate-700" : "text-white/80"}`}>
                        Drag & Drop local files here, or click to upload
                      </p>
                      <p className="text-[10px] text-white/30 mt-1">PDF, DOCX, JPEG, PNG up to 25MB total</p>
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        id="local-file-picker"
                        onChange={(e) => {
                          if (e.target.files) {
                            const names = Array.from(e.target.files).map(f => f.name);
                            setCustomFileNames(prev => [...prev, ...names]);
                          }
                        }}
                      />
                      <label 
                        htmlFor="local-file-picker" 
                        className="mt-3 inline-block px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[10px] font-bold font-mono uppercase text-white/80 cursor-pointer"
                      >
                        Browse Files
                      </label>
                    </div>

                    {customFileNames.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono uppercase text-white/30">Local Files to Attach:</span>
                        <div className="flex flex-wrap gap-2">
                          {customFileNames.map((name, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg text-[10px] text-amber-400">
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{name}</span>
                              <button 
                                type="button" 
                                onClick={() => setCustomFileNames(prev => prev.filter((_, i) => i !== idx))}
                                className="hover:text-red-400 transition"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying DPI Credentials & Triage...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit Secure Consultation Request</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT COLUMN: Fee Summary & Expert Credentials */}
            <div className="lg:col-span-4 space-y-6">
              {/* Fee & Discount Certificate Panel */}
              <div className={`p-5 rounded-2xl border text-left space-y-4 relative overflow-hidden ${
                isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#0b0e14] border-white/5"
              }`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="border-b border-white/5 pb-3">
                  <h3 className={`text-xs font-bold font-mono tracking-wider uppercase ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                    Consultation Cost Breakdown
                  </h3>
                  <p className="text-[10px] text-white/30">Bharat National MSME Protection Subsidy</p>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-white/60">
                    <span>Expert Consult Fee:</span>
                    <span>₹{getFeeForPriority(priority).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Priority SLA Premium:</span>
                    <span>{priority === "Standard" ? "₹0 (Included)" : priority === "Priority" ? "+₹500" : "+₹1,000"}</span>
                  </div>
                  <div className="flex justify-between text-[#22c55e] font-bold border-t border-white/5 pt-2">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                      DPI MSME Subsidy:
                    </span>
                    <span>-₹{(getFeeForPriority(priority) + (priority === "Standard" ? 0 : priority === "Priority" ? 500 : 1000)).toLocaleString()}</span>
                  </div>
                </div>

                {/* MSME Waiver Card */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-green-400" />
                    <span className="font-extrabold text-white">Active MSME Subsidy Certified</span>
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed">
                    Under the Digital Public Infrastructure Act, registered MSME entrepreneurs qualify for <strong>100% Gov-subsidized legal help</strong>. No payment required.
                  </p>
                </div>

                <div className="flex items-baseline justify-between border-t border-white/5 pt-3">
                  <span className="text-[10px] font-mono text-white/30 uppercase">Final Out-of-Pocket:</span>
                  <span className="text-xl font-black text-[#22c55e]">₹0</span>
                </div>
              </div>

              {/* Verified Badge / Safety Panel */}
              <div className={`p-5 rounded-2xl border text-left space-y-4 ${
                isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#0b0e14] border-white/5"
              }`}>
                <h4 className="text-xs font-bold flex items-center gap-1.5 text-amber-500 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4" />
                  Verified SLA Safeguards
                </h4>

                <ul className="space-y-3 text-[11px] leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-amber-500 mt-0.5">▪</span>
                    <p className={`${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
                      <strong>Statutory Legal Seal:</strong> All legal advice conforms strictly to active circulars, court rulings, and standard ministry frameworks.
                    </p>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 mt-0.5">▪</span>
                    <p className={`${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
                      <strong>Secured Vault Privacy:</strong> Your uploaded notices and certificates are stored in an encrypted sandboxed storage unit, accessible only to your matched expert.
                    </p>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 mt-0.5">▪</span>
                    <p className={`${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
                      <strong>Court Admissibility:</strong> Hand-crafted formal written opinions can be appended to your department appeals or responses as pre-legal briefs.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="my-requests-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {requests.length === 0 ? (
              <div className={`py-12 text-center space-y-3 rounded-2xl border ${
                isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#0b0e14]/50 border-white/5"
              }`}>
                <Scale className="w-12 h-12 text-white/10 mx-auto animate-pulse" />
                <div className="space-y-1">
                  <h3 className={`text-sm font-bold ${isLightTheme ? "text-slate-800" : "text-white"}`}>No Active Consultations Found</h3>
                  <p className={`text-xs max-w-sm mx-auto ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                    You haven't requested any expert consultations yet. Go to 'Request Consultation' tab to submit your legal or tax-related disputes.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubTab("book")}
                  className="px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-xl hover:bg-amber-400 transition"
                >
                  Create First Consultation Request
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* CASE LIST COLUMN */}
                <div className="lg:col-span-4 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {requests.map((req) => {
                    const isSelected = selectedRequest?.id === req.id;
                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col gap-2 relative ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/5 shadow-md"
                            : isLightTheme
                              ? "border-slate-200 bg-white hover:bg-slate-50"
                              : "border-white/5 bg-[#0b0e14] hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono text-white/30 uppercase">{req.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-extrabold uppercase ${getPriorityBadgeColor(req.priority)}`}>
                            {req.priority}
                          </span>
                        </div>

                        <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                          {req.title}
                        </h4>

                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-white/40">
                          <User className="w-3 h-3 text-amber-500" />
                          <span className="truncate">{req.expert.name}</span>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-2 text-[9px] font-mono">
                          <span className="text-white/30">{req.date.split(" ")[0]}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold ${getStatusBadgeColor(req.status)}`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CASE DETAIL VIEWER COLUMN */}
                <div className="lg:col-span-8">
                  {selectedRequest ? (
                    <div className={`p-6 rounded-2xl border space-y-6 ${
                      isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b0e14] border-white/5"
                    }`}>
                      {/* Close detail btn */}
                      <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-white/40">{selectedRequest.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-extrabold uppercase ${getPriorityBadgeColor(selectedRequest.priority)}`}>
                              {selectedRequest.priority} Priority
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${getStatusBadgeColor(selectedRequest.status)}`}>
                              {selectedRequest.status}
                            </span>
                          </div>
                          <h3 className={`text-sm font-bold tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                            {selectedRequest.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => setSelectedRequest(null)}
                          className="p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white"
                          title="Close panel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Request Details Info */}
                      <div className="space-y-3 text-left text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-white/30 uppercase block">Matched Legal Advocate</span>
                            <span className={`font-bold ${isLightTheme ? "text-slate-800" : "text-white"}`}>{selectedRequest.expert.name}</span>
                            <span className="text-[10px] text-white/50 block">{selectedRequest.expert.credentials.split(",")[0]}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-white/30 uppercase block">Consultation Schedule</span>
                            <span className={`font-bold ${isLightTheme ? "text-slate-800" : "text-white"}`}>{selectedRequest.channel} Delivery</span>
                            <span className="text-[10px] text-white/50 block">{selectedRequest.preferredDate} at {selectedRequest.preferredTime.split(" ")[0]}</span>
                          </div>
                        </div>

                        <div className="space-y-1 pt-2">
                          <span className="text-[10px] font-mono text-white/30 uppercase block">Original Query / Situation Submitted</span>
                          <p className={`p-3 rounded-xl border leading-relaxed text-[11px] ${
                            isLightTheme ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-black/30 border-white/5 text-white/70"
                          }`}>
                            {selectedRequest.details}
                          </p>
                        </div>

                        {selectedRequest.attachments.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-mono text-white/30 uppercase block">Evidence Attachments ({selectedRequest.attachments.length})</span>
                            <div className="flex flex-wrap gap-2">
                              {selectedRequest.attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-lg text-[10px] text-white/60">
                                  <FileText className="w-3 h-3 text-amber-500" />
                                  <span>{file}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expert Legal Opinion Response block */}
                      {selectedRequest.opinion ? (
                        <div className="space-y-4 pt-4 border-t border-white/5 text-left">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Scale className="w-4 h-4 text-amber-500" />
                              <h4 className={`text-xs font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-800" : "text-amber-500"}`}>
                                Official Legal Consultation Report
                              </h4>
                            </div>
                            <span className="text-[9px] font-mono text-[#22c55e] bg-green-500/10 px-2 py-0.5 rounded">Digital Seal Applied</span>
                          </div>

                          {/* Letterhead styled paper response */}
                          <div className={`p-5 rounded-xl border relative shadow-inner ${
                            isLightTheme 
                              ? "bg-[#faf9f6] border-amber-800/10 text-slate-800" 
                              : "bg-[#0b0c0f] border-amber-500/10 text-white/90"
                          }`}>
                            <div className="absolute top-4 right-4 text-[9px] font-mono text-amber-500/20 border border-amber-500/20 px-1.5 py-0.5 rounded select-none uppercase tracking-widest font-bold">
                              DPI LEGAL REVIEW
                            </div>

                            <div className="space-y-4 text-xs">
                              {/* Summary */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase block">1. Executive Summary & Verdict</span>
                                <p className="leading-relaxed text-[11px] font-medium">{selectedRequest.opinion.summary}</p>
                              </div>

                              {/* Analysis */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase block">2. In-Depth Case Analysis</span>
                                <p className="leading-relaxed text-[11px] text-white/70 whitespace-pre-line">{selectedRequest.opinion.analysis}</p>
                              </div>

                              {/* Legal provisions */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase block">3. Applicable Statutory Clauses & Case Laws</span>
                                <ul className="list-disc list-inside space-y-1 text-white/60 text-[11px]">
                                  {selectedRequest.opinion.legalProvisions.map((provision, idx) => (
                                    <li key={idx}>{provision}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Action items */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase block">4. Prescribed Action Plan</span>
                                <ol className="list-decimal list-inside space-y-1.5 text-white/80 text-[11px]">
                                  {selectedRequest.opinion.actionPlan.map((action, idx) => (
                                    <li key={idx} className="font-semibold">{action}</li>
                                  ))}
                                </ol>
                              </div>

                              {/* Stamp, signature and disclaimer */}
                              <div className="border-t border-white/5 pt-4 mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[9px] font-mono text-white/40">
                                <div className="space-y-1 text-left max-w-sm">
                                  <span>Response Dated: {selectedRequest.opinion.resolvedAt}</span>
                                  <p className="leading-tight text-[8px]">{selectedRequest.opinion.disclaimer}</p>
                                </div>

                                <div className="flex items-center gap-2 border border-amber-500/20 bg-amber-500/[0.02] p-2 rounded-lg shrink-0">
                                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-500 flex items-center justify-center text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none font-mono text-center">
                                    APPROVED<br/>SEAL
                                  </div>
                                  <div className="text-[8px] leading-tight">
                                    <span className="font-bold text-amber-500 block">Adv. M. Sundaram</span>
                                    <span>Bar ID: D/4082/2012</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => alert("Downloading PDF Copy of Expert Consultation Report...")}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-white/5 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Certified Opinion Report</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-4 border-t border-white/5 text-left text-xs">
                          <h4 className="font-bold text-white/50 uppercase tracking-wider text-[10px] font-mono">Consultation Case Lifecycle</h4>
                          
                          {/* SLA progress timeline bar */}
                          <div className="relative pl-6 space-y-5">
                            <div className="absolute left-2.5 top-2 bottom-2 w-[1px] bg-white/10" />
                            
                            <div className="relative flex gap-3">
                              <span className="absolute -left-[19px] w-3 h-3 rounded-full bg-[#22c55e]" />
                              <div>
                                <span className="font-bold text-white block">Case Created & Secured</span>
                                <span className="text-[10px] text-white/30 block">{selectedRequest.date}</span>
                              </div>
                            </div>

                            <div className="relative flex gap-3">
                              <span className="absolute -left-[19px] w-3 h-3 rounded-full bg-[#22c55e]" />
                              <div>
                                <span className="font-bold text-white block">Expert Assigned & Notified</span>
                                <span className="text-[10px] text-white/30 block">Advocate {selectedRequest.expert.name} assigned</span>
                              </div>
                            </div>

                            <div className="relative flex gap-3">
                              <span className="absolute -left-[19px] w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
                              <div>
                                <span className="font-bold text-white block">Legal Precedent Analysis In-Progress</span>
                                <span className="text-[10px] text-[#22c55e] font-mono block">Estimated SLA Response: within {selectedRequest.priority === "Urgent" ? "2 Hours" : "12 Hours"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Consultation Follow-up chat board */}
                      <div className="space-y-4 pt-4 border-t border-white/5 text-left">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-cyan-400" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                            Expert Follow-Up Discussion
                          </h4>
                        </div>

                        {/* Message log */}
                        <div className={`p-4 rounded-xl space-y-3 max-h-[220px] overflow-y-auto ${
                          isLightTheme ? "bg-slate-50" : "bg-black/30"
                        }`}>
                          {(!selectedRequest.messages || selectedRequest.messages.length === 0) ? (
                            <p className="text-[11px] text-white/30 text-center py-4">
                              No follow-up messages exchanged. You can ask follow-up questions regarding the case details here.
                            </p>
                          ) : (
                            selectedRequest.messages.map((msg) => {
                              const isExpert = msg.sender === "expert";
                              return (
                                <div key={msg.id} className={`flex flex-col gap-1 max-w-[85%] ${isExpert ? "" : "ml-auto"}`}>
                                  <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed ${
                                    isExpert 
                                      ? "bg-white/5 text-white/80 rounded-tl-none border border-white/5" 
                                      : "bg-amber-500 text-black font-medium rounded-tr-none"
                                  }`}>
                                    {msg.content}
                                  </div>
                                  <span className={`text-[8px] font-mono text-white/30 px-1 ${isExpert ? "text-left" : "text-right"}`}>
                                    {isExpert ? selectedRequest.expert.name : "You"} • {msg.timestamp}
                                  </span>
                                </div>
                              );
                            })
                          )}

                          {sendingFollowUp && (
                            <div className="flex items-center gap-2 text-[10px] text-white/40">
                              <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                              <span className="font-mono animate-pulse">Expert is reviewing and typing advice...</span>
                            </div>
                          )}
                        </div>

                        {/* Input form */}
                        <form onSubmit={handleFollowUpSubmit} className="flex gap-2">
                          <input
                            type="text"
                            value={followUpMsg}
                            onChange={(e) => setFollowUpMsg(e.target.value)}
                            placeholder="Type a follow-up question regarding the notices or agreement format..."
                            className={`flex-1 text-xs px-3.5 py-2 rounded-xl border focus:outline-none focus:border-cyan-400 ${
                              isLightTheme 
                                ? "bg-white border-slate-200 text-slate-800" 
                                : "bg-[#0b0e14] border-white/10 text-white"
                            }`}
                          />
                          <button
                            type="submit"
                            disabled={!followUpMsg.trim() || sendingFollowUp}
                            className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-12 text-center space-y-3 rounded-2xl border ${
                      isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#0b0e14]/30 border-white/5"
                    }`}>
                      <Info className="w-10 h-10 text-white/20 mx-auto" />
                      <div className="space-y-1">
                        <h3 className={`text-xs font-bold font-mono uppercase ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                          No Case Selected
                        </h3>
                        <p className={`text-xs max-w-xs mx-auto ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                          Select an active or resolved consultation case from the sidebar checklist to inspect legal briefs, download reports, or chat with advocates.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
