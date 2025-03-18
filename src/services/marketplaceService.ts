import { Property } from "@/pages/Marketplace/types";
import { supabase } from "../lib/supabase";

interface MarketplaceFilters {
  type: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  city: string;
  state: string;
}

export async function fetchMarketplaceProperties(
  filters: MarketplaceFilters
): Promise<Property[]> {
  let query = supabase
    .from("properties")
    .select(
      `
      *,
      users (
        email
      )
    `
    )
    .eq("published", true);

  if (filters.type) {
    query = query.eq("property_type", filters.type);
  }
  if (filters.minPrice) {
    query = query.gte("price", parseFloat(filters.minPrice));
  }
  if (filters.maxPrice) {
    query = query.lte("price", parseFloat(filters.maxPrice));
  }
  if (filters.bedrooms) {
    query = query.eq("bedrooms", parseInt(filters.bedrooms));
  }
  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }
  if (filters.state) {
    query = query.ilike("state", `%${filters.state}%`);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) throw error;
  return (data?.map(item => ({
    ...item,
    description: item.description || '',
    amenities: item.amenities || [],
    available_date: item.available_date || '',
    bathrooms: item.bathrooms || 0,
    bedrooms: item.bedrooms || 0,
    compliance_status: item.compliance_status || '',
    created_at: item.created_at || '',
    syndication: {
      zillow: (item.syndication as { zillow?: boolean })?.zillow || false,
      trulia: (item.syndication as { trulia?: boolean })?.trulia || false,
      realtor: (item.syndication as { realtor?: boolean })?.realtor || false,
      hotpads: (item.syndication as { hotpads?: boolean })?.hotpads || false,
    }
  })) as Property[]) || [];
}
