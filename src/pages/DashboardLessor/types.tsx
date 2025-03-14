export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  price: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_type: string;
  compliance_status: string;
  property_leases?: {
    tenant: {
      name: string;
    };
  }[];
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  properties: {
    name: string;
  } | null;
}

export interface Stats {
  totalRevenue: number;
  pendingPayments: number;
  occupancyRate: number;
  propertiesCount: number;
  tenantsCount: number;
  complianceRate: number;
  upcomingViewings: number;
  documentsToReview: number;
}
