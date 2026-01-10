import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Flame,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { cn, normalizeDate } from "@/lib/utils";

import useSound from "use-sound";
import bellSound from "@/assets/sounds/notification-bell-sound.mp3";

import { useAuthStore, useHabitsStore } from "@/lib/stores";
import { PageLayout, PageHeader } from "@/components/ui/layout";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Definimos la fecha fuera para uso general si es necesario
const TODAY_STR = new Date().toISOString().split("T")[0];

export function HabitsList() {
  const { user } = useAuthStore();
  const {
    habits,
    habitLogs,
    habitOrder,
    loading,
    newHabit,
    fetchHabitsAndLogs,
    createHabit,
    toggleBooleanHabit,
    saveLogValue,
    deleteHabit,
    moveHabitUp,
    moveHabitDown,
    setNewHabit,
  } = useHabitsStore();

  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

  const [playAdd] = useSound(bellSound, { volume: 0.3 });

  // Load habits on mount
  useEffect(() => {
    if (user?.$id) {
      fetchHabitsAndLogs(user.$id);
    }
  }, [user, fetchHabitsAndLogs]);

  // Calculate streak for a habit
  const calculateStreak = (logs: any[]) => {
    const completedDates = logs
      .filter((log) => log.completed)
      .map((log) => normalizeDate(log.date))
      .sort();
    let streak = 0;
    let checkDate = new Date();
    let checkDateStr = checkDate.toLocaleDateString("sv-SE");
    if (!completedDates.includes(checkDateStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = checkDate.toLocaleDateString("sv-SE");
    }
    while (completedDates.includes(checkDateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = checkDate.toLocaleDateString("sv-SE");
    }
    return streak;
  };

  // Handle toggle boolean habit
  const handleToggleBooleanHabit = async (habitId: string, date: string) => {
    if (!user) return;
    await toggleBooleanHabit(habitId, date, user.$id);
    playAdd();
  };

  // Handle save log value
  const handleSaveLogValue = async () => {
    if (!user) return;
    const value = parseFloat(inputValue);
    if (isNaN(value)) return;
    await saveLogValue(selectedHabitId, selectedDate, value, user.$id);
    setIsLogDialogOpen(false);
    playAdd();
  };

  // Handle delete habit
  const handleDeleteHabit = async (habitId: string) => {
    if (!user) return;
    await deleteHabit(habitId, user.$id);
  };

  // Handle create habit
  const handleCreateHabit = async () => {
    if (!user) return;
    await createHabit(user.$id);
    setIsAddHabitOpen(false);
  };

  // Handle open log dialog
  const handleOpenLogDialog = (habitId: string, date: string) => {
    const habit = habits.find((h) => h.$id === habitId);
    if (!habit || habit.type !== "count") return;

    const logs = habitLogs[habitId] || [];
    const existingLog = logs.find((l) => normalizeDate(l.date) === date);
    setSelectedHabitId(habitId);
    setSelectedDate(date);
    setInputValue(existingLog ? existingLog.value.toString() : "");
    setIsLogDialogOpen(true);
  };

  // Get last 7 days
  const lastSevenDays = Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    })
    .reverse();

  return (
    <PageLayout>
      <PageHeader
        title="Hábitos"
        subtitle="Somos lo que hacemos repetidamente."
        className="w-10/12 max-w-225 mx-auto"
        icon={Flame}
        actions={
          <Dialog open={isAddHabitOpen} onOpenChange={setIsAddHabitOpen}>
            <DialogTrigger asChild>
              <Button>Agregar Hábito</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Hábito</DialogTitle>
                <DialogDescription>
                  Define un nuevo hábito para seguir.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="habit-name">Nombre del Hábito</Label>
                  <Input
                    id="habit-name"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ name: e.target.value })}
                    placeholder="Ej: Hacer ejercicio"
                  />
                </div>
                <div>
                  <Label htmlFor="habit-type">Tipo</Label>
                  <select
                    id="habit-type"
                    value={newHabit.type}
                    onChange={(e) =>
                      setNewHabit({
                        type: e.target.value as "boolean" | "count",
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="boolean">Sí/No (Completado)</option>
                    <option value="count">Contador (Con meta)</option>
                  </select>
                </div>
                {newHabit.type === "count" && (
                  <>
                    <div>
                      <Label htmlFor="habit-unit">Unidad</Label>
                      <Input
                        id="habit-unit"
                        value={newHabit.unit}
                        onChange={(e) => setNewHabit({ unit: e.target.value })}
                        placeholder="Ej: minutos, km, vasos"
                      />
                    </div>
                    <div>
                      <Label htmlFor="habit-target">Meta</Label>
                      <Input
                        id="habit-target"
                        type="number"
                        value={newHabit.target}
                        onChange={(e) =>
                          setNewHabit({ target: parseInt(e.target.value) || 0 })
                        }
                        placeholder="Ej: 30"
                      />
                    </div>
                  </>
                )}
                <Button onClick={handleCreateHabit} className="w-full">
                  Crear Hábito
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        {/* Calendario Común */}
        <div className="grid grid-cols-7 md:grid-cols-12 mb-6 items-center">
          <div className="hidden">{/* espacio para el numero de semana */}</div>
          <div className="col-span-full md:col-start-6 md:col-span-7 grid grid-cols-7 grid-rows-1 gap-2">
            {lastSevenDays.map((date) => {
              const dateObj = new Date(date + "T00:00:00");
              const dayName = dateObj.toLocaleDateString("es-ES", {
                weekday: "narrow",
              });
              const dayNum = dateObj.getDate();
              const isToday = date === TODAY_STR;

              return (
                <div key={date} className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isToday ? "text-purple-500" : "text-muted-foreground/40"
                    )}
                  >
                    {isToday ? "Hoy" : dayName}
                  </span>
                  <span
                    className={cn(
                      "text-lg font-black",
                      isToday ? "text-purple-500" : "text-muted-foreground"
                    )}
                  >
                    {dayNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Hábitos */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-sm">Cargando hábitos...</p>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-[32px] opacity-30">
              <p className="italic text-sm">
                No hay hábitos configurados aún...
              </p>
            </div>
          ) : (
            habitOrder.map((habitId) => {
              const habit = habits.find((h) => h.$id === habitId);
              if (!habit) return null;
              const logs = habitLogs[habit.$id] || [];

              const streak = calculateStreak(logs);

              return (
                <div
                  className="grid grid-cols-7 grid-rows-2 md:grid-rows-1 md:grid-cols-12 gap-2 mb-4 items-center"
                  key={habit.$id}
                >
                  <div className="group col-span-full md:col-span-5">
                    <div className="flex items-center justify-start gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveHabitUp(habit.$id)}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveHabitDown(habit.$id)}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">{habit.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {streak} días
                        </span>
                      </div>

                      {habit.type == "count" && (
                        <span>
                          {habit.target} {habit.unit}
                        </span>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteHabit(habit.$id)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition hover:cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="col-span-full md:col-start-6 grid grid-cols-7 gap-2">
                    {lastSevenDays.map((date) => {
                      const log = logs.find(
                        (l) => normalizeDate(l.date) === date
                      );

                      const isCountHabit = habit.type === "count";
                      const logValue = log?.value;
                      const isCompleted = isCountHabit
                        ? (logValue || 0) >= (habit.target || 0)
                        : log?.completed || false;
                      const showValue = isCountHabit && logValue !== undefined;
                      const isToday = date === TODAY_STR;

                      return (
                        <div
                          key={date}
                          className={cn(
                            "flex items-center justify-center h-12 rounded-lg border-2 cursor-pointer transition-all",
                            isCompleted
                              ? "bg-primary border-primary text-primary-foreground"
                              : isToday
                              ? "border-primary/50 hover:border-primary"
                              : "border-border hover:border-primary/50",
                            "hover:shadow-md"
                          )}
                          onClick={() =>
                            habit.type === "boolean"
                              ? handleToggleBooleanHabit(habit.$id, date)
                              : handleOpenLogDialog(habit.$id, date)
                          }
                        >
                          {showValue ? (
                            <span className="text-sm font-semibold">
                              {logValue}
                            </span>
                          ) : isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Log Dialog */}
        <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Valor</DialogTitle>
              <DialogDescription>
                Ingresa el valor para este hábito en la fecha seleccionada.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="log-value">Valor</Label>
                <Input
                  id="log-value"
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ingresa el valor"
                />
              </div>
              <Button onClick={handleSaveLogValue} className="w-full">
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
