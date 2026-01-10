import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import useSound from "use-sound";
import checkSound from "@/assets/sounds/pop-sound.mp3";
import deleteSound from "@/assets/sounds/del-pop.mp3";
import bellSound from "@/assets/sounds/notification-bell-sound.mp3";

import { useAuthStore, useTasksStore } from "@/lib/stores";
import { PageLayout, PageHeader } from "@/components/ui/layout";
export function TaskList() {
  const { user } = useAuthStore();
  const {
    tasks,
    loading: isLoading,
    newTaskText,
    fetchTasks,
    addTask,
    toggleTask,
    deleteTask,
    setNewTaskText
  } = useTasksStore();

  const [playComplete] = useSound(checkSound, { volume: 0.5 });
  const [playDelete] = useSound(deleteSound, { volume: 0.3 });
  const [playAdd] = useSound(bellSound, { volume: 0.3 });

  // Load tasks on mount
  useEffect(() => {
    fetchTasks(user?.$id);
  }, [user, fetchTasks]);

  // Handle add task
  const handleAddTask = async () => {
    if (newTaskText.trim() === "" || !user) return;
    await addTask(user.$id);
    playAdd();
  };

  // Handle toggle task
  const handleToggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const nextState = !task.completed;
    if (nextState) {
      playComplete();
    } else {
      playDelete();
    }

    await toggleTask(id);
  };

  // Handle delete task
  const handleDeleteTask = async (id: string) => {
    playDelete();
    await deleteTask(id);
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
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    className="bg-transparent border-none focus-visible:ring-0 text-base placeholder:italic"
                  />
                  <Button
                    onClick={handleAddTask}
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
                            onCheckedChange={() => handleToggleTask(task.id)}
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
                        onClick={() => handleDeleteTask(task.id)}
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
