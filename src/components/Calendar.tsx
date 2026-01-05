import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  isBefore,
  startOfMonth,
  startOfDay,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { es } from "date-fns/locale"; // Opcional: para meses en español

export function CalendarDemo() {
  const months = [];
  const today = startOfDay(new Date());
  const thisMonth = startOfMonth(today);
  const currentYear = today.getFullYear();

  for (let m = 0; m < 12; m++) {
    const dateObj = new Date(currentYear, m, 1);
    months.push(dateObj);
  }

  return (
    <div className="container mx-auto py-16 lg:py-24 xl:max-w-7xl animate-in fade-in duration-1000">
      {/* Año con estilo Neumórfico suave */}
      <div className="flex justify-center mb-16">
        <h2 className="text-7xl lg:text-8xl font-black tracking-tighter text-foreground/80 drop-shadow-[4px_4px_10px_rgba(0,0,0,0.05)] selection:bg-primary/20">
          {currentYear}
        </h2>
      </div>

      {/* Contenedor Flex de Meses */}
      <div className="flex justify-center flex-wrap gap-10">
        {months.map((monthDate, index) => {
          const isPastMonth = isBefore(monthDate, startOfMonth(thisMonth));
          const isCurrentMonth = isSameMonth(monthDate, thisMonth);

          return (
            <div
              key={index}
              className={cn(
                "relative p-1 rounded-[40px] transition-all duration-500",
                isCurrentMonth &&
                  "bg-gradient-to-br from-primary/20 to-transparent shadow-2xl shadow-primary/10"
              )}
            >
              <Calendar
                mode="single"
                month={monthDate}
                hideNavigation={true}
                formatters={{
                  formatCaption: (date, options) =>
                    date.toLocaleString(options?.locale?.code ?? "es-ES", {
                      month: "long",
                    }),
                }}
                locale={es}
                // ESTILO CRISTAL + NEUMORFISMO
                className={cn(
                  "p-6 capitalize transition-all duration-500 rounded-[32px]",
                  "backdrop-blur-xl border border-white/20 dark:border-white/5",
                  isPastMonth
                    ? "bg-muted/10 opacity-40 grayscale-[0.8]"
                    : "bg-card/40 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.2),-5px_-5px_15px_rgba(255,255,255,0.02)]",
                  isCurrentMonth && "bg-card/80 scale-105 border-primary/20"
                )}
                classNames={{
                  caption:
                    "flex justify-center pt-1 relative items-center mb-6 text-sm font-bold tracking-[0.2em] uppercase text-foreground/60",
                  head_cell:
                    "text-muted-foreground/40 w-9 font-medium text-[10px]",
                  cell: "h-9 w-9 text-center text-sm p-0 relative",
                  day: cn(
                    "h-8 w-8 p-0 font-medium transition-all rounded-xl hover:bg-primary/10 hover:text-primary",
                    "flex items-center justify-center mx-auto"
                  ),
                  day_today:
                    "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30 scale-110",
                }}
                modifiers={{
                  past: (date) =>
                    isBefore(date, today) && !isSameDay(date, today),
                }}
                modifiersStyles={{
                  past: {
                    opacity: 0.3,
                    textDecoration: "none", // Quitamos el tachado para que sea más minimal
                  },
                }}
                showOutsideDays={false}
                fixedWeeks
              />

              {/* Indicador de "Mes actual" muy minimal */}
              {isCurrentMonth && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
