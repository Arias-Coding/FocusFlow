import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, ListChecks } from "lucide-react";
import {
  cn,
  addXP,
  triggerConfetti,
  saveToLocalStorage,
  loadFromLocalStorage,
} from "@/lib/utils";
import useSound from "use-sound";
import checkSound from "@/assets/sounds/pop-sound.mp3";
import deleteSound from "@/assets/sounds/del-pop.mp3";
import bellSound from "@/assets/sounds/notification-bell-sound.mp3";

import { useAuth } from "@/components/context/AuthContext";
import { taskService } from "@/lib/appwrite";
import { PageLayout, PageHeader } from "@/components/ui/layout";

interface Task {
  id: string; // Cambiado a string para Appwrite
  text: string;
  completed: boolean;
}
export function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [playComplete] = useSound(checkSound, { volume: 0.5 });
  const [playDelete] = useSound(deleteSound, { volume: 0.3 });
  const [playAdd] = useSound(bellSound, { volume: 0.3 });

  // 1. Cargar tareas iniciales
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        // Load from localStorage if no user
        const localTasks = loadFromLocalStorage("tasks") || [];
        setTasks(localTasks);
        setIsLoading(false);
        return;
      }

      try {
        const data = await taskService.getTasks(user.$id);
        const formatted = data.documents.map((doc: any) => ({
          id: doc.$id,
          text: doc.text,
          completed: doc.completed,
        }));
        setTasks(formatted);
        // Save to localStorage as backup
        saveToLocalStorage("tasks", formatted);
      } catch (error) {
        console.error("Error al cargar tareas:", error);
        // Fallback to localStorage
        const localTasks = loadFromLocalStorage("tasks") || [];
        setTasks(localTasks);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  // 2. Añadir tarea a la nube
  const addTask = async () => {
    if (newTask.trim() === "" || !user) return;

    try {
      const res = await taskService.createTask(user.$id, newTask);
      const task: Task = {
        id: res.$id,
        text: newTask,
        completed: false,
      };
      const updatedTasks = [task, ...tasks];
      setTasks(updatedTasks);
      playAdd();
      setNewTask("");
      // Save to localStorage
      saveToLocalStorage("tasks", updatedTasks);
    } catch (error) {
      console.error("Error al guardar tarea:", error);
      // Still add to local state and localStorage for offline functionality
      const localTask: Task = {
        id: `local-${Date.now()}`,
        text: newTask,
        completed: false,
      };
      const updatedTasks = [localTask, ...tasks];
      setTasks(updatedTasks);
      saveToLocalStorage("tasks", updatedTasks);
      playAdd();
      setNewTask("");
    }
  };

  // 3. Toggle de estado (Check/Uncheck)
  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const nextState = !task.completed;

    // UI optimista: actualizamos primero para que sea instantáneo
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: nextState } : t
    );
    setTasks(updatedTasks);

    nextState ? playComplete() : playDelete();

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
      setTasks(
        tasks.map((t) => (t.id === id ? { ...t, completed: !nextState } : t))
      );
    }
  };

  // 4. Eliminar de la nube
  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== id);
    setTasks(updatedTasks);
    playDelete();

    // Save to localStorage immediately
    saveToLocalStorage("tasks", updatedTasks);

    try {
      await taskService.deleteTask(id);
    } catch (error) {
      console.error("Error al borrar tarea:", error);
      // Revert the change
      setTasks(tasks);
      saveToLocalStorage("tasks", tasks);
    }
  };

  if (isLoading)
    return (
      <div className="p-10 text-center opacity-50">Cargando tareas...</div>
    );

  return (
    <PageLayout>
      <PageHeader title="Tareas" subtitle="Gestiona tus objetivos diarios" />

      <Card className="border-none bg-card/40 backdrop-blur-xl shadow-3xl rounded-[32px] lg:rounded-[45px] overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Panel Izquierdo: Estadísticas */}
            <div className="w-full lg:w-[300px] bg-muted/30 p-8 border-b lg:border-b-0 lg:border-r border-border/50 space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="bg-background/50 p-4 rounded-2xl border border-border/50">
                  <span className="text-2xl font-black text-primary">
                    {tasks.length}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                    Totales
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-2xl border border-border/50">
                  <span className="text-2xl font-black text-green-500">
                    {tasks.filter((t) => t.completed).length}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                    Listas
                  </p>
                </div>
              </div>
            </div>

            {/* Panel Derecho: Lista Dinámica */}
            <div className="flex-1 p-6 lg:p-10 space-y-8">
              {/* Input de Alta Fidelidad */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex gap-3 bg-background rounded-2xl p-2 border border-border/50 shadow-sm">
                  <Input
                    placeholder="¿Qué sigue en tu lista?..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    className="bg-transparent border-none focus-visible:ring-0 text-base placeholder:italic"
                  />
                  <Button
                    onClick={addTask}
                    className="rounded-xl px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    <Plus className="h-5 w-5 mr-1" />
                    <span className="hidden sm:inline">Añadir</span>
                  </Button>
                </div>
              </div>

              {/* Renderizado de Tareas */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.length === 0 ? (
                  <div className="text-center py-20 opacity-20 flex flex-col items-center">
                    <ListChecks className="h-16 w-16 mb-4" />
                    <p className="font-medium italic">
                      Tu lista está despejada
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                        task.completed
                          ? "bg-muted/20 border-transparent opacity-60"
                          : "bg-card border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="h-6 w-6 rounded-lg border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                          />
                        </div>
                        <span
                          className={cn(
                            "text-base font-semibold transition-all duration-500",
                            task.completed &&
                              "line-through text-muted-foreground italic decoration-primary/30"
                          )}
                        >
                          {task.text}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTask(task.id)}
                        className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default TaskList;
