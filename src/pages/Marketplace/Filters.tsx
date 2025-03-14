import { DollarSign } from "lucide-react";

export function Filters({
  showFilters,
  filters,
  setFilters,
}: {
  showFilters: boolean;
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
}) {
  return (
    <>
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Property Type
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {["house", "apartment", "condo", "townhouse"].map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          type: filters.type === type ? "" : type,
                        })
                      }
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        filters.type === type
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Price Range
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="sr-only">Min Price</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) =>
                          setFilters({ ...filters, minPrice: e.target.value })
                        }
                        placeholder="Min"
                        className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="sr-only">Max Price</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters({ ...filters, maxPrice: e.target.value })
                        }
                        placeholder="Max"
                        className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Bedrooms</h3>
                <div className="grid grid-cols-4 gap-2">
                  {["Any", "1+", "2+", "3+", "4+"].map((bed) => (
                    <button
                      key={bed}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          bedrooms:
                            filters.bedrooms === bed.replace("+", "")
                              ? ""
                              : bed.replace("+", ""),
                        })
                      }
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        filters.bedrooms === bed.replace("+", "")
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {bed}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      value={filters.city}
                      onChange={(e) =>
                        setFilters({ ...filters, city: e.target.value })
                      }
                      placeholder="City"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={filters.state}
                      onChange={(e) =>
                        setFilters({ ...filters, state: e.target.value })
                      }
                      placeholder="State"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
