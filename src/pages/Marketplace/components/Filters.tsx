import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import type { FilterState } from "../hooks/useFilters";

interface FiltersProps {
  onApplyFilters: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export function Filters({ onApplyFilters, currentFilters }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    const resetFilters = {
      type: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      city: "",
      state: "",
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    setIsOpen(false);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== ""
  ).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-medium">Filters</h4>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={handleReset}
            >
              <X className="mr-2 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <RadioGroup
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="type-all" />
                  <Label htmlFor="type-all">All Types</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="house" id="type-house" />
                  <Label htmlFor="type-house">House</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="apartment" id="type-apartment" />
                  <Label htmlFor="type-apartment">Apartment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="condo" id="type-condo" />
                  <Label htmlFor="type-condo">Condo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="townhouse" id="type-townhouse" />
                  <Label htmlFor="type-townhouse">Townhouse</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Price Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    placeholder="$0"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    placeholder="$5000+"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Bedrooms</Label>
              <RadioGroup
                value={filters.bedrooms}
                onValueChange={(value) =>
                  setFilters({ ...filters, bedrooms: value })
                }
                className="grid grid-cols-3 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="bed-all" />
                  <Label htmlFor="bed-all">Any</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="bed-1" />
                  <Label htmlFor="bed-1">1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="bed-2" />
                  <Label htmlFor="bed-2">2</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="bed-3" />
                  <Label htmlFor="bed-3">3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4+" id="bed-4plus" />
                  <Label htmlFor="bed-4plus">4+</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Location</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">City</Label>
                  <Input
                    placeholder="City"
                    value={filters.city}
                    onChange={(e) =>
                      setFilters({ ...filters, city: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">State</Label>
                  <Input
                    placeholder="State"
                    value={filters.state}
                    onChange={(e) =>
                      setFilters({ ...filters, state: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <Button className="w-full" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
