import React, { useState, useEffect } from "react";
import { CitizenProfile, RoadmapData } from "../../types";
import { NAV_CONFIG, NAV_SECTIONS, PrimaryNavId } from "./navConfig";
import { NavItem } from "./NavItem";
import { NavSection } from "./NavSection";
import { CurrentJourneyCard } from "./CurrentJourneyCard";
import { UserContextCard } from "./UserContextCard";
import { SidebarFooter } from "./SidebarFooter";
import { Compass } from "lucide-react";
import { t } from "../../utils/translations";

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  profile: CitizenProfile;
  activeRoadmap?: RoadmapData | null;
  isLightTheme?: boolean;
  unreadNotificationCount?: number;
  savedBookmarksCount?: number;
  activeJourneysCount?: number;
  isAdmin?: boolean;
  onToggleTheme: () => void;
  onOpenQuickAction: () => void;
  userLanguage?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  profile,
  activeRoadmap,
  isLightTheme = false,
  unreadNotificationCount = 0,
  savedBookmarksCount = 0,
  activeJourneysCount = 1,
  isAdmin = false,
  onToggleTheme,
  onOpenQuickAction,
  userLanguage = "English",
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("bharat_navigator_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("bharat_navigator_sidebar_collapsed", String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Map legacy tab names to primary nav IDs
  const getMappedTab = (tab: string): PrimaryNavId => {
    if (tab === "dashboard") return "home";
    if (tab === "digilocker") return "documents";
    if (tab === "bookmarks") return "bookmarks";
    if (tab === "office-locator") return "office-locator";
    if (tab === "history") return "history";
    if (tab === "auth") return "profile";
    return (tab as PrimaryNavId) || "home";
  };

  const currentNavTab = getMappedTab(activeTab);

  // Compute live badges
  const uploadedDocsCount = (activeRoadmap?.documents || []).filter((d) => d?.uploaded).length;

  const getBadgeCount = (type?: string) => {
    switch (type) {
      case "notifications":
        return unreadNotificationCount;
      case "documents":
        return uploadedDocsCount;
      case "journeys":
        return activeRoadmap?.goal ? activeJourneysCount : 0;
      case "bookmarks":
        return savedBookmarksCount;
      default:
        return 0;
    }
  };

  return (
    <aside
      aria-label="Main Navigation Sidebar"
      className={`hidden lg:flex flex-col h-full shrink-0 border-r transition-all duration-300 z-30 select-none ${
        isCollapsed ? "w-[72px]" : "w-[280px]"
      } ${
        isLightTheme
          ? "bg-slate-100 border-slate-300 text-slate-800"
          : "bg-[#0a0c10] border-white/10 text-white"
      }`}
    >
      {/* 1. Branding Header */}
      <div
        className={`p-4 border-b flex items-center transition-all ${
          isCollapsed ? "justify-center px-2" : "justify-between"
        } ${isLightTheme ? "border-slate-300 bg-slate-200/50" : "border-white/10 bg-black/20"}`}
      >
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-3 text-left group focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-0.5"
          title="Bharat Navigator — Government made navigable"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:bg-amber-500/20 transition-all">
            <Compass className="w-5 h-5" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <h1
                className={`text-xs font-bold tracking-widest uppercase truncate ${
                  isLightTheme ? "text-slate-900" : "text-white"
                }`}
              >
                BHARAT NAVIGATOR
              </h1>
              <p className="text-[9px] text-amber-500 font-mono tracking-wider uppercase font-semibold truncate">
                Govt Made Navigable
              </p>
            </div>
          )}
        </button>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {/* Journey Card Widget */}
        <CurrentJourneyCard
          activeRoadmap={activeRoadmap}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
          isLightTheme={isLightTheme}
          userLanguage={userLanguage}
        />

        {/* User Context Summary */}
        <UserContextCard
          profile={profile}
          isCollapsed={isCollapsed}
          isLightTheme={isLightTheme}
          onOpenProfile={() => onNavigate("profile")}
        />

        {/* Grouped Navigation Items */}
        <nav className="space-y-3" aria-label="Sidebar Actions">
          {NAV_SECTIONS.map((section) => {
            if (section.id === "admin" && !isAdmin) return null;

            const sectionItems = NAV_CONFIG.filter((item) => item.section === section.id);
            if (sectionItems.length === 0) return null;

            return (
              <div key={section.id} className="space-y-0.5">
                <NavSection
                  labelKey={section.labelKey}
                  defaultLabel={section.defaultLabel}
                  isCollapsed={isCollapsed}
                  isLightTheme={isLightTheme}
                  userLanguage={userLanguage}
                />

                {sectionItems.map((item) => {
                  const isActive = currentNavTab === item.id;
                  const badgeCount = getBadgeCount(item.badgeType);

                  return (
                    <NavItem
                      key={item.id}
                      item={item}
                      isActive={isActive}
                      onClick={() => onNavigate(item.id)}
                      badgeCount={badgeCount}
                      isCollapsed={isCollapsed}
                      isLightTheme={isLightTheme}
                      userLanguage={userLanguage}
                    />
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* 3. Footer */}
      <SidebarFooter
        isLightTheme={isLightTheme}
        onToggleTheme={onToggleTheme}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        onOpenQuickAction={onOpenQuickAction}
      />
    </aside>
  );
};
