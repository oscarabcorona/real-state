export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  price: number;
  images: string[];
  user_id: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_manager: {
    email: string;
  };
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  properties: {
    name: string;
  };
}

export interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  properties: {
    name: string;
  };
}

export interface Appointment {
  id: string;
  property_id: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  properties: {
    name: string;
    address: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface Stats {
  propertiesCount: number;
  totalPaid: number;
  documentsVerified: number;
  documentsTotal: number;
  upcomingViewings: number;
}
