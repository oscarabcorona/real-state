import { z } from "zod"; 
import { Database } from "@/types/database.types";

// Use database types directly
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];
type PropertyRegion = Database["public"]["Enums"]["property_region"];

// Extend the database type with additional fields
export interface Property extends PropertyRow {
  property_leases?: {
    tenant: {
      id?: string;
      name: string;
    }
  }[];
  status: "published" | "draft"; 
}

// Use the tenant row directly
export type Tenant = TenantRow;

// Define the PropertyFormSchema with zod to match database structure
export const PropertyFormSchema = z.object({
  // Required fields
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(1, "ZIP code is required"),
  
  // Optional fields
  description: z.string().optional().nullable(),
  property_type: z.string().nullable().default("house"),
  
  // Region and measurement system fields
  region: z.string().optional().nullable().default("USA"),
  measurement_system: z.string().nullable().default("imperial"),
  
  // Numeric fields - ensure proper conversion
  price: z.union([z.number(), z.string().transform(val => val === '' ? null : Number(val))])
    .nullable().optional(),
  bedrooms: z.union([z.number(), z.string().transform(val => val === '' ? null : Number(val))])
    .nullable().optional(),
  bathrooms: z.union([z.number(), z.string().transform(val => val === '' ? null : Number(val))])
    .nullable().optional(),
  square_feet: z.union([z.number(), z.string().transform(val => val === '' ? null : Number(val))])
    .nullable().optional(),
  square_meters: z.union([z.number(), z.string().transform(val => val === '' ? null : Number(val))])
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

// Export route params type
export interface PropertiesRouteParams {
  id: string;
}

// Define the syndication type for better type safety
export interface PropertySyndication {
  zillow: boolean;
  trulia: boolean;
  realtor: boolean;
  hotpads: boolean;
}

// Get list of all regions for selection dropdown - match the property_region enum from database
export const PROPERTY_REGIONS = [
  // North America
  'USA', 'CANADA', 'MEXICO',
  
  // Central America
  'BELIZE', 'GUATEMALA', 'HONDURAS', 'EL_SALVADOR', 
  'NICARAGUA', 'COSTA_RICA', 'PANAMA',
  
  // Caribbean
  'ANTIGUA_AND_BARBUDA', 'BAHAMAS', 'BARBADOS', 'CUBA', 
  'DOMINICA', 'DOMINICAN_REPUBLIC', 'GRENADA', 'HAITI', 
  'JAMAICA', 'SAINT_KITTS_AND_NEVIS', 'SAINT_LUCIA', 
  'SAINT_VINCENT_AND_GRENADINES', 'TRINIDAD_AND_TOBAGO',
  
  // South America
  'COLOMBIA', 'VENEZUELA', 'GUYANA', 'SURINAME', 
  'FRENCH_GUIANA', 'ECUADOR', 'PERU', 'BRAZIL', 
  'BOLIVIA', 'PARAGUAY', 'URUGUAY', 'ARGENTINA', 'CHILE'
] as PropertyRegion[];
