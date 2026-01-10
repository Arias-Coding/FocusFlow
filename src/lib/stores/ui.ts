import { create } from "zustand";

interface UIState {
  // Global loading states
  globalLoading: boolean;

  // Modal states
  modals: {
    [key: string]: boolean;
  };

  // Actions
  setGlobalLoading: (loading: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  globalLoading: false,
  modals: {},

  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  openModal: (modalId) => set((state) => ({
    modals: { ...state.modals, [modalId]: true }
  })),

  closeModal: (modalId) => set((state) => ({
    modals: { ...state.modals, [modalId]: false }
  })),

  toggleModal: (modalId) => set((state) => ({
    modals: { ...state.modals, [modalId]: !state.modals[modalId] }
  })),
}));