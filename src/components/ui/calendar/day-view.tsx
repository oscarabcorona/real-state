"use client";

import { cn } from "@/lib/utils";
import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  startOfWeek,
} from "date-fns";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Calendar } from "./calendar";

export interface DayCalendarProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  className?: string;
  currentDate: Date;
}

export function DayCalendar({
  onChange,
  className,
  currentDate,
}: DayCalendarProps) {
  const container = useRef<HTMLDivElement>(null);
  const containerNav = useRef<HTMLDivElement>(null);
  const containerOffset = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [localCurrentDate, setLocalCurrentDate] = useState(currentDate);

  // Update localCurrentDate when currentDate prop changes
  useEffect(() => {
    setLocalCurrentDate(currentDate);
  }, [currentDate]);

  // Create week days for the mobile navigation
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(localCurrentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({
      start: weekStart,
      end: addDays(weekStart, 6),
    });
  }, [localCurrentDate]);

  const handleDayClick = (day: Date) => {
    setLocalCurrentDate(day);
    if (onChange) {
      onChange(day);
    }
  };

  // Handle date change from the Calendar component
  const handleCalendarChange = (date: Date | null) => {
    if (date) {
      setLocalCurrentDate(date);
    }
    if (onChange) {
      onChange(date);
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

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div ref={container} className="flex-1 overflow-auto bg-white">
        <div className="flex h-full w-full">
          {/* Main Day View */}
          <div className="flex flex-col flex-grow">
            {/* Mobile day navigation */}
            <div
              ref={containerNav}
              className="sticky top-0 z-30 flex-none bg-white shadow-sm border-b border-gray-200 md:hidden"
            >
              <div className="grid grid-cols-7 text-sm text-gray-500">
                {weekDays.map((day) => (
                  <button
                    key={day.toString()}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className="flex flex-col items-center pt-3 pb-1.5"
                  >
                    {format(day, "E").charAt(0)}{" "}
                    <span
                      className={cn(
                        "mt-3 flex size-8 items-center justify-center rounded-full text-base font-semibold",
                        isToday(day)
                          ? "bg-primary font-semibold text-white"
                          : isSameDay(day, localCurrentDate)
                          ? "bg-gray-900 font-semibold text-white"
                          : "text-gray-900"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main day view container */}
            <div className="flex w-full flex-auto">
              {/* Time column */}
              <div className="sticky left-0 z-10 w-14 flex-none bg-white border-r border-gray-200">
                <div
                  className="grid"
                  style={{
                    gridTemplateRows: "repeat(48, minmax(1.75rem, 1fr))",
                  }}
                >
                  <div ref={containerOffset} className="h-7"></div>
                  {/* Time labels for each half hour */}
                  {Array.from({ length: 24 }).map((_, hourIndex) => (
                    <Fragment key={hourIndex}>
                      <div className="relative">
                        <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs text-gray-500">
                          {hourIndex === 0
                            ? "12AM"
                            : hourIndex < 12
                            ? `${hourIndex}AM`
                            : hourIndex === 12
                            ? "12PM"
                            : `${hourIndex - 12}PM`}
                        </div>
                      </div>
                      {/* Empty div for half hour */}
                      <div />
                    </Fragment>
                  ))}
                </div>
              </div>

              {/* Day content */}
              <div className="grid flex-auto grid-cols-1 grid-rows-1">
                {/* Show current date label */}
                <div className="absolute top-2 left-4 text-sm font-medium text-gray-600">
                  {format(localCurrentDate, "EEEE, MMMM d")}
                </div>

                {/* Horizontal lines for hours */}
                <div
                  className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                  style={{
                    gridTemplateRows: "repeat(48, minmax(1.75rem, 1fr))",
                  }}
                >
                  <div className="row-end-1 h-7"></div>
                  {Array.from({ length: 48 }).map((_, index) => (
                    <div
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : ""}
                    ></div>
                  ))}
                </div>

                {/* Empty grid for events (would be populated dynamically in real usage) */}
                <ol
                  className="col-start-1 col-end-2 row-start-1 grid grid-cols-1"
                  style={{
                    gridTemplateRows:
                      "1.75rem repeat(48, minmax(1.75rem, 1fr))",
                  }}
                >
                  {/* Events would be rendered here */}
                </ol>
              </div>
            </div>
          </div>

          {/* Calendar Sidebar */}
          <div className="hidden md:block w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 mb-2 text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center"
              >
                <span className="sr-only">Toggle sidebar</span>
                {showSidebar ? "Hide Calendar" : "Show Calendar"}
              </button>
              {showSidebar && (
                <div className="mt-2">
                  <Calendar
                    value={localCurrentDate}
                    onChange={handleCalendarChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile calendar toggle */}
      <div className="md:hidden border-t border-gray-200 p-4">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {showSidebar ? "Hide Calendar" : "Show Calendar"}
        </button>
        {showSidebar && (
          <div className="mt-4">
            <Calendar
              value={localCurrentDate}
              onChange={handleCalendarChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
