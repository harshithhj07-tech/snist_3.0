import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CitizenProfile, RoadmapData } from "../../types";
import { NAV_CONFIG, NAV_SECTIONS, PrimaryNavId } from "./navConfig";
import { NavItem } from "./NavItem";
import { NavSection } from "./NavSection";
import { CurrentJourneyCard } from "./CurrentJourneyCard";
import { UserContextCard } from "./UserContextCard";
import { Compass, X, Sun, Moon, Search } from "lucide-react";
import { t } from "../../utils/translations";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
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

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onClose,
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
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

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

  const handleNavClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Sliding Drawer */}
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className={`relative w-[300px] max-w-[88vw] z-10 border-r flex flex-col h-full shrink-0 shadow-2xl ${
            isLightTheme ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-[#0a0c10] border-white/10 text-white"
          }`}
        >
          {/* Close button */}
          <div className="absolute top-4 right-4 z-20">
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isLightTheme
                  ? "bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300"
                  : "bg-white/10 border-white/10 text-white hover:bg-white/20"
              }`}
              aria-label={t("nav.closeMenu", userLanguage) || "Close Menu"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Branding Header */}
          <div
            className={`p-5 border-b flex items-center gap-3 ${
              isLightTheme ? "border-slate-300 bg-slate-200/50" : "border-white/10 bg-black/20"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Compass className="w-5 h-5" />
            </div>
            <div className="text-left min-w-0 pr-8">
              <h1 className={`text-xs font-bold tracking-widest uppercase truncate ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                BHARAT NAVIGATOR
              </h1>
              <p className="text-[9px] text-amber-500 font-mono tracking-wider uppercase font-semibold truncate">
                Govt Made Navigable
              </p>
            </div>
          </div>

          {/* Scrollable Nav Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <CurrentJourneyCard
              activeRoadmap={activeRoadmap}
              onNavigate={handleNavClick}
              isLightTheme={isLightTheme}
              userLanguage={userLanguage}
            />

            <UserContextCard
              profile={profile}
              isLightTheme={isLightTheme}
              onOpenProfile={() => handleNavClick("profile")}
            />

            <nav className="space-y-3" aria-label="Mobile Navigation List">
              {NAV_SECTIONS.map((section) => {
                if (section.id === "admin" && !isAdmin) return null;

                const sectionItems = NAV_CONFIG.filter((item) => item.section === section.id);
                if (sectionItems.length === 0) return null;

                return (
                  <div key={section.id} className="space-y-0.5">
                    <NavSection
                      labelKey={section.labelKey}
                      defaultLabel={section.defaultLabel}
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
                          onClick={() => handleNavClick(item.id)}
                          badgeCount={badgeCount}
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

          {/* Drawer Footer */}
          <div
            className={`p-3 border-t flex items-center justify-between gap-2 shrink-0 ${
              isLightTheme ? "border-slate-300 bg-slate-200/50" : "border-white/10 bg-black/20"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onOpenQuickAction();
                onClose();
              }}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 border transition cursor-pointer ${
                isLightTheme
                  ? "bg-slate-200 border-slate-300 text-slate-700"
                  : "bg-white/5 border-white/10 text-white/70"
              }`}
            >
              <Search className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Search</span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isLightTheme
                  ? "bg-slate-200 border-slate-300 text-amber-600"
                  : "bg-white/5 border-white/10 text-amber-400"
              }`}
            >
              {isLightTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
};
