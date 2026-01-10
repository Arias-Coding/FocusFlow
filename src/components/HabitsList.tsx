import { useState, useRef, useEffect } from "react";

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
import { cn, addXP, triggerConfetti } from "@/lib/utils";

import useSound from "use-sound";
import bellSound from "@/assets/sounds/notification-bell-sound.mp3";

import { habitService, DB_ID, COLLECTIONS, databases } from "@/lib/appwrite";
import { useAuth } from "@/components/context/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Tipado para los hábitos
interface Habit {
  $id: string;
  userId: string;
  name: string;
  type: "boolean" | "count";
  frequency: string;
  active: boolean;
  createdAt: string;
  unit?: string;
  target?: number;
}

interface HabitLog {
  $id: string;
  habitId: string;
  userId: string;
  date: string;
  value: number;
  completed: boolean;
}

// Definimos la fecha fuera para uso general si es necesario
const TODAY_STR = new Date().toLocaleDateString("sv-SE");

export function HabitsList() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<{ [habitId: string]: HabitLog[] }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: "",
    type: "boolean" as "boolean" | "count",
    frequency: "daily",
    unit: "",
    target: 0,
  });
  const [habitOrder, setHabitOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem("habitOrder");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((id: string) => habits.some((h) => h.$id === id));
      } catch {
        return habits.map((h) => h.$id);
      }
    }
    return habits.map((h) => h.$id);
  });
  const logIdRef = useRef(1);

  useEffect(() => {
    fetchHabitsAndLogs();
  }, [user]);

   useEffect(() => {
     setHabitOrder((prev) => {
       const newOrder = habits.map((h) => h.$id);
       const filtered = prev.filter((id) => habits.some((h) => h.$id === id));
       const missing = newOrder.filter((id) => !filtered.includes(id));
       return [...filtered, ...missing];
     });
   }, [habits]);

   // Debug: log habitLogs when it changes
   useEffect(() => {
     console.log("habitLogs updated:", habitLogs);
   }, [habitLogs]);

  const fetchHabitsAndLogs = async () => {
    try {
      setLoading(true);
      const habitsData = await habitService.getHabits(user!.$id);
      setHabits(habitsData.documents as unknown as Habit[]);

       const allLogsData = await habitService.getAllHabitLogs(user!.$id);
       console.log("Fetched logs data:", allLogsData.documents);
       const logsGrouped: { [habitId: string]: HabitLog[] } = {};
       for (const log of allLogsData.documents) {
         const habitId = log.habitId;
         if (!logsGrouped[habitId]) logsGrouped[habitId] = [];
         logsGrouped[habitId].push(log as unknown as HabitLog);
       }
       console.log("Grouped logs:", logsGrouped);
       setHabitLogs(logsGrouped);
    } catch (error) {
      console.error("Error fetching habits and logs:", error);
     } finally {
       setLoading(false);
     }
  };

  const [playAdd] = useSound(bellSound, { volume: 0.3 });

  const saveHabitOrder = (newOrder: string[]) => {
    setHabitOrder(newOrder);
    localStorage.setItem("habitOrder", JSON.stringify(newOrder));
  };

  const moveHabitUp = (id: string) => {
    const index = habitOrder.indexOf(id);
    if (index > 0) {
      const newOrder = [...habitOrder];
      [newOrder[index], newOrder[index - 1]] = [
        newOrder[index - 1],
        newOrder[index],
      ];
      saveHabitOrder(newOrder);
    }
  };

  const moveHabitDown = (id: string) => {
    const index = habitOrder.indexOf(id);
    if (index < habitOrder.length - 1) {
      const newOrder = [...habitOrder];
      [newOrder[index], newOrder[index + 1]] = [
        newOrder[index + 1],
        newOrder[index],
      ];
      saveHabitOrder(newOrder);
    }
  };

  // 2. Lógica de días (dentro del componente para que se actualice)
  const lastSevenDays = Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString("sv-SE");
    })
    .reverse();

  // 3. Cálculo de racha
  const calculateStreak = (logs: HabitLog[]) => {
    const completedDates = logs
      .filter((log) => log.completed)
      .map((log) => log.date)
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

  // 4. Acción de Toggle para boolean
   const toggleBooleanHabit = async (habitId: string, date: string) => {
     const habit = habits.find((h) => h.$id === habitId);
     if (!habit || habit.type !== "boolean" || !user) return;

     const logs = habitLogs[habitId] || [];
     const existingLog = logs.find((l) => l.date === date);
     const wasCompleted = existingLog?.completed || false;
     const newValue = existingLog ? (existingLog.value === 1 ? 0 : 1) : 1;
     const completed = newValue === 1;

     let newLogId = existingLog?.$id;

     console.log("Toggling habit", habitId, "for date", date, "newValue:", newValue);

     try {
      if (existingLog && !existingLog.$id.startsWith("log_")) {
        // Update existing log if it's a real DB document
        await databases.updateDocument(
          DB_ID,
          COLLECTIONS.HABITS_LOG,
          existingLog.$id,
          { value: newValue, completed }
        );
      } else {
        // Create new log
        const createdLog = await habitService.createLog(
          habitId,
          user.$id,
          date,
          newValue,
          completed
        );
        newLogId = createdLog.$id;
      }

      // Update local state
      const newLog: HabitLog = {
        $id: newLogId || `log_${logIdRef.current++}`,
        habitId,
        userId: user.$id,
        date,
        value: newValue,
        completed,
      };

       setHabitLogs((prev) => ({
         ...prev,
         [habitId]: prev[habitId].filter((l) => l.date !== date).concat(newLog),
       }));

       console.log("Updated habitLogs for", habitId, "with log:", newLog);

       playAdd();

      if (completed && !wasCompleted) {
        addXP(15);
        triggerConfetti("habit");
      }
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  // Acción de log para count
  const openLogDialog = (habitId: string, date: string) => {
    const habit = habits.find((h) => h.$id === habitId);
    if (!habit || habit.type !== "count") return;

    const logs = habitLogs[habitId] || [];
    const existingLog = logs.find((l) => l.date === date);
    setSelectedHabitId(habitId);
    setSelectedDate(date);
    setInputValue(existingLog ? existingLog.value.toString() : "");
    setIsLogDialogOpen(true);
  };

  const saveLogValue = async () => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || !user) return;

    const habit = habits.find((h) => h.$id === selectedHabitId);
    if (!habit) return;

    const completed = value >= (habit.target || 0);
    const logs = habitLogs[selectedHabitId] || [];
    const existingLog = logs.find((l) => l.date === selectedDate);
    const wasCompleted = existingLog?.completed || false;

    let newLogId = existingLog?.$id;

    try {
      if (existingLog && !existingLog.$id.startsWith("log_")) {
        // Update existing log if it's a real DB document
        await databases.updateDocument(
          DB_ID,
          COLLECTIONS.HABITS_LOG,
          existingLog.$id,
          { value, completed }
        );
      } else {
        // Create new log
        const createdLog = await habitService.createLog(
          selectedHabitId,
          user.$id,
          selectedDate,
          value,
          completed
        );
        newLogId = createdLog.$id;
      }

      // Update local state
      const newLog: HabitLog = {
        $id: newLogId || `log_${logIdRef.current++}`,
        habitId: selectedHabitId,
        userId: user.$id,
        date: selectedDate,
        value,
        completed,
      };

      setHabitLogs((prev) => ({
        ...prev,
        [selectedHabitId]: prev[selectedHabitId]
          .filter((l) => l.date !== selectedDate)
          .concat(newLog),
      }));

      setIsLogDialogOpen(false);
      playAdd();

      if (completed && !wasCompleted) {
        addXP(15);
        triggerConfetti("habit");
      }
    } catch (error) {
      console.error("Error saving log value:", error);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return;

    const confirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar este hábito? Esto también eliminará todos sus registros."
    );
    if (!confirmed) return;

    try {
      await habitService.deleteHabitLogs(habitId, user.$id);
      await habitService.deleteHabit(habitId);
      setHabits((prev) => prev.filter((h) => h.$id !== habitId));
      setHabitOrder((prev) => prev.filter((id) => id !== habitId));
      setHabitLogs((prev) => {
        const newLogs = { ...prev };
        delete newLogs[habitId];
        return newLogs;
      });
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const handleCreateHabit = async () => {
    if (!user || !newHabit.name.trim()) return;

    try {
      await habitService.createHabit(
        user.$id,
        newHabit.name,
        newHabit.type,
        newHabit.frequency,
        newHabit.type === "count" ? newHabit.unit : undefined,
        newHabit.type === "count" ? newHabit.target : undefined
      );
      setIsAddHabitOpen(false);
      setNewHabit({
        name: "",
        type: "boolean",
        frequency: "daily",
        unit: "",
        target: 0,
      });
      await fetchHabitsAndLogs();
    } catch (error) {
      console.error("Error creating habit:", error);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-18 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Encabezado Estilo Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 px-2 mb-6">
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
        <Button onClick={() => setIsAddHabitOpen(true)} className="sm:ml-auto">
          Agregar Hábito
        </Button>
      </div>

      {/* Calendario Común */}
      <div className="grid grid-cols-7 md:grid-cols-12 gap-2 mb-6 items-center">
        <div>{/* espacio para el nombre */}</div>
        <div className="md:col-start-6 col-span-full grid grid-cols-7 grid-rows-1 gap-4">
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
           <div className="text-center py-12 sm:py-20">
             <p className="italic text-sm sm:text-base">Cargando hábitos...</p>
           </div>
         ) : habits.length === 0 ? (
           <div className="text-center py-12 sm:py-20 border-2 border-dashed rounded-[32px] sm:rounded-[40px] opacity-30">
             <p className="italic text-sm sm:text-base">
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
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveHabitUp(habit.$id)}
                        disabled={habitOrder.indexOf(habit.$id) === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveHabitDown(habit.$id)}
                        disabled={
                          habitOrder.indexOf(habit.$id) ===
                          habitOrder.length - 1
                        }
                        className="h-6 w-6 p-0"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <h3 className="text-xl font-black tracking-tight">
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center text-pink-500 dark:text-pink-400 font-black text-xs italic">
                        <Flame className="mr-1 h-3 w-3 fill-current" />
                        <span>{streak}</span>
                      </div>
                      {habit.type === "count" && (
                        <span className="text-xs font-bold text-muted-foreground/40">
                          {habit.target} {habit.unit}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHabit(habit.$id)}
                        className="h-6 w-6 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="row-start-2 md:row-start-1 md:col-start-6 col-span-full grid grid-cols-7 grid-rows-1 gap-4">
                  {lastSevenDays.map((date) => {
                    const log = logs.find((l) => l.date === date);
                    const isCompleted = log?.completed || false;
                    const isToday = date === TODAY_STR;

                    return (
                      <button
                        key={date}
                        onClick={() =>
                          habit.type === "boolean"
                            ? toggleBooleanHabit(habit.$id, date)
                            : openLogDialog(habit.$id, date)
                        }
                        className={cn(
                          "h-15 rounded-lg transition-all duration-300 flex flex-col items-center justify-center border",

                          isCompleted
                            ? "bg-purple-400 border-purple-300 text-white shadow-sm"
                            : "bg-background/50 border-border/50 hover:border-purple-300 text-muted-foreground/30",
                          isToday &&
                            !isCompleted &&
                            "ring-1 ring-purple-400/20 border-purple-400/50"
                        )}
                      >
                        {habit.type === "boolean" ? (
                          isCompleted ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <div className="h-1 w-1 rounded-full bg-current" />
                          )
                        ) : (
                          <span className="text-xs font-bold">
                            {log ? log.value : "Log"}
                          </span>
                        )}
                      </button>
                    );
                  })}{" "}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Value</DialogTitle>
            <DialogDescription>
              Enter the value for{" "}
              {habits.find((h) => h.$id === selectedHabitId)?.name} on{" "}
              {selectedDate}
            </DialogDescription>
          </DialogHeader>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <Button onClick={saveLogValue}>Save</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddHabitOpen} onOpenChange={setIsAddHabitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Hábito</DialogTitle>
            <DialogDescription>
              Crea un nuevo hábito para rastrear.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={newHabit.name}
                onChange={(e) =>
                  setNewHabit({ ...newHabit, name: e.target.value })
                }
                placeholder="Ej: Beber agua"
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                value={newHabit.type}
                onChange={(e) =>
                  setNewHabit({
                    ...newHabit,
                    type: e.target.value as "boolean" | "count",
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="boolean">Booleano (Sí/No)</option>
                <option value="count">Contador (con meta)</option>
              </select>
            </div>
            {newHabit.type === "count" && (
              <>
                <div>
                  <Label htmlFor="unit">Unidad</Label>
                  <Input
                    id="unit"
                    value={newHabit.unit}
                    onChange={(e) =>
                      setNewHabit({ ...newHabit, unit: e.target.value })
                    }
                    placeholder="Ej: vasos"
                  />
                </div>
                <div>
                  <Label htmlFor="target">Meta</Label>
                  <Input
                    id="target"
                    type="number"
                    value={newHabit.target}
                    onChange={(e) =>
                      setNewHabit({
                        ...newHabit,
                        target: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Ej: 8"
                  />
                </div>
              </>
            )}
          </div>
          <Button onClick={handleCreateHabit}>Crear Hábito</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
