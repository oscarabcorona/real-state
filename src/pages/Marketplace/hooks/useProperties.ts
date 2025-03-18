import { useEffect, useState } from "react";
import { fetchMarketplaceProperties } from "@/services/marketplaceService";
import type { Property } from "../types";

type FilterState = {
  type: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  city: string;
  state: string;
};

export type SortOption = "newest" | "price-low-high" | "price-high-low" | "bedrooms";

export const useProperties = (filters: FilterState, sortOption: SortOption) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketplaceProperties(filters);

      // Sort properties based on selected option
      const sortedData = [...data].sort((a, b) => {
        switch (sortOption) {
          case "price-low-high":
            return a.price - b.price;
          case "price-high-low":
            return b.price - a.price;
          case "bedrooms":
            return b.bedrooms - a.bedrooms;
          case "newest":
          default:
            return (
              new Date(b.available_date).getTime() -
              new Date(a.available_date).getTime()
            );
        }
      });

      setProperties(sortedData);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties when filters change
  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Re-sort properties when sort option changes
  useEffect(() => {
    if (properties.length > 0) {
      fetchProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOption]);

  return { properties, loading };
};
