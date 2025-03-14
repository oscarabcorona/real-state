import { Building2, ChevronDown, Filter } from "lucide-react";

export function Header({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
}: {
  filters: {
    type: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    city: string;
    state: string;
  };
  setFilters: (filters: {
    type: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    city: string;
    state: string;
  }) => void;
  showFilters: boolean;
  setShowFilters: (showFilters: boolean) => void;
}) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Property Listings
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {Object.values(filters).some((v) => v) && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {Object.values(filters).filter((v) => v).length}
                </span>
              )}
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform ${
                  showFilters ? "transform rotate-180" : ""
                }`}
              />
            </button>
            {Object.values(filters).some((v) => v) && (
              <button
                onClick={() =>
                  setFilters({
                    type: "",
                    minPrice: "",
                    maxPrice: "",
                    bedrooms: "",
                    city: "",
                    state: "",
                  })
                }
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
