import { z } from "zod"; 
import { Json } from "@/types/database.types"; // Import Json type from database types
 
// Update Tenant interface to match database structure
export interface Tenant {
  id: string;
  user_id: string;
  name: string;
  description: string | null; // Changed from string | undefined to string | null
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Update Property interface to match database structure
export interface Property {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  description: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  property_type: string | null;
  amenities: string[] | null;
  images: string[] | null;
  available_date: string | null;
  pet_policy: string | null;
  lease_terms: string | null;
  published: boolean | null;
  syndication: Json | null; // Changed to Json | null to match database type
  compliance_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  property_leases?: {
    tenant: {
      id?: string;
      name: string;
    }
  }[];
}

// Define the PropertyFormSchema with zod to match database structure
export const PropertyFormSchema = z.object({
  // Required fields from database
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(1, "ZIP code is required"),
  
  // Optional fields from database
  description: z.string().optional().nullable(),
  property_type: z.string().nullable().default("house"),
  
  // Numeric fields - ensure proper conversion
  price: z.union([z.number(), z.string().transform(val => val === '' ? null : Number(val))])
    .nullable().optional(),
  bedrooms: z.union([z.number(), z.string().transform(val => val === '' ? null : Number(val))])
    .nullable().optional(),
  bathrooms: z.union([z.number(), z.string().transform(val => val === '' ? null : Number(val))])
    .nullable().optional(),
  square_feet: z.union([z.number(), z.string().transform(val => val === '' ? null : Number(val))])
    .nullable().optional(),
  
  // Array fields
  amenities: z.array(z.string()).optional().nullable(),
  images: z.array(z.string()).optional().nullable(),
  
  // Date fields
  available_date: z.string().optional().nullable(),
  
  // Text fields
  pet_policy: z.string().optional().nullable(),
  lease_terms: z.string().optional().nullable(),
  
  // Boolean fields
  published: z.boolean().optional().nullable().default(false),
  
  // Complex fields
  syndication: z.object({
    zillow: z.boolean().optional().default(false),
    trulia: z.boolean().optional().default(false),
    realtor: z.boolean().optional().default(false),
    hotpads: z.boolean().optional().default(false),
  }).optional().nullable().default({
    zillow: false,
    trulia: false,
    realtor: false,
    hotpads: false
  }),
  
  // Fields for relationships (not directly in properties table)
  tenant_id: z.string().optional().nullable(),
});

// Define the PropertyFormValues type from the schema
export type PropertyFormValues = z.infer<typeof PropertyFormSchema>;

// Helper function to safely access syndication properties
export function getSyndicationValue(property: Property, key: string): boolean {
  if (!property.syndication) return false;
  
  try {
    if (typeof property.syndication === 'string') {
      const parsed = JSON.parse(property.syndication as string);
      return !!parsed[key];
    } else if (typeof property.syndication === 'object') {
      // Use type assertion with a specific interface
      const syndication = property.syndication as Record<string, unknown>;
      return !!syndication[key];
    }
    return false;
  } catch (e: unknown) {
    console.error("Error parsing syndication data:", e);
    return false;
  }
}

// Add a helper function to safely parse syndication data from database
export function parseSyndication(data: Json | null): {
  zillow: boolean;
  trulia: boolean;
  realtor: boolean;
  hotpads: boolean;
} {
  const defaultValue = {
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

// PropertyFormData interface can remain the same
export interface PropertyFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  description: string;
  tenant_id: string;
  property_type: "house" | "apartment" | "condo" | "townhouse";
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  amenities: string[];
  available_date: string;
  pet_policy: string;
  lease_terms: string;
  published: boolean;
  images: string[];
  syndication: {
    zillow: boolean;
    trulia: boolean;
    realtor: boolean;
    hotpads: boolean;
  };
}
