import { Appointment } from "../../../pages/Calendar/types";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  location?: string;
  meta?: Appointment | Record<string, unknown>;  
}

export type CalendarView = "day" | "week" | "month" | "year";

export interface EventClickHandler {
  (event: CalendarEvent): void;
}
