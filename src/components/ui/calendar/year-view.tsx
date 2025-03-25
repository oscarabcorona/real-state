import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getYear,
  isToday as isDateToday,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { Clock, Info, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CalendarEvent, EventClickHandler } from "./types";

export interface MonthData {
  name: string;
  days: {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    hasEvents: boolean;
  }[];
}

export interface YearCalendarProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  className?: string;
  currentDate: Date;
  events?: CalendarEvent[];
  onEventClick?: EventClickHandler;
}

export function YearCalendar({
  value,
  onChange,
  className,
  currentDate,
  events = [],
  onEventClick,
}: YearCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [showSelectedDayEvents, setShowSelectedDayEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showEventSheet, setShowEventSheet] = useState(false);

  // Update selectedDate when value changes
  useEffect(() => {
    setSelectedDate(value || null);
  }, [value]);

  // Generate all months of the year
  const months = useMemo((): MonthData[] => {
    const year = getYear(currentDate);
    const startDate = startOfYear(currentDate);

    return eachMonthOfInterval({
      start: startDate,
      end: new Date(year, 11, 31),
    }).map((monthDate) => {
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

      // Get all days for this month's calendar
      const days = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
      }).map((day) => {
        // Check if this day has any events
        const hasEvents = events.some((event) => isSameDay(event.start, day));

        return {
          date: day,
          isCurrentMonth: isSameMonth(day, monthDate),
          isToday: isDateToday(day),
          isSelected: selectedDate ? isSameDay(day, selectedDate) : false,
          hasEvents,
        };
      });

      return {
        name: format(monthDate, "MMMM"),
        days,
      };
    });
  }, [currentDate, selectedDate, events]);

  // Get events for the selected day
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];

    return events
      .filter((event) => isSameDay(event.start, selectedDate))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [selectedDate, events]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setShowSelectedDayEvents(true);
    if (onChange) {
      onChange(day);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventSheet(true);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const closeEventDetails = () => {
    setShowSelectedDayEvents(false);
  };

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      <div className="overflow-auto">
        {/* Month Grid Section */}
        <div
          className={cn(
            "mx-auto grid max-w-3xl grid-cols-1 gap-x-8 gap-y-16 px-4 py-12 sm:grid-cols-2 sm:px-6 xl:max-w-none xl:grid-cols-3 xl:px-8 2xl:grid-cols-4",
            showSelectedDayEvents && "lg:pb-0"
          )}
        >
          {months.map((month) => (
            <section key={month.name} className="text-center">
              <h2 className="text-sm font-semibold text-gray-900">
                {month.name}
              </h2>
              <div className="mt-6 grid grid-cols-7 text-xs/6 text-gray-500">
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
                <div>S</div>
              </div>
              <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm ring-1 shadow-sm ring-gray-200">
                {month.days.map((day, dayIdx) => (
                  <button
                    key={format(day.date, "yyyy-MM-dd")}
                    type="button"
                    onClick={() => handleDayClick(day.date)}
                    className={cn(
                      day.isCurrentMonth
                        ? "bg-white text-gray-900"
                        : "bg-gray-50 text-gray-400",
                      dayIdx === 0 && "rounded-tl-lg",
                      dayIdx === 6 && "rounded-tr-lg",
                      dayIdx === month.days.length - 7 && "rounded-bl-lg",
                      dayIdx === month.days.length - 1 && "rounded-br-lg",
                      "py-1.5 hover:bg-gray-100 focus:z-10 relative"
                    )}
                  >
                    <time
                      dateTime={format(day.date, "yyyy-MM-dd")}
                      className={cn(
                        "mx-auto flex size-6 items-center justify-center rounded-full",
                        day.isToday && "bg-primary font-semibold text-white",
                        day.isSelected &&
                          !day.isToday &&
                          "bg-gray-900 font-semibold text-white"
                      )}
                    >
                      {format(day.date, "d")}
                    </time>
                    {day.hasEvents && !day.isSelected && !day.isToday && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary"></span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Selected Day Events Section */}
        {showSelectedDayEvents && selectedDate && (
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md rounded-t-xl lg:rounded-none lg:shadow-none mt-auto z-10">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">
                Events for {format(selectedDate, "MMMM d, yyyy")}
              </h2>
              <button
                onClick={closeEventDetails}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close event details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 max-h-60 overflow-y-auto">
              {selectedDayEvents.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {selectedDayEvents.map((event) => (
                    <li
                      key={event.id}
                      className="py-3 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {event.title}
                          </p>
                          {event.location && (
                            <p className="text-sm text-gray-500 mt-1">
                              {event.location}
                            </p>
                          )}
                        </div>
                        <div className="mt-1 sm:mt-0 text-sm text-gray-500">
                          {format(event.start, "h:mm a")} -{" "}
                          {format(event.end, "h:mm a")}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>No events scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Sheet */}
      <Sheet open={showEventSheet} onOpenChange={setShowEventSheet}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-lg font-bold">
              {selectedEvent?.title}
            </SheetTitle>
          </SheetHeader>

          {selectedEvent && (
            <div className="py-4 space-y-4">
              <div className="flex items-start">
                <Clock className="w-5 h-5 mt-0.5 text-gray-500 mr-2" />
                <div>
                  <p className="font-medium text-gray-700">
                    {format(selectedEvent.start, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-gray-600">
                    {format(selectedEvent.start, "h:mm a")} -{" "}
                    {format(selectedEvent.end, "h:mm a")}
                  </p>
                </div>
              </div>

              {selectedEvent.location && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mt-0.5 text-gray-500 mr-2" />
                  <p className="text-gray-700">{selectedEvent.location}</p>
                </div>
              )}

              {selectedEvent.meta && (
                <div className="flex items-start">
                  <Info className="w-5 h-5 mt-0.5 text-gray-500 mr-2" />
                  <div className="text-gray-700">
                    {Object.entries(selectedEvent.meta).map(
                      ([key, value]) =>
                        key !== "id" && (
                          <p key={key} className="capitalize">
                            <span className="font-medium">{key}:</span>{" "}
                            {String(value)}
                          </p>
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <SheetFooter className="pt-4 border-t flex justify-end">
            <SheetClose asChild>
              <Button variant="secondary">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
