import { create } from "zustand";
import { goalService } from "@/lib/appwrite";

interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  year: number;
  createdAt: string;
}

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  currentYear: number;
  newGoal: {
    title: string;
    description: string;
  };

  // Actions
  fetchGoals: (userId: string, year: number) => Promise<void>;
  createGoal: (userId: string) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setNewGoal: (goal: Partial<GoalsState['newGoal']>) => void;
  setCurrentYear: (year: number) => void;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  loading: false,
  currentYear: new Date().getFullYear(),
  newGoal: {
    title: "",
    description: "",
  },

  setNewGoal: (updates) => set((state) => ({
    newGoal: { ...state.newGoal, ...updates }
  })),

  setCurrentYear: (year) => set({ currentYear: year }),

  fetchGoals: async (userId: string, year: number) => {
    // Check if goals collection is configured
    if (!import.meta.env.VITE_APPWRITE_COLLECTION_GOALS_ID) {
      console.warn("Goals collection not configured, skipping goals fetch");
      set({ goals: [], loading: false });
      return;
    }

    set({ loading: true });
    try {
      const data = await goalService.getGoals(userId, year);
      const formattedGoals = data.documents.map((doc: any) => ({
        id: doc.$id,
        userId: doc.userId,
        title: doc.title,
        description: doc.description,
        completed: doc.completed,
        year: doc.year,
        createdAt: doc.$createdAt,
      }));
      set({ goals: formattedGoals });
    } catch (error) {
      console.error("Error fetching goals:", error);
      set({ goals: [] });
    } finally {
      set({ loading: false });
    }
  },

  createGoal: async (userId: string) => {
    // Check if goals collection is configured
    if (!import.meta.env.VITE_APPWRITE_COLLECTION_GOALS_ID) {
      console.warn("Goals collection not configured, cannot create goals");
      return;
    }

    const { newGoal, goals, currentYear } = get();
    if (!newGoal.title.trim()) return;

    try {
      const createdGoal = await goalService.createGoal(
        userId,
        newGoal.title,
        newGoal.description,
        currentYear
      );

      const goal: Goal = {
        id: createdGoal.$id,
        userId,
        title: newGoal.title,
        description: newGoal.description,
        completed: false,
        year: currentYear,
        createdAt: createdGoal.$createdAt,
      };

      set({ goals: [...goals, goal] });

      // Reset form
      set({
        newGoal: {
          title: "",
          description: "",
        }
      });
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  },

  toggleGoal: async (id: string) => {
    // Check if goals collection is configured
    if (!import.meta.env.VITE_APPWRITE_COLLECTION_GOALS_ID) {
      console.warn("Goals collection not configured, cannot toggle goals");
      return;
    }

    const { goals } = get();
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const newCompleted = !goal.completed;

    // Optimistic update
    const updatedGoals = goals.map(g =>
      g.id === id ? { ...g, completed: newCompleted } : g
    );
    set({ goals: updatedGoals });

    try {
      await goalService.toggleGoal(id, newCompleted);
    } catch (error) {
      console.error("Error toggling goal:", error);
      // Revert on error
      set({ goals });
    }
  },

  deleteGoal: async (id: string) => {
    // Check if goals collection is configured
    if (!import.meta.env.VITE_APPWRITE_COLLECTION_GOALS_ID) {
      console.warn("Goals collection not configured, cannot delete goals");
      return;
    }

    const { goals } = get();
    const updatedGoals = goals.filter(g => g.id !== id);
    set({ goals: updatedGoals });

    try {
      // Note: goalService doesn't have a delete method, so this will need to be added
      console.log("Delete goal not implemented in service");
    } catch (error) {
      console.error("Error deleting goal:", error);
      // Restore on error
      set({ goals });
    }
  },
}));