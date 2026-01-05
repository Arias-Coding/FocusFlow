import { Calendar } from "@/components/ui/calendar";
import { isBefore, startOfMonth, startOfDay } from "date-fns";
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
    <div className="container mx-auto py-20 xl:max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-6xl font-black text-center mb-12">{currentYear}</h2>
      <div className="flex justify-center flex-wrap gap-6">
        {months.map((monthDate, index) => {
          const isPastMonth = isBefore(monthDate, thisMonth);

          return (
            <Calendar
              key={index}
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
              className={`rounded-md border shadow transition-colors capitalize ${
                isPastMonth ? "bg-[#c61b1b] border-[#a01616]" : ""
              }`}
              modifiers={{
                past: (date) => isBefore(date, today),
              }}
              modifiersStyles={{
                past: {
                  color: "white",
                  backgroundColor: "#ed1515",
                  borderRadius: "4px",
                },
              }}
              showOutsideDays={false}
              fixedWeeks
            />
          );
        })}
      </div>
    </div>
  );
}
