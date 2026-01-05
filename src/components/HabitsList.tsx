import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Circle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

import useSound from "use-sound";
import checkSound from "@/assets/sounds/pop-sound.mp3";
import deleteSound from "@/assets/sounds/del-pop.mp3";
import bellSound from "@/assets/sounds/notification-bell-sound.mp3";

import { useAuth } from "@/components/context/AuthContext";
import { habitService } from "@/lib/appwrite";

// Tipado para los hábitos
interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDays: string[]; // Formato "YYYY-MM-DD"
}

// ... (imports se mantienen igual)

// Definimos la fecha fuera para uso general si es necesario
const TODAY_STR = new Date().toLocaleDateString("sv-SE");

export function HabitsList() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    try {
      await habitService.updateHabitDays(habitId, newDays, newStreak);
    } catch (error) {
      console.error("Error saving habit:", error);
    }
  };

  // 5. Acción de Añadir (Conectada al botón)
  const addHabit = async () => {
    const name = prompt("¿Qué nuevo hábito quieres empezar?");
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
    } catch (error) {
      console.error("Error creando hábito:", error);
    }
  };

  if (isLoading)
    return (
      <div className="p-20 text-center animate-pulse">Cargando rituales...</div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mis Hábitos</h2>
          <p className="text-muted-foreground">
            Construye constancia día a día.
          </p>
        </div>
        {/* BOTÓN CONECTADO AQUÍ */}
        <Button
          onClick={addHabit}
          className="rounded-full bg-purple-600 hover:bg-purple-700 transition-all hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo Hábito
        </Button>
      </div>

      <div className="grid gap-4">
        {habits.map((habit) => (
          <Card
            key={habit.id}
            className="overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-xl"
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{habit.name}</CardTitle>
                  <div className="flex items-center text-orange-500 font-bold">
                    <Flame className="mr-1 h-4 w-4 fill-current" />
                    <span>Racha de {habit.streak} días</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {lastSevenDays.map((date) => {
                    const isCompleted = habit.completedDays.includes(date);
                    const isToday = date === TODAY_STR;
                    const dayName = new Date(
                      date + "T00:00:00"
                    ).toLocaleDateString("es-ES", { weekday: "narrow" });

                    return (
                      <div
                        key={date}
                        className="flex flex-col items-center gap-2"
                      >
                        <span
                          className={cn(
                            "text-[10px] uppercase font-bold",
                            isToday
                              ? "text-purple-500 font-black"
                              : "text-muted-foreground"
                          )}
                        >
                          {isToday ? "Hoy" : dayName}
                        </span>
                        <button
                          onClick={() => toggleHabit(habit.id, date)}
                          className={cn(
                            "h-10 w-10 rounded-xl transition-all flex items-center justify-center border-2",
                            isCompleted
                              ? "bg-purple-500 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                              : "border-muted hover:border-purple-300",
                            isToday && !isCompleted && "border-purple-500/50"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/30" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* const today = new Date().toLocaleDateString("sv-SE");

export function HabitsList() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [playAdd] = useSound(bellSound, { volume: 0.3 });
  const today = new Date().toLocaleDateString("sv-SE");

  // Cargar hábitos de Appwrite
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

  // Función para calcular racha (Streak)
  const calculateStreak = (days: string[]) => {
    let streak = 0;
    let checkDate = new Date();
    // Si hoy no está completado, empezamos a chequear desde ayer
    if (!days.includes(checkDate.toLocaleDateString("sv-SE"))) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (days.includes(checkDate.toLocaleDateString("sv-SE"))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  const lastSevenDays = Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString("sv-SE");
    })
    .reverse();

  const toggleHabit = async (habitId: string, date: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDays.includes(date);
    const newDays = isCompleted
      ? habit.completedDays.filter((d) => d !== date)
      : [...habit.completedDays, date];

    const newStreak = calculateStreak(newDays);

    // Update Local
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, completedDays: newDays, streak: newStreak }
          : h
      )
    );
    playAdd();

    // Update Appwrite
    try {
      await habitService.updateHabitDays(habitId, newDays, newStreak);
    } catch (error) {
      console.error("Error saving habit:", error);
    }
  };

  const addHabit = async () => {
    const name = prompt("Nombre del nuevo hábito:");
    if (!name || !user) return;

    try {
      const res = await habitService.createHabit(user.$id, name);
      setHabits([
        ...habits,
        { id: res.$id, name, streak: 0, completedDays: [] },
      ]);
    } catch (error) {
      console.error("Error creating habit:", error);
    }
  };

  if (isLoading)
    return (
      <div className="p-20 text-center animate-pulse">Cargando rituales...</div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mis Hábitos</h2>
          <p className="text-muted-foreground">
            Construye constancia día a día.
          </p>
        </div>
        <Button className="rounded-full bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Hábito
        </Button>
      </div>
      <div className="grid gap-4">
        {habits.map((habit) => (
          <Card
            key={habit.id}
            className="overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-xl"
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{habit.name}</CardTitle>
                  <div className="flex items-center text-orange-500 font-bold">
                    <Flame className="mr-1 h-4 w-4 fill-current" />
                    <span>Racha de {habit.streak} días</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {lastSevenDays.map((date) => {
                    const isCompleted = habit.completedDays.includes(date);
                    const isToday = date === today; // Comparación exacta local

                    const dayName = new Date(
                      date + "T00:00:00"
                    ).toLocaleDateString("es-ES", {
                      weekday: "narrow",
                    });

                    return (
                      <div
                        key={date}
                        className="flex flex-col items-center gap-2"
                      >
                        <span
                          className={cn(
                            "text-[10px] uppercase font-bold",
                            isToday
                              ? "text-purple-500 font-black"
                              : "text-muted-foreground"
                          )}
                        >
                          {isToday ? "Hoy" : dayName}
                        </span>
                        <button
                          onClick={() => toggleHabit(habit.id, date)}
                          className={cn(
                            "h-10 w-10 rounded-xl transition-all flex items-center justify-center border-2 hover:cursor-pointer",
                            isCompleted
                              ? "bg-purple-500 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                              : "border-muted hover:border-purple-300",
                            isToday && !isCompleted && "border-purple-500/50" // Resaltar hoy si no está hecho
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/30" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
 */
