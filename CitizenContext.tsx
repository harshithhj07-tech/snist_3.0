import React, { createContext, useContext, useMemo } from "react";
import { CitizenContext, JourneyInstance, NextBestAction } from "../types/citizenContext";
import { useApp } from "../context/AppContext";
import { buildCitizenContextFromProfileAndDocs } from "../services/citizenContextService";
import { resolveContextForGoal } from "../services/contextResolutionEngine";

interface CitizenContextType {
  citizenContext: CitizenContext;
  currentJourney: JourneyInstance | null;
  nextBestAction: NextBestAction | null;
  resolveGoalContext: (goal: string) => ReturnType<typeof resolveContextForGoal>;
}

const ReactCitizenContext = createContext<CitizenContextType | undefined>(undefined);

export const CitizenContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, profile, vaultDocs, roadmaps, currentGoal } = useApp();

  const citizenContext = useMemo(() => {
    return buildCitizenContextFromProfileAndDocs(userId, profile, vaultDocs);
  }, [userId, profile, vaultDocs]);

  const currentJourney: JourneyInstance | null = useMemo(() => {
    if (!roadmaps || roadmaps.length === 0) return null;
    const active = roadmaps[0];
    if (!active) return null;

    // Map RoadmapData to JourneyInstance
    const steps = (active.phases?.flatMap((p) => p.steps) || []).map((s) => ({
      id: s.id,
      title: s.title,
      purpose: s.purpose,
      whyRequired: s.whyRequired,
      mandatory: s.mandatory,
      dependencies: s.dependencies || [],
      dept: s.dept || "State Governance",
      portal: s.portal || "Official e-District Portal",
      timeline: s.timeline || "3-7 Days",
      output: s.output || "Acknowledgement Receipt",
      completed: !!s.completed,
      status: (s.status as any) || (s.completed ? "COMPLETED" : "PENDING"),
      blockingReason: s.blockingReason,
      requiredDocumentId: s.requiredDocName,
      officialLaunchUrl: s.officialLaunchUrl,
    }));

    return {
      id: active.id || "jrn_1",
      userId,
      goal: active.goal || currentGoal || "Active Journey",
      serviceId: active.category,
      jurisdiction: {
        state: active.officialPortal?.state || profile.state,
        district: profile.district,
        level: active.officialPortal?.state ? "STATE" : "CENTRAL",
      },
      status: (active.workflowStatus as any) || "IN_PROGRESS",
      steps,
      requiredDocuments: (active.documents || []).map((d) => ({
        id: d.id,
        name: d.name,
        purpose: d.purpose,
        whereToObtain: d.where,
        mandatory: d.mandatory,
        status: d.uploaded ? "PRESENT" : "MISSING",
      })),
      evidenceRefs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [roadmaps, userId, currentGoal, profile.state, profile.district]);

  const resolution = useMemo(() => {
    return resolveContextForGoal(citizenContext, currentGoal || currentJourney?.goal || "", currentJourney || undefined);
  }, [citizenContext, currentGoal, currentJourney]);

  const value = useMemo(
    () => ({
      citizenContext,
      currentJourney,
      nextBestAction: resolution.nextBestAction,
      resolveGoalContext: (goal: string) => resolveContextForGoal(citizenContext, goal, currentJourney || undefined),
    }),
    [citizenContext, currentJourney, resolution]
  );

  return <ReactCitizenContext.Provider value={value}>{children}</ReactCitizenContext.Provider>;
};

export function useCitizenContext() {
  const ctx = useContext(ReactCitizenContext);
  if (!ctx) {
    throw new Error("useCitizenContext must be used within a CitizenContextProvider");
  }
  return ctx;
}
