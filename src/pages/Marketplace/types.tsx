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
  published: boolean;
  syndication: {
    zillow: boolean;
    trulia: boolean;
    realtor: boolean;
    hotpads: boolean;
  };
}

export interface AppointmentForm {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message: string;
}
