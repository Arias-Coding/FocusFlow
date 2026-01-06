import { useState } from "react";
import { account } from "@/lib/appwrite";
import { useTheme } from "@/components/context/theme-provider"; // Verifica que la ruta sea correcta
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Volume2,
  Moon,
  Sun,
  Laptop,
  Timer as TimerIcon,
  ChevronRight,
  Loader2,
  LogOut,
  TreePine,
  Waves,
  Download,
  Coffee,
  Zap,
} from "lucide-react";

import { useAuth } from "@/components/context/AuthContext";
import { taskService, habitService, goalService } from "@/lib/appwrite";
import { getXP } from "@/lib/utils";

interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
}

function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <div className="space-y-4 w-full">
      <h3 className="text-xs uppercase tracking-[0.15em] font-black text-foreground/60 ml-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SettingsItem({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: any;
  label: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="group flex items-center justify-between p-4 sm:p-5 rounded-[22px] bg-card/20 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-card/30 hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-bold tracking-tight text-foreground">
            {label}
          </span>
          {description && (
            <span className="text-sm text-foreground/50 font-medium leading-tight">
              {description}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children || (
          <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:text-foreground/50 transition-colors" />
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const { user } = useAuth();

  const handleExportData = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      // Fetch all user data
      const [tasksData, habitsData, goalsData] = await Promise.all([
        taskService.getTasks(user.$id),
        habitService.getHabits(user.$id),
        goalService.getGoals(user.$id, new Date().getFullYear()),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        userId: user.$id,
        xp: getXP(),
        data: {
          tasks: tasksData.documents,
          habits: habitsData.documents,
          goals: goalsData.documents,
        },
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `focusflow-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error al exportar los datos. Por favor, inténtalo de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await account.deleteSession("current");
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 pt-16 px-4 sm:px-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 sm:mb-14 space-y-3 ml-2">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter italic text-foreground">
          Ajustes
        </h1>
        <p className="text-base sm:text-lg text-foreground/60 font-medium">
          Configura tu estación de trabajo.
        </p>
      </div>

      <div className="space-y-12">
        <SettingsGroup title="Cuenta">
          <div className="p-4 sm:p-6 rounded-[28px] bg-card/20 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-card/30 flex items-center justify-between relative group shadow-xl hover:scale-[1.02] transition-all duration-200">
            <div className="flex items-center gap-5 relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl shadow-lg shadow-primary/20">
                JS
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-foreground">
                  John Smith
                </span>
                <span className="text-sm text-primary font-bold">
                  Plan Pro • Usuario Activo
                </span>
              </div>
            </div>
            <Button
              variant="secondary"
              className="rounded-xl font-bold px-6 h-11 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Editar
            </Button>
          </div>
        </SettingsGroup>

        <SettingsGroup title="Productividad">
          <SettingsItem
            icon={TimerIcon}
            label="Auto-iniciar Descansos"
            description="El temporizador de descanso inicia automáticamente"
          >
            <Switch
              defaultChecked
              className="data-[state=checked]:bg-primary"
            />
          </SettingsItem>

          <SettingsItem
            icon={Volume2}
            label="Efectos de Sonido"
            description="Alertas audibles al finalizar sesiones"
          >
            <Switch
              defaultChecked
              className="data-[state=checked]:bg-primary"
            />
          </SettingsItem>
        </SettingsGroup>

        {/* GRUPO APARIENCIA - TEMA VISUAL */}
        <SettingsGroup title="Apariencia">
          <SettingsItem
            icon={Palette}
            label="Tema Visual"
            description="Estilo general de la interfaz"
          >
            <div className="flex bg-foreground/[0.05] dark:bg-white/10 p-1 rounded-xl border border-foreground/5">
              {/* BOTÓN LIGHT */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("light")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  theme === "light"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <Sun className="w-4 h-4" />
              </Button>

              {/* BOTÓN DARK */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("dark")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  theme === "dark"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <Moon className="w-4 h-4" />
              </Button>

              {/* BOTÓN SYSTEM */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("system")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  theme === "system"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <Laptop className="w-4 h-4" />
              </Button>

              {/* BOTÓN FOREST */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("forest")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  theme === "forest"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <TreePine className="w-4 h-4" />
              </Button>

              {/* BOTÓN OCEAN */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("ocean")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  theme === "ocean"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <Waves className="w-4 h-4" />
              </Button>

              {/* BOTÓN CATPPUCCIN LATTE */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("catppuccin-latte")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  theme === "catppuccin-latte"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <Coffee className="w-4 h-4" />
              </Button>

              {/* BOTÓN CATPPUCCIN MOCHA */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("catppuccin-mocha")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  theme === "catppuccin-mocha"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <Coffee className="w-4 h-4" />
              </Button>

              {/* BOTÓN TOKYO NIGHT LIGHT */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("tokyo-night-light")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  theme === "tokyo-night-light"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <Zap className="w-4 h-4" />
              </Button>

              {/* BOTÓN TOKYO NIGHT DARK */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("tokyo-night-dark")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  theme === "tokyo-night-dark"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <Zap className="w-4 h-4" />
              </Button>
            </div>
          </SettingsItem>

          <SettingsItem
            icon={Palette}
            label="Color Principal"
            description="Personaliza el color de acento de la interfaz"
          >
            <div className="flex bg-foreground/[0.05] dark:bg-white/10 p-1 rounded-xl border border-foreground/5">
              {/* BOTÓN BLUE */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAccentColor("blue")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  accentColor === "blue"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-blue-500" />
              </Button>

              {/* BOTÓN GREEN */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAccentColor("green")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  accentColor === "green"
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-green-500" />
              </Button>

              {/* BOTÓN PURPLE */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAccentColor("purple")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  accentColor === "purple"
                    ? "bg-purple-500 text-white shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-purple-500" />
              </Button>

              {/* BOTÓN RED */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAccentColor("red")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  accentColor === "red"
                    ? "bg-red-500 text-white shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-red-500" />
              </Button>

              {/* BOTÓN ORANGE */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAccentColor("orange")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  accentColor === "orange"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-orange-500" />
              </Button>

              {/* BOTÓN PINK */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAccentColor("pink")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  accentColor === "pink"
                    ? "bg-pink-500 text-white shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-pink-500" />
              </Button>

              {/* BOTÓN INDIGO */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAccentColor("indigo")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  accentColor === "indigo"
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-indigo-500" />
              </Button>

              {/* BOTÓN TEAL */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAccentColor("teal")}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all",
                  accentColor === "teal"
                    ? "bg-teal-500 text-white shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-teal-500" />
              </Button>
            </div>
          </SettingsItem>
        </SettingsGroup>

        <SettingsGroup title="Datos">
          <SettingsItem
            icon={Download}
            label="Exportar Datos"
            description="Descarga una copia de seguridad de todas tus tareas, hábitos y objetivos"
          >
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="rounded-lg"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          </SettingsItem>
        </SettingsGroup>

        <div className="pt-4 sm:pt-6">
          <Button
            variant="ghost"
            disabled={isLoading}
            onClick={handleLogout}
            className="w-full rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-500/10 font-bold py-6 sm:py-7 text-base sm:text-lg border border-foreground/5 transition-all"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <LogOut className="mr-2 h-5 w-5" /> Cerrar Sesión
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
