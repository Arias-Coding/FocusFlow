import { Button } from "@/components/ui/button";
import { Calendar, Timer, ListChecks, Zap, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

// 1. Añadimos "Notes" al tipo Section
type Section = "Pomodoro" | "Calendar" | "Tasks" | "Habits" | "Notes";

interface FloatingNavProps {
  currentSection: Section;
  setCurrentSection: (section: Section) => void;
}

interface NavButtonProps {
  id: Section;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: (id: Section) => void;
}

function NavButton({
  id,
  label,
  icon: Icon,
  isActive,
  onClick,
}: NavButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onClick(id)}
      className={cn(
        "rounded-full gap-2 transition-all hover:cursor-pointer",
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
          : "hover:bg-muted"
      )}
    >
      <Icon className="w-4 h-4" />
      <span
        className={cn("text-xs font-medium", !isActive && "hidden md:inline")}
      >
        {label}
      </span>
    </Button>
  );
}

export function FloatingNav({
  currentSection,
  setCurrentSection,
}: FloatingNavProps) {
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 p-2 bg-card/80 backdrop-blur-md border rounded-full shadow-2xl">
        <NavButton
          id="Pomodoro"
          label="Pomodoro"
          icon={Timer}
          isActive={currentSection === "Pomodoro"}
          onClick={setCurrentSection}
        />

        <div className="w-px h-4 bg-border mx-1" />

        <NavButton
          id="Tasks"
          label="Tareas"
          icon={ListChecks}
          isActive={currentSection === "Tasks"}
          onClick={setCurrentSection}
        />

        <div className="w-px h-4 bg-border mx-1" />

        <NavButton
          id="Notes"
          label="Notas"
          icon={StickyNote}
          isActive={currentSection === "Notes"}
          onClick={setCurrentSection}
        />

        <div className="w-px h-4 bg-border mx-1" />

        <NavButton
          id="Habits"
          label="Hábitos"
          icon={Zap}
          isActive={currentSection === "Habits"}
          onClick={setCurrentSection}
        />

        {/* 2. Nuevo separador y botón de Notas */}
        <div className="w-px h-4 bg-border mx-1" />

        <NavButton
          id="Calendar"
          label="Calendario"
          icon={Calendar}
          isActive={currentSection === "Calendar"}
          onClick={setCurrentSection}
        />
      </div>
    </nav>
  );
}
