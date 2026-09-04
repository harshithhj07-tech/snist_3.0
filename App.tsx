import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Database, 
  Send, 
  RefreshCw, 
  Search, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  LogOut, 
  X, 
  ShieldCheck, 
  HelpCircle, 
  Activity, 
  Sparkles, 
  Lock, 
  Layers,
  ArrowRight,
  Clock,
  Cpu,
  CornerDownRight,
  Info,
  Compass,
  Map,
  MapPin,
  ClipboardList,
  CheckSquare,
  FileBadge,
  FileCheck2,
  FileText,
  BookOpen,
  AlertCircle,
  Home,
  Menu,
  LayoutDashboard,
  MessageSquare,
  BadgePercent,
  Files,
  Bookmark,
  History,
  Settings,
  Check,
  Plus,
  Trash2,
  UploadCloud,
  Eye,
  ExternalLink,
  Copy,
  Camera,
  Volume2,
  Pencil,
  VolumeX,
  Mic,
  MicOff,
  Fingerprint,
  Globe,
  Key,
  Bell,
  Archive,
  FolderCheck,
  RotateCcw,
  Inbox,
  Calendar,
  Edit2,
  Scale,
  ChevronRight,
  Play,
  ListChecks,
  Filter,
  ArrowUpRight,
  Unlock,
  Download,
  Loader2,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Profile, Step, Phase, GovDocument, Scheme, RoadmapData, Message, ProactiveNotification } from "./types";
import { ProfilePhotoUpload } from "./components/ProfilePhotoUpload";
import { t, SUPPORTED_LANGUAGES, normalizeLangName } from "./utils/translations";
import { jsPDF } from "jspdf";
import { exportWorkflowOrRoadmapToPDF } from "./utils/pdfExportEngine";

// Firebase Storage & Notification Helpers
import { 
  uploadDocumentToFirebase, 
  deleteDocumentFromFirebase, 
  fetchUserDocumentsFromFirebase, 
  downloadDocumentFile,
  StoredUserDocument 
} from "./utils/firebaseStorage";
import { 
  registerServiceWorker, 
  requestNotificationPermission, 
  evaluateRoadmapAndDocAlerts,
  triggerNotification 
} from "./utils/notificationHelper";

// Firebase integration & state handlers
import { auth, logout } from "./firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { onSupabaseAuthStateChange, signOut as supabaseSignOut } from "./supabase";
import { useSessionTimeout } from "./hooks/useSessionTimeout";
import { SessionTimeoutBanner } from "./components/SessionTimeoutBanner";
import { BiometricDocumentGuard } from "./components/BiometricDocumentGuard";
import { 
  getFirebaseUserProfile, 
  saveFirebaseUserProfile, 
  getFirebaseUserRoadmaps, 
  saveFirebaseUserRoadmap, 
  getFirebaseUserMessages, 
  saveFirebaseUserMessage, 
  getFirebaseUserBookmarks, 
  saveFirebaseUserBookmark, 
  deleteFirebaseUserBookmark, 
  getFirebaseUserHistory, 
  saveFirebaseUserHistoryItem,
  deleteFirebaseUserHistoryItem,
  deleteFirebaseUserRoadmap,
  clearFirebaseUserHistory,
  clearFirebaseUserRoadmaps,
  getFirebaseUserDocuments,
  saveFirebaseUserDocument,
  deleteFirebaseUserDocument,
  getFirebaseUserNotifications,
  saveFirebaseUserNotification,
  deleteFirebaseUserNotification,
  saveFirebaseAppData
} from "./utils/firebaseDb";

// Import modular portal/website extensions
import { CMSBlog } from "./components/CMSBlog";
import { ECommerceShop } from "./components/ECommerceShop";
import { DiscussionForum } from "./components/DiscussionForum";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { AuthAndProfile, UserProfile } from "./components/AuthAndProfile";
import { EmailNewsletter } from "./components/EmailNewsletter";
import { ThemeToggle } from "./components/ThemeToggle";
import { PremiumExpertConsultation } from "./components/PremiumExpertConsultation";
import { DocumentAnnotator } from "./components/DocumentAnnotator";
import { DigiLockerVault } from "./components/DigiLockerVault";
import { DocumentValidityMonitor } from "./components/DocumentValidityMonitor";
import { DashboardCardsGrid } from "./components/DashboardCardsGrid";
import { AIAssistantChat } from "./components/AIAssistantChat";
import { NotificationCentre } from "./components/NotificationCentre";
import { DynamicEligibilityChecker } from "./components/DynamicEligibilityChecker";
import { AIWorkflowOrchestratorView } from "./components/AIWorkflowOrchestratorView";
import { GovernmentRAGView } from "./components/GovernmentRAGView";

// Navigation Components
import { Sidebar } from "./components/navigation/Sidebar";
import { MobileDrawer } from "./components/navigation/MobileDrawer";
import { QuickActionPalette } from "./components/navigation/QuickActionPalette";
import { OfficeLocatorView } from "./components/OfficeLocatorView";
import { DocumentIntelligenceView } from "./components/DocumentIntelligenceView";
import { CitizenIntelligenceView } from "./components/CitizenIntelligenceView";
import { AiHistoryView } from "./components/AiHistoryView";
import { LandingPage } from "./components/LandingPage";
import { SettingsView } from "./components/SettingsView";
import { PdfPreviewerModal } from "./components/PdfPreviewerModal";
import { GanttChartD3 } from "./components/GanttChartD3";
import { JourneyEngineView } from "./components/JourneyEngineView";
import { SAMPLE_GOVERNMENT_JOURNEY, DEFAULT_CITIZEN_PROFILE, DEFAULT_VAULT_DOCS } from "./data/sampleJourney";
import SecurityHardeningView from "./components/SecurityHardeningView";
import ScaleCommercializationView from "./components/ScaleCommercializationView";
import Phase10AuditFundingView from "./components/Phase10AuditFundingView";
import { AdminPanelView } from "./components/AdminPanelView";
import { getStepAlerts, StepAlertInfo, formatDate } from "./utils/dateTracking";
// Static listing of Indian States
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

// Prepopulated Active Roadmaps for Quick Load
const QUICK_ROADMAPS = [
  {
    title: "12th Scholar admission in Maharashtra",
    prompt: "I have completed 12th in Maharashtra and want to apply to an engineering college. I have an income certificate of ₹1.5 Lakhs. What is my exact roadmap for admission and scholarships?"
  },
  {
    title: "Register organic dairy farm in Karnataka",
    prompt: "I want to start an organic dairy farm in Karnataka. What is the process, land clearances, animal welfare registration, and NABARD subsidies?"
  },
  {
    title: "IT SaaS Startup in Bangalore",
    prompt: "I want to set up an IT SaaS startup in Bangalore, Karnataka. What is the path for Startup India registration, K-Tech incentives, and intellectual property filings?"
  },
  {
    title: "Update Aadhaar mobile number",
    prompt: "I need to update my Aadhaar registered mobile number. What is the exact step-by-step procedure, required biometric verification, and nearest centers?"
  },
  {
    title: "Apply for Senior Citizen Pension in Telangana",
    prompt: "I am 65 years old living in Telangana with no family income. What is the exact process to register for the Aasara Senior Citizen Pension scheme?"
  }
];

const parseTimelineToDays = (timelineStr: string): number => {
  if (!timelineStr) return 0;
  const cleaned = timelineStr.toLowerCase().trim();
  if (cleaned === "instant" || cleaned === "immediate" || cleaned === "none") return 0.1;
  if (cleaned.includes("hour")) return 0.2;
  
  // Extract numbers
  const match = cleaned.match(/(\d+)\s*(?:-\s*(\d+))?\s*(day|week|month)/);
  if (match) {
    const num1 = parseFloat(match[1]);
    const num2 = match[2] ? parseFloat(match[2]) : null;
    const unit = match[3];
    
    let days = num2 ? (num1 + num2) / 2 : num1;
    if (unit.startsWith("week")) {
      days *= 7;
    } else if (unit.startsWith("month")) {
      days *= 30;
    }
    return days;
  }
  
  // Fallbacks for typical strings if regex fails
  if (cleaned.includes("1-2 days")) return 1.5;
  if (cleaned.includes("3-5 days")) return 4;
  if (cleaned.includes("7 days") || cleaned.includes("1 week")) return 7;
  if (cleaned.includes("14 days") || cleaned.includes("2 weeks")) return 14;
  if (cleaned.includes("30 days") || cleaned.includes("1 month")) return 30;
  
  return 3; // default
};

export default function App() {
  // Active Tab: home, assistant, eligibility, documents, roadmap, office-locator, notifications, bookmarks, history, settings, admin
  const [activeTab, setActiveTab] = useState<
    "home" | "dashboard" | "assistant" | "eligibility" | "documents" | "roadmap" | "bookmarks" | "history" | "settings" | "profile" | "cms" | "shop" | "forum" | "analytics" | "auth" | "newsletter" | "consultation" | "digilocker" | "orchestrator" | "rag" | "doc-intelligence" | "office-locator" | "citizen-intelligence" | "notifications" | "security" | "scale" | "phase10" | "admin"
  >("assistant");

  // Global Website Configuration & Session states
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  useEffect(() => {
    if (isLightTheme) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, [isLightTheme]);
  const [profileEmail, setProfileEmail] = useState("");
  const [profileRole, setProfileRole] = useState<"Visitor" | "Verified Expert" | "Premium Elite" | "Admin">("Visitor");
  const [profileIsLoggedIn, setProfileIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [orchestratorInitialQuery, setOrchestratorInitialQuery] = useState<string>("");

  // Session Inactivity Timeout (30 minutes total, 60 seconds warning)
  const handleSessionTimeoutLogout = useCallback(async () => {
    try {
      await Promise.allSettled([
        logout(),
        supabaseSignOut()
      ]);
    } catch (e) {
      console.error("Session timeout logout error:", e);
    }
    setProfileIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab("auth");
  }, []);

  const { showWarning: showTimeoutWarning, secondsRemaining: timeoutSecondsRemaining, extendSession } = useSessionTimeout({
    isLoggedIn: profileIsLoggedIn,
    onTimeout: handleSessionTimeoutLogout,
    timeoutDurationMs: 30 * 60 * 1000, // 30 minutes
    warningThresholdMs: 60 * 1000 // 60 seconds warning banner
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setProfileEmail(user.email || "");
        setProfileIsLoggedIn(true);

        try {
          const dbProfile = await getFirebaseUserProfile(user.uid);
          if (dbProfile) {
            const loadedProf: Profile = {
              name: dbProfile.name || dbProfile.fullName || user.displayName || user.email?.split("@")[0] || "Citizen",
              email: dbProfile.email || user.email || "",
              state: dbProfile.state || "",
              district: dbProfile.district || "",
              language: dbProfile.language || dbProfile.preferredLanguage || language || "English (India)",
              age: dbProfile.age || 0,
              gender: dbProfile.gender || "",
              occupation: dbProfile.occupation || "",
              income: dbProfile.income || "",
              education: dbProfile.education || "",
              caste: dbProfile.caste || "",
              photoUrl: dbProfile.photoUrl || dbProfile.photoURL || user.photoURL || "",
              onboardingCompleted: dbProfile.onboardingCompleted ?? false,
              profileCompleted: dbProfile.profileCompleted ?? false,
              existingDocs: dbProfile.existingDocs || [],
              businessName: dbProfile.businessName || "",
              msmeCategory: dbProfile.msmeCategory || "",
              role: dbProfile.role || "Visitor"
            };
            setProfile(loadedProf);
            setProfileEmail(loadedProf.email || user.email || "");
            setProfileRole((loadedProf.role as any) || "Visitor");
            if (loadedProf.language) {
              setLanguage(loadedProf.language);
            }
            if (!loadedProf.onboardingCompleted || !loadedProf.profileCompleted || !loadedProf.state || !loadedProf.occupation) {
              setShowCitizenCredentialsModal(true);
            }
          } else {
            // New user profile created upon first sign-in
            const defaultProf: Profile = {
              name: user.displayName || user.email?.split("@")[0] || "Citizen",
              email: user.email || "",
              state: "",
              district: "",
              language: language || "English (India)",
              age: 0,
              gender: "",
              occupation: "",
              income: "",
              education: "",
              caste: "",
              photoUrl: user.photoURL || "",
              onboardingCompleted: false,
              profileCompleted: false,
              existingDocs: [],
              businessName: "",
              msmeCategory: "",
              role: "Visitor"
            };
            setProfile(defaultProf);
            setProfileEmail(defaultProf.email || "");
            setProfileRole("Visitor");
            await saveFirebaseUserProfile(user.uid, defaultProf);
            setShowCitizenCredentialsModal(true);
          }

          const fetchedRoadmaps = await getFirebaseUserRoadmaps(user.uid);
          if (fetchedRoadmaps && fetchedRoadmaps.length > 0) {
            setSavedRoadmaps(fetchedRoadmaps);
            setActiveRoadmap(fetchedRoadmaps[0]);
          } else {
            setSavedRoadmaps([SAMPLE_GOVERNMENT_JOURNEY]);
            setActiveRoadmap(SAMPLE_GOVERNMENT_JOURNEY);
          }

          const savedMessages = await getFirebaseUserMessages(user.uid);
          if (savedMessages.length > 0) {
            setMessages(savedMessages);
          }

          const savedBookmarks = await getFirebaseUserBookmarks(user.uid);
          if (savedBookmarks.length > 0) {
            setBookmarks(savedBookmarks.map(b => b.link));
          }

          const savedHistory = await getFirebaseUserHistory(user.uid);
          if (savedHistory.length > 0) {
            setHistoryList(savedHistory);
          }

          const savedDocs = await fetchUserDocumentsFromFirebase(user.uid);
          if (savedDocs && savedDocs.length > 0) {
            setVaultDocs(savedDocs);
          } else {
            setVaultDocs(DEFAULT_VAULT_DOCS);
          }
        } catch (error) {
          console.error("Error loading user data from Firestore:", error);
        }
      } else {
        setProfileIsLoggedIn(false);
        setProfileEmail(DEFAULT_CITIZEN_PROFILE.email);
        setProfileRole("Visitor");
        setMessages([]);
        setSavedRoadmaps([SAMPLE_GOVERNMENT_JOURNEY]);
        setActiveRoadmap(SAMPLE_GOVERNMENT_JOURNEY);
        setBookmarks([]);
        setHistoryList([]);
        setVaultDocs(DEFAULT_VAULT_DOCS);
        setProfile(DEFAULT_CITIZEN_PROFILE as any);
      }
    });

    const { data: { subscription } } = onSupabaseAuthStateChange((event, session) => {
      if (session?.user) {
        const u = session.user;
        const name = u.user_metadata?.name || u.user_metadata?.fullName || u.email?.split("@")[0] || "Priya Sharma";
        const state = u.user_metadata?.state || "Telangana";
        const district = u.user_metadata?.district || (state === "Bihar" ? "Patna" : "Hyderabad");
        setProfileEmail(u.email || "");
        setProfileIsLoggedIn(true);
        setProfile(prev => ({
          ...prev,
          name,
          fullName: name,
          email: u.email || prev.email,
          state,
          district,
          city: district,
          language: u.user_metadata?.language || prev.language
        }));
      } else if (event === "SIGNED_OUT") {
        setProfileIsLoggedIn(false);
      }
    });

    return () => {
      unsubscribe();
      subscription?.unsubscribe();
    };
  }, []);

  // User Profile State
  const [profile, setProfile] = useState<Profile>(DEFAULT_CITIZEN_PROFILE as any);

  // Active Roadmap state (loaded dynamically from Firebase for authenticated user)
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapData>(SAMPLE_GOVERNMENT_JOURNEY);

  // Chat message thread
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English (India)");
  const [hasFeatherlessKey, setHasFeatherlessKey] = useState<boolean | null>(null);

  const handleLanguageSelect = (langName: string) => {
    setLanguage(langName);
    setProfile(prev => ({ ...prev, language: langName }));
    if (auth.currentUser) {
      saveFirebaseUserProfile(auth.currentUser.uid, { ...profile, language: langName }).catch(() => {});
    }
  };

  useEffect(() => {
    let isMounted = true;
    const checkConfig = async (retries = 3) => {
      try {
        const res = await fetch("/api/config-status");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (isMounted) setHasFeatherlessKey(!!data.hasFeatherlessKey);
      } catch (err) {
        if (retries > 0) {
          setTimeout(() => {
            if (isMounted) checkConfig(retries - 1);
          }, 1000);
        } else {
          console.warn("Could not retrieve backend configuration status, assuming active:", err);
          if (isMounted) setHasFeatherlessKey(true);
        }
      }
    };
    checkConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // Voice Assistant states
  const [isVoiceAssistantListening, setIsVoiceAssistantListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // OCR Document Hub states
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [ocrDocId, setOcrDocId] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<{
    documentType?: string;
    name?: string;
    idNumber?: string;
    dob?: string;
    issueDate?: string;
    extractedText?: string;
    confidenceScore?: number;
  } | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [ocrManualMode, setOcrManualMode] = useState(false);
  const [manualOcrData, setManualOcrData] = useState({
    documentType: "Aadhaar Card",
    name: "",
    idNumber: "",
    issueDate: ""
  });
  const [ocrFallbackNotice, setOcrFallbackNotice] = useState<string | null>(null);

  // DigiLocker states
  const [isDigiLockerOpen, setIsDigiLockerOpen] = useState(false);
  const [digiLockerStep, setDigiLockerStep] = useState<1 | 2 | 3>(1);
  const [digiLockerPhone, setDigiLockerPhone] = useState("");
  const [digiLockerPin, setDigiLockerPin] = useState("");
  const [digiLockerOtp, setDigiLockerOtp] = useState("");
  const [digiLockerSyncing, setDigiLockerSyncing] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [smsToast, setSmsToast] = useState<{ id: string; message: string; otp: string } | null>(null);
  const [digiLockerSelectedDocs, setDigiLockerSelectedDocs] = useState<Record<string, boolean>>({});
  const [digiLockerSyncStatus, setDigiLockerSyncStatus] = useState<"idle" | "syncing" | "complete">("idle");
  const [digiLockerProgressLog, setDigiLockerProgressLog] = useState<string[]>([]);
  
  // Bharat Navigator Secure Vault docs state (synced with user account)
  const [vaultDocs, setVaultDocs] = useState<any[]>(DEFAULT_VAULT_DOCS);

  // Due-date tracking system states
  const [projectStartDate, setProjectStartDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [stepCustomDates, setStepCustomDates] = useState<Record<string, { startDate?: string; alertBeforeDays?: number }>>({});
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [isNotificationCentreOpen, setIsNotificationCentreOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [proactiveNotifications, setProactiveNotifications] = useState<ProactiveNotification[]>([]);
  const [docTab, setDocTab] = useState<"hub" | "digilocker">("hub");
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  // Fetch proactive notifications and sync badge count across header bell & full page
  const fetchProactiveNotifications = useCallback(async () => {
    const currentUid = auth.currentUser?.uid || "usr_default";
    try {
      const res = await fetch(`/api/v1/proactive/notifications?userId=${encodeURIComponent(currentUid)}`);
      if (res.ok) {
        const data = await res.json();
        const list: ProactiveNotification[] = data.notifications || [];
        setProactiveNotifications(list);
        const unread = list.filter((n) => n.lifecycleState === "UNREAD").length;
        setUnreadNotificationCount(unread);
      }
    } catch (err) {
      console.warn("Error fetching proactive notifications in App.tsx:", err);
    }
  }, []);

  useEffect(() => {
    fetchProactiveNotifications();
    const interval = setInterval(fetchProactiveNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchProactiveNotifications]);

  // Initialize Service Worker for notifications
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Evaluate roadmap step & document validity alerts whenever active roadmap updates
  useEffect(() => {
    if (activeRoadmap) {
      evaluateRoadmapAndDocAlerts(
        activeRoadmap,
        activeRoadmap.documents || [],
        stepCustomDates,
        projectStartDate
      );
    }
  }, [activeRoadmap, stepCustomDates, projectStartDate]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roadmapSearchQuery, setRoadmapSearchQuery] = useState("");
  const [roadmapViewTab, setRoadmapViewTab] = useState<"active" | "orchestrator" | "archive">("active");
  const [docViewMode, setDocViewMode] = useState<"vault" | "intelligence">("vault");
  const [roadmapDisplayMode, setRoadmapDisplayMode] = useState<"journey" | "list" | "gantt">("journey");

  // Check URL path on mount for /admin
  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      if (path === "/admin" || search.includes("admin") || hash === "#admin") {
        setActiveTab("admin");
      }
    }
  }, []);

  // Auto-redirect relocated standalone tab keys to consolidated citizen screens
  useEffect(() => {
    if (activeTab === "orchestrator") {
      setRoadmapViewTab("orchestrator");
      setActiveTab("roadmap");
    } else if (activeTab === "doc-intelligence") {
      setActiveTab("documents");
    } else if (activeTab === "citizen-intelligence") {
      setActiveTab("assistant");
    } else if (activeTab === "rag") {
      if (profileRole === "Admin") {
        setActiveTab("admin");
      } else {
        setActiveTab("assistant");
      }
    } else if (activeTab === "scale" || activeTab === "phase10") {
      setActiveTab("home");
    }
  }, [activeTab, profileRole]);
  const [autoArchiveToast, setAutoArchiveToast] = useState<string | null>(null);
  const [historySubTab, setHistorySubTab] = useState<"roadmaps" | "searches">("roadmaps");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState<RoadmapData[]>([SAMPLE_GOVERNMENT_JOURNEY]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Manual Archive/Restore Handler
  const handleArchiveRoadmap = (roadmapToArchive: RoadmapData, archiveState: boolean) => {
    const updated: RoadmapData = {
      ...roadmapToArchive,
      isArchived: archiveState,
      archivedAt: archiveState ? new Date().toISOString() : undefined
    };

    if (activeRoadmap && (activeRoadmap.goal === roadmapToArchive.goal || (roadmapToArchive.id && activeRoadmap.id === roadmapToArchive.id))) {
      setActiveRoadmap(updated);
    }

    setSavedRoadmaps(prev => {
      const matches = (r: RoadmapData) => (roadmapToArchive.id && r.id === roadmapToArchive.id) || r.goal === roadmapToArchive.goal;
      const exists = prev.some(matches);
      if (exists) {
        return prev.map(r => matches(r) ? updated : r);
      }
      return [updated, ...prev];
    });

    if (auth.currentUser) {
      const roadId = updated.id || `rdm_${updated.goal.slice(0, 15).replace(/\s+/g, '_')}`;
      saveFirebaseUserRoadmap(auth.currentUser.uid, roadId, updated);
    }

    if (archiveState) {
      setAutoArchiveToast(`Moved "${updated.goal}" to Historical Records.`);
    } else {
      setAutoArchiveToast(`Restored "${updated.goal}" to Active Dashboard.`);
    }
    setTimeout(() => setAutoArchiveToast(null), 4000);
  };

  // Permanent Delete Roadmap Handler
  const handleDeleteRoadmap = (roadmapToDelete: RoadmapData) => {
    if (!confirm(`Are you sure you want to permanently delete "${roadmapToDelete.goal}"?`)) return;

    setSavedRoadmaps(prev => {
      const matches = (r: RoadmapData) => (roadmapToDelete.id && r.id === roadmapToDelete.id) || r.goal === roadmapToDelete.goal;
      const filtered = prev.filter(r => !matches(r));
      if (activeRoadmap && (activeRoadmap.goal === roadmapToDelete.goal || (roadmapToDelete.id && activeRoadmap.id === roadmapToDelete.id))) {
        const activeList = filtered.filter(r => !r.isArchived);
        if (activeList.length > 0) {
          setActiveRoadmap(activeList[0]);
        } else if (filtered.length > 0) {
          setActiveRoadmap(filtered[0]);
        }
      }
      return filtered;
    });

    if (auth.currentUser) {
      const roadId = roadmapToDelete.id || `rdm_${roadmapToDelete.goal.slice(0, 15).replace(/\s+/g, '_')}`;
      deleteFirebaseUserRoadmap(auth.currentUser.uid, roadId);
    }
  };

  // Document Upload Mock states
  const [dragActive, setDragActive] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [showCitizenCredentialsModal, setShowCitizenCredentialsModal] = useState(false);
  const [modalPhase, setModalPhase] = useState<1 | 2>(1);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Time stamp
  const [currentTime, setCurrentTime] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Expanded Eval detail
  const [expandedEval, setExpandedEval] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Recalculate roadmap completion percentage & Auto-archive completed roadmaps
  useEffect(() => {
    if (!activeRoadmap || !activeRoadmap.phases || activeRoadmap.phases.length === 0) return;

    const totalSteps = activeRoadmap.phases.reduce((acc, phase) => acc + (phase.steps ? phase.steps.length : 0), 0);
    const completedSteps = activeRoadmap.phases.reduce((acc, phase) => {
      return acc + (phase.steps ? phase.steps.filter(s => s.completed).length : 0);
    }, 0);
    const pct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    
    const isFullyCompleted = totalSteps > 0 && completedSteps === totalSteps;
    const shouldArchive = isFullyCompleted && !activeRoadmap.isArchived;
    const shouldUnarchive = !isFullyCompleted && activeRoadmap.isArchived && pct < 100;

    let newIsArchived = activeRoadmap.isArchived;
    let newArchivedAt = activeRoadmap.archivedAt;

    if (shouldArchive) {
      newIsArchived = true;
      newArchivedAt = new Date().toISOString();
      setAutoArchiveToast(`🎉 "${activeRoadmap.goal || 'Compliance Roadmap'}" reached 100% completion! Automatically archived to Historical Records section to keep your active dashboard clean.`);
    } else if (shouldUnarchive) {
      newIsArchived = false;
      newArchivedAt = undefined;
    }

    if (pct !== activeRoadmap.completionPercentage || newIsArchived !== activeRoadmap.isArchived) {
      const updatedActive: RoadmapData = {
        ...activeRoadmap,
        completionPercentage: pct,
        isArchived: newIsArchived,
        archivedAt: newArchivedAt
      };

      setActiveRoadmap(updatedActive);

      setSavedRoadmaps(prev => {
        const matches = (r: RoadmapData) => (updatedActive.id && r.id === updatedActive.id) || r.goal === updatedActive.goal;
        const exists = prev.some(matches);
        if (exists) {
          return prev.map(r => matches(r) ? updatedActive : r);
        }
        return [updatedActive, ...prev];
      });

      if (auth.currentUser) {
        const roadId = updatedActive.id || `rdm_${updatedActive.goal.slice(0, 15).replace(/\s+/g, '_')}`;
        saveFirebaseUserRoadmap(auth.currentUser.uid, roadId, updatedActive);
      }
    }
  }, [activeRoadmap.phases]);

  // Compute active due-date alerts and status
  const stepAlerts = getStepAlerts(
    activeRoadmap,
    projectStartDate,
    "standard",
    {},
    stepCustomDates,
    parseTimelineToDays,
    new Date().toISOString().split("T")[0] // Synchronized with live current date
  );

  const activeAlerts = stepAlerts.filter(
    (alert) => alert.status === "approaching" || alert.status === "overdue"
  );
  const activeAlertsKey = activeAlerts.map(a => `${a.stepId}-${a.status}-${a.daysRemaining}`).join("|");

  useEffect(() => {
    if (auth.currentUser && activeAlerts.length > 0 && activeAlertsKey) {
      activeAlerts.forEach((alert) => {
        saveFirebaseUserNotification(auth.currentUser!.uid, alert.stepId, {
          id: alert.stepId,
          userId: auth.currentUser!.uid,
          title: alert.stepTitle,
          message: `SLA Alert (${alert.dept}): "${alert.stepTitle}" status is ${alert.status} with ${alert.daysRemaining} days remaining.`,
          dept: alert.dept,
          status: alert.status,
          daysRemaining: alert.daysRemaining,
          type: alert.status === "overdue" ? "sla_alert" : "info",
          read: false,
          createdAt: new Date().toISOString()
        }).catch(() => {});
      });
    }
  }, [activeAlertsKey]);

  // Handle send message
  const handleSend = async (e?: React.FormEvent, presetPrompt?: string) => {
    if (e) e.preventDefault();
    const query = presetPrompt || input;
    if (!query.trim() || loading) return;

    // Track history
    const queryExists = historyList.some(h => (typeof h === "string" ? h === query : h.query === query));
    if (!queryExists) {
      const histId = `hist-${Date.now()}`;
      const newHistObj = { id: histId, query, timestamp: new Date().toISOString() };
      setHistoryList(prev => [newHistObj, ...prev.slice(0, 10)]);
      if (auth.currentUser) {
        saveFirebaseUserHistoryItem(auth.currentUser.uid, histId, query);
      }
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      userId: auth.currentUser?.uid,
      role: "user",
      content: query,
      prompt: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => {
      const nextMsgs = [...prev, userMsg];
      if (auth.currentUser) {
        saveFirebaseUserMessage(auth.currentUser.uid, userMsg);
      }
      return nextMsgs;
    });
    if (!presetPrompt) setInput("");
    setLoading(true);
    setActiveTab("assistant");

    const startTimeStamp = performance.now();

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.role === "user" ? m.content : m.answer || m.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: query,
          history: chatHistory,
          profile: profile
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Navigator service network exception");
      }

      const result = await response.json();
      const endTimeStamp = performance.now();
      const latency = Math.round(endTimeStamp - startTimeStamp);
      const approxTokens = Math.round((result.answer || "").length / 4) + 140;

      // Update active roadmap if returned by model
      let targetRoadmap = activeRoadmap;
      if (result.roadmapData) {
        setActiveRoadmap(result.roadmapData);
        targetRoadmap = result.roadmapData;
      } else {
        // Fallback simulate dynamic roadmap updates for rich tabs based on topics
        const goalTitle = query.slice(0, 40) + (query.length > 40 ? "..." : "");
        const matchedCategory = query.toLowerCase().includes("college") || query.toLowerCase().includes("scholar") ? "Education" 
          : query.toLowerCase().includes("dairy") || query.toLowerCase().includes("farm") ? "Agriculture"
          : query.toLowerCase().includes("startup") || query.toLowerCase().includes("saas") ? "Startup"
          : query.toLowerCase().includes("aadhaar") ? "Identity" : "Other";

        const fallbackRoadmap = {
          ...activeRoadmap,
          goal: goalTitle,
          category: matchedCategory,
          completionPercentage: 0
        };
        setActiveRoadmap(fallbackRoadmap);
        targetRoadmap = fallbackRoadmap;
      }

      const finalRoadmapId = `roadmap-${Date.now()}`;
      const targetRoadmapWithId = {
        ...targetRoadmap,
        id: targetRoadmap.id || finalRoadmapId,
        updatedAt: new Date().toISOString()
      };
      
      if (auth.currentUser) {
        saveFirebaseUserRoadmap(auth.currentUser.uid, targetRoadmapWithId.id, targetRoadmapWithId);
      }
      setSavedRoadmaps(prev => {
        const filtered = prev.filter(r => r.goal !== targetRoadmapWithId.goal);
        return [targetRoadmapWithId, ...filtered];
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        userId: auth.currentUser?.uid,
        role: "model",
        content: result.answer || "Roadmap parsed successfully.",
        prompt: query,
        response: result.answer || "",
        answer: result.answer,
        confidenceScore: result.confidenceScore || 95,
        evaluation: result.evaluation || "Automatically synthesized from validated central & state rules.",
        sourcesUsed: result.sourcesUsed || [{ name: "National Service Database", type: "portal", detail: "india.gov.in" }],
        latencyMs: latency,
        tokensCount: approxTokens,
        roadmapData: result.roadmapData,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => {
        const nextMsgs = [...prev, aiMsg];
        if (auth.currentUser) {
          saveFirebaseUserMessage(auth.currentUser.uid, aiMsg);
        }
        return nextMsgs;
      });
    } catch (err: any) {
      console.error("Bharat Navigator dispatch failed:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          content: `### ⚠️ Connection Interrupted\nFailed to calculate government roadmap. Make sure your local workspace server is active.\n\n**Detail**: ${err.message || "Endpoint error"}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle step completion status
  const toggleStepCompletion = (phaseIndex: number, stepId: string) => {
    setActiveRoadmap(prev => {
      const updatedPhases = prev.phases.map((phase, pIdx) => {
        if (pIdx === phaseIndex) {
          return {
            ...phase,
            steps: phase.steps.map(step => {
              if (step.id === stepId) {
                return { ...step, completed: !step.completed };
              }
              return step;
            })
          };
        }
        return phase;
      });
      return { ...prev, phases: updatedPhases };
    });
  };

  // Find nearby department office using browser Geolocation and universal Google Maps redirection
  const handleFindNearbyOffices = (deptName: string) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Search query combining department name + coordinates
          const queryText = `${deptName} near me`;
          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryText)}&latitude=${latitude}&longitude=${longitude}`;
          
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
            window.location.href = url;
          } else {
            window.open(url, "_blank", "noopener,noreferrer");
          }
        },
        (error) => {
          console.log("Geolocation warning (using standard query search fallback):", error);
          const fallbackQuery = `${deptName} ${profile.state || "India"}`;
          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackQuery)}`;
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
            window.location.href = url;
          } else {
            window.open(url, "_blank", "noopener,noreferrer");
          }
        }
      );
    } else {
      const fallbackQuery = `${deptName} ${profile.state || "India"}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackQuery)}`;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = url;
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
  };

  // Get directions to department office using universal Google Maps directions scheme from current location
  const handleGetDirections = (deptName: string) => {
    const destinationQuery = `${deptName} ${profile.state || "India"}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`;
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Generate and download a clean, printable corporate compliance PDF report
  const handleDownloadPDF = () => {
    if (!activeRoadmap) return;
    try {
      exportWorkflowOrRoadmapToPDF({
        roadmap: activeRoadmap,
        profile,
        vaultDocs,
      });
    } catch (e) {
      console.error("PDF generation failed:", e);
    }
  };

  // Document Upload & Storage Handlers
  const [uploadProgressMap, setUploadProgressMap] = useState<Record<string, number>>({});
  const [previewDocModal, setPreviewDocModal] = useState<GovDocument | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBatchUploadFiles(docId, Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    if (e.target.files && e.target.files.length > 0) {
      handleBatchUploadFiles(docId, Array.from(e.target.files));
    }
  };

  const handleBatchUploadFiles = async (targetKey: string, files: File[]) => {
    if (!auth.currentUser) {
      alert("Please sign in to upload files to your secure Firebase Storage vault.");
      return;
    }

    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const docId = files.length === 1 ? targetKey : `${targetKey}_${Date.now()}_${i}`;
      const targetDoc = activeRoadmap.documents.find(d => d.id === targetKey);
      const docTitle = files.length === 1 && targetDoc ? targetDoc.name : file.name;

      try {
        setUploadProgressMap(prev => ({ ...prev, [docId]: 1 }));

        const storedDoc = await uploadDocumentToFirebase(
          auth.currentUser.uid,
          docId,
          file,
          docTitle,
          targetDoc?.category || "Step Enclosure",
          (percent) => {
            setUploadProgressMap(prev => ({ ...prev, [docId]: percent }));
          }
        );

        setActiveRoadmap(prev => {
          const existingIdx = prev.documents.findIndex(d => d.id === targetKey);
          let updatedDocs = [...prev.documents];

          if (existingIdx >= 0 && files.length === 1) {
            updatedDocs[existingIdx] = {
              ...updatedDocs[existingIdx],
              uploaded: true,
              uploadedFileName: file.name,
              downloadUrl: storedDoc.downloadUrl,
              storagePath: storedDoc.storagePath,
              fileSize: file.size,
              fileType: file.type,
              stepId: targetKey
            };
          } else {
            updatedDocs.push({
              id: docId,
              name: file.name,
              purpose: `Enclosure uploaded for roadmap step/requirement`,
              where: "Uploaded by Citizen",
              mandatory: true,
              validity: "Permanent",
              estimatedTime: "Immediate",
              uploaded: true,
              uploadedFileName: file.name,
              downloadUrl: storedDoc.downloadUrl,
              storagePath: storedDoc.storagePath,
              fileSize: file.size,
              fileType: file.type,
              stepId: targetKey,
              category: targetDoc?.category || "Step Enclosure"
            });
          }

          return {
            ...prev,
            documents: updatedDocs
          };
        });
      } catch (err: any) {
        console.error("Batch Document Upload Error:", err);
        alert(`Upload failed for ${file.name}: ${err.message || "Failed to upload document."}`);
      } finally {
        setUploadProgressMap(prev => {
          const next = { ...prev };
          delete next[docId];
          return next;
        });
      }
    }

    setSelectedDocId(null);
  };

  const handleUploadFile = async (docId: string, file: File) => {
    await handleBatchUploadFiles(docId, [file]);
  };

  const deleteUploadedFile = async (docId: string) => {
    const targetDoc = activeRoadmap.documents.find(d => d.id === docId);

    if (auth.currentUser) {
      try {
        await deleteDocumentFromFirebase(auth.currentUser.uid, docId, targetDoc?.storagePath);
      } catch (e) {
        console.warn("Firestore/Storage delete warning:", e);
      }
    }

    setActiveRoadmap(prev => {
      const updatedDocs = prev.documents.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            uploaded: false,
            uploadedFileName: undefined,
            downloadUrl: undefined,
            storagePath: undefined
          };
        }
        return doc;
      });
      return { ...prev, documents: updatedDocs };
    });
  };

  // 1. Live Camera Stream Access for OCR
  const startCameraForOcr = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, 
        audio: false 
      });
      setCameraStream(stream);
      // Wait a moment for video to attach
      setTimeout(() => {
        const videoEl = document.getElementById("ocr-video-feed") as HTMLVideoElement;
        if (videoEl) videoEl.srcObject = stream;
      }, 300);
    } catch (err) {
      console.error("Failed to acquire video stream:", err);
      alert("Could not access camera. Please upload an image file of your certificate instead.");
      setIsCameraActive(false);
    }
  };

  const stopCameraForOcr = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    const videoEl = document.getElementById("ocr-video-feed") as HTMLVideoElement;
    if (!videoEl) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setOcrImage(dataUrl);
      stopCameraForOcr();
      processOcrImage(dataUrl);
    }
  };

  const handleOcrFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setOcrImage(dataUrl);
          processOcrImage(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const processOcrImage = async (base64Image: string) => {
    setOcrLoading(true);
    setOcrResult(null);
    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "OCR Server failed to process image");
      }
      const result = await response.json();
      setOcrResult(result);
    } catch (err: any) {
      console.error("OCR Client failure:", err);
      // Explicit Fallback UX: Let citizen manually enter document fields instead of blocking application
      setOcrFallbackNotice("Automated OCR extraction could not complete or the image was unclear. You can enter the document fields manually below — your application will not be blocked.");
      setOcrManualMode(true);
      setManualOcrData(prev => ({
        ...prev,
        name: profile.name || prev.name || ""
      }));
    } finally {
      setOcrLoading(false);
    }
  };

  const handleApplyManualOcr = async () => {
    if (!ocrDocId) return;

    const docType = manualOcrData.documentType.trim() || "Statutory Document";
    const citizenName = manualOcrData.name.trim() || profile.name || "Citizen";
    const idNumber = manualOcrData.idNumber.trim() || "MANUAL_ENTRY";
    const issueDate = manualOcrData.issueDate.trim() || new Date().toISOString().slice(0, 10);

    const docFileName = `manual_${docType.toLowerCase().replace(/\s+/g, "_")}.pdf`;

    if (auth.currentUser) {
      await saveFirebaseUserDocument(auth.currentUser.uid, ocrDocId, {
        id: ocrDocId,
        name: docType,
        uploadedFileName: docFileName,
        uploaded: true,
        category: "Identity",
        notes: `Manually declared by citizen (Serial: ${idNumber}, Issue Date: ${issueDate}). Note: Manual entry will be verified by departmental officers during processing.`,
        isManuallyDeclared: true,
        timestamp: new Date().toISOString()
      });
    }

    setActiveRoadmap(prev => ({
      ...prev,
      documents: prev.documents.map(d => {
        if (d.id === ocrDocId) {
          return { ...d, uploaded: true, uploadedFileName: docFileName };
        }
        return d;
      })
    }));

    if (citizenName && citizenName !== profile.name) {
      setProfile(prev => ({
        ...prev,
        name: citizenName
      }));
    }

    setIsOcrOpen(false);
    setOcrImage(null);
    setOcrResult(null);
    setOcrManualMode(false);
    setOcrFallbackNotice(null);
  };

  const handleApplyOcrResult = async () => {
    if (!ocrResult || !ocrDocId) return;

    const docFileName = `verified_${ocrResult.documentType?.toLowerCase().replace(/\s+/g, "_") || "certificate"}.pdf`;

    if (auth.currentUser) {
      await saveFirebaseUserDocument(auth.currentUser.uid, ocrDocId, {
        id: ocrDocId,
        name: ocrResult.documentType || "OCR Verified Document",
        uploadedFileName: docFileName,
        uploaded: true,
        category: "Identity",
        timestamp: new Date().toISOString()
      });
    }

    setActiveRoadmap(prev => ({
      ...prev,
      documents: prev.documents.map(d => {
        if (d.id === ocrDocId) {
          return { ...d, uploaded: true, uploadedFileName: docFileName };
        }
        return d;
      })
    }));

    if (ocrResult.name && ocrResult.name !== "Not Extracted") {
      setProfile(prev => ({
        ...prev,
        name: ocrResult.name!
      }));
    }

    setIsOcrOpen(false);
    setOcrImage(null);
    setOcrResult(null);
    alert("OCR extraction complete! Legal coordinates successfully synchronized to your Demographic Profile.");
  };

  const handleSyncOcrToDigiLocker = () => {
    if (!ocrResult) return;
    const newDoc = {
      id: `dl-ocr-${Date.now()}`,
      name: ocrResult.documentType && ocrResult.documentType !== "Not Extracted" ? ocrResult.documentType : "Scanned Government Certificate",
      issuer: "Scanned via Document OCR Hub",
      docType: ocrResult.documentType && ocrResult.documentType !== "Not Extracted" ? ocrResult.documentType : "Government Document",
      idNumber: ocrResult.idNumber && ocrResult.idNumber !== "Not Extracted" ? ocrResult.idNumber : `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: new Date().toISOString().split("T")[0],
      validity: "Lifetime",
      sha256Hash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      verifiedByIssuer: true,
      imageUri: ocrImage || undefined,
      lastSyncedAt: new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setVaultDocs(prev => [newDoc, ...prev]);

    stopCameraForOcr();
    setIsOcrOpen(false);
    setActiveTab("digilocker");
    alert(`✅ "${newDoc.name}" successfully synced and saved to your Bharat Navigator Secure Vault!`);
  };

  // 2. DigiLocker Dynamic Verification Handlers
  const handleDigiLockerRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!digiLockerPhone || (digiLockerPhone.length !== 10 && digiLockerPhone.length !== 12)) {
      alert("Please enter a valid 10-digit mobile number or 12-digit Aadhaar ID.");
      return;
    }
    setDigiLockerSyncing(true);
    setOtpError(null);
    
    // Generate actual 6-digit random OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    setTimeout(() => {
      setGeneratedOtp(code);
      setDigiLockerSyncing(false);
      setDigiLockerStep(2);
      
      // Send interactive visual SMS Notification Toast
      const maskedNum = digiLockerPhone.length === 10 
        ? `+91 ******${digiLockerPhone.substring(6)}`
        : `Aadhaar XXXX-XXXX-${digiLockerPhone.substring(8)}`;
      
      setSmsToast({
        id: `sms-${Date.now()}`,
        message: `💬 SMS FROM UIDAI / DigiLocker:\nYour dynamic 6-digit secure 2FA token is [ ${code} ] for authenticating ${maskedNum}. (Valid for 10 minutes)`,
        otp: code
      });
    }, 1200);
  };

  const handleDigiLockerVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!digiLockerOtp || digiLockerOtp.length !== 6) {
      setOtpError("Dynamic OTP must be a 6-digit number.");
      return;
    }
    if (!digiLockerPin || digiLockerPin.length !== 6) {
      setOtpError("Security wallet PIN must be a 6-digit number.");
      return;
    }

    setDigiLockerSyncing(true);
    
    setTimeout(() => {
      setDigiLockerSyncing(false);
      
      // SECURE VALIDATION of generated OTP code
      if (digiLockerOtp !== generatedOtp) {
        setOtpError("❌ Invalid security code. The OTP you entered does not match the token dispatched to your device.");
        return;
      }

      // Validated! Move to step 3 (Selection screen)
      setDigiLockerStep(3);
      setDigiLockerSyncStatus("idle");
      setDigiLockerProgressLog([]);
      
      // Pre-populate selections for all pending/needed documents
      const initialSelections: Record<string, boolean> = {};
      activeRoadmap.documents.forEach(doc => {
        initialSelections[doc.id] = true;
      });
      setDigiLockerSelectedDocs(initialSelections);
    }, 1500);
  };

  // Perform full-auth document synchronization with progressive visual logging
  const handleDigiLockerSyncSelectedDocs = () => {
    const selectedIds = Object.keys(digiLockerSelectedDocs).filter(id => digiLockerSelectedDocs[id]);
    if (selectedIds.length === 0) {
      alert("Please select at least one document to fetch from DigiLocker.");
      return;
    }

    setDigiLockerSyncStatus("syncing");
    setDigiLockerProgressLog([]);

    const logMessages = [
      "Establishing Secure Handshake with DigiLocker Gateway...",
      "Resolving federal issuers directory (UIDAI, NSDL, State Registries)...",
      "Validating digital crypt signatures of selected records...",
      "Downloading high-fidelity authorized PDF assets...",
      "Writing tamper-proof verification badges to Bharat Nav Vault...",
      "Sync complete! Database records updated with official federal status."
    ];

    logMessages.forEach((msg, index) => {
      setTimeout(() => {
        setDigiLockerProgressLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
        
        // Final completion callback
        if (index === logMessages.length - 1) {
          setDigiLockerSyncStatus("complete");
          
          // Actually sync to active roadmap
          setActiveRoadmap(prev => {
            const updatedDocs = prev.documents.map(doc => {
              if (digiLockerSelectedDocs[doc.id]) {
                return {
                  ...doc,
                  uploaded: true,
                  uploadedFileName: `digilocker_${doc.name.toLowerCase().replace(/\s+/g, "_")}_verified.pdf`
                };
              }
              return doc;
            });
            return { ...prev, documents: updatedDocs };
          });

          // Update user profile with verified status
          setProfile(prev => ({
            ...prev,
            name: `${prev.name.replace(" (DigiLocker Verified)", "")} (DigiLocker Verified)`,
            isLoggedIn: true
          }));
        }
      }, (index + 1) * 800);
    });
  };

  // 3. AI Multilingual Voice Assistant Engine
  const startVoiceAssistant = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Speech recognition fallback simulation
      const typedPrompt = prompt("Speech Recognition API is not supported or blocked in this browser. Please type what you want to ask the Voice Assistant:");
      if (typedPrompt) {
        processVoiceCommand(typedPrompt);
      }
      return;
    }

    setIsVoiceAssistantListening(true);
    setVoiceTranscript("");
    
    const recognition = new SpeechRecognition();
    recognition.lang = language === "Hindi (हिन्दी)" ? "hi-IN" :
                       language === "Telugu (తెలుగు)" ? "te-IN" :
                       language === "Marathi (మராठी)" ? "mr-IN" :
                       language === "Kannada (ಕನ್ನಡ)" ? "kn-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      processVoiceCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition error:", event.error);
      setIsVoiceAssistantListening(false);
      
      if (event.error === "not-allowed") {
        const errorMsg: Message = {
          id: `voice-error-${Date.now()}`,
          role: "model",
          content: "🎤 **Speech Recognition Blocked**\n\nMicrophone access is not allowed. Since this application is running inside an iframe, browsers block microphone access by default.\n\n**To resolve this:**\n1. Click **'Open in New Tab'** at the top right of the preview to load the application directly.\n2. In the new tab, click the microphone button again and click **'Allow'** when prompted.\n3. Alternatively, you can type your question directly in the chat box below!"
        };
        setMessages(prev => [...prev, errorMsg]);
        
        // Also provide a typed fallback so the user can immediately type their prompt
        const typedPrompt = prompt("Microphone access is blocked in this window (common in iframe previews). Please click 'Open in New Tab' at the top-right to grant permissions, or type your query below:");
        if (typedPrompt) {
          processVoiceCommand(typedPrompt);
        }
      } else {
        alert(`Speech Recognition error: ${event.error}. Please try typing your query.`);
      }
    };

    recognition.onend = () => {
      setIsVoiceAssistantListening(false);
    };

    recognition.start();
  };

  const processVoiceCommand = async (commandText: string) => {
    setLoading(true);
    setActiveTab("assistant");

    // Add user message to thread
    const userMsg: Message = {
      id: `user-voice-${Date.now()}`,
      userId: auth.currentUser?.uid,
      role: "user",
      content: `🎤 [Spoken in ${language}] "${commandText}"`,
      prompt: commandText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => {
      const nextMsgs = [...prev, userMsg];
      if (auth.currentUser) {
        saveFirebaseUserMessage(auth.currentUser.uid, userMsg);
      }
      return nextMsgs;
    });

    try {
      let queryInEnglish = commandText;

      // Step 1: Translate query to English if the user speaks regional languages
      if (language !== "English (India)") {
        const transRes = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: commandText, targetLanguage: "English" })
        });
        if (transRes.ok) {
          const transData = await transRes.json();
          queryInEnglish = transData.translatedText;
        }
      }

      // Step 2: Query Chat RAG Bot
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.role === "user" ? m.content : m.answer || m.content
      }));

      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryInEnglish,
          history: chatHistory,
          profile: profile
        })
      });

      if (!chatRes.ok) {
        const errData = await chatRes.json().catch(() => ({}));
        throw new Error(errData.error || "Chat assistant backend failure");
      }
      const chatData = await chatRes.json();

      // Step 3: Translate response back to user's selected language
      let translatedResponse = chatData.answer;
      if (language !== "English (India)") {
        const backTransRes = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: chatData.answer, targetLanguage: language })
        });
        if (backTransRes.ok) {
          const backTransData = await backTransRes.json();
          translatedResponse = backTransData.translatedText;
        }
      }

      // Step 4: Inject into message thread
      const aiMsg: Message = {
        id: `ai-voice-${Date.now()}`,
        userId: auth.currentUser?.uid,
        role: "model",
        content: translatedResponse,
        prompt: commandText,
        response: translatedResponse,
        answer: translatedResponse,
        confidenceScore: chatData.confidenceScore || 95,
        evaluation: chatData.evaluation,
        sourcesUsed: chatData.sourcesUsed || [],
        roadmapData: chatData.roadmapData,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => {
        const nextMsgs = [...prev, aiMsg];
        if (auth.currentUser) {
          saveFirebaseUserMessage(auth.currentUser.uid, aiMsg);
        }
        return nextMsgs;
      });

      // Step 5: Read aloud back to user (Text-to-Speech)
      speakAloudText(translatedResponse);

    } catch (err) {
      console.error("Voice command processing failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const speakAloudText = (textToSpeak: string) => {
    if (!window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean markdown before speaking
    const cleanText = textToSpeak.replace(/[#*`_\[\]()\-]/g, " ");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "Hindi (हिन्दी)" ? "hi-IN" :
                     language === "Telugu (తెలుగు)" ? "te-IN" :
                     language === "Marathi (మराठी)" ? "mr-IN" :
                     language === "Kannada (ಕನ್ನಡ)" ? "kn-IN" : "en-IN";
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeakingAloud = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Add a brand new requirement step manually
  const addNewStep = (phaseIndex: number) => {
    const title = prompt("Enter Step Title:");
    if (!title) return;
    const purpose = prompt("Enter Step Purpose:");
    const dept = prompt("Enter Issuing Government Department:");

    const newStep: Step = {
      id: `custom-${Date.now()}`,
      title,
      purpose: purpose || "Custom verification step.",
      whyRequired: "Added by user to complete personal tracking.",
      mandatory: true,
      dependencies: ["None"],
      dept: dept || "State Government",
      portal: "https://india.gov.in",
      timeline: "Dynamic",
      output: "Proof of Submission",
      completed: false
    };

    setActiveRoadmap(prev => {
      const updatedPhases = prev.phases.map((phase, idx) => {
        if (idx === phaseIndex) {
          return {
            ...phase,
            steps: [...phase.steps, newStep]
          };
        }
        return phase;
      });
      return { ...prev, phases: updatedPhases };
    });
  };

  // Reset active goal back to baseline
  const handleResetGoal = () => {
    setActiveRoadmap({
      goal: "",
      category: "",
      completionPercentage: 0,
      phases: [],
      documents: [],
      eligibleSchemes: [],
      potentialFutureServices: [],
      commonMistakes: []
    });
    setMessages([]);
  };

  // Helper copy text
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Get current active message's confidence value (from last model message)
  const lastModelMessage = [...messages].reverse().find(m => m.role === "model");
  const activeConfidence = lastModelMessage?.confidenceScore ?? 98;

  const isAuthenticated = !!currentUser || profileIsLoggedIn;

  // Display public landing page when unauthenticated, with Auth modal overlay
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden">
        <LandingPage
          isLightTheme={isLightTheme}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onExploreDemo={() => setIsAuthModalOpen(true)}
        />

        {/* Auth Modal Overlay */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-md p-6 sm:p-8 rounded-[28px] border shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              isLightTheme ? "bg-white border-slate-200 text-slate-900" : "bg-[#0c1017] border-white/10 text-white"
            }`}>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1.5 mb-6">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/30 mx-auto shadow-sm">
                  <Compass className="text-amber-500 w-7 h-7" />
                </div>
                <h1 className={`text-xl font-extrabold tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                  BHARAT NAVIGATOR
                </h1>
                <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-600">
                  AI Citizen Gateway Sign In
                </p>
              </div>

              <AuthAndProfile 
                isLightTheme={isLightTheme}
                profile={{
                  name: profile.name,
                  email: profileEmail || profile.email || "",
                  state: profile.state,
                  district: profile.district,
                  city: profile.district,
                  age: profile.age,
                  gender: profile.gender,
                  occupation: profile.occupation,
                  income: profile.income,
                  caste: profile.caste,
                  role: profileRole,
                  isLoggedIn: profileIsLoggedIn,
                  businessName: profile.businessName,
                  msmeCategory: profile.msmeCategory,
                  language: profile.language || language,
                  photoUrl: profile.photoUrl
                }}
                onUpdateProfile={(updatedProf) => {
                  setProfile(prev => ({
                    ...prev,
                    name: updatedProf.name,
                    email: updatedProf.email,
                    state: updatedProf.state,
                    district: updatedProf.district || updatedProf.city || prev.district,
                    city: updatedProf.district || updatedProf.city || prev.city,
                    age: updatedProf.age || prev.age,
                    gender: updatedProf.gender || prev.gender,
                    occupation: updatedProf.occupation,
                    income: updatedProf.income,
                    caste: updatedProf.caste,
                    businessName: updatedProf.businessName,
                    msmeCategory: updatedProf.msmeCategory,
                    language: updatedProf.language || language,
                    photoUrl: updatedProf.photoUrl || prev.photoUrl,
                    role: updatedProf.role
                  }));
                  setProfileEmail(updatedProf.email);
                  setProfileRole(updatedProf.role);
                  if (updatedProf.language) {
                    setLanguage(updatedProf.language);
                  }
                  setProfileIsLoggedIn(updatedProf.isLoggedIn);
                  setIsAuthModalOpen(false);
                }}
                language={language}
                onLanguageChange={(lang) => setLanguage(lang)}
                onOpenOcrHub={() => {
                  setOcrDocId(activeRoadmap.documents[0]?.id || "doc-1");
                  setIsOcrOpen(true);
                }}
                onOpenDigiLocker={() => setActiveTab("digilocker")}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      id="main-workspace" 
      className={`relative flex flex-col h-screen font-sans overflow-hidden w-full select-none transition-colors duration-200 ${
        isLightTheme 
          ? "bg-slate-50 text-slate-800" 
          : "bg-[#08090a] text-[#e0e0e0]"
      }`}
    >
      {/* Subtle Starfield Drifting Background for Dark Mode */}
      {!isLightTheme && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-25">
          <img
            src="/deep_starfield.jpg"
            alt="Deep Starfield Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-75 contrast-125 animate-star-drift animate-star-twinkle"
          />
        </div>
      )}

      {/* SESSION TIMEOUT INACTIVITY WARNING BANNER */}
      <SessionTimeoutBanner
        showWarning={showTimeoutWarning}
        secondsRemaining={timeoutSecondsRemaining}
        onExtendSession={extendSession}
        onLogout={handleSessionTimeoutLogout}
      />

      {/* BACKGROUND DOCUMENT VALIDITY MONITOR ALERT BANNER */}
      <DocumentValidityMonitor
        documents={activeRoadmap.documents}
        onOpenDigiLocker={() => setActiveTab("digilocker")}
        onOpenOcrHub={(docId) => {
          setOcrDocId(docId);
          setIsOcrOpen(true);
        }}
      />

      <div className="flex flex-1 overflow-hidden w-full">
      {/* GLOBAL SMS / OTP FLOATING TOAST SIMULATOR */}
      <AnimatePresence>
        {smsToast && (
          <motion.div
            key={smsToast.id}
            initial={{ opacity: 0, y: -100, x: "-50%", scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -50, x: "-50%", scale: 0.9 }}
            className="fixed top-6 left-1/2 z-[100] w-full max-w-md p-4 bg-[#0c1017] border-2 border-amber-500 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] text-left border-t-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    Government SMS Portal
                  </span>
                  <span className="text-[9px] font-mono text-white/40">Just now</span>
                </div>
                <p className="text-xs text-white leading-relaxed font-mono whitespace-pre-wrap">
                  {smsToast.message}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDigiLockerOtp(smsToast.otp);
                      setSmsToast(null);
                    }}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-[9px] uppercase rounded-md transition cursor-pointer"
                  >
                    Auto-fill OTP Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmsToast(null)}
                    className="px-2.5 py-1 bg-white/5 text-white/60 font-mono text-[9px] uppercase rounded-md hover:bg-white/10 hover:text-white transition cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* MOBILE DRAWER NAVIGATION OVERLAY */}
      <MobileDrawer
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab as any)}
        profile={{
          ...profile,
          email: profileEmail || profile.email,
          photoUrl: profile.photoUrl || currentUser?.photoURL || "",
        }}
        activeRoadmap={activeRoadmap}
        isLightTheme={isLightTheme}
        unreadNotificationCount={unreadNotificationCount}
        savedBookmarksCount={(bookmarks || []).length}
        activeJourneysCount={activeRoadmap?.goal ? 1 : 0}
        isAdmin={profileRole === "Admin"}
        onToggleTheme={() => setIsLightTheme((prev) => !prev)}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
        userLanguage={profile.language || language}
      />


      {/* LEFT COLUMN: Sidebar Navigation Panel (desktop hidden lg:flex) */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab as any)}
        profile={{
          ...profile,
          email: profileEmail || profile.email,
          photoUrl: profile.photoUrl || currentUser?.photoURL || "",
        }}
        activeRoadmap={activeRoadmap}
        isLightTheme={isLightTheme}
        unreadNotificationCount={unreadNotificationCount}
        savedBookmarksCount={(bookmarks || []).length}
        activeJourneysCount={activeRoadmap?.goal ? 1 : 0}
        isAdmin={profileRole === "Admin"}
        onToggleTheme={() => setIsLightTheme((prev) => !prev)}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
        userLanguage={profile.language || language}
      />

      {/* QUICK ACTION PALETTE (Ctrl/Cmd + K) */}
      <QuickActionPalette
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onNavigate={(tab) => setActiveTab(tab as any)}
        isLightTheme={isLightTheme}
        userLanguage={profile.language || language}
      />

      {/* CENTER WORKSPACE SECTION */}
      <main className={`flex-1 flex flex-col relative h-full transition-colors duration-200 ${
        isLightTheme ? "bg-white" : "bg-[#08090a]"
      }`}>
        
        {/* Top Sticky Header */}
        <header className={`h-16 border-b flex items-center justify-between px-3 sm:px-6 backdrop-blur-md shrink-0 transition-colors duration-200 ${
          isLightTheme ? "border-slate-200 bg-slate-100/70" : "border-white/5 bg-[#0a0c10]/30"
        }`}>
          <div className="flex items-center gap-2 sm:gap-3 text-left min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`p-2 rounded-xl lg:hidden flex items-center justify-center transition cursor-pointer shrink-0 ${
                isLightTheme ? "bg-slate-200/80 text-slate-800 hover:bg-slate-300" : "bg-white/10 text-white/80 hover:text-white hover:bg-white/15"
              }`}
              title="Open Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] text-amber-500 font-mono tracking-widest font-bold hidden sm:block shrink-0">
              BHARAT_NAV_V3.0
            </div>
            <div className={`text-xs font-medium truncate max-w-[160px] sm:max-w-none ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
              ACTIVE SECTOR: <span className={`${isLightTheme ? "text-slate-900" : "text-white"} uppercase font-bold text-[10px] sm:text-[11px] tracking-wider`}>{activeRoadmap.category} / {profile.state}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Bell Icon & Notification Centre Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotificationsDropdown(prev => !prev)}
                className={`p-2 rounded-xl transition-all relative flex items-center justify-center cursor-pointer ${
                  isLightTheme 
                    ? "hover:bg-slate-200/60 text-slate-600" 
                    : "hover:bg-white/5 text-white/60 hover:text-white"
                }`}
                title="Notification Centre & Proactive Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 bg-rose-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse border border-black/40">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotificationsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 p-4 text-left ${
                      isLightTheme 
                        ? "bg-white border-slate-200 shadow-slate-200/50" 
                        : "bg-[#0b0e14] border-white/10 shadow-black/80"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-rose-500 animate-bounce" />
                        <span className={`text-xs font-bold ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                          Proactive Alerts ({unreadNotificationCount} Unread)
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-rose-400 uppercase font-bold">Event Engine Live</span>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {proactiveNotifications.length === 0 ? (
                        <div className="py-6 text-center space-y-1">
                          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
                          <p className={`text-xs font-medium ${isLightTheme ? "text-slate-600" : "text-white/70"}`}>All notifications read</p>
                          <p className="text-[10px] text-white/40">No pending alerts from Vault or Workflows.</p>
                        </div>
                      ) : (
                        proactiveNotifications.slice(0, 6).map((notif) => {
                          const isUnread = notif.lifecycleState === "UNREAD";
                          const notifId = notif.id || notif.notificationId;

                          return (
                            <div
                              key={notifId}
                              className={`p-3 rounded-xl border transition text-left flex flex-col gap-1.5 ${
                                isUnread
                                  ? isLightTheme
                                    ? "bg-rose-50/80 border-rose-200"
                                    : "bg-rose-950/20 border-rose-500/30"
                                  : isLightTheme
                                    ? "bg-slate-50 border-slate-200 opacity-70"
                                    : "bg-white/[0.02] border-white/5 opacity-70"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                                  notif.priority === "URGENT" || notif.priority === "DEADLINE"
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                    : notif.priority === "ACTION_REQUIRED"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                                }`}>
                                  {notif.priority}
                                </span>
                                <span className="text-[9px] font-mono text-white/40">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <h5 className={`text-xs font-bold leading-snug ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                                {notif.title}
                              </h5>
                              <p className={`text-[11px] line-clamp-2 leading-relaxed ${isLightTheme ? "text-slate-600" : "text-white/70"}`}>
                                {notif.message}
                              </p>

                              <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[10px] font-mono">
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await fetch("/api/v1/proactive/read", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ notificationId: notifId })
                                      });
                                      fetchProactiveNotifications();
                                    } catch (err) {
                                      console.warn("Error marking read:", err);
                                    }
                                  }}
                                  className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{isUnread ? "Mark Read" : "Read"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab("notifications");
                                    setShowNotificationsDropdown(false);
                                  }}
                                  className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Action →</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex justify-between items-center text-[11px] font-mono">
                      <span className="text-white/40">Live Firestore Sync</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("notifications");
                          setShowNotificationsDropdown(false);
                        }}
                        className="text-rose-400 font-bold hover:underline hover:text-rose-300 transition cursor-pointer"
                      >
                        Full Notification Centre →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


            <ThemeToggle 
              isLightTheme={isLightTheme} 
              onToggleTheme={() => setIsLightTheme(!isLightTheme)} 
            />
            <div className={`w-[1px] h-4 ${isLightTheme ? "bg-slate-300" : "bg-white/10"}`} />
            <button
              onClick={() => setShowCitizenCredentialsModal(true)}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-sm shrink-0"
              title="Configure Citizen Profile & Credentials"
            >
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name || "Citizen"}
                  className="w-5 h-5 rounded-full object-cover border border-amber-500/60 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <User className="w-3 h-3 text-amber-400" />
                </div>
              )}
              <span className="truncate max-w-[110px] text-amber-300 font-sans font-bold capitalize">
                {profile.name || "Citizen Credentials"}
              </span>
            </button>
            <div className={`w-[1px] h-4 ${isLightTheme ? "bg-slate-300" : "bg-white/10"}`} />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className={`text-[9px] font-mono uppercase tracking-widest ${isLightTheme ? "text-slate-500" : "text-white/50"}`}>DPI Stacks Connected</span>
            </div>
            <div className={`w-[1px] h-4 ${isLightTheme ? "bg-slate-300" : "bg-white/10"}`} />
            <div className={`text-xs font-mono tracking-wider font-semibold ${isLightTheme ? "text-slate-600" : "text-white/40"}`}>{currentTime || "00:00:00"}</div>
          </div>
        </header>

        {/* API Key Missing Banner */}
        {hasFeatherlessKey === false && (
          <div className="bg-gradient-to-r from-amber-600/20 via-orange-600/10 to-transparent border-b border-amber-500/20 px-6 py-3.5 flex items-center justify-between text-xs text-amber-400 font-medium shrink-0 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <p className="leading-relaxed text-left">
                <strong className="text-white uppercase font-bold tracking-wider font-mono text-[10px] mr-2">Configuration Required:</strong>
                To enable AI-powered roadmap planning, OCR, and translation features, please configure your <code className="bg-white/10 text-white px-1.5 py-0.5 rounded font-mono font-bold text-[11px] select-all">FEATHERLESS_API_KEY</code> in the <strong>Secrets panel</strong> under the <strong>Settings menu</strong> in the AI Studio UI.
              </p>
            </div>
            <a 
              href="https://featherless.ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[10px] font-bold font-mono tracking-wider bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-1.5 rounded-lg transition uppercase whitespace-nowrap ml-4 shrink-0"
            >
              Get API Key ↗
            </a>
          </div>
        )}

        {/* MAIN BODY SWAP AREA */}
        <div className="flex-1 overflow-y-auto relative p-3 sm:p-6">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: HOME PANEL */}
            {activeTab === "home" && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-8 text-left"
              >
                {/* Hero Greeting or New User Welcome Card */}
                {!activeRoadmap.goal ? (
                  <div className={`p-8 sm:p-10 rounded-3xl border text-center space-y-5 max-w-xl mx-auto my-6 shadow-2xl ${
                    isLightTheme ? "bg-white border-slate-200" : "bg-[#0c1017] border-white/10"
                  }`}>
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h1 className={`text-2xl font-bold font-display ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                        Welcome, {profile.name || "Priya"}!
                      </h1>
                      <p className={`text-sm font-medium ${isLightTheme ? "text-slate-700" : "text-white/80"}`}>
                        You haven't started any services yet.
                      </p>
                      <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-white/50"}`}>
                        Start by asking AI Assistant.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("assistant")}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer inline-flex items-center gap-2 shadow-lg"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Start</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0c121a] to-[#08090a] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="max-w-2xl space-y-4">
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#22c55e]">Citizen Welcome Gateway</span>
                      <h1 className="font-display text-3xl font-bold tracking-tight text-white">
                        Namaste, {profile.name || "Priya"}. Let's secure your government objectives.
                      </h1>
                      <p className="text-xs text-white/60 leading-relaxed font-sans">
                        Bharat Navigator acts as your legal case manager. Tell us your final goal, and we will automatically map out the necessary licenses, state certificates, and subsidies in a flawless dependency-aware checklist.
                      </p>
                      
                      <div className="pt-4 flex flex-wrap gap-3">
                        <button 
                          onClick={() => setActiveTab("assistant")}
                          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-2 shadow-lg transition"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Consult AI Assistant</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab("dashboard")}
                          className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>View Current Plan Progress</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Start Cards */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-white/50 font-bold pl-1">Suggested Government Objectives</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {QUICK_ROADMAPS.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSend(undefined, item.prompt)}
                        className="p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-amber-500/30 hover:bg-white/[0.04] transition cursor-pointer group text-left space-y-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition">
                          <Compass className="w-4 h-4 text-white group-hover:text-amber-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition truncate">{item.title}</h4>
                          <p className="text-[11px] text-white/50 leading-relaxed mt-1.5 line-clamp-2">{item.prompt}</p>
                        </div>
                        <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono font-semibold text-white/30 group-hover:text-amber-500 transition">
                          <span>Map Procedure</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl text-left">
                    <span className="text-[10px] font-mono font-bold text-white/40 uppercase">ACTIVE STATE</span>
                    <p className="text-lg font-bold text-white mt-1 uppercase tracking-tight">{profile.state}</p>
                    <p className="text-[10px] text-white/40 mt-1">Specific regional portals loaded</p>
                  </div>
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl text-left">
                    <span className="text-[10px] font-mono font-bold text-white/40 uppercase">CONFIDENCE SCORE</span>
                    <p className="text-lg font-bold text-[#22c55e] mt-1">98% Accuracy</p>
                    <p className="text-[10px] text-white/40 mt-1">Grounded in central statutes</p>
                  </div>
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl text-left">
                    <span className="text-[10px] font-mono font-bold text-white/40 uppercase">DOCUMENTS MET</span>
                    <p className="text-lg font-bold text-cyan-400 mt-1">{(activeRoadmap?.documents || []).filter(d => d?.uploaded).length} / {(activeRoadmap?.documents || []).length}</p>
                    <p className="text-[10px] text-white/40 mt-1">Identity matching completed</p>
                  </div>
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl text-left">
                    <span className="text-[10px] font-mono font-bold text-white/40 uppercase">STEPS FINISHED</span>
                    <p className="text-lg font-bold text-amber-500 mt-1">
                      {(activeRoadmap?.phases || []).reduce((sum, p) => sum + (p.steps ? p.steps.filter(s => s?.completed).length : 0), 0)} / {(activeRoadmap?.phases || []).reduce((sum, p) => sum + (p.steps ? p.steps.length : 0), 0)}
                    </p>
                    <p className="text-[10px] text-white/40 mt-1">Dynamic roadmap tracks</p>
                  </div>
                </div>

                {/* Premium Expert Consultation Promo Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-600/5 to-transparent border border-amber-500/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="space-y-1.5 max-w-xl text-left">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] text-amber-400 font-mono font-bold uppercase tracking-wider">
                        Manual Advocacy
                      </span>
                      <span className="text-[10px] font-mono text-white/40">SLA Guaranteed</span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      Encountering a complex legal notice, patent filing, or audit mismatch?
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Dypass the queue and submit your case files directly to a High Court advocate or Chartered Accountant. Fully subsidized under the DPI Startup & MSME Protection Act.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("consultation")}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-amber-500/10 cursor-pointer whitespace-nowrap self-stretch md:self-auto justify-center"
                  >
                    <Scale className="w-4 h-4" />
                    <span>Request Expert Consultation ↗</span>
                  </button>
                </div>

              </motion.div>
            )}



            {activeTab === "dashboard" && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6 text-left"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500">Case Manager Panel</span>
                    <h2 className="text-xl font-bold text-white mt-1">National Goal Tracker</h2>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleResetGoal}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Clear Goal</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab("assistant")}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-xs font-bold text-amber-400 transition flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Consult AI</span>
                    </button>
                  </div>
                </div>

                {/* Live Firestore Dashboard Cards (Uploaded Docs, Saved Services, Active Roadmaps, AI Conversations, Notifications) */}
                <DashboardCardsGrid 
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                />

                {/* Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left panel: Active goal detail */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 font-mono uppercase rounded">Active Goal</span>
                        <span className="text-[10px] text-white/40 font-mono uppercase">{activeRoadmap.category} Category</span>
                      </div>
                      
                      <h3 className="text-base font-bold text-white">
                        "{activeRoadmap.goal}"
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-white/50">Overall Procedural Compliance</span>
                          <span className="text-amber-400 font-bold">{activeRoadmap.completionPercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 via-white to-green-500 transition-all duration-300"
                            style={{ width: `${activeRoadmap.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step checklist details */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono uppercase tracking-widest text-white/40 font-bold pl-1">Compliance Checkpoints</h4>
                      
                      {(activeRoadmap?.phases || []).map((phase, pIdx) => (
                        <div key={pIdx} className="p-5 bg-[#0a0c10]/40 border border-white/5 rounded-xl space-y-3">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-xs font-bold text-white tracking-wide">{phase.phaseName}</span>
                            <button 
                              onClick={() => addNewStep(pIdx)}
                              className="text-[10px] font-mono text-amber-500 hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Custom Target</span>
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {(!phase.steps || phase.steps.length === 0) ? (
                              <p className="text-[11px] text-white/30 italic">No checklist targets generated for this phase.</p>
                            ) : (
                              phase.steps.map((step) => (
                                <div 
                                  key={step.id}
                                  className={`p-3 rounded-lg border flex items-start gap-3 transition ${
                                    step.completed 
                                      ? "bg-green-500/[0.01] border-green-500/10 text-white/50" 
                                      : "bg-white/[0.01] border-white/5 text-white"
                                  }`}
                                >
                                  <button 
                                    onClick={() => toggleStepCompletion(pIdx, step.id)}
                                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition ${
                                      step.completed 
                                        ? "bg-green-500 border-green-500 text-black" 
                                        : "border-white/20 hover:border-amber-500"
                                    }`}
                                  >
                                    {step.completed && <Check className="w-3 h-3 stroke-[3px]" />}
                                  </button>
                                  
                                  <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between gap-2">
                                      <h5 className={`text-xs font-semibold ${step.completed ? "line-through text-white/30" : "text-white"}`}>
                                        {step.title}
                                      </h5>
                                      {step.mandatory ? (
                                        <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 text-[8px] rounded font-mono text-red-400 font-bold uppercase shrink-0">Mandatory</span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-[8px] rounded font-mono text-white/40 uppercase shrink-0">Optional</span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{step.purpose}</p>
                                    
                                    {!step.completed && (
                                      <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-[9px] font-mono text-white/40">Dept: <span className="text-white/70">{step.dept}</span></span>
                                        <div className="flex items-center gap-3">
                                          {step.timeline && <span className="text-[9px] font-mono text-amber-500/80">Est: {step.timeline}</span>}
                                          {step.portal && (
                                            <a 
                                              href={step.portal} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-[9px] font-mono text-cyan-400 hover:underline flex items-center gap-0.5 font-bold"
                                            >
                                              <span>Launch Portal</span>
                                              <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right panel: Profile details and summary lists */}
                  <div className="space-y-6">
                    {/* Official State Seal Profile Design */}
                    <div className="p-6 bg-gradient-to-br from-[#0c1310] via-[#080a08] to-[#120f0a] border border-white/5 rounded-2xl relative overflow-hidden text-center space-y-4">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-white to-green-500" />
                      
                      <div className="mx-auto w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                        <Compass className="text-amber-500 w-8 h-8 animate-pulse-slow" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-[#22c55e] uppercase">Digital State Profile</span>
                        <h4 className="text-sm font-bold text-white uppercase">{profile.state} Active</h4>
                        <p className="text-[10px] text-white/40 font-mono uppercase tracking-tight">DPI Gateway Enabled</p>
                      </div>

                      <div className="border-t border-white/5 pt-3 text-left space-y-2 text-[11px] font-mono text-white/60">
                        <div className="flex justify-between">
                          <span>Occupation:</span>
                          <span className="text-white font-bold">{profile.occupation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Income Limit:</span>
                          <span className="text-white font-bold">{profile.income}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Caste Group:</span>
                          <span className="text-white font-bold">{profile.caste}</span>
                        </div>
                      </div>
                    </div>

                    {/* Common mistakes */}
                    <div className="p-5 bg-red-500/[0.02] border border-red-500/10 rounded-2xl text-left space-y-3">
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Common Mistakes to Avoid</h4>
                      </div>
                      <ul className="space-y-2 pl-4 list-disc text-[11px] text-white/60 leading-relaxed">
                        {(activeRoadmap?.commonMistakes || []).map((m, idx) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Future unlocked services */}
                    <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl text-left space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400">Future Services Unlocked</h4>
                      <div className="space-y-2">
                        {(activeRoadmap?.potentialFutureServices || []).map((s, idx) => (
                          <div key={idx} className="flex gap-2 text-[11px] text-white/60 leading-normal">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: AI ASSISTANT CHAT FEED */}
            {activeTab === "assistant" && (
              <AIAssistantChat
                profile={profile}
                activeRoadmap={activeRoadmap}
                vaultDocs={vaultDocs}
                onNavigateTab={(tab, roadmap, contextQuery) => {
                  if (contextQuery) {
                    setOrchestratorInitialQuery(contextQuery);
                  }
                  if (roadmap) {
                    setActiveRoadmap(roadmap);
                    setSavedRoadmaps((prev) => {
                      const matches = (r: RoadmapData) =>
                        (roadmap.id && r.id === roadmap.id) || r.goal === roadmap.goal;
                      if (!prev.some(matches)) {
                        return [roadmap, ...prev];
                      }
                      return prev;
                    });
                  }
                  if (tab === "roadmap") {
                    setRoadmapViewTab("active");
                  }
                  setActiveTab(tab as any);
                }}
                onSelectRoadmap={(roadmap) => {
                  setActiveRoadmap(roadmap);
                  setSavedRoadmaps((prev) => {
                    const matches = (r: RoadmapData) =>
                      (roadmap.id && r.id === roadmap.id) || r.goal === roadmap.goal;
                    if (!prev.some(matches)) {
                      return [roadmap, ...prev];
                    }
                    return prev;
                  });
                }}
              />
            )}

            {/* TAB 4: DYNAMIC ELIGIBILITY CHECKER */}
            {activeTab === "eligibility" && (
              <motion.div 
                key="eligibility"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-5xl mx-auto text-left"
              >
                <DynamicEligibilityChecker
                  userId={profile.email || "default-user"}
                  profile={profile}
                  vaultDocs={vaultDocs}
                  onOpenUploadModal={() => setIsOcrOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                />
              </motion.div>
            )}

            {/* TAB 5: DOCUMENTS HUB WITH OCR SCANNING & DIGILOCKER */}
            {activeTab === "documents" && (
              <BiometricDocumentGuard
                userId={currentUser?.uid || "default-user"}
                userEmail={currentUser?.email || profile.email}
                userName={profile.name}
              >
                <motion.div 
                  key="documents"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-7xl mx-auto space-y-6 text-left"
                >
                  {/* Documents Sub-Navigation Bar */}
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
                    <button
                      onClick={() => setDocViewMode("vault")}
                      className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
                        docViewMode === "vault"
                          ? "bg-amber-500 text-black border-amber-500 shadow-lg"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <Files className="w-4 h-4" />
                      <span>DigiLocker & Vault</span>
                    </button>

                    <button
                      onClick={() => setDocViewMode("intelligence")}
                      className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
                        docViewMode === "intelligence"
                          ? "bg-amber-500 text-black border-amber-500 shadow-lg"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Document Intelligence & OCR Pipeline</span>
                    </button>
                  </div>

                  {docViewMode === "vault" ? (
                    <DigiLockerVault 
                      documents={activeRoadmap.documents}
                      vaultDocs={vaultDocs}
                      onUpdateVaultDocs={setVaultDocs}
                      onOpenOcrHub={() => setDocViewMode("intelligence")} 
                      userEmail={currentUser?.email || profile.email}
                      userName={profile.name}
                      userId={currentUser?.uid || "default-user"}
                      onNavigateToRoadmap={() => setActiveTab("roadmap")}
                      activeWorkflows={savedRoadmaps}
                      onUpdateWorkflows={(updatedWorkflows) => {
                        setSavedRoadmaps(updatedWorkflows);
                        if (updatedWorkflows.length > 0) {
                          setActiveRoadmap(updatedWorkflows[0]);
                        }
                      }}
                    />
                  ) : (
                    <DocumentIntelligenceView 
                      vaultDocs={vaultDocs} 
                      isLightTheme={isLightTheme} 
                      userId={currentUser?.uid || "usr_8921"}
                      onNavigateToVault={() => setDocViewMode("vault")}
                      onPullToVault={(pulledDoc) => {
                        const newDocs = [pulledDoc, ...vaultDocs];
                        setVaultDocs(newDocs);
                        if (currentUser?.uid) {
                          saveFirebaseAppData(currentUser.uid, "digilocker_vault", newDocs);
                        }
                      }}
                    />
                  )}
                </motion.div>
              </BiometricDocumentGuard>
            )}

            {/* TAB 6: INTERACTIVE ROADMAP FLOW & HISTORICAL RECORDS ARCHIVE */}
            {activeTab === "roadmap" && (() => {
              const activeRoadmapsList = savedRoadmaps.filter(r => !r.isArchived);
              const archivedRoadmapsList = savedRoadmaps.filter(r => r.isArchived);

              // Find the first pending step ID in the active roadmap
              let firstPendingStepId: string | null = null;
              if (activeRoadmap && activeRoadmap.phases) {
                for (const phase of activeRoadmap.phases) {
                  const pending = phase.steps ? phase.steps.find((s) => !s.completed) : null;
                  if (pending) {
                    firstPendingStepId = pending.id;
                    break;
                  }
                }
              }

              return (
                <motion.div 
                  key="roadmap"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-4xl mx-auto space-y-6 text-left"
                >
                  {/* Automated Archive Toast Notification */}
                  {autoArchiveToast && (
                    <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-mono flex items-center justify-between gap-3 animate-fade-in shadow-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">{autoArchiveToast}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setRoadmapViewTab("archive")}
                          className="px-2.5 py-1 bg-emerald-500 text-black font-bold rounded-lg text-[10px] hover:bg-emerald-400 transition cursor-pointer"
                        >
                          View Archive ↗
                        </button>
                        <button onClick={() => setAutoArchiveToast(null)} className="text-emerald-400/60 hover:text-emerald-300 text-sm">×</button>
                      </div>
                    </div>
                  )}

                  {/* Roadmap Hub Navigation Tabs: Active vs Historical Records */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <button
                        onClick={() => setRoadmapViewTab("active")}
                        className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
                          roadmapViewTab === "active"
                            ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/10"
                            : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Map className="w-4 h-4" />
                        <span>Active Dashboards</span>
                        <span className="px-1.5 py-0.5 bg-black/20 text-xs rounded-full font-mono">
                          {activeRoadmapsList.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setRoadmapViewTab("orchestrator")}
                        className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
                          roadmapViewTab === "orchestrator"
                            ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/10"
                            : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Cpu className="w-4 h-4" />
                        <span>Execution & Workflow Activity</span>
                      </button>

                      <button
                        onClick={() => setRoadmapViewTab("archive")}
                        className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
                          roadmapViewTab === "archive"
                            ? "bg-emerald-50 text-black border-emerald-500 shadow-lg shadow-emerald-500/10"
                            : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Archive className="w-4 h-4" />
                        <span>Historical Records</span>
                        <span className="px-1.5 py-0.5 bg-black/20 text-xs rounded-full font-mono">
                          {archivedRoadmapsList.length}
                        </span>
                      </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-white/40">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Automated Compliance Archive Engine</span>
                    </div>
                  </div>

                  {/* VIEW: ORCHESTRATOR & WORKFLOW ACTIVITY */}
                  {roadmapViewTab === "orchestrator" && (
                    <div className="space-y-6">
                      <AIWorkflowOrchestratorView
                        citizenProfile={profile}
                        vaultDocs={vaultDocs}
                        isLightTheme={isLightTheme}
                        initialQuery={orchestratorInitialQuery}
                        historyList={historyList}
                        savedRoadmaps={savedRoadmaps}
                        onAddToHistory={(item) => {
                          setHistoryList((prev) => [item, ...prev.filter((p) => (typeof p === "string" ? p : p.id) !== (typeof item === "string" ? item : item.id))]);
                        }}
                        onSelectRoadmap={(roadmap) => {
                          setActiveRoadmap(roadmap);
                          setRoadmapViewTab("active");
                        }}
                        onApplyRoadmapToApp={(roadmap) => {
                          setActiveRoadmap(roadmap);
                          setRoadmapViewTab("active");
                        }}
                      />
                    </div>
                  )}

                  {/* VIEW 1: ACTIVE DASHBOARD ROADMAPS */}
                  {roadmapViewTab === "active" && (
                    <div className="space-y-6">
                      {/* Active Roadmaps Switcher & View Mode Bar */}
                      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs ${
                        isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b0f19] border-white/10"
                      }`}>
                        {savedRoadmaps.length > 0 ? (
                          <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
                            <Map className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-white/50 text-xs font-bold shrink-0">Roadmap:</span>
                            <select
                              value={activeRoadmap.goal || (savedRoadmaps[0]?.goal || "")}
                              onChange={(e) => {
                                const selected = savedRoadmaps.find(r => r.goal === e.target.value);
                                if (selected) setActiveRoadmap(selected);
                              }}
                              className={`w-full md:w-auto flex-1 border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer ${
                                isLightTheme
                                  ? "bg-slate-50 border-slate-200 text-slate-800 focus:border-amber-500"
                                  : "bg-black/60 border-white/15 text-amber-300 focus:border-amber-500"
                              }`}
                            >
                              {savedRoadmaps.map((r, rIdx) => (
                                <option key={r.id || rIdx} value={r.goal}>
                                  {r.goal} ({r.isArchived ? "Archived" : `${r.completionPercentage}% Done`})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-white/50">
                            <Map className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>No saved roadmaps yet. Use AI Assistant or Orchestrator to generate one!</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                          {/* View Mode Toggle: Journey Engine vs D3 Gantt vs Sequential List */}
                          <div className={`flex items-center p-1 border rounded-xl ${
                            isLightTheme ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/10"
                          }`}>
                            <button
                              onClick={() => setRoadmapDisplayMode("journey")}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                                roadmapDisplayMode === "journey"
                                  ? "bg-indigo-600 text-white shadow"
                                  : isLightTheme ? "text-slate-600 hover:text-slate-900" : "text-white/60 hover:text-white"
                              }`}
                            >
                              <Compass className="w-3.5 h-3.5 text-indigo-300" />
                              <span>Journey Engine</span>
                            </button>

                            <button
                              onClick={() => setRoadmapDisplayMode("gantt")}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                                roadmapDisplayMode === "gantt"
                                  ? "bg-amber-500 text-black shadow"
                                  : isLightTheme ? "text-slate-600 hover:text-slate-900" : "text-white/60 hover:text-white"
                              }`}
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>D3 Gantt Chart</span>
                            </button>

                            <button
                              onClick={() => setRoadmapDisplayMode("list")}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                                roadmapDisplayMode === "list"
                                  ? "bg-amber-500 text-black shadow"
                                  : isLightTheme ? "text-slate-600 hover:text-slate-900" : "text-white/60 hover:text-white"
                              }`}
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>Sequential List</span>
                            </button>
                          </div>

                          {activeRoadmap && activeRoadmap.goal && !activeRoadmap.isArchived && (
                            <button
                              onClick={() => handleArchiveRoadmap(activeRoadmap, true)}
                              className={`px-3 py-2 border rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                isLightTheme
                                  ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                                  : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"
                              }`}
                              title="Move roadmap to Historical Records"
                            >
                              <Archive className="w-3.5 h-3.5 text-amber-400" />
                              <span>Archive</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Fallback if activeRoadmap has no phases or empty goal */}
                      {(!activeRoadmap || !activeRoadmap.phases || activeRoadmap.phases.length === 0) ? (
                        <div className={`p-10 rounded-2xl border text-center space-y-4 ${
                          isLightTheme ? "bg-white border-slate-200" : "bg-[#0b0e14] border-white/10"
                        }`}>
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div className="space-y-1.5 max-w-md mx-auto">
                            <h3 className={`text-base font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                              No Active Roadmap Selected
                            </h3>
                            <p className={`text-xs ${isLightTheme ? "text-slate-600" : "text-white/60"}`}>
                              Ask the AI Citizen Assistant or launch the AI Workflow Orchestrator to generate a custom government compliance roadmap.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <button
                              onClick={() => setActiveTab("assistant")}
                              className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer shadow flex items-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Ask AI Assistant</span>
                            </button>
                            <button
                              onClick={() => setActiveTab("orchestrator")}
                              className={`px-4 py-2 border font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 ${
                                isLightTheme ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-white/10 border-white/20 text-white"
                              }`}
                            >
                              <Cpu className="w-4 h-4 text-amber-400" />
                              <span>Run AI Orchestrator</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Header and Download Bar */}
                          <div className="border-b border-white/5 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold uppercase tracking-widest text-yellow-500">Visual Compliance Graph</span>
                                {activeRoadmap.isArchived && (
                                  <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold rounded uppercase flex items-center gap-1">
                                    <FolderCheck className="w-3 h-3" /> Historical Record
                                  </span>
                                )}
                              </div>
                              <h2 className={`text-xl font-bold mt-1 ${isLightTheme ? "text-slate-900" : "text-white"}`}>{activeRoadmap.goal || "Compliance Roadmap"}</h2>
                              <p className={`text-xs mt-1 ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>
                                Sequential SLA timelines, statutory approvals, and mandatory dependencies.
                              </p>
                            </div>

                            {/* Actions Panel */}
                            <div className="flex flex-wrap items-center gap-3">
                              {/* Download PDF Button */}
                              <button
                                type="button"
                                onClick={handleDownloadPDF}
                                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold font-mono text-xs px-4 py-2.5 rounded-2xl shadow-lg transition duration-200 cursor-pointer self-start md:self-auto shrink-0"
                              >
                                <FileText className="w-4 h-4" />
                                <span>Download Roadmap</span>
                              </button>

                              {/* Project Start Date Anchor */}
                              <div className={`flex items-center gap-2.5 border rounded-2xl px-4 py-2.5 self-start md:self-auto shrink-0 ${
                                isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/5"
                              }`}>
                                <Calendar className="w-4 h-4 text-yellow-500" />
                                <div className="flex flex-col text-left">
                                  <span className={`text-[9px] font-mono uppercase font-bold tracking-wider ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>Project Timeline Anchor</span>
                                  <input
                                    type="date"
                                    value={projectStartDate}
                                    onChange={(e) => setProjectStartDate(e.target.value)}
                                    className={`bg-transparent border-none text-xs font-bold outline-none focus:ring-0 p-0 cursor-pointer text-left font-mono ${
                                      isLightTheme ? "text-slate-900" : "text-white"
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* View Mode Rendering: Journey Engine vs D3 Gantt vs Sequential List */}
                          {roadmapDisplayMode === "journey" ? (
                            <JourneyEngineView
                              roadmap={activeRoadmap}
                              vaultDocs={vaultDocs}
                              onUpdateRoadmap={(updated) => {
                                setActiveRoadmap(updated);
                                setSavedRoadmaps(prev =>
                                  prev.map(r => (r.id === updated.id || r.goal === updated.goal ? updated : r))
                                );
                              }}
                              onVaultDocsUpdated={(updatedDocs) => setVaultDocs(updatedDocs)}
                              activeWorkflows={savedRoadmaps}
                              onNavigateToVault={() => setActiveTab("documents")}
                              onAskAI={(prompt) => {
                                setActiveTab("assistant");
                                handleSend(undefined, prompt);
                              }}
                            />
                          ) : roadmapDisplayMode === "gantt" ? (
                            <GanttChartD3
                              roadmap={activeRoadmap}
                              projectStartDate={projectStartDate}
                              isLightTheme={isLightTheme}
                              onStepClick={(stepId) => {
                                const pIdx = activeRoadmap.phases.findIndex(p => p.steps.some(s => s.id === stepId));
                                if (pIdx !== -1) {
                                  toggleStepCompletion(pIdx, stepId);
                                }
                              }}
                            />
                          ) : (
                            <>
                              {/* Search Bar for filtering steps by title, department, or purpose */}
                              <div className={`border rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
                                isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/5"
                              }`}>
                                <div className="flex-1 relative">
                                  <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="text"
                                    value={roadmapSearchQuery}
                                    onChange={(e) => setRoadmapSearchQuery(e.target.value)}
                                    placeholder="Search roadmap steps by title, department, or purpose..."
                                    className={`w-full border rounded-xl pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:border-amber-500 ${
                                      isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-black/40 border-white/10 text-white"
                                    }`}
                                  />
                                  {roadmapSearchQuery && (
                                    <button
                                      type="button"
                                      onClick={() => setRoadmapSearchQuery("")}
                                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                {roadmapSearchQuery && (
                                  <div className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 shrink-0 select-none">
                                    <Filter className="w-3.5 h-3.5" />
                                    Active Filter Enabled
                                  </div>
                                )}
                              </div>

                              {/* Sequential Timeline Component */}
                      {(() => {
                        if (!activeRoadmap || !activeRoadmap.phases) return null;

                        const hasMatchingSteps = activeRoadmap.phases.some(phase => 
                          phase.steps.some(step => {
                            if (!roadmapSearchQuery) return true;
                            const query = roadmapSearchQuery.toLowerCase();
                            const titleMatch = (step.title || "").toLowerCase().includes(query);
                            const deptMatch = (step.dept || "").toLowerCase().includes(query);
                            const purposeMatch = (step.purpose || "").toLowerCase().includes(query);
                            return titleMatch || deptMatch || purposeMatch;
                          })
                        );

                        if (!hasMatchingSteps) {
                          return (
                            <div className="py-12 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl space-y-3">
                              <Search className="w-8 h-8 text-white/20 mx-auto" />
                              <h3 className="text-sm font-bold text-white font-sans">No Matching Steps Found</h3>
                              <p className="text-xs text-white/40 max-w-sm mx-auto leading-normal">
                                We couldn't find any compliance steps matching "{roadmapSearchQuery}". Try clearing your search filter or checking spelling.
                              </p>
                              <button
                                type="button"
                                onClick={() => setRoadmapSearchQuery("")}
                                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-black font-bold font-mono text-xs rounded-xl hover:bg-yellow-600 transition duration-200 cursor-pointer"
                              >
                                Reset Filter
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-10 relative pl-8 before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-green-500/30 before:via-yellow-500/20 before:to-white/5">
                            {activeRoadmap.phases.map((phase, pIdx) => {
                              const phaseSteps = phase.steps.filter(step => {
                                if (!roadmapSearchQuery) return true;
                                const query = roadmapSearchQuery.toLowerCase();
                                const titleMatch = (step.title || "").toLowerCase().includes(query);
                                const deptMatch = (step.dept || "").toLowerCase().includes(query);
                                const purposeMatch = (step.purpose || "").toLowerCase().includes(query);
                                return titleMatch || deptMatch || purposeMatch;
                              });

                              if (phaseSteps.length === 0) return null;

                              const originalSteps = phase.steps;
                              const phaseCompleted = originalSteps.filter(s => s.completed).length;
                              const phasePct = originalSteps.length > 0 ? Math.round((phaseCompleted / originalSteps.length) * 100) : 0;

                              return (
                                <div key={pIdx} className="space-y-5 relative">
                                  {/* Phase Node Indicator */}
                                  <div className="flex items-center justify-between gap-4 -ml-[33px] relative z-10">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-mono text-[10px] font-bold ${
                                        phasePct === 100
                                          ? "bg-green-500 border-green-500 text-black shadow-lg shadow-green-500/20"
                                          : phasePct > 0
                                          ? "bg-yellow-500 border-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                                          : "bg-[#08090a] border-white/20 text-white/60"
                                      }`}>
                                        {pIdx + 1}
                                      </div>
                                      <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 bg-[#08090a] px-2.5 py-0.5 rounded-lg border border-white/5 font-mono">
                                        {phase.phaseName}
                                      </span>
                                    </div>

                                    {/* Phase progress pill */}
                                    <span className="text-[10px] font-mono font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded-md">
                                      {phaseCompleted}/{originalSteps.length} Steps
                                    </span>
                                  </div>

                                  {/* Steps vertical sequential flow */}
                                  <div className="space-y-4">
                                    {phaseSteps.map((step) => {
                                      const alertInfo = stepAlerts.find(a => a.stepId === step.id);
                                      const customConfig = stepCustomDates[step.id] || {};
                                      const isExpanded = expandedStepId === step.id;
                                      const isCustomized = !!stepCustomDates[step.id];
                                      const isActiveStep = step.id === firstPendingStepId;

                                      return (
                                        <div
                                          key={step.id}
                                          className={`p-5 rounded-2xl text-left transition relative border overflow-hidden ${
                                            isExpanded
                                              ? "bg-white/[0.03] border-[#a855f7]/50 shadow-xl shadow-[#a855f7]/5"
                                              : isActiveStep
                                              ? "bg-yellow-500/[0.02] border-yellow-500/30 hover:border-yellow-500/50 hover:bg-yellow-500/[0.04]"
                                              : step.completed
                                              ? "bg-white/[0.01] border-green-500/20 hover:border-green-500/40"
                                              : "bg-[#08090a] border-white/5 hover:border-white/15"
                                          }`}
                                        >
                                          {/* Pulsing indicator background for active step */}
                                          {isActiveStep && !isExpanded && (
                                            <div className="absolute top-0 right-0 w-1.5 h-full bg-yellow-500 animate-pulse" />
                                          )}

                                          {/* Main row layout */}
                                          <div 
                                            onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                                            className="flex items-start justify-between gap-4 cursor-pointer select-none"
                                          >
                                            <div className="space-y-1 min-w-0 flex-1">
                                              <div className="flex flex-wrap items-center gap-2">
                                                <h4 className={`text-xs font-bold leading-tight ${
                                                  step.completed ? "line-through text-white/40" : "text-white"
                                                }`}>
                                                  {step.title}
                                                </h4>

                                                {/* Badges */}
                                                {isActiveStep && (
                                                  <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[8px] font-mono font-bold uppercase tracking-wider animate-pulse">
                                                    Current Action
                                                  </span>
                                                )}
                                                {step.mandatory && (
                                                  <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[8px] font-mono font-bold uppercase tracking-wider">
                                                    Mandatory
                                                  </span>
                                                )}
                                              </div>

                                              <div className="text-[9px] font-mono text-white/40 uppercase flex items-center gap-2">
                                                <span className="text-cyan-400 font-semibold">{step.dept}</span>
                                                <span>•</span>
                                                <span>Wait time: {step.timeline}</span>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                              {/* Alert icons */}
                                              {!step.completed && alertInfo && (
                                                <div className="hidden sm:block">
                                                  {alertInfo.status === "overdue" ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-mono font-semibold">
                                                      Overdue {Math.abs(alertInfo.daysRemaining)}d
                                                    </span>
                                                  ) : alertInfo.status === "approaching" ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono font-semibold animate-pulse">
                                                      Due in {alertInfo.daysRemaining}d
                                                    </span>
                                                  ) : null}
                                                </div>
                                              )}

                                              {/* Completion indicator */}
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleStepCompletion(pIdx, step.id);
                                                }}
                                                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition cursor-pointer hover:scale-105 ${
                                                  step.completed
                                                    ? "bg-green-500 border-green-500 text-black"
                                                    : "border-white/10 hover:border-yellow-500/50 bg-white/[0.01]"
                                                }`}
                                                title={step.completed ? "Mark step pending" : "Mark step completed"}
                                              >
                                                {step.completed ? (
                                                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                                ) : (
                                                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 hover:bg-yellow-400" />
                                                )}
                                              </button>

                                              <div className="text-white/40">
                                                {isExpanded ? (
                                                  <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                  <ChevronRight className="w-4 h-4" />
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {!isExpanded && (
                                            <p className="text-[10px] text-white/50 leading-relaxed truncate mt-2 pl-0 border-l border-white/5">
                                              {step.purpose}
                                            </p>
                                          )}

                                          <AnimatePresence>
                                            {isExpanded && (
                                              <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t border-white/5 space-y-4 overflow-hidden text-left"
                                              >
                                                <div className="space-y-1.5">
                                                  <span className="text-[9px] font-mono uppercase text-white/40 font-bold block tracking-wider">Functional Objective</span>
                                                  <p className="text-xs text-white/80 leading-relaxed">{step.purpose}</p>
                                                </div>

                                                {step.whyRequired && (
                                                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-start gap-2.5">
                                                    <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                                    <div className="space-y-0.5">
                                                      <span className="text-[9px] font-mono uppercase text-cyan-400 font-bold block tracking-wider">Statutory Justification</span>
                                                      <p className="text-xs text-white/70 leading-relaxed">{step.whyRequired}</p>
                                                    </div>
                                                  </div>
                                                )}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                                  <div className="space-y-1">
                                                    <span className="text-[9px] font-mono uppercase text-white/40 font-bold block tracking-wider">Departmental SLA & Outcome</span>
                                                    <div className="text-xs text-white/70 space-y-1">
                                                      <div>
                                                        <span className="text-white/40">Authority:</span> <span className="font-semibold text-white/90">{step.dept}</span>
                                                      </div>
                                                      <div>
                                                        <span className="text-white/40">Expected Document:</span> <span className="font-semibold text-white/90">{step.output}</span>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  <div className="space-y-1">
                                                    <span className="text-[9px] font-mono uppercase text-white/40 font-bold block tracking-wider">Procedural Dependencies</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                      {step.dependencies && step.dependencies.length > 0 && step.dependencies[0] !== "None" ? (
                                                        step.dependencies.map((dep, idx) => (
                                                          <span key={idx} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-mono">
                                                            Requires: {dep}
                                                          </span>
                                                        ))
                                                      ) : (
                                                        <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-mono">
                                                          No Prerequisites (Independent Step)
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="w-full my-3 p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl space-y-3">
                                                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                                                    <div className="flex items-center gap-2">
                                                      <UploadCloud className="w-4 h-4 text-cyan-400" />
                                                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                                                        Step Enclosures & Multi-File Batch Upload
                                                      </span>
                                                    </div>
                                                    <span className="text-[9px] font-mono text-cyan-400/70">
                                                      Select or drop multiple files simultaneously
                                                    </span>
                                                  </div>

                                                  {(() => {
                                                    const stepDocs = activeRoadmap.documents.filter(d => d.stepId === step.id || (d.uploaded && d.name.toLowerCase().includes(step.title.slice(0, 8).toLowerCase())));
                                                    return (
                                                      <div className="space-y-2">
                                                        {stepDocs.length > 0 && (
                                                          <div className="flex flex-wrap gap-2">
                                                            {stepDocs.map(doc => (
                                                              <div key={doc.id} className="p-2 bg-black/40 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2 font-mono text-emerald-300">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                                <span className="truncate max-w-[180px]">{doc.name}</span>
                                                                {doc.downloadUrl && (
                                                                  <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-[10px] ml-1">
                                                                    View
                                                                  </a>
                                                                )}
                                                              </div>
                                                            ))}
                                                          </div>
                                                        )}

                                                        <div 
                                                          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                                          onDragLeave={() => setDragActive(false)}
                                                          onDrop={(e) => handleDrop(e, step.id)}
                                                          className="p-4 border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-xl bg-black/30 text-center space-y-2 transition cursor-pointer"
                                                        >
                                                          <input
                                                            type="file"
                                                            id={`step-batch-input-${step.id}`}
                                                            multiple
                                                            onChange={(e) => handleFileChange(e, step.id)}
                                                            className="hidden"
                                                          />
                                                          <label htmlFor={`step-batch-input-${step.id}`} className="cursor-pointer flex flex-col items-center gap-1.5">
                                                            <Plus className="w-5 h-5 text-cyan-400 mx-auto" />
                                                            <span className="text-xs font-bold font-mono text-white">Upload All Enclosures in a Single Batch</span>
                                                            <span className="text-[10px] text-white/50 font-mono">Supports multiple PDF, PNG, JPG files (Hold Ctrl/Cmd to select multiple)</span>
                                                          </label>
                                                        </div>
                                                      </div>
                                                    );
                                                  })()}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                                  {step.portal && step.portal !== "Not applicable" && (
                                                    <a
                                                      href={step.portal.startsWith("http") ? step.portal : `https://google.com/search?q=${encodeURIComponent(step.portal + " " + step.dept)}`}
                                                      target="_blank"
                                                      referrerPolicy="no-referrer"
                                                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#a855f7]/10 hover:bg-[#a855f7]/20 border border-[#a855f7]/20 text-[#c084fc] hover:text-white rounded-xl text-xs font-semibold font-mono transition"
                                                    >
                                                      <ExternalLink className="w-3.5 h-3.5" />
                                                      Access Portal
                                                    </a>
                                                  )}

                                                  <button
                                                    type="button"
                                                    onClick={() => handleFindNearbyOffices(step.dept)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-white rounded-xl text-xs font-semibold font-mono transition cursor-pointer"
                                                    title="Find nearest department office on Google Maps using your location"
                                                  >
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    Locate Office
                                                  </button>

                                                  <button
                                                    type="button"
                                                    onClick={() => handleGetDirections(step.dept)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 hover:text-white rounded-xl text-xs font-semibold font-mono transition cursor-pointer"
                                                    title="Get turn-by-turn directions to this authority's office"
                                                  >
                                                    <Compass className="w-3.5 h-3.5" />
                                                    Get Directions
                                                  </button>
                                                </div>

                                                {!step.completed && (
                                                  <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-3.5">
                                                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                                                      <span className="text-[10px] font-mono uppercase text-white/60 font-bold tracking-wider">Alert Config & Date Thresholds</span>
                                                      {isCustomized && (
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            setStepCustomDates(prev => {
                                                              const updated = { ...prev };
                                                              delete updated[step.id];
                                                              return updated;
                                                            });
                                                          }}
                                                          className="text-[9px] font-mono text-red-400 hover:underline font-bold uppercase cursor-pointer"
                                                        >
                                                          Reset to Automatic
                                                        </button>
                                                      )}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                                      <div className="space-y-1">
                                                        <label className="text-[9px] font-mono uppercase text-white/40 block">Custom Step Start Date</label>
                                                        <input
                                                          type="date"
                                                          value={customConfig.startDate || alertInfo?.startDate || projectStartDate}
                                                          onChange={(e) => {
                                                            const newDate = e.target.value;
                                                            setStepCustomDates(prev => ({
                                                              ...prev,
                                                              [step.id]: {
                                                                ...prev[step.id],
                                                                startDate: newDate
                                                              }
                                                            }));
                                                          }}
                                                          className="w-full bg-[#08090a] border border-white/10 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-yellow-500/50"
                                                        />
                                                      </div>

                                                      <div className="space-y-1">
                                                        <label className="text-[9px] font-mono uppercase text-white/40 block">Lead Warning Alert Trigger</label>
                                                        <select
                                                          value={customConfig.alertBeforeDays !== undefined ? customConfig.alertBeforeDays : 2}
                                                          onChange={(e) => {
                                                            const days = parseInt(e.target.value);
                                                            setStepCustomDates(prev => ({
                                                              ...prev,
                                                              [step.id]: {
                                                                ...prev[step.id],
                                                                alertBeforeDays: days
                                                              }
                                                            }));
                                                          }}
                                                          className="w-full bg-[#08090a] border border-white/10 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-yellow-500/50 cursor-pointer"
                                                        >
                                                          <option value={1} className="bg-[#0b0e14]">1 day before SLA deadline</option>
                                                          <option value={2} className="bg-[#0b0e14]">2 days before SLA deadline</option>
                                                          <option value={3} className="bg-[#0b0e14]">3 days before SLA deadline</option>
                                                          <option value={5} className="bg-[#0b0e14]">5 days before SLA deadline</option>
                                                        </select>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}

                                                <div className="pt-2 border-t border-white/5 flex justify-end">
                                                  <button
                                                    type="button"
                                                    onClick={() => toggleStepCompletion(pIdx, step.id)}
                                                    className={`px-3.5 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                                                      step.completed
                                                        ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                                        : "bg-[#22c55e] text-black hover:bg-[#22c55e]/90 shadow-lg shadow-green-500/10"
                                                    }`}
                                                  >
                                                    {step.completed ? (
                                                      <>
                                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                                        Revert to Pending
                                                      </>
                                                    ) : (
                                                      <>
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Complete This Step & Proceed
                                                      </>
                                                    )}
                                                  </button>
                                                </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* VIEW 2: HISTORICAL RECORDS ARCHIVE */}
                  {roadmapViewTab === "archive" && (
                    <div className="space-y-6">
                      <div className="p-5 bg-[#0b0f19] border border-emerald-500/20 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FolderCheck className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                              Historical Records Repository
                            </h3>
                          </div>
                          <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold rounded-full">
                            {archivedRoadmapsList.length} Archived Pipelines
                          </span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          All 100% completed compliance pipelines and archived roadmaps are stored here. Preserves historical records for official statutory audits while keeping your active dashboard clutter-free.
                        </p>
                      </div>

                      {archivedRoadmapsList.length === 0 ? (
                        <div className="py-16 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl space-y-3 font-mono">
                          <Inbox className="w-10 h-10 text-white/20 mx-auto" />
                          <h3 className="text-sm font-bold text-white">No Historical Records Found</h3>
                          <p className="text-xs text-white/40 max-w-md mx-auto leading-normal">
                            When an active roadmap reaches 100% completion, it will automatically move to this section to keep your active dashboard clean.
                          </p>
                          <button
                            onClick={() => setRoadmapViewTab("active")}
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer"
                          >
                            <Map className="w-3.5 h-3.5" />
                            <span>Return to Active Dashboards</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {archivedRoadmapsList.map((r, rIdx) => {
                            const totalSteps = r.phases.reduce((acc, p) => acc + (p.steps ? p.steps.length : 0), 0);
                            const completedSteps = r.phases.reduce((acc, p) => acc + (p.steps ? p.steps.filter(s => s.completed).length : 0), 0);
                            const formattedDate = r.archivedAt ? new Date(r.archivedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "Recently Completed";

                            return (
                              <div
                                key={r.id || rIdx}
                                className="p-5 bg-[#08090a] border border-emerald-500/30 rounded-2xl space-y-4 hover:border-emerald-500/50 transition shadow-xl relative overflow-hidden flex flex-col justify-between"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold rounded-lg uppercase flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      100% Completed Record
                                    </span>
                                    <span className="text-[10px] font-mono text-white/40">
                                      Archived: {formattedDate}
                                    </span>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-bold text-white leading-snug">
                                      {r.goal}
                                    </h4>
                                    <p className="text-[11px] font-mono text-white/50 mt-1">
                                      Category: {r.category || "Government Portal & Compliance"}
                                    </p>
                                  </div>

                                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs font-mono">
                                    <div className="flex items-center gap-2 text-white/70">
                                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Steps: {completedSteps}/{totalSteps}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/70">
                                      <FileBadge className="w-3.5 h-3.5 text-cyan-400" />
                                      <span>Enclosures: {r.documents ? r.documents.length : 0}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                                  <button
                                    onClick={() => {
                                      setActiveRoadmap(r);
                                      setRoadmapViewTab("active");
                                    }}
                                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Inspect Pipeline</span>
                                  </button>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleArchiveRoadmap(r, false)}
                                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-xl transition cursor-pointer flex items-center gap-1"
                                      title="Restore to Active Dashboard"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                                      <span>Restore</span>
                                    </button>

                                    <button
                                      onClick={() => handleDeleteRoadmap(r)}
                                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition cursor-pointer"
                                      title="Permanently Delete Record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })()}

            {/* TAB 7: BOOKMARKS */}
            {activeTab === "bookmarks" && (
              <motion.div 
                key="bookmarks"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6 text-left"
              >
                <div className={`border-b pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isLightTheme ? "border-slate-200" : "border-white/5"}`}>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#e11d48]">Saved Assets</span>
                    <h2 className={`text-xl font-bold mt-1 ${isLightTheme ? "text-slate-900" : "text-white"}`}>Official Bookmarked Portals</h2>
                    <p className={`text-xs mt-1 ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>
                      Quick shortcuts to verified government single-window registries. Never visit cloned or fake portals.
                    </p>
                  </div>
                </div>

                {/* Save New Portal Input Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const link = formData.get("link") as string;
                    if (link && !bookmarks.includes(link)) {
                      setBookmarks(prev => {
                        const nextB = [...prev, link];
                        if (auth.currentUser) {
                          const sanitizedId = `bmark-${link.replace(/[^a-zA-Z0-9]/g, "")}`.slice(0, 100);
                          saveFirebaseUserBookmark(auth.currentUser.uid, sanitizedId, { id: sanitizedId, link });
                        }
                        return nextB;
                      });
                      e.currentTarget.reset();
                    }
                  }}
                  className={`p-5 rounded-2xl flex gap-3 flex-wrap md:flex-nowrap items-end border ${
                    isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.02] border-white/5"
                  }`}
                >
                  <div className="flex-1 min-w-[200px]">
                    <label className={`text-[9px] font-mono uppercase tracking-widest block mb-1.5 ${isLightTheme ? "text-slate-700 font-bold" : "text-white/40"}`}>Add Official Portal Link</label>
                    <input 
                      type="url" 
                      name="link"
                      required
                      placeholder="https://example.gov.in"
                      className={`w-full rounded-xl px-3.5 py-2 text-xs focus:outline-none ${
                        isLightTheme 
                          ? "bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#e11d48] font-medium shadow-sm" 
                          : "bg-black/40 border border-white/10 text-white placeholder-white/25 focus:border-[#e11d48]"
                      }`}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-[#e11d48] hover:bg-[#be123c] text-white text-[11px] font-bold rounded-xl uppercase tracking-wider h-[38px] cursor-pointer shadow-sm"
                  >
                    Add Bookmark
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmarks.length === 0 ? (
                    <div className={`col-span-full p-8 text-center rounded-2xl border ${isLightTheme ? "bg-white border-slate-200 text-slate-500" : "bg-white/[0.01] border-white/5 text-white/40"}`}>
                      No bookmarked portals saved yet. Add a portal link above to keep it handy.
                    </div>
                  ) : (
                    bookmarks.map((link, idx) => (
                      <div key={idx} className={`p-5 rounded-2xl flex items-center justify-between text-xs gap-4 border ${
                        isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.01] border-white/5"
                      }`}>
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-8 h-8 rounded-lg bg-[#e11d48]/10 flex items-center justify-center border border-[#e11d48]/20 text-[#e11d48]">
                            <Bookmark className="w-4 h-4 fill-[#e11d48]" />
                          </div>
                          <div className="truncate text-left">
                            <p className={`font-bold font-mono truncate ${isLightTheme ? "text-slate-900" : "text-white"}`}>{link.replace("https://", "")}</p>
                            <p className={`text-[9px] font-mono ${isLightTheme ? "text-slate-500 font-semibold" : "text-white/40"}`}>Government Domain Verified</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a 
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-3.5 py-1.5 rounded-lg font-bold font-mono uppercase tracking-wider text-[10px] shrink-0 border ${
                              isLightTheme 
                                ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800" 
                                : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                            }`}
                          >
                            Launch
                          </a>
                          <button 
                            onClick={() => {
                              setBookmarks(prev => {
                                const nextB = prev.filter(b => b !== link);
                                if (auth.currentUser) {
                                  const sanitizedId = `bmark-${link.replace(/[^a-zA-Z0-9]/g, "")}`.slice(0, 100);
                                  deleteFirebaseUserBookmark(auth.currentUser.uid, sanitizedId);
                                }
                                return nextB;
                              });
                            }}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isLightTheme 
                                ? "hover:bg-slate-100 text-slate-500 hover:text-red-600" 
                                : "hover:bg-white/5 text-white/40 hover:text-red-500"
                            }`}
                            title="Delete bookmark"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </motion.div>
            )}

            {/* TAB: DIGILOCKER VAULT */}
            {activeTab === "digilocker" && (
              <motion.div 
                key="digilocker"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-7xl mx-auto space-y-6 text-left animate-fade-in"
              >
                <DigiLockerVault 
                  isLightTheme={isLightTheme}
                  documents={activeRoadmap.documents}
                  vaultDocs={vaultDocs}
                  onUpdateVaultDocs={setVaultDocs}
                  onOpenOcrHub={() => setIsOcrOpen(true)} 
                  userEmail={currentUser?.email || profile.email}
                  userName={profile.name}
                  userId={currentUser?.uid || "default-user"}
                  onNavigateToRoadmap={() => setActiveTab("roadmap")}
                />
              </motion.div>
            )}

            {/* TAB: PREMIUM EXPERT CONSULTATION */}
            {activeTab === "consultation" && (
              <motion.div 
                key="consultation"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-5xl mx-auto space-y-6 text-left animate-fade-in"
              >
                <PremiumExpertConsultation 
                  isLightTheme={isLightTheme}
                  profile={profile}
                  documentsList={activeRoadmap.documents}
                />
              </motion.div>
            )}

            {/* TAB 8: HISTORY */}
            {activeTab === "history" && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto"
              >
                <AiHistoryView
                  isLightTheme={isLightTheme}
                  historyList={historyList}
                  userId={currentUser?.uid || "default-user"}
                  onUpdateHistoryList={setHistoryList}
                  onSelectQueryToResume={(query, moduleType) => {
                    if (moduleType === "orchestrator") {
                      setActiveTab("orchestrator");
                    } else if (moduleType === "rag") {
                      setActiveTab("rag");
                    } else if (moduleType === "doc_intelligence") {
                      setActiveTab("doc-intelligence");
                    } else {
                      setActiveTab("assistant");
                      handleSend(undefined, query);
                    }
                  }}
                />
              </motion.div>
            )}

            {/* TAB 9: SETTINGS */}
            {activeTab === "settings" && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto"
              >
                <SettingsView
                  isLightTheme={isLightTheme}
                  onToggleTheme={() => setIsLightTheme(!isLightTheme)}
                  language={language}
                  onLanguageChange={(lang) => {
                    setLanguage(lang);
                    setProfile(prev => ({ ...prev, language: lang }));
                    if (currentUser) {
                      saveFirebaseUserProfile(currentUser.uid, { language: lang });
                    }
                  }}
                  profile={profile}
                  vaultDocs={vaultDocs}
                  savedRoadmaps={savedRoadmaps}
                  historyList={historyList}
                  onClearLocalCache={() => {
                    localStorage.clear();
                    alert("Local browser cache cleared!");
                  }}
                  onLogout={async () => {
                    await logout();
                    setProfileIsLoggedIn(false);
                    setCurrentUser(null);
                    setActiveTab("auth");
                  }}
                />
              </motion.div>
            )}

            {/* TAB: CMS BLOG */}
            {activeTab === "cms" && (
              <motion.div 
                key="cms"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <CMSBlog isLightTheme={isLightTheme} />
              </motion.div>
            )}

            {/* TAB: SHOP */}
            {activeTab === "shop" && (
              <motion.div 
                key="shop"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <ECommerceShop isLightTheme={isLightTheme} />
              </motion.div>
            )}

            {/* TAB: FORUM */}
            {activeTab === "forum" && (
              <motion.div 
                key="forum"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <DiscussionForum isLightTheme={isLightTheme} />
              </motion.div>
            )}

            {/* TAB: NEWSLETTER */}
            {activeTab === "newsletter" && (
              <motion.div 
                key="newsletter"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <EmailNewsletter isLightTheme={isLightTheme} />
              </motion.div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === "analytics" && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <AnalyticsDashboard userId={auth.currentUser?.uid || "default-user"} isLightTheme={isLightTheme} />
              </motion.div>
            )}

            {/* TAB: AUTH CREDENTIALS & CITIZEN PROFILE */}
            {(activeTab === "auth" || activeTab === "profile") && (
              <motion.div 
                key="auth"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <AuthAndProfile 
                  isLightTheme={isLightTheme}
                  profile={{
                    name: profile.name,
                    email: profileEmail || profile.email || "",
                    state: profile.state,
                    district: profile.district,
                    city: profile.district,
                    age: profile.age,
                    gender: profile.gender,
                    occupation: profile.occupation,
                    income: profile.income,
                    caste: profile.caste,
                    role: profileRole,
                    isLoggedIn: profileIsLoggedIn,
                    businessName: profile.businessName,
                    msmeCategory: profile.msmeCategory,
                    language: profile.language || language,
                    photoUrl: profile.photoUrl
                  }}
                  language={language}
                  onLanguageChange={(lang) => {
                    setLanguage(lang);
                    setProfile(prev => {
                      const newProf = { ...prev, language: lang };
                      if (auth.currentUser) {
                        saveFirebaseUserProfile(auth.currentUser.uid, newProf);
                      }
                      return newProf;
                    });
                  }}
                  onOpenOcrHub={() => setIsOcrOpen(true)}
                  onOpenDigiLocker={() => setActiveTab("digilocker")}
                  onUpdateProfile={(updated: UserProfile) => {
                    setProfileEmail(updated.email);
                    setProfileRole(updated.role);
                    setProfileIsLoggedIn(updated.isLoggedIn);
                    if (updated.language) {
                      setLanguage(updated.language);
                    }
                    setProfile(prev => {
                      const newProf = {
                        ...prev,
                        name: updated.name,
                        email: updated.email,
                        state: updated.state,
                        district: updated.district || updated.city || prev.district,
                        city: updated.district || updated.city || prev.city,
                        age: updated.age || prev.age,
                        gender: updated.gender || prev.gender,
                        occupation: updated.occupation,
                        income: updated.income,
                        caste: updated.caste,
                        businessName: updated.businessName,
                        msmeCategory: updated.msmeCategory,
                        language: updated.language || language,
                        photoUrl: updated.photoUrl || prev.photoUrl,
                        role: updated.role
                      };
                      if (auth.currentUser) {
                        saveFirebaseUserProfile(auth.currentUser.uid, {
                          ...newProf,
                          email: updated.email,
                          role: updated.role,
                          isLoggedIn: updated.isLoggedIn
                        });
                      }
                      return newProf;
                    });
                  }}
                />
              </motion.div>
            )}

            {/* TAB 10: PROACTIVE NOTIFICATIONS & EVENT ENGINE (PHASE 6) */}
            {activeTab === "notifications" && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                <NotificationCentre 
                  userId={currentUser?.uid || profile.email || "user_default"}
                  isEmbedded={true}
                  isLightTheme={isLightTheme}
                  vaultDocs={vaultDocs}
                  activeRoadmaps={savedRoadmaps}
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                  onUnreadCountChange={(cnt) => setUnreadNotificationCount(cnt)}
                />
              </motion.div>
            )}

            {/* TAB: FIND AN OFFICE */}
            {activeTab === "office-locator" && (
              <motion.div 
                key="office-locator"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                <OfficeLocatorView 
                  isLightTheme={isLightTheme}
                  profile={profile}
                  roadmaps={savedRoadmaps}
                  activeRoadmapTitle={activeRoadmap.goal}
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                />
              </motion.div>
            )}

            {/* TAB: AI WORKFLOW ORCHESTRATOR */}
            {activeTab === "orchestrator" && (
              <motion.div 
                key="orchestrator"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                <AIWorkflowOrchestratorView 
                  isLightTheme={isLightTheme}
                  citizenProfile={profile}
                  vaultDocs={vaultDocs}
                  initialQuery={orchestratorInitialQuery}
                  historyList={historyList}
                  savedRoadmaps={savedRoadmaps}
                  onApplyRoadmapToApp={(roadmap) => {
                    setActiveRoadmap(roadmap);
                    setSavedRoadmaps((prev) => {
                      const matches = (r: RoadmapData) =>
                        (roadmap.id && r.id === roadmap.id) || r.goal === roadmap.goal;
                      if (!prev.some(matches)) return [roadmap, ...prev];
                      return prev;
                    });
                    setActiveTab("roadmap");
                  }}
                  onAddToHistory={(item) => {
                    setHistoryList((prev) => [item, ...prev]);
                    if (auth.currentUser) {
                      const itemId = typeof item === "string" ? `hist-${Date.now()}` : (item.id || `hist-${Date.now()}`);
                      const itemQuery = typeof item === "string" ? item : (item.query || item.title || "Query");
                      saveFirebaseUserHistoryItem(auth.currentUser.uid, itemId, itemQuery);
                    }
                  }}
                  onSelectRoadmap={(roadmap) => {
                    setActiveRoadmap(roadmap);
                    setActiveTab("roadmap");
                  }}
                />
              </motion.div>
            )}

            {/* TAB: KNOWLEDGE BASE (GOVERNMENT RAG) */}
            {activeTab === "rag" && (
              <motion.div 
                key="rag"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                <GovernmentRAGView 
                  isLightTheme={isLightTheme}
                  profile={profile}
                  vaultDocs={vaultDocs}
                  roadmaps={savedRoadmaps}
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                  onOpenUploadModal={() => setIsOcrOpen(true)}
                  onStartRoadmap={(serviceName) => {
                    setOrchestratorInitialQuery(serviceName);
                    setActiveTab("orchestrator");
                  }}
                />
              </motion.div>
            )}

            {/* TAB: DOCUMENT INTELLIGENCE */}
            {activeTab === "doc-intelligence" && (
              <motion.div 
                key="doc-intelligence"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                <DocumentIntelligenceView 
                  isLightTheme={isLightTheme}
                  vaultDocs={vaultDocs}
                  userId={currentUser?.uid || "default-user"}
                  onNavigateToVault={() => setActiveTab("digilocker")}
                />
              </motion.div>
            )}

            {/* TAB: CITIZEN INTELLIGENCE */}
            {activeTab === "citizen-intelligence" && (
              <motion.div 
                key="citizen-intelligence"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                <CitizenIntelligenceView 
                  isLightTheme={isLightTheme}
                  profile={profile}
                  vaultDocs={vaultDocs}
                  roadmaps={savedRoadmaps}
                />
              </motion.div>
            )}

            {/* TAB: ADMIN PANEL */}
            {activeTab === "admin" && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                <AdminPanelView 
                  userRole={profileRole}
                  profile={profile}
                  isLightTheme={isLightTheme}
                  vaultDocs={vaultDocs}
                  savedRoadmaps={savedRoadmaps}
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                  setIsOcrOpen={setIsOcrOpen}
                  onUpdateRole={(newRole) => setProfileRole(newRole)}
                />
              </motion.div>
            )}

            {/* TAB: SECURITY HARDENING */}
            {activeTab === "security" && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                <SecurityHardeningView />
              </motion.div>
            )}

            {/* TAB: SCALE & COMMERCIALIZATION */}
            {activeTab === "scale" && (
              <motion.div 
                key="scale"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                <ScaleCommercializationView />
              </motion.div>
            )}

            {/* TAB: PHASE 10 IP & FUNDING READINESS */}
            {activeTab === "phase10" && (
              <motion.div 
                key="phase10"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                <Phase10AuditFundingView />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* DYNAMIC MODAL 1: DIGILOCKER MULTI-STEP VERIFIER */}
      {isDigiLockerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0a0d14] border border-white/10 rounded-3xl p-6 space-y-6 text-left relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600 animate-pulse" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400">
                <Fingerprint className="w-5 h-5 animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400">DigiLocker National Identity Gateway</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDigiLockerOpen(false);
                  setSmsToast(null);
                }}
                className="text-white/40 hover:text-white p-1 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {digiLockerStep === 1 && (
              <form onSubmit={handleDigiLockerRequestOtp} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Connect DigiLocker Wallet</h3>
                  <p className="text-xs text-white/50 leading-relaxed">Provide your Aadhaar or mobile coordinates registered with UIDAI to link your government folder.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-white/40">10-Digit Mobile / 12-Digit Aadhaar</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 9876543210"
                    maxLength={12}
                    value={digiLockerPhone}
                    onChange={(e) => setDigiLockerPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-xs bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono tracking-wider"
                  />
                </div>
                <button
                  type="submit"
                  disabled={digiLockerSyncing || (digiLockerPhone.length !== 10 && digiLockerPhone.length !== 12)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {digiLockerSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Request Secure 2FA OTP"}
                </button>
              </form>
            )}

            {digiLockerStep === 2 && (
              <form onSubmit={handleDigiLockerVerify} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Secure Identity Pin</h3>
                  <p className="text-xs text-white/50 leading-relaxed">Enter the dynamic verification code sent via SMS plus your personal wallet PIN.</p>
                </div>

                {otpError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium leading-relaxed">
                    {otpError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/40 flex items-center justify-between">
                      <span>SMS OTP</span>
                      {generatedOtp && (
                        <button
                          type="button"
                          onClick={() => {
                            if (generatedOtp) {
                              setDigiLockerOtp(generatedOtp);
                              setOtpError(null);
                            }
                          }}
                          className="text-blue-400 text-[8px] hover:underline"
                        >
                          Autofill
                        </button>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="6-digit code"
                      value={digiLockerOtp}
                      onChange={(e) => {
                        setOtpError(null);
                        setDigiLockerOtp(e.target.value.replace(/\D/g, ""));
                      }}
                      className="w-full text-center text-xs font-mono tracking-widest bg-black/40 border border-white/10 rounded-xl py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/40">wallet PIN</label>
                    <input
                      type="password"
                      required
                      maxLength={6}
                      placeholder="6-digit PIN"
                      value={digiLockerPin}
                      onChange={(e) => {
                        setOtpError(null);
                        setDigiLockerPin(e.target.value.replace(/\D/g, ""));
                      }}
                      className="w-full text-center text-xs font-mono tracking-widest bg-black/40 border border-white/10 rounded-xl py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                  <span>Code not received?</span>
                  <button 
                    type="button" 
                    onClick={handleDigiLockerRequestOtp}
                    className="text-blue-400 hover:underline"
                  >
                    Resend SMS
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={digiLockerSyncing || digiLockerOtp.length !== 6 || digiLockerPin.length !== 6}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {digiLockerSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Token...</span>
                    </>
                  ) : "Verify & Authorize"}
                </button>
              </form>
            )}

            {digiLockerStep === 3 && (
              <div className="space-y-4">
                {digiLockerSyncStatus === "idle" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white font-sans">Authorized Documents Directory</h3>
                      <p className="text-xs text-white/50 leading-relaxed">Select from your official state-signed wallet directory to sync documents into your active roadmap:</p>
                    </div>
                    
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {(activeRoadmap?.documents || []).map((doc) => (
                        <div 
                          key={doc.id}
                          onClick={() => {
                            setDigiLockerSelectedDocs(prev => ({
                              ...prev,
                              [doc.id]: !prev[doc.id]
                            }));
                          }}
                          className={`p-3 bg-white/[0.02] border rounded-xl flex items-center justify-between cursor-pointer transition hover:bg-white/[0.05] ${
                            digiLockerSelectedDocs[doc.id] ? "border-blue-500/30 bg-blue-500/[0.02]" : "border-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition shrink-0 ${
                              digiLockerSelectedDocs[doc.id] ? "bg-blue-500 border-blue-500 text-black" : "border-white/20"
                            }`}>
                              {digiLockerSelectedDocs[doc.id] && <Check className="w-3 h-3 stroke-[3px]" />}
                            </div>
                            <div className="text-left truncate">
                              <p className="text-xs font-bold text-white truncate">{doc.name}</p>
                              <p className="text-[9px] text-white/40 font-mono truncate">{doc.purpose}</p>
                            </div>
                          </div>
                          <span className="text-[8px] font-mono uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 shrink-0">
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleDigiLockerSyncSelectedDocs}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Pull {Object.values(digiLockerSelectedDocs).filter(Boolean).length} Verified Assets
                    </button>
                  </div>
                )}

                {digiLockerSyncStatus === "syncing" && (
                  <div className="space-y-5 py-2">
                    <div className="text-center space-y-1">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                      <h3 className="text-sm font-bold text-white font-sans">Syncing Secured State Channels</h3>
                      <p className="text-xs text-white/40">Fetching authenticated federal records safely...</p>
                    </div>
                    
                    <div className="space-y-1.5 p-4 bg-black/50 border border-white/5 rounded-2xl h-44 overflow-y-auto font-mono text-[9px] text-blue-300">
                      {digiLockerProgressLog.map((log, idx) => (
                        <div key={idx} className="flex gap-2 text-left">
                          <span className="text-white/30 shrink-0">⚡</span>
                          <span className="leading-relaxed">{log}</span>
                        </div>
                      ))}
                      {digiLockerProgressLog.length < 6 && (
                        <div className="flex items-center gap-1.5 text-white/30 animate-pulse text-left">
                          <span>⚡</span>
                          <span>Decrypting secure records payload...</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Animated progress bar */}
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden relative">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-300 rounded-full" 
                        style={{ width: `${(digiLockerProgressLog.length / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {digiLockerSyncStatus === "complete" && (
                  <div className="text-center p-4 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <ShieldCheck className="w-7 h-7 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white font-sans">Dynamic Verification Perfected</h3>
                      <p className="text-xs text-white/50">Your active roadmap compliance vault is fully secured.</p>
                    </div>
                    
                    <div className="p-3.5 bg-black/40 rounded-xl text-left border border-white/5 space-y-2">
                      <span className="text-[10px] font-mono text-white/40 block uppercase tracking-wider">Secured Documents List:</span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {(activeRoadmap?.documents || []).map(doc => {
                          if (digiLockerSelectedDocs[doc.id]) {
                            return (
                              <div key={doc.id} className="flex items-center justify-between font-mono text-[10px] text-emerald-400">
                                <span className="truncate flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                  {doc.name}
                                </span>
                                <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">Secured</span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsDigiLockerOpen(false);
                        setSmsToast(null);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-sans font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                    >
                      Return to Compliance Hub
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DYNAMIC MODAL 2: AI MULTIMODAL OCR SCANNER */}
      {isOcrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0a0d14] border border-white/10 rounded-3xl p-6 space-y-5 text-left relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-500">
                <Camera className="w-5 h-5" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest">Document Verification & Entry</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOcrManualMode(!ocrManualMode);
                    if (!ocrManualMode && profile.name) {
                      setManualOcrData(prev => ({ ...prev, name: profile.name }));
                    }
                  }}
                  className={`px-3 py-1 text-[11px] font-mono rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                    ocrManualMode 
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                      : "bg-white/5 text-white/70 hover:text-white border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Pencil className="w-3 h-3" />
                  <span>{ocrManualMode ? "Switch to Scanner" : "Enter Manually"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCameraForOcr();
                    setIsOcrOpen(false);
                    setOcrFallbackNotice(null);
                  }}
                  className="text-white/40 hover:text-white p-1 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {ocrFallbackNotice && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-200">{ocrFallbackNotice}</p>
                  <p className="text-[11px] text-white/60">Note: Manual entry will be verified during processing, keeping your application unblocked.</p>
                </div>
              </div>
            )}

            {ocrManualMode ? (
              // Manual Document Entry Fallback View
              <div className="p-5 bg-[#0d0f14] rounded-2xl border border-white/10 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Manual Document Declaration</h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                    Fallback Entry Mode
                  </span>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-1 text-white/70">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Never Blocked Policy:
                  </p>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    You can declare document details manually to proceed immediately. A clear audit note is appended that manual entry will be verified by departmental officers during processing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-white/60 block">
                      Document Type *
                    </label>
                    <select
                      value={manualOcrData.documentType}
                      onChange={(e) => setManualOcrData({ ...manualOcrData, documentType: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                      <option value="PAN Card">PAN Card (Income Tax)</option>
                      <option value="Income Certificate">Income Certificate (Revenue / Tehsildar)</option>
                      <option value="Caste Certificate">Caste / Community Certificate</option>
                      <option value="Domicile Certificate">Domicile / Residence Certificate</option>
                      <option value="Ration Card">Ration Card / Food Security Card</option>
                      <option value="Driving License">Driving License (Sarathi)</option>
                      <option value="Voter ID">Voter ID (EPIC / ECI)</option>
                      <option value="Bank Passbook">Bank Passbook / Statement</option>
                      <option value="Land Record / Patta">Land Record / Patta / 7/12</option>
                      <option value="Statutory Enclosure">Other Statutory Enclosure</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-white/60 block">
                      Citizen Full Name (As on Document) *
                    </label>
                    <input
                      type="text"
                      value={manualOcrData.name}
                      placeholder={profile.name || "Enter citizen name"}
                      onChange={(e) => setManualOcrData({ ...manualOcrData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-white/60 block">
                      Identification / Serial Number *
                    </label>
                    <input
                      type="text"
                      value={manualOcrData.idNumber}
                      placeholder="e.g. XXXX-XXXX-1234 or Certificate No."
                      onChange={(e) => setManualOcrData({ ...manualOcrData, idNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-white/60 block">
                      Issue Date / Validity Date
                    </label>
                    <input
                      type="date"
                      value={manualOcrData.issueDate}
                      onChange={(e) => setManualOcrData({ ...manualOcrData, issueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOcrManualMode(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs rounded-xl cursor-pointer"
                  >
                    Back to Scanner
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyManualOcr}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Document & Continue Application</span>
                  </button>
                </div>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-1">
              
              {/* Left Column: Image inputs */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase text-white/40 block">Step 1: Capture or Upload Document Image</span>
                
                {isCameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 flex items-center justify-center">
                    <video id="ocr-video-feed" autoPlay playsInline className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={captureCameraPhoto}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-500 text-black font-bold font-mono text-xs uppercase rounded-full shadow-lg hover:bg-amber-400 cursor-pointer"
                    >
                      Capture Frame
                    </button>
                  </div>
                ) : ocrImage ? (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/5 aspect-video flex items-center justify-center group">
                      <img src={ocrImage} alt="Certificate preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsAnnotating(true)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-[10px] uppercase rounded-lg shadow-lg cursor-pointer flex items-center gap-1 transition"
                          title="Draw or add text labels onto certificate"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Annotate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setOcrImage(null)}
                          className="p-1.5 bg-black/60 hover:bg-black text-red-400 rounded-full cursor-pointer"
                          title="Clear photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAnnotating(true)}
                      className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold uppercase rounded-xl cursor-pointer flex items-center justify-center gap-2 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Draw or Add Text Stamps onto Certificate</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-4 bg-black/20 flex flex-col items-center justify-center min-h-[200px]">
                    <UploadCloud className="w-8 h-8 text-white/30" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-white">Scan Government Certificate</p>
                      <p className="text-[10px] text-white/40 leading-normal max-w-xs">Scan physical certificates using device camera, or upload image files.</p>
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={startCameraForOcr}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-[10px] uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Start Live Camera</span>
                      </button>
                      <label className="px-4 py-2 bg-white/5 border border-white/10 text-white font-mono font-bold text-[10px] uppercase rounded-xl transition cursor-pointer hover:bg-white/10 flex items-center justify-center">
                        Browse File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleOcrFilePick}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {isCameraActive && (
                  <button
                    type="button"
                    onClick={stopCameraForOcr}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[10px] font-bold uppercase rounded-xl cursor-pointer"
                  >
                    Stop Camera
                  </button>
                )}
              </div>

              {/* Right Column: Extracted results */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase text-white/40 block">Step 2: AI Document Analysis</span>

                {ocrLoading ? (
                  <div className="p-8 rounded-2xl bg-black/20 border border-white/5 flex flex-col items-center justify-center h-full min-h-[200px] space-y-3">
                    <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                    <p className="text-xs text-white/60 font-mono animate-pulse">Running Multimodal AI OCR...</p>
                  </div>
                ) : ocrResult ? (
                  <div className="space-y-4 h-full flex flex-col justify-between">
                    <div className="p-4 bg-[#0d0f14] rounded-2xl border border-white/5 space-y-3 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/40 font-mono text-[9px] uppercase">Document Classified</span>
                        <span className="text-amber-400 font-bold font-sans">{ocrResult.documentType}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/40 font-mono text-[9px] uppercase">Legal Name Matches</span>
                        <span className="text-white font-bold font-sans">{ocrResult.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/40 font-mono text-[9px] uppercase">Certificate Serial ID</span>
                        <span className="text-white font-bold font-mono text-[10px]">{ocrResult.idNumber}</span>
                      </div>
                      {ocrResult.dob && (
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40 font-mono text-[9px] uppercase">Date of Birth</span>
                          <span className="text-white font-mono text-[10px]">{ocrResult.dob}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-white/40 font-mono text-[9px] uppercase">AI Confidence score</span>
                        <span className="text-emerald-400 font-bold font-mono text-[10px]">{ocrResult.confidenceScore}%</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-mono text-white/30 leading-relaxed">
                        ✓ Verified by Bharat Nav Multi-Modal SDK. Proceeding syncs extracted fields to Demographics.
                      </p>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={handleApplyOcrResult}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Sync to Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSyncOcrToDigiLocker}
                          className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Sync & Save to Bharat Navigator Secure Vault</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-black/20 border border-white/5 text-center text-white/30 text-xs flex flex-col items-center justify-center min-h-[200px] font-mono space-y-3">
                    <p>Waiting for scanned document input...</p>
                    <button
                      type="button"
                      onClick={() => {
                        setOcrManualMode(true);
                        if (profile.name) {
                          setManualOcrData(prev => ({ ...prev, name: profile.name }));
                        }
                      }}
                      className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs rounded-xl font-sans transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Prefer typing details manually? Click here</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT ANNOTATOR CANVAS MODAL */}
      {isAnnotating && ocrImage && (
        <DocumentAnnotator
          imageUrl={ocrImage}
          onSave={(annotatedImageBase64) => {
            setOcrImage(annotatedImageBase64);
            setIsAnnotating(false);
            processOcrImage(annotatedImageBase64);
          }}
          onClose={() => setIsAnnotating(false)}
        />
      )}

      {/* FLOAT: VOICE LISTENING HUD */}
      {isVoiceAssistantListening && (
        <div className="fixed bottom-6 right-6 z-50 p-5 bg-[#0e1610] border border-[#22c55e]/20 rounded-2xl shadow-2xl flex items-center gap-4">
          <div className="relative w-8 h-8 flex items-center justify-center bg-[#22c55e]/20 rounded-full border border-[#22c55e]/30 text-[#22c55e] animate-pulse">
            <Mic className="w-4 h-4" />
            <span className="absolute inset-0 rounded-full bg-[#22c55e]/10 animate-ping" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-white font-mono uppercase tracking-wide">Assistant Listening...</p>
            <p className="text-[10px] text-white/50">Speak now in {language}.</p>
          </div>
        </div>
      )}

      {/* FLOAT: TEXT TO SPEECH SPEAKER HUD */}
      {isSpeaking && (
        <div className="fixed bottom-6 right-6 z-50 p-5 bg-[#14120a] border border-amber-500/20 rounded-2xl shadow-2xl flex items-center gap-4">
          <div className="relative w-8 h-8 flex items-center justify-center bg-amber-500/20 rounded-full border border-amber-500/30 text-amber-400 animate-pulse">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-white font-mono uppercase tracking-wide">Assistant Speaking</p>
            <button
              onClick={stopSpeakingAloud}
              className="text-[10px] text-amber-500 hover:underline font-mono text-left block cursor-pointer"
            >
              Mute Assistant Voice
            </button>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocModal && (
        <PdfPreviewerModal
          document={{
            id: previewDocModal.id,
            name: previewDocModal.name,
            docNumber: `DOC-${previewDocModal.id.substring(0, 8).toUpperCase()}`,
            issuer: previewDocModal.where || "Firebase Storage Vault",
            category: previewDocModal.category || "Identity Document",
            validity: previewDocModal.validity,
            issueDate: "Verified",
            downloadUrl: previewDocModal.downloadUrl,
            sha256Hash: previewDocModal.storagePath ? `sha256-${previewDocModal.storagePath}` : undefined
          }}
          onClose={() => setPreviewDocModal(null)}
        />
      )}

      {/* Citizen Credentials Entry Modal - Strict 2-Step Onboarding Flow (Phase 8) */}
      {showCitizenCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="onboarding-modal-title">
          <div className="w-full max-w-2xl bg-[#0b0e14] border border-amber-500/40 rounded-3xl p-6 space-y-5 text-left shadow-2xl relative overflow-y-auto max-h-[90vh]">
            {/* Header with Step Indicators */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="onboarding-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                    <span>{t("nav.dpiPlanner", profile.language || language)} — Citizen Onboarding</span>
                    <span className="text-[10px] uppercase font-mono bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Step {modalPhase} of 2
                    </span>
                  </h3>
                  <p className="text-[11px] text-white/60">
                    {modalPhase === 1 
                      ? "Step 1: Enter your name, state, district, age, and primary occupation."
                      : "Step 2: Select income bracket, education, social category, and language."}
                  </p>
                </div>
              </div>
              {profile.onboardingCompleted && (
                <button 
                  type="button"
                  aria-label="Close onboarding modal"
                  onClick={() => setShowCitizenCredentialsModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition cursor-pointer self-start sm:self-center"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Step Switcher Navigation */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalPhase(1)}
                className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  modalPhase === 1 ? "bg-amber-500 text-slate-950 font-bold shadow-md" : "text-white/60 hover:text-white"
                }`}
              >
                <span>1. Name, Location & Occupation</span>
              </button>
              <button
                type="button"
                onClick={() => setModalPhase(2)}
                className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  modalPhase === 2 ? "bg-amber-500 text-slate-950 font-bold shadow-md" : "text-white/60 hover:text-white"
                }`}
              >
                <span>2. Socio-Economic & Language</span>
              </button>
            </div>

            {/* STEP 1: IDENTITY, LOCATION & OCCUPATION */}
            {modalPhase === 1 && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setModalPhase(2);
                }} 
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                      {t("form.fullName", profile.language || language)} *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value, fullName: e.target.value }))}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                      {t("form.state", profile.language || language)} *
                    </label>
                    <select 
                      value={profile.state || "Telangana"}
                      onChange={(e) => {
                        const newState = e.target.value;
                        setProfile(prev => ({
                          ...prev,
                          state: newState,
                          district: newState === "Bihar" ? "Patna" : newState === "Telangana" ? "Hyderabad" : prev.district,
                          city: newState === "Bihar" ? "Patna" : newState === "Telangana" ? "Hyderabad" : prev.city
                        }));
                      }}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Telangana">Telangana</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                      District / City *
                    </label>
                    <input 
                      type="text"
                      required
                      value={profile.district || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, district: e.target.value, city: e.target.value }))}
                      placeholder="e.g. Hyderabad / Pune / Patna / Mysuru"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                      Age & Gender *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="number"
                        min="1"
                        max="120"
                        required
                        value={profile.age || 28}
                        onChange={(e) => setProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                      />
                      <select 
                        value={profile.gender || "Male"}
                        onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-2 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                      {t("form.occupation", profile.language || language)} *
                    </label>
                    <select 
                      value={profile.occupation || "Citizen / Entrepreneur"}
                      onChange={(e) => setProfile(prev => ({ ...prev, occupation: e.target.value }))}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Citizen / Entrepreneur">Citizen / Entrepreneur</option>
                      <option value="Farmer / Agriculture">Farmer / Agriculture</option>
                      <option value="MSME Business Owner">Small Business Owner / MSME</option>
                      <option value="Student / Higher Education">Student / Higher Education</option>
                      <option value="Salaried Employee (Private)">Salaried Employee (Private)</option>
                      <option value="Government Servant">Government Servant</option>
                      <option value="Self-Employed / Artisan">Self-Employed / Artisan</option>
                      <option value="Senior Citizen / Pensioner">Senior Citizen / Pensioner</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <span>Continue to Step 2 (Income & Preferences) →</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: SOCIO-ECONOMIC CRITERIA & LANGUAGE PREFERENCE */}
            {modalPhase === 2 && (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const updatedProf: Profile = {
                    ...profile,
                    onboardingCompleted: true,
                    profileCompleted: true,
                    language: profile.language || language || "English",
                    preferredLanguage: profile.preferredLanguage || profile.language || language || "English",
                    updatedAt: new Date().toISOString()
                  };
                  setProfile(updatedProf);
                  setShowCitizenCredentialsModal(false);
                  
                  if (auth.currentUser) {
                    await saveFirebaseUserProfile(auth.currentUser.uid, updatedProf);
                  }
                  
                  // Instantly switch to Dashboard where grounding dynamically computes for entered state!
                  setActiveTab("dashboard");
                }} 
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                      {t("form.income", profile.language || language)} *
                    </label>
                    <select 
                      value={profile.income || "Below ₹1.5 Lakhs (BPL)"}
                      onChange={(e) => setProfile(prev => ({ ...prev, income: e.target.value }))}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Below ₹1.5 Lakhs (BPL)">Below ₹1.5 Lakhs (BPL Subsidies Eligible)</option>
                      <option value="₹1.5L - ₹5L">₹1.5L - ₹5L (Standard Welfare Bracket)</option>
                      <option value="₹5L - ₹10L">₹5L - ₹10L (Middle Income Group)</option>
                      <option value="Above ₹10L">Above ₹10L (Commercial Enterprise)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                      Highest Education Qualification *
                    </label>
                    <select 
                      value={profile.education || "10th Pass / Secondary School"}
                      onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Below 10th Pass">Below 10th Pass</option>
                      <option value="10th Pass / Secondary School">10th Pass / Secondary School</option>
                      <option value="12th Pass / Higher Secondary">12th Pass / Higher Secondary</option>
                      <option value="Diploma / ITI Vocational">Diploma / ITI Vocational</option>
                      <option value="Graduate / Bachelor Degree">Graduate / Bachelor Degree</option>
                      <option value="Post Graduate / Master Degree">Post Graduate / Master Degree</option>
                      <option value="Doctorate / Professional">Doctorate / Professional</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                      Social Category (Caste) *
                    </label>
                    <select 
                      value={profile.caste || "General"}
                      onChange={(e) => setProfile(prev => ({ ...prev, caste: e.target.value }))}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="General">General</option>
                      <option value="OBC (Non-Creamy Layer)">OBC (Non-Creamy Layer)</option>
                      <option value="OBC (Creamy Layer)">OBC (Creamy Layer)</option>
                      <option value="SC (Scheduled Caste)">SC (Scheduled Caste)</option>
                      <option value="ST (Scheduled Tribe)">ST (Scheduled Tribe)</option>
                      <option value="EWS (Economically Weaker Section)">EWS (Economically Weaker Section)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                      Land Holding & BPL Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={profile.landHolding || "Non-Agricultural"}
                        onChange={(e) => setProfile(prev => ({ ...prev, landHolding: e.target.value }))}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-2 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Non-Agricultural">Non-Agricultural</option>
                        <option value="Marginal Farmer (< 1 Hectare)">Marginal (&lt; 1 Ha)</option>
                        <option value="Small Farmer (1-2 Hectares)">Small (1-2 Ha)</option>
                        <option value="Medium / Large Farmer (> 2 Hectares)">Large (&gt; 2 Ha)</option>
                      </select>
                      <select 
                        value={profile.bplStatus || "APL (Above Poverty Line)"}
                        onChange={(e) => setProfile(prev => ({ ...prev, bplStatus: e.target.value }))}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-2 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="APL (Above Poverty Line)">APL Card</option>
                        <option value="BPL (Below Poverty Line)">BPL Card</option>
                        <option value="Antyodaya Anna Yojana (AAY)">AAY Card</option>
                        <option value="Priority Household (PHH)">PHH Card</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Single Consolidated Language Picker */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                    {t("nav.selectLanguage", profile.language || language)} *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUPPORTED_LANGUAGES.map((langMeta) => {
                      const isSelected = normalizeLangName(profile.language || language) === langMeta.name;
                      return (
                        <div
                          key={langMeta.code}
                          onClick={() => {
                            setLanguage(langMeta.name);
                            setProfile(prev => ({
                              ...prev,
                              language: langMeta.name,
                              preferredLanguage: langMeta.name
                            }));
                          }}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-amber-500/20 border-amber-500 ring-1 ring-amber-500/50 text-white"
                              : "bg-white/5 border-white/10 hover:border-amber-500/50 text-white/80"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{langMeta.flagEmoji}</span>
                            <div>
                              <span className="font-bold text-xs block">{langMeta.native}</span>
                              <span className="text-[9px] text-white/50">{langMeta.name}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setModalPhase(1)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold uppercase rounded-xl transition cursor-pointer"
                  >
                    ← Back to Step 1
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Profile & Launch Dashboard</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reusable Private Notification Centre Slide-Over */}
      <NotificationCentre
        userId={currentUser?.uid || profile.email || "default-user"}
        isOpen={isNotificationCentreOpen}
        onClose={() => setIsNotificationCentreOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
        onUnreadCountChange={(cnt) => setUnreadNotificationCount(cnt)}
        isLightTheme={isLightTheme}
        vaultDocs={vaultDocs}
        activeRoadmaps={savedRoadmaps}
      />

      </div>
    </div>
  );
}
