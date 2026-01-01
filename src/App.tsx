import { useState } from "react";
import { ThemeProvider } from "@/components/context/theme-provider";
import { CalendarDemo } from "./components/calendar";
import { Pomodoro } from "./components/Pomodoro";
import { FloatingNav } from "./components/FloatingNav";
import TaskList from "./components/TaskList";

// - Agregar mini animacion de confeti en el cursor al completar una tarea
// - Agregar seccion de musica zen (brown noise, rain, fire)
// - Agregar sonidos: campana al pomodoro, click al navbar, check al tasklist
// - Títulos de Pestaña Dinámicos (document.title) ((24:10) Enfoque...)
// - Color de la app dependiendo el estado (default, work, break)
// - Asignar Tarea al Pomodoro
// - Cambiar el tema (más allá de Dark/Light, quizás un tema "Bosque" o "Mar").

type Section = "Pomodoro" | "Calendar" | "Tasks";

function App() {
  const [currentSection, setCurrentSection] = useState<Section>("Pomodoro");

  const sections = {
    Pomodoro: <Pomodoro />,
    Calendar: <CalendarDemo />,
    Tasks: <TaskList />, // Asegúrate de haber importado TaskList
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground relative">
        <main className="min-h-lvh flex items-center justify-center p-4">
          {sections[currentSection]}
        </main>

        <FloatingNav
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
