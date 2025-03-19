import { z } from "zod"; 

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Tenant {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  description: string | null;
  status: string | null;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Property {
  id: string;
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
  syndication: Json | null;
  compliance_status: string | null;
  created_at: string | null;
  property_leases?: {
    tenant: {
      name: string;
    };
  }[];
}

// Export the schema properly - make sure it's before being used in type
export const PropertyFormSchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(1, "ZIP code is required"),
  description: z.string().optional(),
  tenant_id: z.string().optional().nullable(),
  property_type: z.enum([
    "house",
    "apartment",
    "condo",
    "townhouse",
    "commercial",
  ]),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  bedrooms: z.coerce.number().min(0, "Bedrooms must be a positive number"),
  bathrooms: z.coerce.number().min(0, "Bathrooms must be a positive number"),
  square_feet: z.coerce
    .number()
    .min(0, "Square feet must be a positive number"),
  amenities: z.array(z.string()).default([]),
  available_date: z.string().optional(),
  pet_policy: z.string().optional(),
  lease_terms: z.string().optional(),
  published: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  syndication: z.object({
    zillow: z.boolean().default(false),
    trulia: z.boolean().default(false),
    realtor: z.boolean().default(false),
    hotpads: z.boolean().default(false),
  }),
});

// Export the type derived from the schema
export type PropertyFormValues = z.infer<typeof PropertyFormSchema>;

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
