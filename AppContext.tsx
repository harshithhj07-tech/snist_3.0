import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Profile, RoadmapData, Message, UserNotification, AIConversation, AIWorkspace, CitizenTimelineEvent, CrossJourneyConsentPermission } from "../types";
import { DigiLockerDoc } from "../components/DigiLockerVault";
import { eventBus } from "../services/eventBus";
import {
  getFirebaseUserProfile,
  saveFirebaseUserProfile,
  getFirebaseUserDocuments,
  saveFirebaseUserDocument,
  deleteFirebaseUserDocument,
  getFirebaseUserRoadmaps,
  saveFirebaseUserRoadmap,
  getFirebaseUserMessages,
  saveFirebaseUserMessage,
  getFirebaseUserNotifications,
  saveFirebaseUserNotification,
  getFirebaseUserBookmarks,
  getFirebaseUserConversations,
  saveFirebaseUserConversation,
  deleteFirebaseUserConversation,
  getFirebaseUserTimeline,
  saveFirebaseUserTimelineEvent,
  getFirebaseUserConsents,
  saveFirebaseUserConsent,
} from "../utils/firebaseDb";
import { auth } from "../firebase";
import { onSupabaseAuthStateChange } from "../supabase";
import { SAMPLE_GOVERNMENT_JOURNEY, DEFAULT_CITIZEN_PROFILE, DEFAULT_VAULT_DOCS } from "../data/sampleJourney";

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "document" | "profile" | "ocr" | "ai" | "roadmap" | "notification";
}

export const DEFAULT_WORKSPACES: AIWorkspace[] = [
  { id: "general", name: "General Inquiries", iconName: "HelpCircle", description: "General government schemes, public services, and e-district inquiries", color: "amber", isDefault: true },
  { id: "passport", name: "Passport & Travel", iconName: "Globe", description: "Passport issuance, Tatkaal application, Police verification & Visa guidance", color: "blue" },
  { id: "business", name: "Business & MSME", iconName: "Briefcase", description: "Company incorporation, Udyam registration, Shop license & Startup India", color: "emerald" },
  { id: "scholarships", name: "Scholarships & Education", iconName: "GraduationCap", description: "State post-matric study grants, NSP scholarship portal & Bonafide verifications", color: "purple" },
  { id: "taxes", name: "Taxes & Compliance", iconName: "FileText", description: "GST notices, Income tax filing, Tax audit defense & PAN linking", color: "rose" },
  { id: "agriculture", name: "Agriculture & Solar", iconName: "Sprout", description: "Kisan Credit Card, PM-KUSUM solar pumps, Land Patta & Dairy ventures", color: "green" },
  { id: "health", name: "Health & Ayushman", iconName: "HeartPulse", description: "Ayushman Bharat cards, ABHA health ID & Disability pension benefits", color: "cyan" },
];

interface AppContextType {
  userId: string;
  userName: string;
  userEmail: string;
  isLightTheme: boolean;
  setIsLightTheme: (val: boolean) => void;

  profile: Profile;
  updateProfile: (newProfile: Partial<Profile>) => Promise<void>;

  vaultDocs: DigiLockerDoc[];
  addVaultDoc: (doc: DigiLockerDoc) => Promise<void>;
  updateVaultDoc: (doc: DigiLockerDoc) => Promise<void>;
  deleteVaultDoc: (docId: string) => Promise<void>;

  savedServices: any[];
  roadmaps: RoadmapData[];
  addRoadmap: (roadmap: RoadmapData) => Promise<void>;

  messages: Message[];
  addMessage: (msg: Message) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;

  // AI Conversations & Workspace state
  conversations: AIConversation[];
  activeConversationId: string | null;
  activeConversation: AIConversation | null;
  workspaces: AIWorkspace[];
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;

  createNewConversation: (title?: string, workspaceId?: string) => Promise<string>;
  selectConversation: (id: string) => void;
  saveCurrentConversation: (conv: AIConversation) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  togglePinConversation: (id: string) => Promise<void>;
  toggleFavoriteConversation: (id: string) => Promise<void>;
  archiveConversation: (id: string, archive?: boolean) => Promise<void>;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  duplicateConversation: (id: string) => Promise<string>;
  mergeConversations: (targetId: string, sourceId: string) => Promise<void>;

  // Citizen Timeline & Activity
  timelineEvents: CitizenTimelineEvent[];
  addTimelineEvent: (event: Omit<CitizenTimelineEvent, "id" | "userId" | "timestamp">) => Promise<void>;

  notifications: UserNotification[];
  addNotification: (notif: Partial<UserNotification>) => Promise<void>;
  markNotificationRead: (notifId: string) => Promise<void>;

  consents: CrossJourneyConsentPermission[];
  updateConsentPermission: (id: string, status: "ALLOWED" | "DENIED") => Promise<void>;

  activityLog: ActivityItem[];
  addActivity: (item: Omit<ActivityItem, "id" | "timestamp">) => void;

  currentGoal: string;
  setCurrentGoal: (goal: string) => void;

  preferredLanguage: string;
  setPreferredLanguage: (lang: string) => void;

  isLoadingData: boolean;
  refreshUserData: () => Promise<void>;

  // Global search helper
  globalSearch: (query: string) => {
    conversations: AIConversation[];
    documents: DigiLockerDoc[];
    roadmaps: RoadmapData[];
    notifications: UserNotification[];
  };

  // Computed Live Metrics for Dashboard
  profileCompletionPercentage: number;
  verifiedDocsCount: number;
  pendingDocsCount: number;
  upcomingExpiryCount: number;
  unreadNotificationsCount: number;
}

export const DEMO_SEED_PROFILE: Profile = {
  name: "Citizen User",
  state: "Telangana",
  district: "Hyderabad",
  age: 28,
  gender: "Male",
  occupation: "Self-Employed",
  income: "₹ 3,50,000 / Year",
  education: "Graduate",
  caste: "General",
  existingDocs: [],
  language: "English",
  email: "user@example.com",
  onboardingCompleted: true,
  profileCompleted: true,
};

const defaultProfile: Profile = {
  name: "",
  state: "",
  district: "",
  age: 0,
  gender: "",
  occupation: "",
  income: "",
  education: "",
  caste: "",
  existingDocs: [],
  language: "English",
  email: "",
  onboardingCompleted: false,
  profileCompleted: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string>(auth.currentUser?.uid || "");
  const [userName, setUserName] = useState<string>(auth.currentUser?.displayName || "Citizen User");
  const [userEmail, setUserEmail] = useState<string>(auth.currentUser?.email || "user@example.com");
  const [isLightTheme, setIsLightTheme] = useState<boolean>(false);

  const [profile, setProfileState] = useState<Profile>(DEFAULT_CITIZEN_PROFILE as any);
  const [vaultDocs, setVaultDocs] = useState<DigiLockerDoc[]>(DEFAULT_VAULT_DOCS as any);
  const [savedServices, setSavedServices] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([SAMPLE_GOVERNMENT_JOURNEY]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [consents, setConsents] = useState<CrossJourneyConsentPermission[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);

  // Conversations & Workspaces state
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [workspaces] = useState<AIWorkspace[]>(DEFAULT_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("general");
  const [timelineEvents, setTimelineEvents] = useState<CitizenTimelineEvent[]>([]);

  const [currentGoal, setCurrentGoal] = useState<string>("");
  const [preferredLanguage, setPreferredLanguageState] = useState<string>(() => {
    try {
      return localStorage.getItem("bharat_preferred_language") || "Hindi";
    } catch {
      return "Hindi";
    }
  });
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Synchronized language setter that updates state, localStorage, and profile
  const setPreferredLanguage = useCallback((lang: string) => {
    if (!lang) return;
    const normalized = lang.trim();
    setPreferredLanguageState(normalized);
    try {
      localStorage.setItem("bharat_preferred_language", normalized);
    } catch {
      // Ignore storage errors
    }
    setProfileState((prev) => {
      const updated = { ...prev, language: normalized, preferredLanguage: normalized };
      if (userId && userId !== "usr_default" && auth.currentUser) {
        saveFirebaseUserProfile(userId, updated).catch(console.warn);
      }
      return updated;
    });
  }, [userId]);

  // Computed active conversation object
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  // Sync auth changes
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName || "Citizen User");
        setUserEmail(user.email || "user@example.com");
      } else {
        setUserId("");
        setUserName("Citizen User");
        setUserEmail("user@example.com");
      }
    });

    const { data: { subscription } } = onSupabaseAuthStateChange((event, session) => {
      if (session?.user) {
        const u = session.user;
        const name = u.user_metadata?.name || u.user_metadata?.fullName || u.email?.split("@")[0] || "Priya Sharma";
        const state = u.user_metadata?.state || "Telangana";
        const district = u.user_metadata?.district || (state === "Bihar" ? "Patna" : "Hyderabad");
        setUserId(u.id);
        setUserName(name);
        setUserEmail(u.email || "");
        setProfileState(prev => ({
          ...prev,
          name,
          fullName: name,
          email: u.email || prev.email,
          state,
          district,
          city: district,
          language: u.user_metadata?.language || prev.language
        }));
      }
    });

    return () => {
      unsub();
      subscription?.unsubscribe();
    };
  }, []);

  // Helper to add activity
  const addActivity = useCallback((item: Omit<ActivityItem, "id" | "timestamp">) => {
    const newAct: ActivityItem = {
      ...item,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setActivityLog((prev) => [newAct, ...prev].slice(0, 20));
  }, []);

  // Add timeline event to memory and Firestore
  const addTimelineEvent = useCallback(async (evt: Omit<CitizenTimelineEvent, "id" | "userId" | "timestamp">) => {
    const eventObj: CitizenTimelineEvent = {
      ...evt,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: userId || "usr_default",
      timestamp: new Date().toISOString(),
    };
    setTimelineEvents((prev) => [eventObj, ...prev]);
    if (userId) {
      await saveFirebaseUserTimelineEvent(userId, eventObj);
    }
  }, [userId]);

  // Fetch all user data from Firestore
  const refreshUserData = useCallback(async () => {
    if (!userId || !auth.currentUser || userId === "usr_default" || userId === "default-user") {
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    try {
      const [profData, docsData, roadmapsData, msgsData, notifsData, bookmarksData, convsData, timelineData, consentsData] = await Promise.all([
        getFirebaseUserProfile(userId),
        getFirebaseUserDocuments(userId),
        getFirebaseUserRoadmaps(userId),
        getFirebaseUserMessages(userId),
        getFirebaseUserNotifications(userId),
        getFirebaseUserBookmarks(userId),
        getFirebaseUserConversations(userId),
        getFirebaseUserTimeline(userId),
        getFirebaseUserConsents(userId),
      ]);

      if (profData) {
        setProfileState((prev) => ({ ...prev, ...profData }));
        const loadedLang = profData.language || profData.preferredLanguage;
        if (loadedLang) {
          setPreferredLanguageState(loadedLang);
          try {
            localStorage.setItem("bharat_preferred_language", loadedLang);
          } catch {
            // ignore
          }
        }
      }
      if (docsData && docsData.length > 0) {
        setVaultDocs(docsData as DigiLockerDoc[]);
      }
      if (roadmapsData && roadmapsData.length > 0) {
        setRoadmaps(roadmapsData);
      }
      if (msgsData) {
        setMessages(msgsData);
      }
      if (notifsData) {
        setNotifications(notifsData as UserNotification[]);
      }
      if (bookmarksData) {
        setSavedServices(bookmarksData);
      }
      if (convsData) {
        setConversations(convsData as AIConversation[]);
        if (convsData.length > 0) {
          setActiveConversationId(prev => prev || convsData[0].id);
        }
      }
      if (timelineData) {
        setTimelineEvents(timelineData as CitizenTimelineEvent[]);
      }
      if (consentsData) {
        setConsents(consentsData as CrossJourneyConsentPermission[]);
      }
    } catch (err) {
      console.warn("Failed to load full user data from Firestore:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [userId]);

  // Toggle or Update Consent Permission
  const updateConsentPermission = async (id: string, status: "ALLOWED" | "DENIED") => {
    setConsents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c))
    );
    const target = consents.find((c) => c.id === id);
    if (target) {
      const updated = { ...target, status, updatedAt: new Date().toISOString() };
      await saveFirebaseUserConsent(userId || "usr_default", updated);
      eventBus.emit("CONSENT_UPDATED", updated, userId);
    }
  };

  // Initial load
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Sync active conversation messages with top-level messages state
  useEffect(() => {
    if (activeConversation) {
      setMessages(activeConversation.messages || []);
    }
  }, [activeConversationId]);

  // Create new conversation
  const createNewConversation = async (title?: string, workspaceId?: string): Promise<string> => {
    const newId = `conv_${Date.now()}`;
    const targetWs = workspaceId || activeWorkspaceId || "general";
    const defaultTitle = title || `New ${workspaces.find(w => w.id === targetWs)?.name || 'Government'} Session`;

    const newConv: AIConversation = {
      id: newId,
      userId: userId || "usr_default",
      title: defaultTitle,
      workspaceId: targetWs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      referencedDocs: [],
      workflowReferences: [],
      status: "active",
      pinned: false,
      favorite: false,
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setMessages([]);

    if (userId) {
      await saveFirebaseUserConversation(userId, newConv);
    }

    addTimelineEvent({
      title: "Started New AI Conversation",
      description: `Created conversation: ${defaultTitle}`,
      category: "conversation",
    });

    return newId;
  };

  // Select conversation
  const selectConversation = (id: string) => {
    const target = conversations.find(c => c.id === id);
    if (target) {
      setActiveConversationId(id);
      setActiveWorkspaceId(target.workspaceId || "general");
      setMessages(target.messages || []);
    }
  };

  // Save current conversation
  const saveCurrentConversation = async (convObj: AIConversation) => {
    setConversations((prev) => prev.map(c => c.id === convObj.id ? convObj : c));
    if (userId) {
      await saveFirebaseUserConversation(userId, convObj);
    }
  };

  // Delete conversation
  const deleteConversation = async (id: string) => {
    setConversations((prev) => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
        setMessages(remaining[0].messages || []);
      } else {
        setActiveConversationId(null);
        setMessages([]);
      }
    }
    if (userId) {
      await deleteFirebaseUserConversation(userId, id);
    }
    addTimelineEvent({
      title: "Deleted AI Conversation",
      description: "Removed conversation thread from Firestore memory",
      category: "conversation",
    });
  };

  // Toggle Pin Conversation
  const togglePinConversation = async (id: string) => {
    const target = conversations.find(c => c.id === id);
    if (!target) return;
    const updated = { ...target, pinned: !target.pinned, updatedAt: new Date().toISOString() };
    await saveCurrentConversation(updated);
  };

  // Toggle Favorite Conversation
  const toggleFavoriteConversation = async (id: string) => {
    const target = conversations.find(c => c.id === id);
    if (!target) return;
    const updated = { ...target, favorite: !target.favorite, updatedAt: new Date().toISOString() };
    await saveCurrentConversation(updated);
  };

  // Archive Conversation
  const archiveConversation = async (id: string, archive: boolean = true) => {
    const target = conversations.find(c => c.id === id);
    if (!target) return;
    const updated: AIConversation = {
      ...target,
      status: archive ? "archived" : "active",
      updatedAt: new Date().toISOString()
    };
    await saveCurrentConversation(updated);
  };

  // Rename Conversation
  const renameConversation = async (id: string, newTitle: string) => {
    const target = conversations.find(c => c.id === id);
    if (!target) return;
    const updated = { ...target, title: newTitle, updatedAt: new Date().toISOString() };
    await saveCurrentConversation(updated);
  };

  // Duplicate Conversation
  const duplicateConversation = async (id: string): Promise<string> => {
    const target = conversations.find(c => c.id === id);
    if (!target) return "";
    const newId = `conv_${Date.now()}`;
    const duplicated: AIConversation = {
      ...target,
      id: newId,
      title: `${target.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [duplicated, ...prev]);
    setActiveConversationId(newId);
    setMessages(duplicated.messages || []);
    if (userId) {
      await saveFirebaseUserConversation(userId, duplicated);
    }
    return newId;
  };

  // Merge Conversations
  const mergeConversations = async (targetId: string, sourceId: string) => {
    const target = conversations.find(c => c.id === targetId);
    const source = conversations.find(c => c.id === sourceId);
    if (!target || !source) return;

    const mergedMessages = [...(target.messages || []), ...(source.messages || [])].sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeA - timeB;
    });

    const updatedTarget: AIConversation = {
      ...target,
      messages: mergedMessages,
      title: `${target.title} & ${source.title}`,
      updatedAt: new Date().toISOString(),
    };

    await saveCurrentConversation(updatedTarget);
    await deleteConversation(sourceId);
  };

  // Global search across chats, docs, roadmaps, notifications
  const globalSearch = useCallback((query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return {
        conversations: [],
        documents: [],
        roadmaps: [],
        notifications: [],
      };
    }

    const matchedConvs = conversations.filter(c =>
      c.title.toLowerCase().includes(q) ||
      (c.messages || []).some(m => m.content.toLowerCase().includes(q) || (m.answer && m.answer.toLowerCase().includes(q)))
    );

    const matchedDocs = vaultDocs.filter(d =>
      d.name.toLowerCase().includes(q) ||
      (d.extractedText && d.extractedText.toLowerCase().includes(q)) ||
      (d.idNumber && d.idNumber.toLowerCase().includes(q))
    );

    const matchedRoadmaps = roadmaps.filter(r =>
      r.goal.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );

    const matchedNotifs = notifications.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q)
    );

    return {
      conversations: matchedConvs,
      documents: matchedDocs,
      roadmaps: matchedRoadmaps,
      notifications: matchedNotifs,
    };
  }, [conversations, vaultDocs, roadmaps, notifications]);

  // Subscribe to EventBus wildcard for real-time reactivity across modules
  useEffect(() => {
    const unsubscribe = eventBus.on("*", (payload) => {
      console.log(`[Central EventBus] Received Event: ${payload.type}`, payload);

      switch (payload.type) {
        case "DOCUMENT_CREATED":
          if (payload.data) {
            addActivity({
              title: "Document Uploaded",
              description: `Uploaded & encrypted ${payload.data.name || "Document"} into Secure Vault.`,
              type: "document",
            });
            addTimelineEvent({
              title: "Vault Document Added",
              description: `Uploaded ${payload.data.name || "Document"}`,
              category: "document",
            });
          }
          break;

        case "DOCUMENT_UPDATED":
          if (payload.data) {
            addActivity({
              title: "Document Updated",
              description: `Updated metadata for ${payload.data.name || "Document"}.`,
              type: "document",
            });
          }
          break;

        case "DOCUMENT_DELETED":
          addActivity({
            title: "Document Deleted",
            description: "Removed document from Secure Vault.",
            type: "document",
          });
          break;

        case "PROFILE_UPDATED":
          addActivity({
            title: "Citizen Profile Updated",
            description: "Updated demographic and state compliance details.",
            type: "profile",
          });
          addTimelineEvent({
            title: "Profile Updated",
            description: "Updated citizen state/demographic information",
            category: "profile",
          });
          break;

        case "OCR_COMPLETED":
          addActivity({
            title: "OCR Extraction Complete",
            description: "Extracted metadata & text layer via AI Multimodal Vision.",
            type: "ocr",
          });
          break;

        case "AI_ANALYSIS_COMPLETED":
          addActivity({
            title: "AI Compliance Analyzed",
            description: "Evaluated document validity & missing fields.",
            type: "ai",
          });
          break;

        case "ROADMAP_CREATED":
          addActivity({
            title: "Government Roadmap Generated",
            description: `Generated statutory roadmap for goal: ${payload.data?.goal || "Citizen Goal"}.`,
            type: "roadmap",
          });
          addTimelineEvent({
            title: "Roadmap Created",
            description: `Generated roadmap for ${payload.data?.goal || "Goal"}`,
            category: "roadmap",
          });
          break;

        default:
          break;
      }
    });

    return () => unsubscribe();
  }, [addActivity, addTimelineEvent]);

  // Update Profile
  const updateProfile = async (newProf: Partial<Profile>) => {
    const updated = { ...profile, ...newProf };
    setProfileState(updated);
    if (newProf.language || newProf.preferredLanguage) {
      const newL = (newProf.language || newProf.preferredLanguage)!.trim();
      setPreferredLanguageState(newL);
      try {
        localStorage.setItem("bharat_preferred_language", newL);
      } catch {
        // ignore
      }
    }
    if (userId) {
      await saveFirebaseUserProfile(userId, updated);
    }
    eventBus.emit("PROFILE_UPDATED", updated, userId);
  };

  // Add Vault Doc
  const addVaultDoc = async (docObj: DigiLockerDoc) => {
    setVaultDocs((prev) => [docObj, ...prev.filter((d) => d.id !== docObj.id)]);
    if (userId) {
      await saveFirebaseUserDocument(userId, docObj.id, docObj);
    }
    eventBus.emit("DOCUMENT_CREATED", docObj, userId);
    eventBus.emit("OCR_COMPLETED", docObj, userId);
    eventBus.emit("AI_ANALYSIS_COMPLETED", docObj, userId);
  };

  // Update Vault Doc
  const updateVaultDoc = async (docObj: DigiLockerDoc) => {
    setVaultDocs((prev) => prev.map((d) => (d.id === docObj.id ? docObj : d)));
    if (userId) {
      await saveFirebaseUserDocument(userId, docObj.id, docObj);
    }
    eventBus.emit("DOCUMENT_UPDATED", docObj, userId);
  };

  // Delete Vault Doc
  const deleteVaultDoc = async (docId: string) => {
    setVaultDocs((prev) => prev.filter((d) => d.id !== docId));
    if (userId) {
      await deleteFirebaseUserDocument(userId, docId);
    }
    eventBus.emit("DOCUMENT_DELETED", { id: docId }, userId);
  };

  // Add Roadmap
  const addRoadmap = async (roadmap: RoadmapData) => {
    const id = roadmap.id || `roadmap_${Date.now()}`;
    const fullRoadmap = { ...roadmap, id };
    setRoadmaps((prev) => [fullRoadmap, ...prev.filter((r) => r.id !== id)]);
    if (userId) {
      await saveFirebaseUserRoadmap(userId, id, fullRoadmap);
    }
    eventBus.emit("ROADMAP_CREATED", fullRoadmap, userId);
  };

  // Add Message (Persist chats in active conversation + Firestore)
  const addMessage = async (msg: Message) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m.id === msg.id);
      if (exists) {
        return prev.map((m) => (m.id === msg.id ? msg : m));
      }
      return [...prev, msg];
    });

    if (userId) {
      try {
        await saveFirebaseUserMessage(userId, msg);
      } catch (err) {
        console.warn("Failed to persist message to Firestore:", err);
      }
    }

    // Auto update/create conversation thread
    if (!activeConversationId) {
      const convId = `conv_${Date.now()}`;
      const title = msg.role === "user" ? (msg.content.slice(0, 40) + "...") : "Government Inquiry";
      const newConv: AIConversation = {
        id: convId,
        userId: userId || "usr_default",
        title,
        workspaceId: activeWorkspaceId || "general",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [msg],
        status: "active",
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(convId);
      if (userId) {
        await saveFirebaseUserConversation(userId, newConv);
      }
    } else {
      const curConv = conversations.find(c => c.id === activeConversationId);
      if (curConv) {
        const updatedMsgs = [...(curConv.messages || []).filter(m => m.id !== msg.id), msg];
        
        // Auto-generate smart title from first user prompt if still default or short
        let newTitle = curConv.title;
        if (msg.role === "user" && ((curConv.messages || []).length === 0 || curConv.title.startsWith("New ") || curConv.title.startsWith("Government Inquiry"))) {
          const content = msg.content || "";
          newTitle = content.length > 35 ? content.slice(0, 35) + "..." : content;
        }

        const updatedConv: AIConversation = {
          ...curConv,
          title: newTitle,
          messages: updatedMsgs,
          updatedAt: new Date().toISOString(),
        };
        saveCurrentConversation(updatedConv);
      }
    }
  };

  // Add Notification
  const addNotification = async (notif: Partial<UserNotification>) => {
    const notifObj: UserNotification = {
      id: notif.id || `notif_${Date.now()}`,
      userId: userId || "usr_default",
      title: notif.title || "System Alert",
      message: notif.message || "",
      type: notif.type || "info",
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: notif.actionUrl,
      actionLabel: notif.actionLabel,
    };
    setNotifications((prev) => [notifObj, ...prev]);
    if (userId) {
      await saveFirebaseUserNotification(userId, notifObj.id, notifObj);
    }
    eventBus.emit("NOTIFICATION_ADDED", notifObj, userId);
  };

  // Mark Notification Read
  const markNotificationRead = async (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    const target = notifications.find((n) => n.id === notifId);
    if (target && userId) {
      await saveFirebaseUserNotification(userId, notifId, { ...target, read: true });
    }
    eventBus.emit("NOTIFICATION_READ", { id: notifId }, userId);
  };

  // Compute Citizen Profile Completion % dynamically (0-100)
  const profileCompletionPercentage = (() => {
    const fields = [
      profile.name,
      profile.state,
      profile.district,
      profile.age,
      profile.gender,
      profile.occupation,
      profile.income,
      profile.education,
      profile.caste,
      profile.email,
    ];
    const filled = fields.filter((f) => f !== undefined && f !== null && f !== "" && f !== "Not specified").length;
    return Math.round((filled / fields.length) * 100);
  })();

  // Compute Live Document Metrics
  const verifiedDocsCount = (vaultDocs || []).filter((d) => d?.verifiedByIssuer || (d?.confidenceScore && d.confidenceScore >= 85)).length;
  const pendingDocsCount = (vaultDocs || []).filter((d) => (d?.missingFields && d.missingFields.length > 0) || (d?.confidenceScore && d.confidenceScore < 85)).length;
  const upcomingExpiryCount = (vaultDocs || []).filter((d) => d?.expiresSoon || d?.isExpired).length;
  const unreadNotificationsCount = (notifications || []).filter((n) => !n?.read).length;

  return (
    <AppContext.Provider
      value={{
        userId,
        userName,
        userEmail,
        isLightTheme,
        setIsLightTheme,

        profile,
        updateProfile,

        vaultDocs,
        addVaultDoc,
        updateVaultDoc,
        deleteVaultDoc,

        savedServices,
        roadmaps,
        addRoadmap,

        messages,
        addMessage,
        setMessages,

        conversations,
        activeConversationId,
        activeConversation,
        workspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,

        createNewConversation,
        selectConversation,
        saveCurrentConversation,
        deleteConversation,
        togglePinConversation,
        toggleFavoriteConversation,
        archiveConversation,
        renameConversation,
        duplicateConversation,
        mergeConversations,

        timelineEvents,
        addTimelineEvent,

        notifications,
        addNotification,
        markNotificationRead,

        consents,
        updateConsentPermission,

        activityLog,
        addActivity,

        currentGoal,
        setCurrentGoal,

        preferredLanguage,
        setPreferredLanguage,

        isLoadingData,
        refreshUserData,

        globalSearch,

        profileCompletionPercentage,
        verifiedDocsCount,
        pendingDocsCount,
        upcomingExpiryCount,
        unreadNotificationsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

