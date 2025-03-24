import { cn } from "@/lib/utils";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isToday as isDateToday,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface CalendarProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  className?: string;
}

export function Calendar({ value, onChange, className }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [currentDate, setCurrentDate] = useState<Date>(value || new Date());

  // Calculate current month label for display
  const currentMonthLabel = useMemo(
    () => format(currentDate, "MMMM yyyy"),
    [currentDate]
  );

  // Generate calendar days for the current month view
  const days = useMemo((): Day[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Week starts on Monday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(
      (day) => ({
        date: day,
        isCurrentMonth: isSameMonth(day, monthStart),
        isToday: isDateToday(day),
        isSelected: selectedDate ? isSameDay(day, selectedDate) : false,
      })
    );
  }, [currentDate, selectedDate]);

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleSelectDay = (day: Day) => {
    const newSelectedDate = day.date;
    setSelectedDate(newSelectedDate);
    onChange?.(newSelectedDate);
  };

  return (
    <div className={cn("rounded-lg shadow-sm p-5 bg-white", className)}>
      <div className="flex items-center justify-between text-gray-900">
        <button
          type="button"
          onClick={handlePreviousMonth}
          className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
        >
          <span className="sr-only">Previous month</span>
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <div className="flex-auto text-sm font-semibold text-center">
          {currentMonthLabel}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
        >
          <span className="sr-only">Next month</span>
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 text-xs text-center text-gray-500 font-medium">
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
        <div>S</div>
      </div>

      <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm ring-1 shadow-sm ring-gray-200 overflow-hidden">
        {days.map((day, dayIdx) => (
          <button
            key={format(day.date, "yyyy-MM-dd")}
            type="button"
            onClick={() => handleSelectDay(day)}
            className={cn(
              "py-2 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20 transition-colors",
              day.isCurrentMonth ? "bg-white" : "bg-gray-50",
              (day.isSelected || day.isToday) && "font-semibold",
              day.isSelected && !day.isToday && "text-white",
              !day.isSelected &&
                day.isCurrentMonth &&
                !day.isToday &&
                "text-gray-900",
              !day.isSelected &&
                !day.isCurrentMonth &&
                !day.isToday &&
                "text-gray-400",
              day.isToday && !day.isSelected && "text-primary",
              dayIdx === 0 && "rounded-tl-lg",
              dayIdx === 6 && "rounded-tr-lg",
              dayIdx === days.length - 7 && "rounded-bl-lg",
              dayIdx === days.length - 1 && "rounded-br-lg"
            )}
          >
            <time
              dateTime={format(day.date, "yyyy-MM-dd")}
              className={cn(
                "mx-auto flex size-7 items-center justify-center rounded-full transition-colors",
                day.isSelected &&
                  day.isToday &&
                  "bg-primary text-white shadow-sm",
                day.isSelected &&
                  !day.isToday &&
                  "bg-gray-900 text-white shadow-sm"
              )}
            >
              {format(day.date, "d")}
            </time>
          </button>
        ))}
      </div>
    </div>
  );
}
