import { DollarSign, BedDouble, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <Card className="border-none shadow-sm transition-all duration-200 animate-in slide-in-from-top-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">Property Type</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["house", "apartment", "condo", "townhouse"].map(
                      (type) => (
                        <Tooltip key={type}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={
                                filters.type === type ? "default" : "outline"
                              }
                              onClick={() =>
                                setFilters({
                                  ...filters,
                                  type: filters.type === type ? "" : type,
                                })
                              }
                              className="w-full capitalize"
                            >
                              {type}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex items-center gap-2">
                              <span>Filter by {type}</span>
                              {filters.type === type && "(Active)"}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Price Range</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) =>
                          setFilters({ ...filters, minPrice: e.target.value })
                        }
                        placeholder="Min Price"
                        className="pl-8"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters({ ...filters, maxPrice: e.target.value })
                        }
                        placeholder="Max Price"
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Bedrooms</h3>
                </div>
                <div className="flex justify-start gap-2 flex-wrap sm:flex-nowrap">
                  {["Any", "1+", "2+", "3+", "4+"].map((bed) => (
                    <Tooltip key={bed}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            filters.bedrooms === bed.replace("+", "")
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            setFilters({
                              ...filters,
                              bedrooms:
                                filters.bedrooms === bed.replace("+", "")
                                  ? ""
                                  : bed.replace("+", ""),
                            })
                          }
                          className="flex-1 sm:flex-none min-w-[64px]"
                        >
                          {bed}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {bed === "Any"
                          ? "Any number of bedrooms"
                          : `${bed} bedrooms`}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Location</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                  <Input
                    type="text"
                    value={filters.city}
                    onChange={(e) =>
                      setFilters({ ...filters, city: e.target.value })
                    }
                    placeholder="City"
                  />
                  <Input
                    type="text"
                    value={filters.state}
                    onChange={(e) =>
                      setFilters({ ...filters, state: e.target.value })
                    }
                    placeholder="State"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
