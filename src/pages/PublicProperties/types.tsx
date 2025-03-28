export type Tenant = {
  name: string;
};

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string | null;
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
  tenants: Tenant[];
}
