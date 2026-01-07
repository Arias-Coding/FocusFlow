import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Plus,
  CheckCircle2,
  Trophy,
  Zap,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { goalService } from "@/lib/appwrite";

// Estructura mejorada de Goal
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
  estado_progreso: number; // 0-100
  puntuación_ejecución: number; // 0-100
}

// Array de goals de ejemplo para testing
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
  {
    id: "goal-3",
    objetivo_aspiracional: "Completar certificación en TypeScript",
    periodo: {
      año: 2026,
      cuatrimestre: 2,
      semanas: [13, 24],
    },
    indicadores_exito_lag: ["Certificado obtenido", "10 proyectos realizados"],
    tacticas_semanales_lead: [
      {
        descripcion: "Estudiar 1 hora diaria",
        frecuencia: "diaria",
      },
      {
        descripcion: "Completar 1 proyecto por semana",
        frecuencia: "semanal",
      },
    ],
    estado_progreso: 65,
    puntuación_ejecución: 75,
  },
  {
    id: "goal-4",
    objetivo_aspiracional: "Expandir a nuevo mercado",
    periodo: {
      año: 2026,
      cuatrimestre: 3,
      semanas: [25, 36],
    },
    indicadores_exito_lag: ["Presencia en 3 países", "500 usuarios nuevos"],
    tacticas_semanales_lead: [
      {
        descripcion: "Investigar regulaciones locales",
        frecuencia: "semanal",
      },
      {
        descripcion: "Conectar con influencers locales",
        frecuencia: "semanal",
      },
    ],
    estado_progreso: 0,
    puntuación_ejecución: 0,
  },
];

export function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>(EXAMPLE_GOALS); // Usando goals de ejemplo
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3>(1);
  const [newGoal, setNewGoal] = useState({
    objetivo_aspiracional: "",
    indicadores_exito_lag: "",
    tacticas_semanales_lead: "",
    frecuencia: "semanal" as const,
  });

  const currentYear = new Date().getFullYear();

  // Obtener goals del cuatrimestre seleccionado
  const goalsForQuarter = goals.filter(
    (g) => g.periodo.cuatrimestre === selectedQuarter
  );

  // Mapeo de cuatrimestres a meses
  const quartersInfo = {
    1: { months: "Enero - Abril", weeks: "Semanas 1-12" },
    2: { months: "Mayo - Agosto", weeks: "Semanas 13-24" },
    3: { months: "Septiembre - Diciembre", weeks: "Semanas 25-36" },
  };

  // Calcular promedio de progreso del cuatrimestre
  const avgProgressQuarter =
    goalsForQuarter.length > 0
      ? Math.round(
          goalsForQuarter.reduce((sum, g) => sum + g.estado_progreso, 0) /
            goalsForQuarter.length
        )
      : 0;

  // Calcular promedio de ejecución del cuatrimestre
  const avgExecutionQuarter =
    goalsForQuarter.length > 0
      ? Math.round(
          goalsForQuarter.reduce((sum, g) => sum + g.puntuación_ejecución, 0) /
            goalsForQuarter.length
        )
      : 0;

  const addGoal = () => {
    if (!newGoal.objetivo_aspiracional.trim()) return;

    const tacticasArray = newGoal.tacticas_semanales_lead
      .split("\n")
      .filter((t) => t.trim())
      .map((descripcion) => ({
        descripcion: descripcion.trim(),
        frecuencia: newGoal.frecuencia,
      }));

    const indicadoresArray = newGoal.indicadores_exito_lag
      .split("\n")
      .filter((i) => i.trim());

    const goal: Goal = {
      id: `goal-${Date.now()}`,
      objetivo_aspiracional: newGoal.objetivo_aspiracional,
      periodo: {
        año: currentYear,
        cuatrimestre: selectedQuarter,
        semanas: [
          selectedQuarter === 1 ? 1 : selectedQuarter === 2 ? 13 : 25,
          selectedQuarter === 1 ? 12 : selectedQuarter === 2 ? 24 : 36,
        ],
      },
      indicadores_exito_lag: indicadoresArray,
      tacticas_semanales_lead: tacticasArray,
      estado_progreso: 0,
      puntuación_ejecución: 0,
    };

    setGoals([...goals, goal]);
    setNewGoal({
      objetivo_aspiracional: "",
      indicadores_exito_lag: "",
      tacticas_semanales_lead: "",
      frecuencia: "semanal",
    });
  };

  const updateGoalProgress = (id: string, progress: number) => {
    setGoals(
      goals.map((g) =>
        g.id === id ? { ...g, estado_progreso: Math.min(100, progress) } : g
      )
    );
  };

  const updateGoalExecution = (id: string, execution: number) => {
    setGoals(
      goals.map((g) =>
        g.id === id
          ? { ...g, puntuación_ejecución: Math.min(100, execution) }
          : g
      )
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto animate-in fade-in duration-1000">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-2">
          Objetivos {currentYear}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Estructura tu año en 3 cuatrimestres y alcanza tus metas
        </p>
      </div>

      {/* Quarter Selection */}
      <Card className="mb-6 sm:mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[1, 2, 3].map((quarter) => (
              <Button
                key={quarter}
                variant={selectedQuarter === quarter ? "default" : "outline"}
                onClick={() => setSelectedQuarter(quarter as 1 | 2 | 3)}
                className="h-auto py-3 flex flex-col gap-1"
              >
                <span className="font-bold text-base sm:text-lg">
                  Cuatrimestre {quarter}
                </span>
                <span className="text-xs sm:text-sm opacity-90">
                  {quartersInfo[quarter as 1 | 2 | 3].months}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quarter Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Progreso Promedio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold">{avgProgressQuarter}%</div>
            <Progress value={avgProgressQuarter} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {goalsForQuarter.length} objetivos en este cuatrimestre
            </p>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Puntuación Ejecución
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold">{avgExecutionQuarter}%</div>
            <Progress value={avgExecutionQuarter} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Desempeño en tácticas semanales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add New Goal */}
      <Card className="mb-6 sm:mb-8 group hover:scale-[1.01] transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nuevo Objetivo - Cuatrimestre {selectedQuarter}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Nombre del objetivo (ej. Lanzar mi MVP)"
            value={newGoal.objetivo_aspiracional}
            onChange={(e) =>
              setNewGoal({ ...newGoal, objetivo_aspiracional: e.target.value })
            }
            className="bg-white/5 border-white/10 focus:border-primary/50"
          />

          <div>
            <label className="text-sm font-medium mb-2 block">
              Indicadores de Éxito (uno por línea)
            </label>
            <Textarea
              placeholder="ej. 100 usuarios pagos&#10;ej. 50 clientes activos"
              value={newGoal.indicadores_exito_lag}
              onChange={(e) =>
                setNewGoal({
                  ...newGoal,
                  indicadores_exito_lag: e.target.value,
                })
              }
              className="bg-white/5 border-white/10 focus:border-primary/50 resize-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Frecuencia de Tácticas
              </label>
              <select
                value={newGoal.frecuencia}
                onChange={(e) =>
                  setNewGoal({
                    ...newGoal,
                    frecuencia: e.target.value as "diaria" | "semanal",
                  })
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm"
              >
                <option value="diaria">Diaria</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Tácticas Semanales (una por línea)
            </label>
            <Textarea
              placeholder="ej. Contactar 5 prospectos diarios&#10;ej. Publicar 2 posts en redes sociales"
              value={newGoal.tacticas_semanales_lead}
              onChange={(e) =>
                setNewGoal({
                  ...newGoal,
                  tacticas_semanales_lead: e.target.value,
                })
              }
              className="bg-white/5 border-white/10 focus:border-primary/50 resize-none"
              rows={3}
            />
          </div>

          <Button onClick={addGoal} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Objetivo
          </Button>
        </CardContent>
      </Card>

      {/* Goals List */}
      {goalsForQuarter.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">
              No hay objetivos para este cuatrimestre
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {goalsForQuarter.map((goal) => (
            <Card
              key={goal.id}
              className="overflow-hidden hover:scale-[1.01] transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl mb-2">
                      {goal.objetivo_aspiracional}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        Semanas {goal.periodo.semanas[0]}-
                        {goal.periodo.semanas[1]}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(goal.id)}
                    className="text-destructive hover:bg-destructive/20"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progreso */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      Progreso del Objetivo
                    </label>
                    <span className="text-sm font-bold">
                      {goal.estado_progreso}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Progress value={goal.estado_progreso} className="flex-1" />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={goal.estado_progreso}
                      onChange={(e) =>
                        updateGoalProgress(
                          goal.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-16 h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Puntuación Ejecución */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      Puntuación Ejecución
                    </label>
                    <span className="text-sm font-bold">
                      {goal.puntuación_ejecución}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Progress
                      value={goal.puntuación_ejecución}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={goal.puntuación_ejecución}
                      onChange={(e) =>
                        updateGoalExecution(
                          goal.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-16 h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Indicadores de Éxito */}
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Indicadores de Éxito (LAG)
                  </h4>
                  <ul className="space-y-1">
                    {goal.indicadores_exito_lag.map((indicador, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-muted-foreground flex gap-2"
                      >
                        <span className="text-primary">▸</span>
                        {indicador}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tácticas Semanales */}
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Tácticas Semanales (LEAD)
                  </h4>
                  <ul className="space-y-2">
                    {goal.tacticas_semanales_lead.map((tactica, idx) => (
                      <li
                        key={idx}
                        className="text-sm bg-white/2 p-2 rounded border border-white/5"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-primary">◆</span>
                          <div className="flex-1">
                            <p>{tactica.descripcion}</p>
                            <Badge
                              variant="outline"
                              className="mt-1 text-xs capitalize"
                            >
                              {tactica.frecuencia}
                            </Badge>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
