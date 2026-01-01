import { Button } from "@/components/ui/button";
import { Calendar, Timer, ListChecks } from "lucide-react"; // Importamos ListChecks
import { cn } from "@/lib/utils";

// 1. Actualizamos el tipo para incluir "Tasks"
type Section = "Pomodoro" | "Calendar" | "Tasks";

interface FloatingNavProps {
  currentSection: Section;
  setCurrentSection: (section: Section) => void;
}

export function FloatingNav({
  currentSection,
  setCurrentSection,
}: FloatingNavProps) {
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 p-2 bg-card/80 backdrop-blur-md border rounded-full shadow-2xl">
        {/* Opción: Pomodoro */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentSection("Pomodoro")}
          className={cn(
            "rounded-full gap-2 transition-all",
            currentSection === "Pomodoro"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              : "hover:bg-muted"
          )}
        >
          <Timer className="w-4 h-4" />
          <span
            className={cn(
              "text-xs font-medium",
              currentSection !== "Pomodoro" && "hidden md:inline"
            )}
          >
            Pomodoro
          </span>
        </Button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Opción: Calendario */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentSection("Calendar")}
          className={cn(
            "rounded-full gap-2 transition-all",
            currentSection === "Calendar"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              : "hover:bg-muted"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span
            className={cn(
              "text-xs font-medium",
              currentSection !== "Calendar" && "hidden md:inline"
            )}
          >
            Calendario
          </span>
        </Button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* 2. Nueva Opción: Tareas */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentSection("Tasks")}
          className={cn(
            "rounded-full gap-2 transition-all",
            currentSection === "Tasks"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              : "hover:bg-muted"
          )}
        >
          <ListChecks className="w-4 h-4" />
          <span
            className={cn(
              "text-xs font-medium",
              currentSection !== "Tasks" && "hidden md:inline"
            )}
          >
            Tareas
          </span>
        </Button>
      </div>
    </nav>
  );
}
