import { useState } from "react";

export type FilterState = {
  type: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  city: string;
  state: string;
};

export const useFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    type: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    city: "",
    state: "",
  });

  const countActiveFilters = () => {
    return Object.values(filters).filter((val) => val !== "").length;
  };

  const clearAllFilters = () => {
    setFilters({
      type: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      city: "",
      state: "",
    });
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  return {
    filters,
    setFilters,
    countActiveFilters,
    clearAllFilters,
    handleFilterChange,
  };
};
