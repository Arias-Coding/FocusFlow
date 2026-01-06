import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Quote, Target, Trophy } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { taskService, habitService } from "@/lib/appwrite";
import {
  getXP,
  getLevel,
  getXPForNextLevel,
  triggerConfetti,
} from "@/lib/utils";
import { PageLayout, PageHeader, CardGrid } from "@/components/ui/layout";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  streak: number;
}

const motivationalQuotes = [
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "La disciplina es el puente entre metas y logros.",
  "Cada día es una nueva oportunidad para ser mejor.",
  "La consistencia vence al talento cuando el talento no es consistente.",
  "Tu futuro yo te agradecerá los esfuerzos de hoy.",
  "El progreso, no la perfección, es el objetivo.",
  "Pequeños cambios, grandes resultados.",
  "La motivación te pone en marcha, el hábito te mantiene en movimiento.",
];

export function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [quote, setQuote] = useState("");
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [previousLevel, setPreviousLevel] = useState(1);

  useEffect(() => {
    // Random quote
    setQuote(
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    );

    // Update XP and check for level up
    const currentXP = getXP();
    const currentLevel = getLevel(currentXP);

    setXp(currentXP);
    setLevel(currentLevel);

    // Check if leveled up
    if (currentLevel > previousLevel && previousLevel !== 1) {
      triggerConfetti("levelUp");
    }

    setPreviousLevel(currentLevel);

    // Fetch tasks
    const fetchTasks = async () => {
      if (!user) return;
      try {
        const data = await taskService.getTasks(user.$id);
        const formatted = data.documents.map((doc: any) => ({
          id: doc.$id,
          text: doc.text,
          completed: doc.completed,
        }));
        setTasks(formatted);
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };

    // Fetch habits
    const fetchHabits = async () => {
      if (!user) return;
      try {
        const data = await habitService.getHabits(user.$id);
        const formatted = data.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name,
          streak: doc.streak,
        }));
        setHabits(formatted);
      } catch (error) {
        console.error("Error loading habits:", error);
      }
    };

    fetchTasks();
    fetchHabits();
  }, [user]);

  const pendingTasks = tasks.filter((task) => !task.completed);
  const highestStreakHabit = habits.reduce(
    (max, habit) => (habit.streak > max.streak ? habit : max),
    { name: "Ninguno", streak: 0 }
  );

  return (
    <PageLayout>
      <PageHeader
        title="¡Bienvenido de vuelta!"
        subtitle="Tu día de productividad comienza aquí"
      />

      <CardGrid>
        {/* Motivational Quote */}
        <Card className="md:col-span-2 xl:col-span-3 group hover:scale-[1.01] transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Quote className="w-5 h-5" />
              Frase del Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg sm:text-xl italic text-muted-foreground">
              "{quote}"
            </p>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="group hover:scale-105 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Tareas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl sm:text-5xl font-bold mb-2">
              {pendingTasks.length}
            </div>
            <p className="text-sm text-muted-foreground">
              {pendingTasks.length === 0
                ? "¡Todas completadas!"
                : "tareas para hoy"}
            </p>
            {pendingTasks.length > 0 && (
              <div className="mt-4 space-y-2">
                {pendingTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 text-sm p-2 rounded-md bg-white/[0.02] border border-white/5"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="truncate flex-1">{task.text}</span>
                  </div>
                ))}
                {pendingTasks.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{pendingTasks.length - 3} más
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Highest Streak Habit */}
        <Card className="group hover:scale-105 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5" />
              Mejor Racha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl sm:text-5xl font-bold mb-2">
              {highestStreakHabit.streak}
            </div>
            <p className="text-sm text-muted-foreground">
              {highestStreakHabit.name === "Ninguno"
                ? "Sin hábitos"
                : highestStreakHabit.name}
            </p>
            {highestStreakHabit.streak > 0 && (
              <Badge variant="secondary" className="mt-2">
                <Flame className="w-3 h-3 mr-1" />
                {highestStreakHabit.streak} días
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* XP and Level */}
        <Card className="group hover:scale-105 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Nivel y XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">Nivel {level}</div>
            <p className="text-sm text-muted-foreground mb-3">
              {xp} XP totales
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Próximo nivel</span>
                <span>{getXPForNextLevel(xp)} XP</span>
              </div>
              <div className="w-full bg-muted/20 rounded-full h-3 border border-white/10">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${((xp % 100) / 100) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </CardGrid>

      {/* Quick Stats */}
      <Card className="group hover:scale-[1.01] transition-all duration-300">
        <CardHeader>
          <CardTitle>Estadísticas Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-bold">{habits.length}</div>
              <div className="text-xs text-muted-foreground">Hábitos</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-bold">
                {tasks.filter((t) => t.completed).length}
              </div>
              <div className="text-xs text-muted-foreground">Completadas</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-bold">{tasks.length}</div>
              <div className="text-xs text-muted-foreground">Total Tareas</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-bold">{level}</div>
              <div className="text-xs text-muted-foreground">Nivel</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
