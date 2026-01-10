import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/context/theme-provider";
import { SidebarNav } from "./components/FloatingNav.tsx";
import { Pomodoro } from "./components/Pomodoro.tsx";
import TaskList from "./components/TaskList.tsx";
import { Notes } from "./components/Notes.tsx";
import { HabitsList } from "./components/HabitsList.tsx";
import { CalendarDemo } from "./components/Calendar.tsx";
import Settings from "./components/Settings.tsx";

import { AuthProvider } from "./components/context/AuthContext";
import { useAuthStore } from "@/lib/stores";
import { Login } from "./components/Login.tsx";
import { Zen } from "./components/Zen.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { Goals } from "./components/Goals.tsx";

type Section =
  | "Dashboard"
  | "Pomodoro"
  | "Calendar"
  | "Tasks"
  | "Habits"
  | "Notes"
  | "Settings"
  | "Zen"
  | "Goals";

const sections = {
  Dashboard: <Dashboard />,
  Pomodoro: <Pomodoro />,
  Calendar: <CalendarDemo />,
  Tasks: <TaskList />, // Asegúrate de haber importado TaskList
  Habits: <HabitsList />,
  Notes: <Notes />,
  Settings: <Settings />,
  Zen: <Zen />,
  Goals: <Goals />,
};

function AppContent() {
  const [currentSection, setCurrentSection] = useState<Section>("Dashboard");

  useEffect(() => {
    document.title = currentSection;
  }, [currentSection]);

  const { user, loading } = useAuthStore();

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
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <SidebarNav
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-20 transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto">
          {sections[currentSection]}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const root = window.document.documentElement;
    console.log("Clases en HTML:", root.classList.value);
    console.log("Tema en LocalStorage:", localStorage.getItem("vite-ui-theme"));
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
