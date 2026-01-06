import { Button } from "@/components/ui/button";
import {
  Calendar,
  Timer,
  ListChecks,
  Zap,
  StickyNote,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

// 1. Añadimos "Settings" al tipo Section
type Section =
  | "Pomodoro"
  | "Calendar"
  | "Tasks"
  | "Habits"
  | "Notes"
  | "Settings";

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
        "rounded-full gap-2 transition-all hover:cursor-pointer px-3 md:px-4",
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg scale-105"
          : "hover:bg-muted text-muted-foreground"
      )}
    >
      <Icon className={cn("w-4 h-4", isActive && "animate-pulse")} />
      <span
        className={cn("text-xs font-semibold", !isActive && "hidden md:inline")}
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
      <div className="flex items-center gap-1 p-2 bg-card/60 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <NavButton
          id="Pomodoro"
          label="Pomodoro"
          icon={Timer}
          isActive={currentSection === "Pomodoro"}
          onClick={setCurrentSection}
        />

        <div className="w-px h-4 bg-border/50 mx-1" />

        <NavButton
          id="Tasks"
          label="Tareas"
          icon={ListChecks}
          isActive={currentSection === "Tasks"}
          onClick={setCurrentSection}
        />

        <div className="w-px h-4 bg-border/50 mx-1" />

        <NavButton
          id="Notes"
          label="Notas"
          icon={StickyNote}
          isActive={currentSection === "Notes"}
          onClick={setCurrentSection}
        />

        <div className="w-px h-4 bg-border/50 mx-1" />

        <NavButton
          id="Habits"
          label="Hábitos"
          icon={Zap}
          isActive={currentSection === "Habits"}
          onClick={setCurrentSection}
        />

        <div className="w-px h-4 bg-border/50 mx-1" />

        <NavButton
          id="Calendar"
          label="Calendario"
          icon={Calendar}
          isActive={currentSection === "Calendar"}
          onClick={setCurrentSection}
        />

        {/* 2. Sección de Ajustes Final */}
        <div className="w-px h-4 bg-border/50 mx-1" />

        <NavButton
          id="Settings"
          label="Ajustes"
          icon={Settings2}
          isActive={currentSection === "Settings"}
          onClick={setCurrentSection}
        />
      </div>
    </nav>
  );
}
