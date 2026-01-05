import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Coffee, Brain, Settings2 } from "lucide-react";
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
  // 1. Estados dinámicos para la configuración (en minutos)
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // Tiempos en segundos calculados
  const WORK_TIME = workMinutes * 60;
  const BREAK_TIME = breakMinutes * 60;

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // --- Lógica del Círculo ---
  const radius = 170;
  const circumference = 2 * Math.PI * radius;
  const totalTime = isBreak ? BREAK_TIME : WORK_TIME;
  const progress = (timeLeft / totalTime) * 100;
  const offset = circumference - (progress / 100) * circumference;

  // Actualizar timeLeft cuando cambian los ajustes y el timer no está corriendo
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
    }
  }, [workMinutes, breakMinutes, isBreak]);

  useEffect(() => {
    let timer: number | undefined;
    if (isActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      const nextMode = !isBreak;
      setIsBreak(nextMode);
      setTimeLeft(nextMode ? breakMinutes * 60 : workMinutes * 60);
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, isBreak, workMinutes, breakMinutes]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[600px] p-6 lg:p-20 animate-in fade-in zoom-in duration-1000">
      {/* Contenedor del Círculo Maestro */}
      <div className="relative flex items-center justify-center">
        {/* Resplandor de Fondo Dinámico */}
        <div
          className={cn(
            "absolute inset-0 blur-[100px] opacity-20 transition-colors duration-1000",
            isBreak ? "bg-green-500" : "bg-purple-600"
          )}
        />

        {/* SVG del Círculo de Progreso */}
        <svg
          width="450"
          height="450"
          viewBox="0 0 400 400"
          className="absolute -rotate-90 transform drop-shadow-2xl"
        >
          {/* Círculo de Fondo (Track) */}
          <circle
            cx="200"
            cy="200"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted/5"
          />
          {/* Círculo de Progreso Activo */}
          <circle
            cx="200"
            cy="200"
            r={radius}
            stroke={isBreak ? "#22c55e" : "#a855f7"}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: isActive
                ? "stroke-dashoffset 1s linear, stroke 0.5s ease"
                : "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease",
            }}
            className={cn(
              "transition-all duration-500",
              isBreak
                ? "drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                : "drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
            )}
          />
        </svg>

        {/* Disco Central (Interface) */}
        <Card className="z-10 w-[320px] h-[320px] rounded-full border border-white/10 bg-card/20 backdrop-blur-2xl shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] flex flex-col items-center justify-center overflow-hidden">
          {/* Indicador de Estado Superior */}
          <div className="absolute top-12 left-0 right-0 flex justify-center">
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-1 rounded-full border backdrop-blur-md transition-all duration-500",
                isBreak
                  ? "bg-green-500/10 border-green-500/20 text-green-500"
                  : "bg-purple-500/10 border-purple-500/20 text-purple-500"
              )}
            >
              {isBreak ? (
                <Coffee className="h-3 w-3" />
              ) : (
                <Brain className="h-3 w-3" />
              )}
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {isBreak ? "Descanso" : "Enfoque"}
              </span>
            </div>
          </div>

          {/* Reloj Principal */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <span className="text-7xl lg:text-8xl font-thin tabular-nums tracking-tighter text-foreground drop-shadow-sm">
              {formatTime(timeLeft)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase">
                {Math.ceil(progress)}% Completado
              </span>
            </div>
          </div>

          {/* Botón de Configuración Integrado */}
          <div className="absolute bottom-10">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-10 w-10 hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground"
                >
                  <Settings2 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xs border-none bg-card/95 backdrop-blur-2xl rounded-[32px] shadow-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold tracking-tight text-center">
                    Configuración
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider px-1">
                      Enfoque (min)
                    </Label>
                    <Input
                      type="number"
                      value={workMinutes}
                      onChange={(e) => setWorkMinutes(Number(e.target.value))}
                      className="rounded-2xl border-none bg-muted/50 h-12 focus-visible:ring-purple-500/50"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider px-1">
                      Descanso (min)
                    </Label>
                    <Input
                      type="number"
                      value={breakMinutes}
                      onChange={(e) => setBreakMinutes(Number(e.target.value))}
                      className="rounded-2xl border-none bg-muted/50 h-12 focus-visible:ring-green-500/50"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>

      {/* Controles Principales (Debajo del círculo) */}
      <div className="mt-12 flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="h-14 w-14 rounded-full border-border/40 hover:bg-muted/50 transition-all hover:rotate-[-90deg]"
        >
          <RotateCcw className="h-6 w-6 text-muted-foreground" />
        </Button>
        <Button
          size="lg"
          onClick={toggleTimer}
          className={cn(
            "h-20 w-20 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-background",
            isBreak
              ? "bg-green-600 hover:bg-green-700 shadow-green-500/20"
              : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20",
            isActive && "bg-foreground text-background hover:bg-foreground/90"
          )}
        >
          {isActive ? (
            <Pause className="h-8 w-8 fill-current" />
          ) : (
            <Play className="h-8 w-8 fill-current ml-1" />
          )}
        </Button>
        <div className="w-14 h-14" /> {/* Espaciador para equilibrio visual */}
      </div>
    </div>
  );
}
