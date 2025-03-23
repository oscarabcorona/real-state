import { cn } from "@/lib/utils";
import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useRef } from "react";

export interface WeekCalendarProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  className?: string;
  currentDate: Date;
}

export function WeekCalendar({
  value,
  onChange,
  className,
  currentDate,
}: WeekCalendarProps) {
  const container = useRef<HTMLDivElement>(null);
  const containerNav = useRef<HTMLDivElement>(null);
  const containerOffset = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Create week days
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({
      start: weekStart,
      end: addDays(weekStart, 6),
    });
  }, [currentDate]);

  const handleDayClick = (day: Date) => {
    if (onChange) {
      onChange(day);
    }
  };

  // Set scroll position based on current time
  useEffect(() => {
    if (container.current && containerNav.current && containerOffset.current) {
      const currentMinute = new Date().getHours() * 60;
      container.current.scrollTop =
        ((container.current.scrollHeight -
          containerNav.current.offsetHeight -
          containerOffset.current.offsetHeight) *
          currentMinute) /
        1440;
    }
  }, []);

  // Check if a day is selected
  const isDaySelected = (day: Date) => {
    return value ? isSameDay(day, value) : false;
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div ref={container} className="flex-1 overflow-auto bg-white">
        <div className="flex flex-col h-full w-full">
          {/* Header with days */}
          <div
            ref={containerNav}
            className="sticky top-0 z-30 flex-none bg-white shadow-sm border-b border-gray-200"
          >
            {/* Mobile view */}
            <div className="grid grid-cols-7 text-sm text-gray-500 sm:hidden">
              {weekDays.map((day) => (
                <button
                  key={day.toString()}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className="flex flex-col items-center pt-2 pb-3"
                >
                  {format(day, "E").charAt(0)}{" "}
                  <span
                    className={cn(
                      "mt-1 flex size-8 items-center justify-center",
                      isToday(day)
                        ? "rounded-full bg-primary font-semibold text-white"
                        : isDaySelected(day)
                        ? "rounded-full bg-gray-900 font-semibold text-white"
                        : "font-semibold text-gray-900"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </button>
              ))}
            </div>

            {/* Desktop view */}
            <div className="hidden sm:flex">
              <div className="w-14 flex-none"></div>
              <div className="grid flex-auto grid-cols-7" ref={gridRef}>
                {weekDays.map((day) => (
                  <div
                    key={day.toString()}
                    className="flex items-center justify-center py-3 cursor-pointer border-r border-gray-200 last:border-r-0"
                    onClick={() => handleDayClick(day)}
                  >
                    <span className="flex items-baseline">
                      {format(day, "EEE")}{" "}
                      <span
                        className={cn(
                          "ml-1.5 flex h-7 w-7 items-center justify-center",
                          isToday(day)
                            ? "rounded-full bg-primary font-semibold text-white"
                            : isDaySelected(day)
                            ? "rounded-full bg-gray-900 font-semibold text-white"
                            : "font-semibold text-gray-900"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main grid with hours and days */}
          <div className="flex flex-auto">
            {/* Time column */}
            <div className="sticky left-0 z-10 w-14 flex-none bg-white border-r border-gray-200">
              <div
                className="grid"
                style={{ gridTemplateRows: "repeat(24, minmax(3.5rem, 1fr))" }}
              >
                <div ref={containerOffset} className="h-7"></div>
                {Array.from({ length: 24 }).map((_, hourIndex) => (
                  <div key={hourIndex} className="relative">
                    <div className="sticky left-0 z-20 -mt-2.5 w-14 pr-2 text-right text-xs text-gray-500">
                      {hourIndex === 0
                        ? "12AM"
                        : hourIndex < 12
                        ? `${hourIndex}AM`
                        : hourIndex === 12
                        ? "12PM"
                        : `${hourIndex - 12}PM`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Days grid */}
            <div className="grid flex-auto grid-cols-7 grid-rows-1">
              {weekDays.map((day, dayIndex) => (
                <div
                  key={day.toString()}
                  className={cn(
                    "border-r border-gray-200 last:border-r-0",
                    dayIndex === 6 && "border-r-0" // No right border on Sunday
                  )}
                >
                  {/* Hour lines for each day */}
                  <div
                    className="grid divide-y divide-gray-200"
                    style={{
                      gridTemplateRows: "repeat(24, minmax(3.5rem, 1fr))",
                    }}
                  >
                    <div className="h-7"></div>{" "}
                    {/* Offset for header alignment */}
                    {Array.from({ length: 24 }).map((_, hourIndex) => (
                      <div key={hourIndex} className="relative h-full"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
