import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Quote, Target, Trophy, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { taskService, habitService } from "@/lib/appwrite";
import {
  getXP,
  getLevel,
  getXPForNextLevel,
  triggerConfetti,
  cn,
} from "@/lib/utils";
import { PageLayout, PageHeader, CardGrid } from "@/components/ui/layout";
import { Progress } from "@/components/ui/progress";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDays: string[];
}

interface Goal {
  id: string;
  objetivo_aspiracional: string;
  periodo: {
    año: number;
    cuatrimestre: 1 | 2 | 3;
    semanas: [number, number];
  };
  indicadores_exito_lag: string[];
  tacticas_semanales_lead: Array<{
    descripcion: string;
    frecuencia: "diaria" | "semanal";
  }>;
  estado_progreso: number;
  puntuación_ejecución: number;
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

// Datos de ejemplo de objetivos
const EXAMPLE_GOALS: Goal[] = [
  {
    id: "goal-1",
    objetivo_aspiracional: "Lanzar mi MVP",
    periodo: {
      año: 2026,
      cuatrimestre: 1,
      semanas: [1, 12],
    },
    indicadores_exito_lag: ["100 usuarios pagos", "50 clientes activos"],
    tacticas_semanales_lead: [
      {
        descripcion: "Contactar 5 prospectos diarios",
        frecuencia: "diaria",
      },
      {
        descripcion: "Publicar 2 posts en redes sociales",
        frecuencia: "semanal",
      },
    ],
    estado_progreso: 45,
    puntuación_ejecución: 60,
  },
  {
    id: "goal-2",
    objetivo_aspiracional: "Obtener 10 clientes pagos",
    periodo: {
      año: 2026,
      cuatrimestre: 1,
      semanas: [1, 12],
    },
    indicadores_exito_lag: ["$5000 en ingresos recurrentes"],
    tacticas_semanales_lead: [
      {
        descripcion: "Enviar 10 propuestas comerciales",
        frecuencia: "semanal",
      },
      {
        descripcion: "Revisar y optimizar pitch",
        frecuencia: "semanal",
      },
    ],
    estado_progreso: 30,
    puntuación_ejecución: 50,
  },
];

export function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>(EXAMPLE_GOALS);
  const [quote, setQuote] = useState("");
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [previousLevel, setPreviousLevel] = useState(1);

  // Obtener cuatrimestre actual
  const getCurrentQuarter = (): 1 | 2 | 3 => {
    const month = new Date().getMonth();
    if (month < 4) return 1;
    if (month < 8) return 2;
    return 3;
  };

  const currentQuarter = getCurrentQuarter();
  const currentGoals = goals.filter(
    (g) => g.periodo.cuatrimestre === currentQuarter
  );

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
          completedDays: doc.completedDays || [],
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
    { name: "Ninguno", streak: 0, id: "", completedDays: [] }
  );

  // Generar último 30 días
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString("sv-SE"));
    }
    return days;
  };

  // Calcular intensidad de heatmap para un día (0-4)
  const getHeatmapIntensity = (date: string): number => {
    const completedCount = habits.filter((h) =>
      h.completedDays.includes(date)
    ).length;
    const totalHabits = habits.length;
    if (totalHabits === 0) return 0;
    const percentage = (completedCount / totalHabits) * 100;
    if (percentage === 0) return 0;
    if (percentage <= 25) return 1;
    if (percentage <= 50) return 2;
    if (percentage <= 75) return 3;
    return 4;
  };

  const getHeatmapColor = (intensity: number): string => {
    const colors = [
      "bg-white/10",
      "bg-green-500/40",
      "bg-green-500/60",
      "bg-green-500/80",
      "bg-green-500",
    ];
    return colors[intensity] || "bg-white/10";
  };

  return (
    <PageLayout className="animate-in fade-in duration-700 my-20">
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
                  <div key={task.id}>
                    <div className="flex items-center gap-3 text-sm p-2 rounded-md bg-white/2 border border-white/5">
                      <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                      <span className="truncate flex-1">{task.text}</span>
                    </div>
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
      <Card className="group hover:scale-[1.01] transition-all duration-300 mt-6">
        <CardHeader>
          <CardTitle>Estadísticas Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/2 border border-white/5">
              <div className="text-2xl font-bold">{habits.length}</div>
              <div className="text-xs text-muted-foreground">Hábitos</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/2 border border-white/5">
              <div className="text-2xl font-bold">
                {tasks.filter((t) => t.completed).length}
              </div>
              <div className="text-xs text-muted-foreground">Completadas</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/2 border border-white/5">
              <div className="text-2xl font-bold">{tasks.length}</div>
              <div className="text-xs text-muted-foreground">Total Tareas</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/2 border border-white/5">
              <div className="text-2xl font-bold">{level}</div>
              <div className="text-xs text-muted-foreground">Nivel</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Quarter Goals Section */}
      {currentGoals.length > 0 && (
        <Card className="group hover:scale-[1.01] transition-all duration-300 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Objetivos - Cuatrimestre {currentQuarter}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-lg border border-white/10 bg-white/2 hover:bg-white/5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm sm:text-base">
                        {goal.objetivo_aspiracional}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Semanas {goal.periodo.semanas[0]}-
                        {goal.periodo.semanas[1]}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Progreso</span>
                        <span className="font-bold">
                          {goal.estado_progreso}%
                        </span>
                      </div>
                      <Progress value={goal.estado_progreso} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Ejecución</span>
                        <span className="font-bold">
                          {goal.puntuación_ejecución}%
                        </span>
                      </div>
                      <Progress
                        value={goal.puntuación_ejecución}
                        className="h-2"
                      />
                    </div>
                  </div>

                  {goal.indicadores_exito_lag.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium mb-2">
                        Indicadores LAG:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {goal.indicadores_exito_lag.map((indicator, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 30 Days Heatmap Section */}
      {habits.length > 0 && (
        <Card className="group hover:scale-[1.01] transition-all duration-300 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Actividad últimos 30 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Heatmap grid */}
              <div className="pb-2">
                <div className="flex gap-1 min-w-min">
                  {getLast30Days().map((date) => {
                    const intensity = getHeatmapIntensity(date);
                    const dayNum = new Date(date).getDate();
                    const isToday =
                      date === new Date().toLocaleDateString("sv-SE");

                    return (
                      <div
                        key={date}
                        className="flex flex-col items-center gap-1"
                      >
                        <span className="text-xs text-muted-foreground mb-1">
                          {dayNum}
                        </span>
                        <div
                          className={cn(
                            "w-8 h-8 rounded-md transition-all border",
                            getHeatmapColor(intensity),
                            isToday && "border-primary ring-2 ring-primary/50"
                          )}
                          title={`${date}: ${
                            habits.filter((h) => h.completedDays.includes(date))
                              .length
                          }/${habits.length} hábitos`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10">
                <span className="text-xs text-muted-foreground">Menos</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn("w-3 h-3 rounded-sm", getHeatmapColor(i))}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Más</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
