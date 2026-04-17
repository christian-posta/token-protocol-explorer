"use client";
import { create } from "zustand";

interface ScenarioState {
  currentStep: number;
  isPlaying: boolean;
  playSpeed: number; // ms between steps
  selectedArtifactIndex: number | null;

  setCurrentStep: (step: number) => void;
  nextStep: (maxStep: number) => void;
  prevStep: () => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaySpeed: (speed: number) => void;
  setSelectedArtifactIndex: (index: number | null) => void;
  reset: () => void;
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  currentStep: 0,
  isPlaying: false,
  playSpeed: 1800,
  selectedArtifactIndex: null,

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
  reset: () =>
    set({
      currentStep: 0,
      isPlaying: false,
      selectedArtifactIndex: null,
    }),
}));
