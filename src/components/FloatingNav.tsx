import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Timer,
  ListChecks,
  Zap,
  StickyNote,
  Settings2,
  Headphones,
  Home,
  Target,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

// Navigation sections configuration
const navigationSections = [
  { id: "Dashboard" as const, label: "Inicio", icon: Home },
  { id: "Pomodoro" as const, label: "Pomodoro", icon: Timer },
  { id: "Tasks" as const, label: "Tareas", icon: ListChecks },
  { id: "Habits" as const, label: "Hábitos", icon: Zap },
  { id: "Calendar" as const, label: "Calendario", icon: Calendar },
  { id: "Notes" as const, label: "Notas", icon: StickyNote },
  { id: "Goals" as const, label: "Objetivos", icon: Target },
  { id: "Zen" as const, label: "Zen", icon: Headphones },
  { id: "Settings" as const, label: "Ajustes", icon: Settings2 },
];

type Section = (typeof navigationSections)[number]["id"];

interface SidebarNavProps {
  currentSection: Section;
  setCurrentSection: (section: Section) => void;
}

interface NavItemProps {
  id: Section;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: (id: Section) => void;
}

function NavItem({
  id,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
  onClick,
}: NavItemProps) {
  return (
    <Button
      variant="ghost"
      onClick={() => onClick(id)}
      className={cn(
        "w-full justify-start gap-3 h-12 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon
        className={cn("w-5 h-5 flex-shrink-0", isActive && "animate-pulse")}
      />
      {!isCollapsed && <span className="font-medium truncate">{label}</span>}
    </Button>
  );
}

export function SidebarNav({
  currentSection,
  setCurrentSection,
}: SidebarNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-card/95 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-all duration-300 ease-in-out",
          "lg:translate-x-0 lg:shadow-none",
          isCollapsed ? "-translate-x-full" : "translate-x-0",
          "w-64 lg:w-20 lg:hover:w-64 group"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Timer className="w-4 h-4 text-primary-foreground" />
            </div>
            <span
              className={cn(
                "font-bold text-lg transition-opacity duration-200",
                isCollapsed
                  ? "opacity-0 lg:group-hover:opacity-100"
                  : "opacity-100"
              )}
            >
              FocusFlow
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationSections.map((section) => (
            <NavItem
              key={section.id}
              id={section.id}
              label={section.label}
              icon={section.icon}
              isActive={currentSection === section.id}
              isCollapsed={isCollapsed}
              onClick={setCurrentSection}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className={cn(
              "text-xs text-muted-foreground text-center transition-opacity duration-200",
              isCollapsed
                ? "opacity-0 lg:group-hover:opacity-100"
                : "opacity-100"
            )}
          >
            v1.0.0
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsCollapsed(false)}
        className={cn(
          "fixed top-4 left-4 z-30 h-10 w-10 rounded-full bg-card/90 backdrop-blur-xl border-white/20 shadow-lg lg:hidden transition-all duration-200",
          !isCollapsed && "opacity-0 pointer-events-none"
        )}
      >
        <Menu className="w-4 h-4" />
      </Button>
    </>
  );
}

// Legacy FloatingNav for backward compatibility
export function FloatingNav({
  currentSection,
  setCurrentSection,
}: {
  currentSection: Section;
  setCurrentSection: (section: Section) => void;
}) {
  return (
    <SidebarNav
      currentSection={currentSection}
      setCurrentSection={setCurrentSection}
    />
  );
}
