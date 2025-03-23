import { cn } from "@/lib/utils";
import {
  eachDayOfInterval,
  format,
  isToday as isDateToday,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useMemo, useState, useEffect } from "react";

export interface MonthDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface MonthCalendarProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  className?: string;
  currentDate: Date;
}

export function MonthCalendar({
  value,
  onChange,
  className,
  currentDate,
}: MonthCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);

  // Update selectedDate when value changes
  useEffect(() => {
    setSelectedDate(value || null);
  }, [value]);

  // Generate calendar days for the current month view - always 6 weeks (42 days)
  const days = useMemo((): MonthDay[] => {
    const monthStart = startOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Week starts on Monday

    // Calculate days needed
    const daysNeeded = 42; // Always show 6 weeks

    // Generate dates from calendarStart to calendarStart + 41 days
    return eachDayOfInterval({
      start: calendarStart,
      end: new Date(
        calendarStart.getTime() + (daysNeeded - 1) * 24 * 60 * 60 * 1000
      ),
    }).map((day) => ({
      date: day,
      isCurrentMonth: isSameMonth(day, monthStart),
      isToday: isDateToday(day),
      isSelected: selectedDate ? isSameDay(day, selectedDate) : false,
    }));
  }, [currentDate, selectedDate]);

  const handleSelectDay = (day: MonthDay) => {
    const newSelectedDate = day.date;
    setSelectedDate(newSelectedDate);
    onChange?.(newSelectedDate);
  };

  return (
    <div className={cn("lg:flex lg:h-full lg:flex-col", className)}>
      <div className="ring-1 shadow-sm ring-black/5 lg:flex lg:flex-auto lg:flex-col">
        <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs/6 font-semibold text-gray-700 lg:flex-none">
          <div className="bg-white py-2">
            M<span className="sr-only sm:not-sr-only">on</span>
          </div>
          <div className="bg-white py-2">
            T<span className="sr-only sm:not-sr-only">ue</span>
          </div>
          <div className="bg-white py-2">
            W<span className="sr-only sm:not-sr-only">ed</span>
          </div>
          <div className="bg-white py-2">
            T<span className="sr-only sm:not-sr-only">hu</span>
          </div>
          <div className="bg-white py-2">
            F<span className="sr-only sm:not-sr-only">ri</span>
          </div>
          <div className="bg-white py-2">
            S<span className="sr-only sm:not-sr-only">at</span>
          </div>
          <div className="bg-white py-2">
            S<span className="sr-only sm:not-sr-only">un</span>
          </div>
        </div>

        <div className="flex bg-gray-200 text-xs/6 text-gray-700 lg:flex-auto">
          {/* Desktop view */}
          <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">
            {days.map((day) => (
              <div
                key={format(day.date, "yyyy-MM-dd")}
                className={cn(
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-500",
                  "relative px-3 py-2 min-h-[6rem] cursor-pointer",
                  day.isSelected && "bg-gray-50"
                )}
                onClick={() => handleSelectDay(day)}
              >
                <time
                  dateTime={format(day.date, "yyyy-MM-dd")}
                  className={cn(
                    "block w-6 h-6 flex items-center justify-center",
                    day.isToday &&
                      "rounded-full bg-primary font-semibold text-white",
                    day.isSelected &&
                      !day.isToday &&
                      "rounded-full bg-gray-900 font-semibold text-white"
                  )}
                >
                  {format(day.date, "d")}
                </time>
              </div>
            ))}
          </div>

          {/* Mobile view */}
          <div className="isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden">
            {days.map((day) => (
              <button
                key={format(day.date, "yyyy-MM-dd")}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={cn(
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50",
                  (day.isSelected || day.isToday) && "font-semibold",
                  day.isSelected && !day.isToday && "text-white",
                  !day.isSelected && day.isToday && "text-primary",
                  !day.isSelected &&
                    day.isCurrentMonth &&
                    !day.isToday &&
                    "text-gray-900",
                  !day.isSelected &&
                    !day.isCurrentMonth &&
                    !day.isToday &&
                    "text-gray-500",
                  "flex h-14 flex-col px-3 py-2 hover:bg-gray-100 focus:z-10"
                )}
              >
                <time
                  dateTime={format(day.date, "yyyy-MM-dd")}
                  className={cn(
                    "ml-auto",
                    day.isSelected &&
                      "flex size-6 items-center justify-center rounded-full",
                    day.isSelected && day.isToday && "bg-primary",
                    day.isSelected && !day.isToday && "bg-gray-900"
                  )}
                >
                  {format(day.date, "d")}
                </time>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
