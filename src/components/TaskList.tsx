import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import useSound from "use-sound";
import checkSound from "@/components/assets/sounds/pop-sound.mp3";
import deleteSound from "@/components/assets/sounds/del-pop.mp3";
import bellSound from "@/components/assets/sounds/notification-bell-sound.mp3";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  const [playComplete] = useSound(checkSound, { volume: 0.5 });
  const [playDelete] = useSound(deleteSound, { volume: 0.3 });
  const [playAdd] = useSound(bellSound, { volume: 0.3 });

  const addTask = () => {
    if (newTask.trim() === "") return;
    const task: Task = {
      id: Date.now(),
      text: newTask,
      completed: false,
    };
    setTasks([task, ...tasks]);
    playAdd();
    setNewTask("");
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;

          if (nextState) {
            playComplete();
          } else {
            playDelete();
          }

          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
    playDelete();
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-2">
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
                  className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
