export interface Tenant {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
}

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
  property_type: "house" | "apartment" | "condo" | "townhouse";
  amenities: string[];
  images: string[];
  available_date: string;
  pet_policy: string;
  lease_terms: string;
  published: boolean;
  syndication: {
    zillow: boolean;
    trulia: boolean;
    realtor: boolean;
    hotpads: boolean;
  };
  compliance_status: "compliant" | "pending" | "non_compliant";
  created_at: string;
  property_leases?: {
    tenant: {
      name: string;
    };
  }[];
}
