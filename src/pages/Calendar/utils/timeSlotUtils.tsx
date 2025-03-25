import { addMinutes, parse, format } from "date-fns";
import { ValidationResult } from "../../Calendar/types";
import { VIEWING_RULES } from "../const";
import { isDateInRange, isWeekday } from "./dateUtils";

/**
 * Generate available time slots for a given date
 */
export const generateTimeSlots = (dateString: string): string[] => {
  if (!dateString || !isDateInRange(dateString) || !isWeekday(dateString)) {
    return [];
  }

  const { startTime, endTime, duration } = VIEWING_RULES;
  const slots: string[] = [];

  try {
    // Parse start and end times
    const startDate = parse(startTime, "HH:mm", new Date());
    const endDate = parse(endTime, "HH:mm", new Date());

    // Generate slots in specified increments
    let currentSlot = startDate;
    while (currentSlot < endDate) {
      slots.push(format(currentSlot, "HH:mm"));
      currentSlot = addMinutes(currentSlot, duration);
    }

    return slots;
  } catch (error) {
    console.error("Error generating time slots:", error);
    return [];
  }
};

/**
 * Validate a selected date
 */
export const validateDate = (dateString: string): ValidationResult => {
  if (!dateString) {
    return { valid: false, error: "Date is required" };
  }

  if (!isDateInRange(dateString)) {
    return {
      valid: false,
      error: `Date must be within ${VIEWING_RULES.daysInAdvance} days from today`,
    };
  }

  if (!isWeekday(dateString)) {
    return {
      valid: false,
      error: "Appointments are only available on weekdays",
    };
  }

  return { valid: true };
};

/**
 * Validate a selected time
 */
export const validateTime = (
  dateString: string,
  timeString: string
): ValidationResult => {
  if (!timeString) {
    return { valid: false, error: "Time is required" };
  }

  const availableSlots = generateTimeSlots(dateString);
  if (!availableSlots.includes(timeString)) {
    return {
      valid: false,
      error: "Please select an available time slot",
    };
  }

  return { valid: true };
};
