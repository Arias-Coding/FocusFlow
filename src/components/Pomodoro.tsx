import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Settings2,
  ChevronRight,
  Timer,
  Check,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/context/theme-provider";
import { cn, saveToLocalStorage, loadFromLocalStorage, triggerConfetti } from "@/lib/utils";
import { useAuthStore, useTasksStore, useHabitsStore } from "@/lib/stores";
import { PageLayout } from "@/components/ui/layout";
import useSound from "use-sound";
import sessionCompleteSound from "@/assets/sounds/pop-sound.mp3";
import breakCompleteSound from "@/assets/sounds/notification-bell-sound.mp3";

// Types for selectable items
type SelectableItem = 
  | { type: "task"; id: string; text: string }
  | { type: "habit"; id: string; name: string; habitType: "boolean" | "count"; unit?: string };

// Componente reutilizable para estadísticas
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  color: string;
  delay?: number;
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
  delay = 0,
}: StatCardProps) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div
        className={cn(
          "p-2.5 rounded-xl border shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105",
          color
        )}
      >
        <Icon className="h-4 sm:h-5 w-4 sm:w-5" />
      </div>
      <div className="flex flex-col">
        <span
          key={String(value)}
          className="text-xl sm:text-2xl font-black tracking-tighter leading-none animate-in zoom-in duration-300"
          style={{ animationDelay: `${delay}ms` }}
        >
          {value}
        </span>
        <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.2em] font-bold opacity-40 mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}

// Componente para el selector de tareas y hábitos
interface TaskSelectorProps {
  tasks: any[];
  habits: any[];
  habitLogs: { [habitId: string]: any[] };
  selectedItemId: string;
  onItemSelect: (item: SelectableItem | null) => void;
}

function TaskSelector({
  tasks,
  habits,
  habitLogs,
  selectedItemId,
  onItemSelect,
}: TaskSelectorProps) {
  const { theme } = useTheme();
  const isDarkTheme =
    theme === "dark" ||
    theme === "forest" ||
    theme === "ocean" ||
    theme === "catppuccin-mocha" ||
    theme === "tokyo-night-dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const pendingTasks = tasks.filter((task) => !task.completed);
  const activeHabits = habits.filter((h) => h.active);

  const getItemFromId = (id: string): SelectableItem | null => {
    const task = pendingTasks.find((t) => t.id === id);
    if (task) return { type: "task", id: task.id, text: task.text };
    
    const habit = activeHabits.find((h) => h.$id === id);
    if (habit) return { type: "habit", id: habit.$id, name: habit.name, habitType: habit.type, unit: habit.unit };
    
    return null;
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      onItemSelect(null);
    } else {
      const item = getItemFromId(value);
      if (item) onItemSelect(item);
    }
  };

  return (
    <div className="mt-6 max-w-xs mx-auto w-full">
      <select
        value={selectedItemId}
        onChange={handleSelect}
        className={cn(
          "w-full backdrop-blur-md border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all",
          isDarkTheme
            ? "bg-white/10 border-white/20 text-foreground hover:bg-white/15"
            : "bg-white/60 border-gray-200 text-foreground hover:bg-white/80"
        )}
      >
        <option value="">Seleccionar tarea o hábito</option>
        {pendingTasks.length > 0 && (
          <>
            <optgroup label="Tareas" className="font-medium">
              {pendingTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  📝 {task.text}
                </option>
              ))}
            </optgroup>
          </>
        )}
        {activeHabits.length > 0 && (
          <>
            <optgroup label="Hábitos" className="font-medium">
              {activeHabits.map((habit) => {
                const today = new Date().toLocaleDateString("sv-SE");
                const logs = habitLogs[habit.$id] || [];
                const todayLog = logs.find((l: any) => l.date === today);
                const isCompleted = todayLog?.completed || (habit.type === "count" && (todayLog?.value || 0) > 0);
                
                return (
                  <option key={habit.$id} value={habit.$id}>
                    {isCompleted ? "✅" : habit.type === "count" ? "📊" : "🔄"} {habit.name}
                    {habit.unit ? ` (${habit.unit})` : ""}
                  </option>
                );
              })}
            </optgroup>
          </>
        )}
      </select>
    </div>
  );
}

export function Pomodoro() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, toggleTask } = useTasksStore();
  const { habits, habitLogs, fetchHabitsAndLogs, saveLogValue, toggleBooleanHabit } = useHabitsStore();

  const [playSessionComplete] = useSound(sessionCompleteSound, { volume: 0.5 });
  const [playBreakComplete] = useSound(breakCompleteSound, { volume: 0.3 });

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);
  const [workSeconds, setWorkSeconds] = useState(25 * 60);
  const [breakSeconds, setBreakSeconds] = useState(5 * 60);
  const [longBreakSeconds, setLongBreakSeconds] = useState(15 * 60);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);

  // Auto-start next phase setting
  const [autoStartNextPhase, setAutoStartNextPhase] = useState(
    () => loadFromLocalStorage("pomodoro-auto-start") || false
  );

  // Task completion popup state
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [pendingItem, setPendingItem] = useState<SelectableItem | null>(null);
  const [habitProgressValue, setHabitProgressValue] = useState<number>(1);

  // Selected item state (task or habit)
  const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);

  // Settings dialog local state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempWorkMinutes, setTempWorkMinutes] = useState(Math.floor(workSeconds / 60));
  const [tempWorkSecs, setTempWorkSecs] = useState(workSeconds % 60);
  const [tempBreakMinutes, setTempBreakMinutes] = useState(Math.floor(breakSeconds / 60));
  const [tempBreakSecs, setTempBreakSecs] = useState(breakSeconds % 60);
  const [tempLongBreakMinutes, setTempLongBreakMinutes] = useState(Math.floor(longBreakSeconds / 60));
  const [tempLongBreakSecs, setTempLongBreakSecs] = useState(longBreakSeconds % 60);
  const [tempAutoStart, setTempAutoStart] = useState(autoStartNextPhase);

  // Initialize temp values when dialog opens
  useEffect(() => {
    if (settingsOpen) {
      setTempWorkMinutes(Math.floor(workSeconds / 60));
      setTempWorkSecs(workSeconds % 60);
      setTempBreakMinutes(Math.floor(breakSeconds / 60));
      setTempBreakSecs(breakSeconds % 60);
      setTempLongBreakMinutes(Math.floor(longBreakSeconds / 60));
      setTempLongBreakSecs(longBreakSeconds % 60);
      setTempAutoStart(autoStartNextPhase);
    }
  }, [workSeconds, breakSeconds, longBreakSeconds, autoStartNextPhase]);

  // Apply settings
  const applySettings = () => {
    setWorkSeconds(Math.max(1, tempWorkMinutes * 60 + tempWorkSecs));
    setBreakSeconds(Math.max(1, tempBreakMinutes * 60 + tempBreakSecs));
    setLongBreakSeconds(Math.max(1, tempLongBreakMinutes * 60 + tempLongBreakSecs));
    setAutoStartNextPhase(tempAutoStart);
    setSettingsOpen(false);
  };

  // --- NUEVOS ESTADOS DE ESTADÍSTICAS ---
  const [completedSessions, setCompletedSessions] = useState(
    () => loadFromLocalStorage("pomodoro-sessions") || 0
  );
  const [completedBreaks, setCompletedBreaks] = useState(
    () => loadFromLocalStorage("pomodoro-breaks") || 0
  );
  const [totalWorkSeconds, setTotalWorkSeconds] = useState(
    () => loadFromLocalStorage("pomodoro-work-time") || 0
  );

  const WORK_TIME = workSeconds;
  const BREAK_TIME = breakSeconds;
  const LONG_BREAK_TIME = longBreakSeconds;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isLongBreak, setIsLongBreak] = useState(false);

  // Ref to prevent multiple notifications
  const sessionCompletedRef = useRef(false);

  // Lógica de progreso mejorada
  const totalTime = isLongBreak
    ? LONG_BREAK_TIME
    : isBreak
    ? BREAK_TIME
    : WORK_TIME;
  const progress = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));

  // Animación suave del progreso
  const [animatedProgress, setAnimatedProgress] = useState(progress);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 50); // Pequeño delay para animación suave

    return () => clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(
        isLongBreak ? LONG_BREAK_TIME : isBreak ? BREAK_TIME : WORK_TIME
      );
    }
  }, [workSeconds, breakSeconds, longBreakSeconds, isBreak, isLongBreak]);

  // Fetch tasks
  useEffect(() => {
    if (user?.$id) {
      fetchTasks(user.$id);
      fetchHabitsAndLogs(user.$id);
    }
  }, [user, fetchTasks, fetchHabitsAndLogs]);

  // Persist stats
  useEffect(() => {
    saveToLocalStorage("pomodoro-sessions", completedSessions);
  }, [completedSessions]);

  useEffect(() => {
    saveToLocalStorage("pomodoro-breaks", completedBreaks);
  }, [completedBreaks]);

  useEffect(() => {
    saveToLocalStorage("pomodoro-work-time", totalWorkSeconds);
  }, [totalWorkSeconds]);

  useEffect(() => {
    saveToLocalStorage("pomodoro-auto-start", autoStartNextPhase);
  }, [autoStartNextPhase]);

  // Function to bring app to focus/foreground
  const bringAppToFocus = () => {
    if (document.hidden) {
      // Try to bring window to focus using various methods
      if (document.visibilityState === "hidden") {
        // Request focus on the window if possible
        window.focus();
      }
    }
  };

  useEffect(() => {
    let timer: number | undefined;
    if (isActive && timeLeft > 0) {
      sessionCompletedRef.current = false;
      timer = window.setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
        if (!isBreak) setTotalWorkSeconds((prev: number) => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && !sessionCompletedRef.current) {
      sessionCompletedRef.current = true;
      // Bring app to focus when timer completes
      bringAppToFocus();

      if (!isBreak && !isLongBreak) {
        setCompletedSessions((prev: number) => prev + 1);
        playSessionComplete();
        triggerConfetti("task");
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("¡Sesión completada!", {
            body: "Toma un descanso merecido.",
          });
        }
        if (selectedItem) {
          setPendingItem(selectedItem);
          if (selectedItem.type === "habit" && selectedItem.habitType === "count") {
            setHabitProgressValue(1);
          } else {
            setHabitProgressValue(1);
          }
          setShowTaskPopup(true);
        }
        if (sessionsUntilLongBreak === 1) {
          setIsLongBreak(true);
          setIsBreak(false);
          setSessionsUntilLongBreak(4);
        } else {
          setIsBreak(true);
          setIsLongBreak(false);
          setSessionsUntilLongBreak((prev: number) => prev - 1);
        }
      } else {
        setCompletedBreaks((prev: number) => prev + 1);
        playBreakComplete();
        setIsBreak(false);
        setIsLongBreak(false);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("¡Descanso terminado!", {
            body: "Es hora de volver al trabajo.",
          });
        }
      }
      setIsActive(false);
      setTimeLeft(
        isLongBreak ? LONG_BREAK_TIME : isBreak ? BREAK_TIME : WORK_TIME
      );
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, isBreak, isLongBreak]);

  // Títulos de Pestaña Dinámicos
  useEffect(() => {
    if (isActive) {
      const timeStr = formatTime(timeLeft);
      if (isLongBreak) {
        document.title = `🌴 ${timeStr} - Descanso Largo`;
      } else if (isBreak) {
        document.title = `☕ ${timeStr} - Descanso`;
      } else {
        document.title = `🎯 ${timeStr} - Enfoque`;
      }
    } else {
      if (isLongBreak) {
        document.title = "🌴 Pausa Larga - FocusFlow";
      } else if (isBreak) {
        document.title = "☕ Pausa - FocusFlow";
      } else {
        document.title = "🎯 Listo para Enfocarte - FocusFlow";
      }
    }
  }, [isActive, timeLeft, isBreak, isLongBreak]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(
      isLongBreak ? LONG_BREAK_TIME : isBreak ? BREAK_TIME : WORK_TIME
    );
  };

  // Handle item completion from popup
  const handleItemComplete = async (completed: boolean) => {
    if (completed && pendingItem && user?.$id) {
      const today = new Date().toLocaleDateString("sv-SE");

      if (pendingItem.type === "task") {
        await toggleTask(pendingItem.id);
      } else if (pendingItem.type === "habit") {
        if (pendingItem.habitType === "boolean") {
          await toggleBooleanHabit(pendingItem.id, today, user.$id);
        } else if (pendingItem.habitType === "count") {
          // Get the most recent habit log for this habit
          const habitLogsForHabit = habitLogs[pendingItem.id] || [];
          const mostRecentLog = habitLogsForHabit
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

          let finalValue = habitProgressValue;

          if (mostRecentLog) {
            const mostRecentLogDate = new Date(mostRecentLog.date).toLocaleDateString("sv-SE");
            if (mostRecentLogDate === today) {
              // Same day: add existing value + popup input
              finalValue = mostRecentLog.value + habitProgressValue;
            }
            // Different day: just use popup input (already set to habitProgressValue)
          }

          await saveLogValue(pendingItem.id, today, finalValue, user.$id);
        }
      }
      setSelectedItem(null);
    }
    setShowTaskPopup(false);
    setPendingItem(null);
  };

  // Auto-start next phase effect
  useEffect(() => {
    if (autoStartNextPhase && !isActive && timeLeft === 0) {
      // Don't auto-start if popup is showing
      if (!showTaskPopup) {
        setIsActive(true);
      }
    }
  }, [autoStartNextPhase, isActive, timeLeft, showTaskPopup]);

  const skipSession = () => {
    setIsActive(false);
    if (isLongBreak) {
      setIsLongBreak(false);
      setIsBreak(false);
    } else if (isBreak) {
      setIsBreak(false);
    } else {
      // From work, go to break
      if (sessionsUntilLongBreak === 1) {
        setIsLongBreak(true);
        setSessionsUntilLongBreak(4);
      } else {
        setIsBreak(true);
        setSessionsUntilLongBreak((prev) => prev - 1);
      }
    }
    setTimeLeft(
      isLongBreak ? LONG_BREAK_TIME : isBreak ? BREAK_TIME : WORK_TIME
    );
  };

  const formatTotalTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  return (
    <PageLayout className="animate-in fade-in duration-700">
      {/*       <PageHeader
        title="Pomodoro"
        subtitle="Técnica de productividad enfocada en intervalos"
        className="mt-15"
      /> */}

      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto -mt-2 sm:-mt-4">
        {/* CONTENEDOR DE LA BARRA DE ESTADÍSTICAS */}
        <div className="w-full max-w-md sm:max-w-lg px-3 mb-12 sm:mb-16 relative animate-in slide-in-from-top-8 duration-700 delay-150">
          {/* BOTÓN DE CONFIGURACIÓN FLOTANTE (Fuera del box) */}
          <div className="absolute -top-2 -right-2 z-20">
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md border border-white/10 shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                  <Settings2 className="h-4 sm:h-5 w-4 sm:w-5 text-white/70" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl sm:rounded-3xl w-[90vw] sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">
                    Ajustes Focus
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Tiempo Enfoque */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-medium opacity-60">
                      Tiempo Enfoque
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          value={tempWorkMinutes}
                          onChange={(e) =>
                            setTempWorkMinutes(
                              Math.max(0, parseInt(e.target.value) || 0)
                            )
                          }
                          className="text-end bg-white/5 border-white/10 rounded-xl h-9 font-medium pr-10 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-50">
                          min
                        </span>
                      </div>
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          value={tempWorkSecs}
                          onChange={(e) =>
                            setTempWorkSecs(
                              Math.min(
                                59,
                                Math.max(0, parseInt(e.target.value) || 0)
                              )
                            )
                          }
                          className="text-end bg-white/5 border-white/10 rounded-xl h-9 font-medium pr-10 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                          max="59"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-50">
                          seg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tiempo Descanso */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-medium opacity-60">
                      Tiempo Descanso
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          value={tempBreakMinutes}
                          onChange={(e) =>
                            setTempBreakMinutes(
                              Math.max(0, parseInt(e.target.value) || 0)
                            )
                          }
                          className="text-end bg-white/5 border-white/10 rounded-xl h-9 font-medium pr-10 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-50">
                          min
                        </span>
                      </div>
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          value={tempBreakSecs}
                          onChange={(e) =>
                            setTempBreakSecs(
                              Math.min(
                                59,
                                Math.max(0, parseInt(e.target.value) || 0)
                              )
                            )
                          }
                          className="text-end bg-white/5 border-white/10 rounded-xl h-9 font-medium pr-10 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                          max="59"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-50">
                          seg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Descanso Largo */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-medium opacity-60">
                      Descanso Largo
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          value={tempLongBreakMinutes}
                          onChange={(e) =>
                            setTempLongBreakMinutes(
                              Math.max(0, parseInt(e.target.value) || 0)
                            )
                          }
                          className="text-end bg-white/5 border-white/10 rounded-xl h-9 font-medium pr-10 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-50">
                          min
                        </span>
                      </div>
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          value={tempLongBreakSecs}
                          onChange={(e) =>
                            setTempLongBreakSecs(
                              Math.min(
                                59,
                                Math.max(0, parseInt(e.target.value) || 0)
                              )
                            )
                          }
                          className="text-end bg-white/5 border-white/10 rounded-xl h-9 font-medium pr-10 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                          max="59"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-50">
                          seg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Auto-start option */}
                  <div className="flex items-center justify-between pt-2">
                    <Label className="text-xs uppercase tracking-wider font-medium opacity-60 cursor-pointer">
                      Iniciar siguiente fase automáticamente
                    </Label>
                    <button
                      onClick={() => setTempAutoStart(!tempAutoStart)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors duration-300 relative",
                        tempAutoStart ? "bg-primary" : "bg-white/20"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300",
                          tempAutoStart ? "left-7 translate-x-0" : "left-1"
                        )}
                      />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setSettingsOpen(false)}
                      className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl h-10"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={applySettings}
                      className="flex-1 bg-primary hover:bg-primary/90 rounded-xl h-10"
                    >
                      Aceptar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* LA BARRA (Glassmorphism) */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
            {/* Indicador de progreso inferior */}
            <div
              className={cn(
                "absolute bottom-0 left-0 h-1 transition-all duration-700 ease-out",
                isLongBreak
                  ? "bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                  : isBreak
                  ? "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.4)]"
                  : "bg-purple-400 shadow-[0_0_10px_rgba(192,132,250,0.4)]"
              )}
              style={{
                width: `${Math.min(100, (completedSessions / 8) * 100)}%`,
              }}
            />

            <div className="flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6 relative z-10 gap-2 sm:gap-4 overflow-x-auto">
              {/* Ciclos */}
              <StatCard
                icon={Brain}
                value={completedSessions}
                label="Ciclos"
                color={
                  isBreak
                    ? "bg-green-400/20 border-green-400/30 text-green-500"
                    : "bg-purple-400/20 border-purple-400/30 text-purple-500"
                }
                delay={0}
              />

              <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

              {/* Total */}
              <StatCard
                icon={Timer}
                value={formatTotalTime(totalWorkSeconds)}
                label="Enfoque"
                color="bg-pink-400/20 border-pink-400/30 text-pink-500"
                delay={100}
              />

              <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

              {/* Pausas */}
              <StatCard
                icon={Coffee}
                value={completedBreaks}
                label="Descansos"
                color="bg-teal-400/20 border-teal-400/30 text-teal-500"
                delay={200}
              />
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center scale-85 sm:scale-95 mb-4 sm:mb-6">
          {/* Círculo de progreso (bg) - círculo que se llena desde abajo */}
          <div className="absolute w-56 sm:w-64 lg:w-72 h-56 sm:h-64 lg:h-72 rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-1000",
                isLongBreak
                  ? "bg-green-200 shadow-[0_0_20px_rgba(74,222,128,0.5)]"
                  : isBreak
                  ? "bg-teal-200 shadow-[0_0_20px_rgba(20,184,166,0.5)]"
                  : "bg-primary shadow-[0_0_20px_rgba(168,85,247,0.5)]"
              )}
              style={{
                clipPath: `polygon(0% ${100 - progress}%, 100% ${
                  100 - progress
                }%, 100% 100%, 0% 100%)`,
              }}
            />
          </div>

          {/* Resplandor glassmorphism - verdaderamente traslucido */}
          <div
            className={cn(
              "absolute w-56 sm:w-64 lg:w-72 h-56 sm:h-64 lg:h-72 rounded-full backdrop-blur-[2px] border border-white/5",
              isLongBreak
                ? "bg-green-400/0"
                : isBreak
                ? "bg-teal-400/0"
                : "bg-primary/0"
            )}
            style={{
              boxShadow: isLongBreak
                ? "0 0 15px -3px rgba(74, 222, 128, 0.05), inset 0 0 15px -3px rgba(74, 222, 128, 0.02)"
                : isBreak
                ? "0 0 15px -3px rgba(20, 184, 166, 0.05), inset 0 0 15px -3px rgba(20, 184, 166, 0.02)"
                : "0 0 15px -3px rgba(168,85,247,0.05), inset 0 0 15px -3px rgba(168,85,247,0.02)",
            }}
          />

          <Card className="z-10 w-56 sm:w-64 lg:w-72 h-56 sm:h-64 lg:h-72 rounded-full border border-white/20 bg-white/5 dark:bg-card/20 backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
            {/* Efectos de fondo animados */}
            <div
              className="absolute inset-0 rounded-full opacity-20 transition-all duration-1000"
              style={{
                background: isLongBreak
                  ? "radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)"
                  : isBreak
                  ? "radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
                animation: isActive ? "pulse 2s infinite" : "none",
              }}
            />

            {/* Etiqueta de estado flotante interna con animación */}
            <div
              className={cn(
                "mb-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[7px] sm:text-[8px] font-bold uppercase tracking-wider border backdrop-blur-md transition-all duration-500",
                isLongBreak
                  ? "text-green-400 border-green-500/20 bg-green-500/5"
                  : isBreak
                  ? "text-teal-400 border-teal-500/20 bg-teal-500/5"
                  : "text-purple-400 border-purple-500/20 bg-purple-500/5"
              )}
              style={{
                animation: isActive ? "bounce 1s infinite" : "none",
              }}
            >
              {isLongBreak
                ? "Descanso Largo"
                : isBreak
                ? "Descanso"
                : "Enfoque"}
            </div>

            {/* Temporizador con animación de escala */}
            <span
              className={cn(
                "text-4xl sm:text-5xl lg:text-6xl font-thin tabular-nums tracking-tighter text-foreground leading-none transition-all duration-300",
                isActive && "scale-105"
              )}
              style={{
                textShadow: isActive
                  ? "0 0 20px rgba(255,255,255,0.1)"
                  : "none",
              }}
            >
              {formatTime(timeLeft)}
            </span>

            {/* Porcentaje con animación */}
            <div className="mt-1 text-[8px] sm:text-[9px] font-bold opacity-40 uppercase tracking-[0.2em] transition-all duration-500">
              {Math.ceil(animatedProgress)}%
            </div>

            {/* Indicador de actividad */}
            {isActive && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full animate-ping",
                    isLongBreak
                      ? "bg-green-500"
                      : isBreak
                      ? "bg-teal-500"
                      : "bg-purple-500"
                  )}
                />
              </div>
            )}
          </Card>
        </div>

        {/* Task Selector */}
        <TaskSelector
          tasks={tasks}
          habits={habits}
          habitLogs={habitLogs}
          selectedItemId={selectedItem?.id || ""}
          onItemSelect={setSelectedItem}
        />

        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-3 sm:gap-6">
          <Button
            variant="outline"
            size="icon"
            onClick={resetTimer}
            className="h-10 sm:h-12 w-10 sm:w-12 rounded-full border-white/10 bg-white/5 hover:bg-white/20 backdrop-blur-md transition-all hover:rotate-[-45deg]"
          >
            <RotateCcw className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground/70" />
          </Button>

          <Button
            size="lg"
            onClick={toggleTimer}
            className={cn(
              "h-14 sm:h-18 w-14 sm:w-18 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border-4 sm:border-5 border-background/50",
              isLongBreak
                ? "bg-green-500 shadow-green-400/30"
                : isBreak
                ? "bg-teal-500 shadow-teal-400/30"
                : "bg-primary shadow-primary-400/30"
            )}
          >
            {isActive ? (
              <Pause className="h-6 sm:h-8 w-6 sm:w-8 fill-current text-white" />
            ) : (
              <Play className="h-6 sm:h-8 w-6 sm:w-8 fill-current text-white" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={skipSession}
            className="h-10 sm:h-12 w-10 sm:w-12 rounded-full border-white/10 bg-white/5 hover:bg-white/20 backdrop-blur-md transition-all hover:translate-x-1"
          >
            <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground/70" />
          </Button>
        </div>

        {/* Item Completion Popup */}
        {showTaskPopup && pendingItem && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <Card className="bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 min-w-[300px]">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    isBreak
                      ? "bg-green-500/20"
                      : isLongBreak
                      ? "bg-teal-500/20"
                      : "bg-primary/20"
                  )}
                >
                  <Check
                    className={cn(
                      "h-5 w-5",
                      isBreak
                        ? "text-green-400"
                        : isLongBreak
                        ? "text-teal-400"
                        : "text-primary"
                    )}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">
                    ¡Sesión completada!
                  </p>
                  {pendingItem.type === "task" ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-3">
                        ¿Completaste "{pendingItem.text}"?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleItemComplete(true)}
                          className={cn(
                            "h-8 px-3 text-xs font-medium rounded-lg transition-colors",
                            isBreak
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : isLongBreak
                              ? "bg-teal-500 hover:bg-teal-600 text-white"
                              : "bg-primary hover:bg-primary/90 text-white"
                          )}
                        >
                          Sí, completar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleItemComplete(false)}
                          className="h-8 px-3 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10"
                        >
                          No
                        </Button>
                      </div>
                    </>
                  ) : pendingItem.type === "habit" && pendingItem.habitType === "boolean" ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-3">
                        ¿Completaste "{pendingItem.name}"?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleItemComplete(true)}
                          className={cn(
                            "h-8 px-3 text-xs font-medium rounded-lg transition-colors",
                            isBreak
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : isLongBreak
                              ? "bg-teal-500 hover:bg-teal-600 text-white"
                              : "bg-primary hover:bg-primary/90 text-white"
                          )}
                        >
                          Sí
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleItemComplete(false)}
                          className="h-8 px-3 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10"
                        >
                          No
                        </Button>
                      </div>
                    </>
                  ) : pendingItem.type === "habit" && pendingItem.habitType === "count" ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-2">
                        ¿Cuánto avanzaste en "{pendingItem.name}"?
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <Input
                          type="number"
                          min="1"
                          value={habitProgressValue}
                          onChange={(e) => setHabitProgressValue(parseInt(e.target.value) || 1)}
                          className="w-20 h-8 bg-white/5 border-white/10 rounded-lg text-sm"
                        />
                        <span className="text-xs text-muted-foreground">
                          {pendingItem.unit || "veces"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleItemComplete(true)}
                          className={cn(
                            "h-8 px-3 text-xs font-medium rounded-lg transition-colors",
                            isBreak
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : isLongBreak
                              ? "bg-teal-500 hover:bg-teal-600 text-white"
                              : "bg-primary hover:bg-primary/90 text-white"
                          )}
                        >
                          Guardar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleItemComplete(false)}
                          className="h-8 px-3 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10"
                        >
                          Omitir
                        </Button>
                      </div>
                    </>
                  ) : null}
                </div>
                <button
                  onClick={() => handleItemComplete(false)}
                  className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
