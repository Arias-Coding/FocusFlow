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
  BarChart3,
  Timer,
  CheckCircle2,
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

export function Pomodoro() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // --- NUEVOS ESTADOS DE ESTADÍSTICAS ---
  const [completedSessions, setCompletedSessions] = useState(0);
  const [completedBreaks, setCompletedBreaks] = useState(0);
  const [totalWorkSeconds, setTotalWorkSeconds] = useState(0);

  const WORK_TIME = workMinutes * 60;
  const BREAK_TIME = breakMinutes * 60;

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // Lógica de progreso
  const radius = 170;
  const circumference = 2 * Math.PI * radius;
  const totalTime = isBreak ? BREAK_TIME : WORK_TIME;
  const progress = (timeLeft / totalTime) * 100;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (!isActive) setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
  }, [workMinutes, breakMinutes, isBreak, isActive]);

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
      if (!isBreak) setCompletedSessions((prev) => prev + 1);
      else setCompletedBreaks((prev) => prev + 1);
      skipSession();
    }
    return () => clearInterval(timer);
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
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-2.5 rounded-xl border shadow-sm transition-colors",
                  isBreak
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-purple-500/10 border-purple-500/20"
                )}
              >
                <Brain
                  className={cn(
                    "h-5 w-5",
                    isBreak ? "text-green-500" : "text-purple-500"
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span
                  key={completedSessions}
                  className="text-2xl font-black tracking-tighter leading-none animate-in zoom-in duration-300"
                >
                  {completedSessions}
                </span>
                <span className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-30 mt-1">
                  Ciclos
                </span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-white/10" />

            {/* Total */}
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 shadow-sm">
                <Timer className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter leading-none tabular-nums">
                  {formatTotalTime(totalWorkSeconds)}
                </span>
                <span className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-30 mt-1">
                  Enfoque
                </span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-white/10" />

            {/* Pausas */}
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 shadow-sm">
                <Coffee className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex flex-col">
                <span
                  key={completedBreaks}
                  className="text-2xl font-black tracking-tighter leading-none animate-in zoom-in duration-300"
                >
                  {completedBreaks}
                </span>
                <span className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-30 mt-1 text-right">
                  Pausas
                </span>
              </div>
            </div>
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
          className="absolute -rotate-90 transform drop-shadow-2xl"
        >
          <circle
            cx="200"
            cy="200"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-muted/5"
          />
          <circle
            cx="200"
            cy="200"
            r={radius}
            stroke={isBreak ? "#22c55e" : "#a855f7"}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
            style={{
              transition: isActive
                ? "stroke-dashoffset 1s linear"
                : "0.7s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>

        <Card className="z-10 w-[300px] h-[300px] rounded-full border border-white/10 bg-card/10 backdrop-blur-3xl shadow-2xl flex flex-col items-center justify-center relative">
          {/* Etiqueta de estado flotante interna */}
          <div
            className={cn(
              "mb-2 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
              isBreak
                ? "text-green-500 border-green-500/20 bg-green-500/5"
                : "text-purple-500 border-purple-500/20 bg-purple-500/5"
            )}
          >
            {isBreak ? "Rest" : "Focus"}
          </div>

          <span className="text-7xl font-thin tabular-nums tracking-tighter text-foreground leading-none">
            {formatTime(timeLeft)}
          </span>

          <div className="mt-2 text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">
            {Math.ceil(progress)}%
          </div>
        </Card>
      </div>

      <div className="mt-16 flex items-center gap-8">
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
