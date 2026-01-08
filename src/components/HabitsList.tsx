import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Flame, Sparkles, Trash2 } from "lucide-react";
import { cn, addXP, triggerConfetti } from "@/lib/utils";

import useSound from "use-sound";
/* import checkSound from "@/assets/sounds/pop-sound.mp3";   
import deleteSound from "@/assets/sounds/del-pop.mp3"; */
import bellSound from "@/assets/sounds/notification-bell-sound.mp3";

import { useAuth } from "@/components/context/AuthContext";
import { habitService } from "@/lib/appwrite";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Tipado para los hábitos
interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDays: string[]; // Formato "YYYY-MM-DD"
}

// Definimos la fecha fuera para uso general si es necesario
const TODAY_STR = new Date().toLocaleDateString("sv-SE");

// Habit templates
const habitTemplates = [
  { name: "Ejercicio diario", icon: "💪", category: "Salud" },
  { name: "Leer 30 minutos", icon: "📚", category: "Aprendizaje" },
  { name: "Meditar 10 minutos", icon: "🧘", category: "Bienestar" },
  { name: "Beber 8 vasos de agua", icon: "💧", category: "Salud" },
  { name: "Escribir en diario", icon: "✍️", category: "Reflexión" },
  { name: "Aprender algo nuevo", icon: "🎓", category: "Aprendizaje" },
  { name: "Hacer estiramientos", icon: "🤸", category: "Salud" },
  { name: "Practicar gratitud", icon: "🙏", category: "Bienestar" },
];

export function HabitsList() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const [playAdd] = useSound(bellSound, { volume: 0.3 });

  // 1. Cargar hábitos
  useEffect(() => {
    const fetchHabits = async () => {
      if (!user) return;
      try {
        const data = await habitService.getHabits(user.$id);
        const formatted = data.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name,
          streak: doc.streak,
          completedDays: doc.completedDays,
        }));
        setHabits(formatted);
      } catch (error) {
        console.error("Error habits:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHabits();
  }, [user]);

  // 2. Lógica de días (dentro del componente para que se actualice)
  const lastSevenDays = Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString("sv-SE");
    })
    .reverse();

  // 3. Cálculo de racha
  const calculateStreak = (days: string[]) => {
    let streak = 0;
    let checkDate = new Date();
    if (!days.includes(checkDate.toLocaleDateString("sv-SE"))) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (days.includes(checkDate.toLocaleDateString("sv-SE"))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  // 4. Acción de Toggle
  const toggleHabit = async (habitId: string, date: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDays.includes(date);
    const newDays = isCompleted
      ? habit.completedDays.filter((d) => d !== date)
      : [...habit.completedDays, date];

    const newStreak = calculateStreak(newDays);

    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, completedDays: newDays, streak: newStreak }
          : h
      )
    );
    playAdd();

    if (!isCompleted) {
      addXP(15); // 15 XP por completar hábito
      triggerConfetti("habit"); // Trigger confetti animation
    }

    try {
      await habitService.updateHabitDays(habitId, newDays, newStreak);
    } catch (error) {
      console.error("Error saving habit:", error);
    }
  };

  // 5. Acción de Añadir (Conectada al botón)
  const addHabit = async (habitName?: string) => {
    const name = habitName || prompt("¿Qué nuevo hábito quieres empezar?");
    if (!name || !user) return;

    try {
      const res = await habitService.createHabit(user.$id, name);
      const newHabit: Habit = {
        id: res.$id,
        name: name,
        streak: 0,
        completedDays: [],
      };
      setHabits((prev) => [...prev, newHabit]);
      playAdd();
      setIsTemplateDialogOpen(false);
    } catch (error) {
      console.error("Error creando hábito:", error);
    }
  };

  // 6. Acción de Eliminar
  const deleteHabit = async (habitId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este hábito?")) return;

    try {
      await habitService.deleteHabit(habitId);
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      playAdd(); // Reusing the sound for consistency
    } catch (error) {
      console.error("Error eliminando hábito:", error);
    }
  };

  if (isLoading)
    return (
      <div className="p-20 text-center animate-pulse">Cargando rituales...</div>
    );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-18 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Encabezado Estilo Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 px-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-400/20 border border-pink-400/30 text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-widest">
            <Flame className="h-3 w-3 fill-current" /> En racha
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter">
            Hábitos
          </h2>
          <p className="text-muted-foreground font-medium italic text-sm sm:text-base">
            "Somos lo que hacemos repetidamente."
          </p>
        </div>

        <Dialog
          open={isTemplateDialogOpen}
          onOpenChange={setIsTemplateDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto rounded-2xl h-12 sm:h-14 px-6 sm:px-8 bg-purple-400 hover:bg-purple-500 shadow-xl shadow-purple-400/30 transition-all hover:scale-105 active:scale-95 font-bold text-white text-sm sm:text-base">
              <Sparkles className="mr-2 h-4 sm:h-5 w-4 sm:w-5" /> Nuevo Hábito
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">
                Elige un Hábito
              </DialogTitle>
              <DialogDescription>
                Selecciona una plantilla o crea uno personalizado
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
              {habitTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-xs sm:text-sm"
                  onClick={() => addHabit(template.name)}
                >
                  <span className="text-xl sm:text-2xl">{template.icon}</span>
                  <span className="font-medium text-center">
                    {template.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {template.category}
                  </span>
                </Button>
              ))}

              <Button
                variant="outline"
                className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 border-dashed hover:bg-muted/50 transition-all text-xs sm:text-sm"
                onClick={() => addHabit()}
              >
                <Plus className="text-xl sm:text-2xl" />
                <span className="font-medium text-center">Personalizado</span>
                <span className="text-xs text-muted-foreground">
                  Crea uno propio
                </span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rejilla de Hábitos */}
      <div className="grid gap-4 sm:gap-6">
        {habits.length === 0 ? (
          <div className="text-center py-12 sm:py-20 border-2 border-dashed rounded-[32px] sm:rounded-[40px] opacity-30">
            <p className="italic text-sm sm:text-base">
              No hay hábitos configurados aún...
            </p>
          </div>
        ) : (
          habits.map((habit) => {
            // Cálculo de porcentaje de la semana (ejemplo visual)
            //            const weeklyProgress = (habit.completedDays.length % 7) * 14.2;

            return (
              <Card
                key={habit.id}
                className="group overflow-hidden border-none bg-card/40 backdrop-blur-xl shadow-2xl rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] transition-all hover:shadow-purple-500/5"
              >
                <CardContent className="p-4 sm:p-6 lg:p-8 lg:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                    {/* Info del Hábito */}
                    <div className="space-y-3 sm:space-y-4 flex-1">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight group-hover:text-purple-500 transition-colors">
                            {habit.name}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteHabit(habit.id)}
                            className="opacity-0 lg:group-hover:opacity-100 hover:cursor-pointer h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                          <div className="flex items-center text-pink-500 dark:text-pink-400 font-black text-xs sm:text-sm italic">
                            <Flame className="mr-1 h-4 sm:h-5 w-4 sm:w-5 fill-current" />
                            <span>{habit.streak} DÍAS</span>
                          </div>
                          <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-tighter">
                            Frecuencia Diaria
                          </span>
                        </div>
                      </div>

                      {/* Barra de Progreso Sutil */}
                      <div className="w-full max-w-xs h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-1000"
                          style={{
                            width: `${Math.min(100, habit.streak * 10)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Tracker Semanal */}
                    <div className="flex items-center justify-between lg:justify-end gap-1.5 sm:gap-2 lg:gap-3">
                      {lastSevenDays.map((date) => {
                        const isCompleted = habit.completedDays.includes(date);
                        const isToday = date === TODAY_STR;
                        const dateObj = new Date(date + "T00:00:00");
                        const dayName = dateObj.toLocaleDateString("es-ES", {
                          weekday: "narrow",
                        });
                        const dayNum = dateObj.getDate();

                        return (
                          <div
                            key={date}
                            className="flex flex-col items-center gap-2"
                          >
                            <span
                              className={cn(
                                "text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors",
                                isToday
                                  ? "text-purple-500"
                                  : "text-muted-foreground/40"
                              )}
                            >
                              {isToday ? "Hoy" : dayName}
                            </span>

                            <button
                              onClick={() => toggleHabit(habit.id, date)}
                              className={cn(
                                "h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-[14px] sm:rounded-[18px] lg:rounded-[22px] transition-all duration-500 flex flex-col items-center justify-center border-2 relative group/btn",
                                isCompleted
                                  ? "bg-purple-400 border-purple-300 text-white shadow-lg shadow-purple-400/30 scale-105"
                                  : "bg-background/50 border-border/50 hover:border-purple-300 text-muted-foreground/30",
                                isToday &&
                                  !isCompleted &&
                                  "ring-2 ring-purple-400/20 border-purple-400/50"
                              )}
                            >
                              <span
                                className={cn(
                                  "text-[9px] sm:text-xs font-bold mb-0.5 transition-colors",
                                  isCompleted
                                    ? "text-white"
                                    : "text-foreground/20"
                                )}
                              >
                                {dayNum}
                              </span>
                              {isCompleted ? (
                                <CheckCircle2 className="h-3 sm:h-4 w-3 sm:w-4" />
                              ) : (
                                <div className="h-1 w-1 rounded-full bg-current" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
