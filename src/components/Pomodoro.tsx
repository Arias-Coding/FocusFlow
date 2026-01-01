import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

export function Pomodoro() {
  const WORK_TIME = 25 * 60; // 25 minutos
  const BREAK_TIME = 5 * 60; // 5 minutos

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    // En Vite/Navegador, el ID del timer es un número
    let timer: number | undefined;

    if (isActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Cambio automático entre sesión y descanso
      const nextMode = !isBreak;
      setIsBreak(nextMode);
      setTimeLeft(nextMode ? BREAK_TIME : WORK_TIME);
      setIsActive(false);

      // Notificación amigable
      alert(nextMode ? "¡Tiempo de descanso!" : "¡A trabajar!");
    }

    // Limpieza del efecto
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [isActive, timeLeft, isBreak]);

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

  const progress =
    ((isBreak ? BREAK_TIME - timeLeft : WORK_TIME - timeLeft) /
      (isBreak ? BREAK_TIME : WORK_TIME)) *
    100;

  return (
    <Card className="w-full max-w-md shadow-2xl border-2">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
          {isBreak ? (
            <>
              <Coffee className="text-green-500" /> Tiempo de Descanso
            </>
          ) : (
            <>
              <Brain className="text-red-500" /> Sesión de Enfoque
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Visualización del Tiempo */}
        <div className="text-center">
          <span className="text-8xl font-black tabular-nums tracking-tighter transition-all">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Barra de Progreso */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3 transition-all" />
          <p className="text-xs text-center text-muted-foreground uppercase tracking-widest font-medium">
            {Math.round(progress)}% Completado
          </p>
        </div>

        {/* Controles */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            variant={isActive ? "outline" : "default"}
            className="w-32 transition-all active:scale-95"
            onClick={toggleTimer}
          >
            {isActive ? (
              <Pause className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isActive ? "Pausar" : "Iniciar"}
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="transition-all active:scale-95"
            onClick={resetTimer}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reiniciar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
