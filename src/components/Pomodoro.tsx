import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Settings2,
  ChevronRight,
  Timer,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/context/AuthContext";
import { taskService } from "@/lib/appwrite";

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
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "p-2.5 rounded-xl border shadow-sm transition-colors",
          color
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        <span
          key={value}
          className="text-2xl font-black tracking-tighter leading-none animate-in zoom-in duration-300"
          style={{ animationDelay: `${delay}ms` }}
        >
          {value}
        </span>
        <span className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-30 mt-1">
          {label}
        </span>
      </div>
    </div>
  );
}

// Componente para el selector de tareas
interface TaskSelectorProps {
  tasks: any[];
  selectedTaskId: string;
  onTaskSelect: (taskId: string) => void;
}

function TaskSelector({
  tasks,
  selectedTaskId,
  onTaskSelect,
}: TaskSelectorProps) {
  return (
    <div className="mt-8 max-w-xs mx-auto">
      <select
        value={selectedTaskId}
        onChange={(e) => onTaskSelect(e.target.value)}
        className="w-full bg-card/20 backdrop-blur-md border border-white/10 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
      >
        <option value="">Seleccionar tarea para completar</option>
        {tasks.map((task) => (
          <option key={task.$id} value={task.$id}>
            {task.text}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Pomodoro() {
  const { user } = useAuth();
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // --- NUEVOS ESTADOS DE ESTADÍSTICAS ---
  const [completedSessions, setCompletedSessions] = useState(0);
  const [completedBreaks, setCompletedBreaks] = useState(0);
  const [totalWorkSeconds, setTotalWorkSeconds] = useState(0);

  // --- ESTADOS PARA TAREAS ---
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  const WORK_TIME = workMinutes * 60;
  const BREAK_TIME = breakMinutes * 60;

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // Lógica de progreso mejorada
  const radius = 170;
  const circumference = 2 * Math.PI * radius;
  const totalTime = isBreak ? BREAK_TIME : WORK_TIME;
  const progress = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const offset = circumference - (progress / 100) * circumference;

  // Animación suave del progreso
  const [animatedProgress, setAnimatedProgress] = useState(progress);
  const [animatedOffset, setAnimatedOffset] = useState(offset);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
      setAnimatedOffset(offset);
    }, 50); // Pequeño delay para animación suave

    return () => clearTimeout(timer);
  }, [progress, offset]);

  useEffect(() => {
    if (!isActive) setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
  }, [workMinutes, breakMinutes, isBreak, isActive]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      try {
        const data = await taskService.getTasks(user.$id);
        const pendingTasks = data.documents.filter(
          (doc: any) => !doc.completed
        );
        setTasks(pendingTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };
    fetchTasks();
  }, [user]);

  useEffect(() => {
    let timer: number | undefined;
    if (isActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        // Si estamos en modo trabajo, sumamos al tiempo total
        if (!isBreak) setTotalWorkSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Registrar sesión completada automáticamente
      if (!isBreak) {
        setCompletedSessions((prev) => prev + 1);
        // Si hay tarea seleccionada, completarla
        if (selectedTaskId) {
          taskService.toggleTask(selectedTaskId, true);
          setSelectedTaskId(""); // Reset selection
        }
      } else {
        setCompletedBreaks((prev) => prev + 1);
      }
      skipSession();
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, isBreak]);

  // Títulos de Pestaña Dinámicos
  useEffect(() => {
    if (isActive) {
      const timeStr = formatTime(timeLeft);
      document.title = isBreak
        ? `☕ ${timeStr} - Descanso`
        : `🎯 ${timeStr} - Enfoque`;
    } else {
      document.title = isBreak
        ? "☕ Pausa - FocusFlow"
        : "🎯 Listo para Enfocarte - FocusFlow";
    }
  }, [isActive, timeLeft, isBreak]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
  };

  const skipSession = () => {
    setIsActive(false);
    const nextMode = !isBreak;
    setIsBreak(nextMode);
    setTimeLeft(nextMode ? breakMinutes * 60 : workMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatTotalTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[800px] p-6 lg:p-20 animate-in fade-in zoom-in duration-1000">
      {/* CONTENEDOR DE LA BARRA DE ESTADÍSTICAS */}
      <div className="w-full max-w-xl px-4 mb-25 relative animate-in slide-in-from-top-8 duration-1000 delay-200">
        {/* BOTÓN DE CONFIGURACIÓN FLOTANTE (Fuera del box) */}
        <div className="absolute -top-3 -right-1 z-20">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl bg-white/10 dark:bg-card/40 backdrop-blur-md border border-white/20 shadow-xl hover:scale-110 active:scale-95 transition-all group"
              >
                <Settings2 className="h-4 w-4 text-white/70 group-hover:rotate-90 transition-transform duration-500" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-2xl border-white/10 rounded-[32px] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tighter italic">
                  Ajustes Focus
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="work"
                    className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 ml-1"
                  >
                    Tiempo Enfoque (min)
                  </Label>
                  <Input
                    id="work"
                    type="number"
                    value={workMinutes}
                    onChange={(e) => setWorkMinutes(Number(e.target.value))}
                    className="bg-white/5 border-white/10 rounded-2xl h-12 font-bold focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="break"
                    className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 ml-1"
                  >
                    Tiempo Descanso (min)
                  </Label>
                  <Input
                    id="break"
                    type="number"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(Number(e.target.value))}
                    className="bg-white/5 border-white/10 rounded-2xl h-12 font-bold focus:ring-green-500/20"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* LA BARRA (Glassmorphism) */}
        <div className="bg-white/[0.02] dark:bg-card/20 backdrop-blur-3xl border border-white/10 rounded-[28px] shadow-2xl relative overflow-hidden group">
          {/* Resplandor interno animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:animate-[shimmer_2.5s_infinite] transition-transform" />

          {/* Indicador de progreso inferior */}
          <div
            className={cn(
              "absolute bottom-0 left-0 h-[2px] transition-all duration-1000 ease-in-out",
              isBreak
                ? "bg-green-500 shadow-[0_0_10px_#22c55e]"
                : "bg-purple-500 shadow-[0_0_10px_#a855f7]"
            )}
            style={{
              width: `${Math.min(100, (completedSessions / 8) * 100)}%`,
            }}
          />

          <div className="flex items-center justify-between py-5 px-10 relative z-10 gap-8">
            {/* Ciclos */}
            <StatCard
              icon={Brain}
              value={completedSessions}
              label="Ciclos"
              color={
                isBreak
                  ? "bg-green-500/10 border-green-500/20 text-green-500"
                  : "bg-purple-500/10 border-purple-500/20 text-purple-500"
              }
              delay={0}
            />

            <div className="h-8 w-[1px] bg-white/10" />

            {/* Total */}
            <StatCard
              icon={Timer}
              value={formatTotalTime(totalWorkSeconds)}
              label="Enfoque"
              color="bg-orange-500/10 border-orange-500/20 text-orange-500"
              delay={100}
            />

            <div className="h-8 w-[1px] bg-white/10" />

            {/* Pausas */}
            <StatCard
              icon={Coffee}
              value={completedBreaks}
              label="Pausas"
              color="bg-green-500/10 border-green-500/20 text-green-500"
              delay={200}
            />
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center scale-95 lg:scale-105">
        {/* Resplandor */}
        <div
          className={cn(
            "absolute inset-0 blur-[120px] opacity-20 transition-colors duration-1000",
            isBreak ? "bg-green-500" : "bg-purple-600"
          )}
        />

        <svg
          width="450"
          height="450"
          viewBox="0 0 400 400"
          className="absolute transform drop-shadow-2xl"
        >
          {/* Círculo de fondo con gradiente */}
          <defs>
            <linearGradient id="progressBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
            <linearGradient
              id="progressFill"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={isBreak ? "#22c55e" : "#a855f7"} />
              <stop offset="50%" stopColor={isBreak ? "#16a34a" : "#9333ea"} />
              <stop offset="100%" stopColor={isBreak ? "#15803d" : "#7c3aed"} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Círculo de fondo */}
          <circle
            cx="200"
            cy="200"
            r={radius}
            stroke="url(#progressBg)"
            strokeWidth="6"
            fill="transparent"
            className="opacity-60"
          />

          {/* Círculo de progreso con animación mejorada */}
          <circle
            cx="200"
            cy="200"
            r={radius}
            stroke="url(#progressFill)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out filter drop-shadow-lg"
            style={{
              filter: "url(#glow)",
              transform: "rotate(-90deg)",
              transformOrigin: "200px 200px",
            }}
          />

          {/* Indicador de progreso animado */}
          {animatedProgress > 0 && (
            <circle
              cx="200"
              cy="30" // Top of the circle
              r="6"
              fill={isBreak ? "#22c55e" : "#a855f7"}
              className="animate-pulse"
              style={{
                transformOrigin: "200px 200px",
                transform: `rotate(${(animatedProgress / 100) * 360 - 90}deg)`,
                transition: "transform 1s ease-out",
              }}
            />
          )}
        </svg>

        <Card className="z-10 w-[300px] h-[300px] rounded-full border border-white/10 bg-card/10 backdrop-blur-3xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          {/* Efectos de fondo animados */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div
            className="absolute inset-0 rounded-full opacity-20 transition-all duration-1000"
            style={{
              background: isBreak
                ? "radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
              animation: isActive ? "pulse 2s infinite" : "none",
            }}
          />

          {/* Etiqueta de estado flotante interna con animación */}
          <div
            className={cn(
              "mb-2 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-sm transition-all duration-500",
              isBreak
                ? "text-green-500 border-green-500/20 bg-green-500/5"
                : "text-purple-500 border-purple-500/20 bg-purple-500/5"
            )}
            style={{
              animation: isActive ? "bounce 1s infinite" : "none",
            }}
          >
            {isBreak ? "Rest" : "Focus"}
          </div>

          {/* Temporizador con animación de escala */}
          <span
            className={cn(
              "text-7xl font-thin tabular-nums tracking-tighter text-foreground leading-none transition-all duration-300",
              isActive && "scale-110"
            )}
            style={{
              textShadow: isActive ? "0 0 20px rgba(255,255,255,0.1)" : "none",
            }}
          >
            {formatTime(timeLeft)}
          </span>

          {/* Porcentaje con animación */}
          <div className="mt-2 text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] transition-all duration-500">
            {Math.ceil(animatedProgress)}%
          </div>

          {/* Indicador de actividad */}
          {isActive && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full animate-ping",
                  isBreak ? "bg-green-500" : "bg-purple-500"
                )}
              />
            </div>
          )}
        </Card>
      </div>

      {/* Task Selector */}
      <TaskSelector
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        onTaskSelect={setSelectedTaskId}
      />

      <div className="mt-8 flex items-center gap-8">
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="h-12 w-12 rounded-full border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all hover:rotate-[-45deg]"
        >
          <RotateCcw className="h-5 w-5 text-muted-foreground/60" />
        </Button>

        <Button
          size="lg"
          onClick={toggleTimer}
          className={cn(
            "h-20 w-20 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border-[6px] border-background/50",
            isBreak
              ? "bg-green-600 shadow-green-500/20"
              : "bg-purple-600 shadow-purple-500/20"
          )}
        >
          {isActive ? (
            <Pause className="h-8 w-8 fill-current text-white" />
          ) : (
            <Play className="h-8 w-8 fill-current text-white ml-1" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={skipSession}
          className="h-12 w-12 rounded-full border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all hover:translate-x-1"
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground/60" />
        </Button>
      </div>
    </div>
  );
}
