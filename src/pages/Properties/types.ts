import { Database } from '@/types/database.types';

export type Property = Database['public']['Tables']['properties']['Row'];
export type Tenant = Database['public']['Tables']['tenants']['Row'];

export type PropertyFormData = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  description: string | null;
  tenant_id: string;
  property_type: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  amenities: string[] | null;
  available_date: string | null;
  pet_policy: string | null;
  lease_terms: string | null;
  published: boolean | null;
  images: string[] | null;
  syndication: Record<string, string> | null;
};
