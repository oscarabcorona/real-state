import { addDays, format, isValid } from "date-fns";
import { VIEWING_RULES } from "../const";

/**
 * Format a date string to a human-readable format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return isValid(date) ? format(date, "MMMM d, yyyy") : "Not specified";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Check if a date is within the allowed booking window
 */
export const isDateInRange = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = addDays(today, VIEWING_RULES.daysInAdvance);

    return isValid(date) && date >= today && date <= maxDate;
  } catch (error: unknown) {
    console.error("Error checking date range:", error);
    return false;
  }
};

/**
 * Check if a date is a weekday (not in excluded days)
 */
export const isWeekday = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    const day = date.getDay(); // 0 is Sunday, 6 is Saturday
    return !VIEWING_RULES.excludeDays.includes(day);
  } catch (error: unknown) {
    console.error("Error checking weekday:", error);
    return false;
  }
};

/**
 * Get minimum required date for input fields
 */
export const getMinBookingDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

/**
 * Get maximum allowed date for input fields
 */
export const getMaxBookingDate = (): string => {
  const today = new Date();
  const maxDate = addDays(today, VIEWING_RULES.daysInAdvance);
  return maxDate.toISOString().split("T")[0];
};
