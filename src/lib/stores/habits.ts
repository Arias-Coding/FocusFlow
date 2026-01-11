import { create } from "zustand";
import { habitService, DB_ID, COLLECTIONS, databases } from "@/lib/appwrite";
import { addXP, normalizeDate } from "@/lib/utils";

interface Habit {
  $id: string;
  userId: string;
  name: string;
  type: "boolean" | "count";
  frequency: string;
  active: boolean;
  createdAt: string;
  unit?: string;
  target?: number;
}

interface HabitLog {
  $id: string;
  habitId: string;
  userId: string;
  date: string;
  value: number;
  completed: boolean;
}

interface HabitsState {
  habits: Habit[];
  habitLogs: { [habitId: string]: HabitLog[] };
  habitOrder: string[];
  loading: boolean;
  newHabit: {
    name: string;
    type: "boolean" | "count";
    frequency: string;
    unit: string;
    target: number;
  };

  // Actions
  fetchHabitsAndLogs: (userId: string) => Promise<void>;
  createHabit: (userId: string) => Promise<void>;
  toggleBooleanHabit: (habitId: string, date: string, userId: string) => Promise<void>;
  saveLogValue: (habitId: string, date: string, value: number, userId: string) => Promise<void>;
  deleteHabit: (habitId: string, userId: string) => Promise<void>;
  moveHabitUp: (id: string) => void;
  moveHabitDown: (id: string) => void;
  setNewHabit: (habit: Partial<HabitsState['newHabit']>) => void;
  setHabitOrder: (order: string[]) => void;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  habitLogs: {},
  habitOrder: [],
  loading: true,
  newHabit: {
    name: "",
    type: "boolean",
    frequency: "daily",
    unit: "",
    target: 0,
  },

  setNewHabit: (updates) => set((state) => ({
    newHabit: { ...state.newHabit, ...updates }
  })),

  setHabitOrder: (order) => {
    set({ habitOrder: order });
    localStorage.setItem("habitOrder", JSON.stringify(order));
  },

  fetchHabitsAndLogs: async (userId: string) => {
     set({ loading: true });
     try {
       const habitsData = await habitService.getHabits(userId);
       const habits = habitsData.documents as unknown as Habit[];
       set({ habits });

       const allLogsData = await habitService.getAllHabitLogs(userId);
       const logsGrouped: { [habitId: string]: HabitLog[] } = {};
       for (const log of allLogsData.documents) {
         const habitId = log.habitId;
         if (!logsGrouped[habitId]) logsGrouped[habitId] = [];
         logsGrouped[habitId].push(log as unknown as HabitLog);
       }
       set({ habitLogs: logsGrouped });

      // Update habit order
      const newOrder = habits.map((h) => h.$id);
      const savedOrder = localStorage.getItem("habitOrder");
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        const filtered = parsed.filter((id: string) => habits.some((h) => h.$id === id));
        const missing = newOrder.filter((id) => !filtered.includes(id));
        set({ habitOrder: [...filtered, ...missing] });
      } else {
        set({ habitOrder: newOrder });
      }
    } catch (error) {
      console.error("Error fetching habits and logs:", error);
    } finally {
      set({ loading: false });
    }
  },

  createHabit: async (userId: string) => {
    const { newHabit, habits } = get();
    if (!newHabit.name.trim()) return;

    try {
      const createdHabit = await habitService.createHabit(
        userId,
        newHabit.name,
        newHabit.type,
        newHabit.frequency,
        newHabit.type === "count" ? newHabit.unit : undefined,
        newHabit.type === "count" ? newHabit.target : undefined
      );

      const habit: Habit = {
        $id: createdHabit.$id,
        userId,
        name: newHabit.name,
        type: newHabit.type,
        frequency: newHabit.frequency,
        active: true,
        createdAt: createdHabit.$createdAt,
        unit: newHabit.type === "count" ? newHabit.unit : undefined,
        target: newHabit.type === "count" ? newHabit.target : undefined,
      };

      const updatedHabits = [...habits, habit];
      set({ habits: updatedHabits });

      // Update habit order
      const newOrder = [...get().habitOrder, habit.$id];
      set({ habitOrder: newOrder });
      localStorage.setItem("habitOrder", JSON.stringify(newOrder));

      // Reset form
      set({
        newHabit: {
          name: "",
          type: "boolean",
          frequency: "daily",
          unit: "",
          target: 0,
        }
      });
    } catch (error) {
      console.error("Error creating habit:", error);
    }
  },

   toggleBooleanHabit: async (habitId: string, date: string, userId: string) => {
     const { habitLogs } = get();
     const habit = get().habits.find((h) => h.$id === habitId);
     if (!habit || habit.type !== "boolean") return;

     const logs = habitLogs[habitId] || [];
     const existingLog = logs.find((l) => normalizeDate(l.date) === date);

     let action: 'create' | 'update' | 'delete';
     let newValue: number | undefined;
     let completed: boolean | undefined;

     if (!existingLog) {
       // null => true
       action = 'create';
       newValue = 1;
       completed = true;
     } else if (existingLog.completed) {
       // true => false
       action = 'update';
       newValue = 0;
       completed = false;
     } else {
       // false => null
       action = 'delete';
     }

     const tempId = existingLog ? existingLog.$id : `temp_${Date.now()}`;
     const wasCompleted = existingLog?.completed || false;

     // Optimistic update
     if (action === 'delete') {
       set((state) => {
         const currentLogs = state.habitLogs[habitId] || [];
         return {
           habitLogs: {
             ...state.habitLogs,
             [habitId]: currentLogs.filter((l) => l.$id !== existingLog!.$id),
           },
         };
       });
     } else {
       const newLog: HabitLog = {
         $id: tempId,
         habitId,
         userId,
         date,
         value: newValue!,
         completed: completed!,
       };
       set((state) => {
         const currentLogs = state.habitLogs[habitId] || [];
         return {
           habitLogs: {
             ...state.habitLogs,
             [habitId]: currentLogs.filter((l) => normalizeDate(l.date) !== date).concat(newLog),
           },
         };
       });
     }

     try {
       if (action === 'delete') {
         await databases.deleteDocument(
           DB_ID,
           COLLECTIONS.HABITS_LOG,
           existingLog!.$id
         );
       } else if (action === 'update') {
         await databases.updateDocument(
           DB_ID,
           COLLECTIONS.HABITS_LOG,
           existingLog!.$id,
           { value: newValue, completed }
         );
       } else {
         // create
         const createdLog = await habitService.createLog(
           habitId,
           userId,
           date,
           newValue!,
           completed!
         );
         // Update with real ID
         set((state) => {
           const currentLogs = state.habitLogs[habitId] || [];
           const updatedLog: HabitLog = {
             $id: createdLog.$id,
             habitId,
             userId,
             date,
             value: newValue!,
             completed: completed!,
           };
           return {
             habitLogs: {
               ...state.habitLogs,
               [habitId]: currentLogs.filter((l) => l.$id !== tempId).concat(updatedLog),
             },
           };
         });
       }

       if (completed! && !wasCompleted) {
         addXP(15);
       }
     } catch (error) {
       console.error("Error toggling habit:", error);
       // Revert optimistic update
       if (action === 'delete') {
         set((state) => {
           const currentLogs = state.habitLogs[habitId] || [];
           return {
             habitLogs: {
               ...state.habitLogs,
               [habitId]: currentLogs.concat(existingLog!),
             },
           };
         });
       } else {
         set((state) => {
           const currentLogs = state.habitLogs[habitId] || [];
           return {
             habitLogs: {
               ...state.habitLogs,
               [habitId]: currentLogs.filter((l) => l.$id !== tempId),
             },
           };
         });
       }
     }
   },

  saveLogValue: async (habitId: string, date: string, value: number, userId: string) => {
    const { habitLogs } = get();
    const habit = get().habits.find((h) => h.$id === habitId);
    if (!habit) return;

    const completed = value >= (habit.target || 0);
    const logs = habitLogs[habitId] || [];
    const existingLog = logs.find((l) => normalizeDate(l.date) === date);
    const wasCompleted = existingLog?.completed || false;

    let newLogId = existingLog?.$id;

    try {
      if (existingLog) {
        // Update existing log
        await databases.updateDocument(
          DB_ID,
          COLLECTIONS.HABITS_LOG,
          existingLog.$id,
          { value, completed }
        );
        newLogId = existingLog.$id;
      } else {
        // Create new log
        const createdLog = await habitService.createLog(
          habitId,
          userId,
          date,
          value,
          completed
        );
        newLogId = createdLog.$id;
      }

      // Update local state
      const newLog: HabitLog = {
        $id: newLogId,
        habitId,
        userId,
        date,
        value,
        completed,
      };

      set((state) => {
        const currentLogs = state.habitLogs[habitId] || [];
        return {
          habitLogs: {
            ...state.habitLogs,
            [habitId]: currentLogs
              .filter((l) => normalizeDate(l.date) !== date)
              .concat(newLog),
          },
        };
      });

      if (completed && !wasCompleted) {
        addXP(15);
      }
    } catch (error) {
      console.error("Error saving log value:", error);
    }
  },

  deleteHabit: async (habitId: string, userId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar este hábito? Esto también eliminará todos sus registros."
    );
    if (!confirmed) return;

    try {
      await habitService.deleteHabitLogs(habitId, userId);
      await habitService.deleteHabit(habitId);

      // Update local state
      set((state) => ({
        habits: state.habits.filter((h) => h.$id !== habitId),
        habitLogs: { ...state.habitLogs, [habitId]: [] },
        habitOrder: state.habitOrder.filter((id) => id !== habitId),
      }));

      localStorage.setItem("habitOrder", JSON.stringify(get().habitOrder));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  },

  moveHabitUp: (id: string) => {
    const { habitOrder } = get();
    const index = habitOrder.indexOf(id);
    if (index > 0) {
      const newOrder = [...habitOrder];
      [newOrder[index], newOrder[index - 1]] = [
        newOrder[index - 1],
        newOrder[index],
      ];
      set({ habitOrder: newOrder });
      localStorage.setItem("habitOrder", JSON.stringify(newOrder));
    }
  },

  moveHabitDown: (id: string) => {
    const { habitOrder } = get();
    const index = habitOrder.indexOf(id);
    if (index < habitOrder.length - 1) {
      const newOrder = [...habitOrder];
      [newOrder[index], newOrder[index + 1]] = [
        newOrder[index + 1],
        newOrder[index],
      ];
      set({ habitOrder: newOrder });
      localStorage.setItem("habitOrder", JSON.stringify(newOrder));
    }
  },
}));