import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="relative flex items-center justify-center p-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* SVG del Círculo */}
      <svg
        width="500"
        height="500"
        viewBox="0 0 400 400"
        className="absolute -rotate-90 transform"
      >
        <circle
          cx="200"
          cy="200"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          className="text-muted/10"
        />
        <circle
          cx="200"
          cy="200"
          r={radius}
          stroke={isBreak ? "#22c55e" : "#a855f7"}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: isActive
              ? "stroke-dashoffset 1s linear"
              : "stroke-dashoffset 0.5s ease",
          }}
          className={cn(
            isBreak
              ? "drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]"
              : "drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]"
          )}
        />
      </svg>

      {/* Botón de Configuración Flotante (Esquina superior derecha del círculo) */}
      <div className="absolute top-10 right-10 z-20">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:rotate-90 transition-transform duration-500"
            >
              <Settings2 className="h-6 w-6 text-muted-foreground" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-82 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Ajustes del Timer
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="work" className="text-sm font-medium">
                  Tiempo de Enfoque (min)
                </Label>
                <Input
                  id="work"
                  type="number"
                  value={workMinutes}
                  onChange={(e) => setWorkMinutes(Number(e.target.value))}
                  className="rounded-xl border-2 focus-visible:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="break" className="text-sm font-medium">
                  Tiempo de Descanso (min)
                </Label>
                <Input
                  id="break"
                  type="number"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number(e.target.value))}
                  className="rounded-xl border-2 focus-visible:ring-green-500"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contenido Central */}
      <Card className="z-10 w-full max-w-sm border-none bg-transparent shadow-none">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {isBreak ? (
              <>
                <Coffee className="h-4 w-4 text-green-500" /> Descanso
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 text-purple-500" /> Enfoque
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-8">
          <div className="flex flex-col items-center">
            <span className="text-8xl font-light tabular-nums tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <div
              className={cn(
                "mt-4 rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase animate-pulse",
                isBreak
                  ? "bg-green-500/10 text-green-500"
                  : "bg-purple-500/10 text-purple-500"
              )}
            >
              {Math.ceil(progress)}% Restante
            </div>
          </div>

          <div className="flex w-full justify-center gap-4">
            <Button
              size="lg"
              onClick={toggleTimer}
              className={cn(
                "w-36 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95",
                isBreak
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-purple-600 hover:bg-purple-700",
                isActive && "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {isActive ? (
                <Pause className="mr-2 h-5 w-5" />
              ) : (
                <Play className="mr-2 h-5 w-5" />
              )}
              {isActive ? "Pausar" : "Iniciar"}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="h-12 w-12 rounded-full border-2 transition-all hover:rotate-180 active:scale-90"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
