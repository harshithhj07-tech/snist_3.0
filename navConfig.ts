import { 
  Home, 
  MessageSquare, 
  BadgePercent, 
  Files, 
  Route, 
  MapPin, 
  Bell, 
  History, 
  Bookmark, 
  User, 
  Settings, 
  ShieldCheck,
  LucideIcon 
} from "lucide-react";

export type PrimaryNavId =
  | "home"
  | "assistant"
  | "eligibility"
  | "documents"
  | "roadmap"
  | "office-locator"
  | "notifications"
  | "history"
  | "bookmarks"
  | "profile"
  | "settings"
  | "admin";

export type NavSectionId = "main" | "activity" | "account" | "admin";

export interface NavConfigItem {
  id: PrimaryNavId;
  labelKey: string;
  defaultLabel: string;
  icon: LucideIcon;
  section: NavSectionId;
  badgeType?: "notifications" | "documents" | "journeys" | "bookmarks";
  description?: string;
  mobilePriority?: number;
  adminOnly?: boolean;
}

export const NAV_CONFIG: NavConfigItem[] = [
  // A. MAIN
  {
    id: "home",
    labelKey: "nav.home",
    defaultLabel: "Home",
    icon: Home,
    section: "main",
    description: "Citizen command center & next actions",
    mobilePriority: 1
  },
  {
    id: "assistant",
    labelKey: "nav.aiAssistant",
    defaultLabel: "AI Assistant",
    icon: MessageSquare,
    section: "main",
    description: "Ask questions, get guided roadmap advice",
    mobilePriority: 2
  },
  {
    id: "roadmap",
    labelKey: "nav.journeys",
    defaultLabel: "My Journeys",
    icon: Route,
    section: "main",
    badgeType: "journeys",
    description: "Active application roadmaps & dependencies",
    mobilePriority: 3
  },
  {
    id: "eligibility",
    labelKey: "nav.eligibilityServices",
    defaultLabel: "Eligibility & Services",
    icon: BadgePercent,
    section: "main",
    description: "Check eligibility across central & state schemes",
    mobilePriority: 4
  },
  {
    id: "documents",
    labelKey: "nav.documents",
    defaultLabel: "Documents",
    icon: Files,
    section: "main",
    badgeType: "documents",
    description: "Vault & document verification status",
    mobilePriority: 5
  },
  {
    id: "office-locator",
    labelKey: "nav.findOffice",
    defaultLabel: "Find an Office",
    icon: MapPin,
    section: "main",
    description: "Locate relevant department offices & seva kendras",
    mobilePriority: 6
  },

  // B. ACTIVITY & ACCOUNT
  {
    id: "notifications",
    labelKey: "nav.notifications",
    defaultLabel: "Notifications",
    icon: Bell,
    section: "activity",
    badgeType: "notifications",
    description: "Alerts, document expiry & SLA updates",
    mobilePriority: 7
  },
  {
    id: "profile",
    labelKey: "nav.profile",
    defaultLabel: "Profile",
    icon: User,
    section: "account",
    description: "Demographics, language & citizen photo",
    mobilePriority: 8
  },
  {
    id: "history",
    labelKey: "nav.activity",
    defaultLabel: "Activity",
    icon: History,
    section: "activity",
    description: "Past conversations, actions & audit log",
    mobilePriority: 9
  },
  {
    id: "bookmarks",
    labelKey: "nav.savedServices",
    defaultLabel: "Saved Services",
    icon: Bookmark,
    section: "activity",
    badgeType: "bookmarks",
    description: "Bookmarked schemes & government resources",
    mobilePriority: 10
  },
  {
    id: "settings",
    labelKey: "nav.settings",
    defaultLabel: "Settings",
    icon: Settings,
    section: "account",
    description: "Preferences, trust & security controls",
    mobilePriority: 11
  },

  // C. ADMIN
  {
    id: "admin",
    labelKey: "nav.adminConsole",
    defaultLabel: "Admin Console",
    icon: ShieldCheck,
    section: "admin",
    description: "Platform audit, metrics & systemic controls",
    adminOnly: true,
    mobilePriority: 12
  }
];

export const NAV_SECTIONS: { id: NavSectionId; labelKey: string; defaultLabel: string }[] = [
  { id: "main", labelKey: "nav.sectionMain", defaultLabel: "MAIN" },
  { id: "activity", labelKey: "nav.sectionActivity", defaultLabel: "ACTIVITY" },
  { id: "account", labelKey: "nav.sectionAccount", defaultLabel: "ACCOUNT" },
  { id: "admin", labelKey: "nav.sectionAdmin", defaultLabel: "ADMIN" }
];
