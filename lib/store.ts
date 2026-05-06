"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Default width for the request/response details pane (px). */
export const DEFAULT_DETAILS_PANEL_WIDTH_PX = 475;

interface ScenarioState {
  currentStep: number;
  isPlaying: boolean;
  playSpeed: number; // ms between steps
  selectedArtifactIndex: number | null;
  /** Right details panel width; persisted across scenarios and reloads. */
  detailsPanelWidthPx: number;

  setCurrentStep: (step: number) => void;
  nextStep: (maxStep: number) => void;
  prevStep: () => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaySpeed: (speed: number) => void;
  setSelectedArtifactIndex: (index: number | null) => void;
  setDetailsPanelWidthPx: (widthOrUpdater: number | ((prev: number) => number)) => void;
  reset: () => void;
}

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set) => ({
      currentStep: 0,
      isPlaying: false,
      playSpeed: 1800,
      selectedArtifactIndex: null,
      detailsPanelWidthPx: DEFAULT_DETAILS_PANEL_WIDTH_PX,

      setCurrentStep: (step) => set({ currentStep: step, selectedArtifactIndex: null }),
      nextStep: (maxStep) =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, maxStep),
          selectedArtifactIndex: null,
        })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
          selectedArtifactIndex: null,
        })),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setPlaySpeed: (speed) => set({ playSpeed: speed }),
      setSelectedArtifactIndex: (index) => set({ selectedArtifactIndex: index }),
      setDetailsPanelWidthPx: (widthOrUpdater) =>
        set((state) => ({
          detailsPanelWidthPx:
            typeof widthOrUpdater === "function"
              ? widthOrUpdater(state.detailsPanelWidthPx)
              : widthOrUpdater,
        })),
      reset: () =>
        set({
          currentStep: 0,
          isPlaying: false,
          selectedArtifactIndex: null,
        }),
    }),
    {
      name: "token-explorer-scenario",
      partialize: (state) => ({
        detailsPanelWidthPx: state.detailsPanelWidthPx,
      }),
    }
  )
);
