import { Property, PropertySyndication } from "../types";
import { Json } from "@/types/database.types";

/**
 * Helper function to safely access syndication properties from a property
 */
export function getSyndicationValue(property: Property, key: string): boolean {
  if (!property.syndication) return false;
  
  try {
    if (typeof property.syndication === 'string') {
      const parsed = JSON.parse(property.syndication);
      return !!parsed[key];
    } else if (typeof property.syndication === 'object') {
      const syndication = property.syndication as Record<string, unknown>;
      return !!syndication[key];
    }
    return false;
  } catch (e: unknown) {
    console.error("Error parsing syndication data:", e);
    return false;
  }
}

/**
 * Helper function to safely parse syndication data from database
 */
export function parseSyndication(data: Json | null): PropertySyndication {
  const defaultValue: PropertySyndication = {
    zillow: false,
    trulia: false,
    realtor: false,
    hotpads: false
  };
  
  if (!data) return defaultValue;
  
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return {
        zillow: !!parsed.zillow,
        trulia: !!parsed.trulia,
        realtor: !!parsed.realtor,
        hotpads: !!parsed.hotpads
      };
    } else if (typeof data === 'object' && data !== null) {
      return {
        zillow: !!(data as Record<string, unknown>).zillow,
        trulia: !!(data as Record<string, unknown>).trulia,
        realtor: !!(data as Record<string, unknown>).realtor,
        hotpads: !!(data as Record<string, unknown>).hotpads
      };
    }
  } catch (e) {
    console.error("Error parsing syndication data:", e);
  }
  
  return defaultValue;
}

/**
 * Helper function to format area based on measurement system
 */
export function formatArea(property: Property): string {
  if (property.measurement_system === 'metric' && property.square_meters) {
    return `${property.square_meters.toLocaleString()} m²`;
  } else if (property.square_feet) {
    return `${property.square_feet.toLocaleString()} sq.ft`;
  }
  return "0";
} 