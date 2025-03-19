export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  price: number | null;
  images: string[] | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  property_type: string | null;
  compliance_status: string | null;
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
  created_at: string | null;
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

export interface RevenueChartData {
  labels: string[];
  data: number[];
}
