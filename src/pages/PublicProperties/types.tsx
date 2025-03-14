export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_type: string;
  amenities: string[];
  images: string[];
  available_date: string;
  pet_policy: string;
  lease_terms: string;
  tenants: {
    name: string;
  };
}
