import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import useSound from "use-sound";
import checkSound from "@/assets/sounds/pop-sound.mp3";
import deleteSound from "@/assets/sounds/del-pop.mp3";
import bellSound from "@/assets/sounds/notification-bell-sound.mp3";

import { useAuth } from "@/components/context/AuthContext";
import { taskService } from "@/lib/appwrite";

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
      if (!user) return;
      try {
        const data = await taskService.getTasks(user.$id);
        const formatted = data.documents.map((doc: any) => ({
          id: doc.$id,
          text: doc.text,
          completed: doc.completed,
        }));
        setTasks(formatted);
      } catch (error) {
        console.error("Error al cargar tareas:", error);
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
      setTasks([task, ...tasks]);
      playAdd();
      setNewTask("");
    } catch (error) {
      console.error("Error al guardar tarea:", error);
    }
  };

  // 3. Toggle de estado (Check/Uncheck)
  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const nextState = !task.completed;

    // UI optimista: actualizamos primero para que sea instantáneo
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: nextState } : t))
    );

    nextState ? playComplete() : playDelete();

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
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
      playDelete();
    } catch (error) {
      console.error("Error al borrar tarea:", error);
    }
  };

  if (isLoading)
    return (
      <div className="p-10 text-center opacity-50">Cargando tareas...</div>
    );

  return (
    <Card className="w-full max-w-md shadow-lg border-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <ListChecks className="text-primary w-6 h-6" />
          Tareas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input estándar */}
        <div className="flex gap-2">
          <Input
            placeholder="Nueva tarea..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="bg-muted/50"
          />
          <Button onClick={addTask} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Lista de tareas */}
        <div className="space-y-2 max-h-90 overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No hay tareas pendientes.
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-md border bg-card group"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="hover:cursor-pointer"
                  />
                  <span
                    className={cn(
                      "text-sm font-medium transition-all",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.text}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask(task.id)}
                  className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer discreto */}
        {tasks.length > 0 && (
          <div className="pt-4 border-t text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between font-bold">
            <span>Total: {tasks.length}</span>
            <span>Completas: {tasks.filter((t) => t.completed).length}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TaskList;
