"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { MonthCalendar } from "./month-calendar";
import { WeekCalendar } from "./week-view";
import { DayCalendar } from "./day-view";
import { YearCalendar } from "./year-view";
import { cn } from "@/lib/utils";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { CalendarEvent, CalendarView, EventClickHandler } from "./types";

export interface CalendarContainerProps {
  defaultView?: CalendarView;
  className?: string;
  events?: CalendarEvent[];
  onEventClick?: EventClickHandler;
}

export function CalendarContainer({
  defaultView = "month",
  className,
  events = [],
  onEventClick,
}: CalendarContainerProps) {
  const [view, setView] = useState<CalendarView>(defaultView);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
  };

  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate((prev) => subMonths(prev, 1));
    } else if (view === "week") {
      setCurrentDate((prev) => subWeeks(prev, 1));
    } else if (view === "day") {
      setCurrentDate((prev) => subDays(prev, 1));
    } else if (view === "year") {
      setCurrentDate((prev) => subYears(prev, 1));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate((prev) => addMonths(prev, 1));
    } else if (view === "week") {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else if (view === "day") {
      setCurrentDate((prev) => addDays(prev, 1));
    } else if (view === "year") {
      setCurrentDate((prev) => addYears(prev, 1));
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setCurrentDate(date);
    }
  };

  const getViewLabel = () => {
    switch (view) {
      case "day":
        return "Day view";
      case "week":
        return "Week view";
      case "month":
        return "Month view";
      case "year":
        return "Year view";
      default:
        return "Month view";
    }
  };

  const getHeaderTitle = () => {
    if (view === "day") {
      return (
        format(currentDate, "MMMM d, yyyy") +
        " • " +
        format(currentDate, "EEEE")
      );
    } else if (view === "year") {
      return format(currentDate, "yyyy");
    }
    return format(currentDate, "MMMM yyyy");
  };

  const renderCalendarView = () => {
    switch (view) {
      case "day":
        return (
          <DayCalendar
            value={selectedDate}
            onChange={handleDateChange}
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
          />
        );
      case "week":
        return (
          <WeekCalendar
            value={selectedDate}
            onChange={handleDateChange}
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
          />
        );
      case "year":
        return (
          <YearCalendar
            value={selectedDate}
            onChange={handleDateChange}
            currentDate={currentDate}
            events={events}
          />
        );
      case "month":
      default:
        return (
          <MonthCalendar
            value={selectedDate}
            onChange={handleDateChange}
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        "h-full flex flex-col rounded-lg overflow-hidden border border-gray-200 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 lg:px-6 lg:py-4 flex-none">
          <h1 className="text-base font-semibold text-gray-900">
            {getHeaderTitle()}
          </h1>
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center rounded-md bg-white shadow-xs md:items-stretch">
              <button
                type="button"
                onClick={handlePrevious}
                className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
              >
                <span className="sr-only">Previous {view}</span>
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleGoToToday}
                className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
              >
                Today
              </button>
              <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
              <button
                type="button"
                onClick={handleNext}
                className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
              >
                <span className="sr-only">Next {view}</span>
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="hidden md:flex md:items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50"
                  >
                    {getViewLabel()}
                    <ChevronDown
                      className="-mr-1 size-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => handleViewChange("day")}>
                    Day view
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewChange("week")}>
                    Week view
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewChange("month")}>
                    Month view
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewChange("year")}>
                    Year view
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="relative md:hidden">
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={handleGoToToday}>
                  Go to today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange("day")}>
                  Day view
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange("week")}>
                  Week view
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange("month")}>
                  Month view
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange("year")}>
                  Year view
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-auto">{renderCalendarView()}</div>
      </div>
    </div>
  );
}
