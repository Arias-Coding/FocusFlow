import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/context/theme-provider";
import { FloatingNav } from "./components/FloatingNav";
import { Pomodoro } from "./components/Pomodoro";
import TaskList from "./components/TaskList";
import { Notes } from "./components/Notes.tsx";
import { HabitsList } from "./components/HabitsList";
import { CalendarDemo } from "./components/Calendar";

import { AuthProvider, useAuth } from "./components/context/AuthContext";
import { Login } from "./components/Login";

// - Agregar mini animacion de confeti en el cursor al completar una tarea
// - Agregar seccion de musica zen (brown noise, rain, fire)
// - Títulos de Pestaña Dinámicos (document.title) ((24:10) Enfoque...)
// - Color de la app dependiendo el estado (default, work, break)
// - Asignar Tarea al Pomodoro
// - Cambiar el tema (más allá de Dark/Light, quizás un tema "Bosque" o "Mar").
//
// - Creacion de cuenta e inicio de secion
// - Objetivos del año => Sonido epico de check

// - Dashboard de Bienvenida: Una pantalla principal que muestre:
//     Una frase motivadora aleatoria.
//     Un contador de "Tareas para hoy".
//     Tu hábito con la racha más alta.
// - Sistema de niveles: Ganar "XP" cada vez que completas una tarea o hábito para gamificar tu productividad.

type Section = "Pomodoro" | "Calendar" | "Tasks" | "Habits" | "Notes";

const sections = {
  Pomodoro: <Pomodoro />,
  Calendar: <CalendarDemo />,
  Tasks: <TaskList />, // Asegúrate de haber importado TaskList
  Habits: <HabitsList />,
  Notes: <Notes />,
};

function AppContent() {
  const [currentSection, setCurrentSection] = useState<Section>("Pomodoro");

  useEffect(() => {
    document.title = currentSection;
  }, [currentSection]);

  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-pulse font-bold tracking-tighter text-2xl">
          FOCUSFLOW
        </div>
      </div>
    );

  // Si no hay usuario, mostramos el Login
  if (!user) return <Login />;

  // Si hay usuario, mostramos la App normal
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <main className="min-h-lvh flex items-center justify-center p-4">
        <div className="min-h-screen bg-background text-foreground relative">
          <main className="min-h-lvh flex items-center justify-center p-4">
            {sections[currentSection]}
          </main>

          <FloatingNav
            currentSection={currentSection}
            setCurrentSection={setCurrentSection}
          />
        </div>
      </main>
      <FloatingNav
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
