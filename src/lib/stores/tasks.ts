import { create } from "zustand";
import { taskService } from "@/lib/appwrite";
import { addXP, triggerConfetti, saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TasksState {
  tasks: Task[];
  loading: boolean;
  newTaskText: string;

  // Actions
  fetchTasks: (userId?: string) => Promise<void>;
  addTask: (userId?: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setNewTaskText: (text: string) => void;
  clearNewTaskText: () => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: true,
  newTaskText: "",

  setNewTaskText: (text: string) => set({ newTaskText: text }),

  clearNewTaskText: () => set({ newTaskText: "" }),

  fetchTasks: async (userId?: string) => {
    set({ loading: true });
    try {
      if (!userId) {
        // Load from localStorage if no user
        const localTasks = loadFromLocalStorage("tasks") || [];
        set({ tasks: localTasks, loading: false });
        return;
      }

      const data = await taskService.getTasks(userId);
      const formatted = data.documents.map((doc: any) => ({
        id: doc.$id,
        text: doc.text,
        completed: doc.completed,
      }));
      set({ tasks: formatted });
      // Save to localStorage as backup
      saveToLocalStorage("tasks", formatted);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
      // Fallback to localStorage
      const localTasks = loadFromLocalStorage("tasks") || [];
      set({ tasks: localTasks });
    } finally {
      set({ loading: false });
    }
  },

  addTask: async (userId?: string) => {
    const { newTaskText, tasks } = get();
    if (newTaskText.trim() === "" || !userId) return;

    try {
      const res = await taskService.createTask(userId, newTaskText);
      const task: Task = {
        id: res.$id,
        text: newTaskText,
        completed: false,
      };
      const updatedTasks = [task, ...tasks];
      set({ tasks: updatedTasks, newTaskText: "" });
      // Save to localStorage
      saveToLocalStorage("tasks", updatedTasks);
    } catch (error) {
      console.error("Error al guardar tarea:", error);
      // Still add to local state and localStorage for offline functionality
      const localTask: Task = {
        id: `local-${Date.now()}`,
        text: newTaskText,
        completed: false,
      };
      const updatedTasks = [localTask, ...tasks];
      set({ tasks: updatedTasks, newTaskText: "" });
      saveToLocalStorage("tasks", updatedTasks);
    }
  },

  toggleTask: async (id: string) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const nextState = !task.completed;

    // UI optimista: actualizamos primero para que sea instantáneo
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: nextState } : t
    );
    set({ tasks: updatedTasks });

    if (nextState) {
      addXP(10); // 10 XP por completar tarea
      triggerConfetti("task"); // Trigger confetti animation
    }

    // Save to localStorage immediately
    saveToLocalStorage("tasks", updatedTasks);

    try {
      await taskService.toggleTask(id, nextState);
    } catch (error) {
      // Si falla, revertimos el cambio
      console.error("Error al toggle tarea:", error);
      set({ tasks });
      saveToLocalStorage("tasks", tasks);
    }
  },

  deleteTask: async (id: string) => {
    const { tasks } = get();
    const updatedTasks = tasks.filter((t) => t.id !== id);
    set({ tasks: updatedTasks });
    saveToLocalStorage("tasks", updatedTasks);

    try {
      await taskService.deleteTask(id);
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      // Restore on error
      set({ tasks });
      saveToLocalStorage("tasks", tasks);
    }
  },
}));