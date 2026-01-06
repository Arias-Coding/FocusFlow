import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, CheckCircle2, Trophy } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { goalService } from "@/lib/appwrite";

interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  year: number;
}

export function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;
      try {
        const data = await goalService.getGoals(user.$id, currentYear);
        const formatted = data.documents.map((doc: any) => ({
          id: doc.$id,
          title: doc.title,
          description: doc.description,
          completed: doc.completed,
          year: doc.year,
        }));
        setGoals(formatted);
      } catch (error) {
        console.error("Error loading goals:", error);
      } finally {
        // setIsLoading(false);
      }
    };
    fetchGoals();
  }, [user, currentYear]);

  const addGoal = async () => {
    if (!newGoalTitle.trim() || !user) return;
    try {
      const res = await goalService.createGoal(
        user.$id,
        newGoalTitle,
        newGoalDesc,
        currentYear
      );
      const goal: Goal = {
        id: res.$id,
        title: newGoalTitle,
        description: newGoalDesc,
        completed: false,
        year: currentYear,
      };
      setGoals([...goals, goal]);
      setNewGoalTitle("");
      setNewGoalDesc("");
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const toggleGoal = async (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    const newCompleted = !goal.completed;
    try {
      await goalService.toggleGoal(id, newCompleted);
      setGoals(
        goals.map((g) => (g.id === id ? { ...g, completed: newCompleted } : g))
      );
    } catch (error) {
      console.error("Error toggling goal:", error);
    }
  };

  const completedGoals = goals.filter((g) => g.completed);
  const pendingGoals = goals.filter((g) => !g.completed);

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-6xl mx-auto animate-in fade-in duration-1000">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-2">
          Objetivos de {currentYear}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Define y alcanza tus metas anuales
        </p>
      </div>

      {/* Add New Goal */}
      <Card className="mb-6 sm:mb-8 group hover:scale-[1.02] transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nuevo Objetivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Título del objetivo"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            className="bg-white/5 border-white/10 focus:border-primary/50"
          />
          <Textarea
            placeholder="Descripción (opcional)"
            value={newGoalDesc}
            onChange={(e) => setNewGoalDesc(e.target.value)}
            className="bg-white/5 border-white/10 focus:border-primary/50 resize-none"
            rows={3}
          />
          <Button onClick={addGoal} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Objetivo
          </Button>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Pending Goals */}
        <Card className="group hover:scale-[1.01] transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Pendientes ({pendingGoals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {pendingGoals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm sm:text-base">
                No hay objetivos pendientes
              </p>
            ) : (
              pendingGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-200 group/item"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGoal(goal.id)}
                    className="mt-1 h-8 w-8 p-0 hover:bg-primary/20 hover:scale-110 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base truncate">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Completed Goals */}
        <Card className="group hover:scale-[1.01] transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Completados ({completedGoals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {completedGoals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm sm:text-base">
                Aún no has completado objetivos
              </p>
            ) : (
              completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-all duration-200 group/item"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium line-through text-muted-foreground text-sm sm:text-base truncate">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Completado
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
