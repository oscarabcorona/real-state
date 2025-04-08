import React from "react";
import {
  Check,
  PlusCircle,
  X,
  Home,
  Building2,
  Bed,
  DollarSign,
  ArrowDownUp,
  Plus,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tenant } from "../types";
import { Button } from "@/components/ui/button";

export type FilterOption = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

const propertyTypes: FilterOption[] = [
  { label: "House", value: "house", icon: <Home className="h-4 w-4" /> },
  {
    label: "Apartment",
    value: "apartment",
    icon: <Building2 className="h-4 w-4" />,
  },
  { label: "Condo", value: "condo", icon: <Building2 className="h-4 w-4" /> },
  {
    label: "Townhouse",
    value: "townhouse",
    icon: <Home className="h-4 w-4" />,
  },
  { label: "Land", value: "land" },
  {
    label: "Commercial",
    value: "commercial",
    icon: <Building2 className="h-4 w-4" />,
  },
];

const priceRanges: FilterOption[] = [
  {
    label: "Under $100k",
    value: "0-100000",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    label: "100k - 200k",
    value: "100000-200000",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    label: "200k - 500k",
    value: "200000-500000",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    label: "500k - 1M",
    value: "500000-1000000",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    label: "Over 1M",
    value: "1000000-",
    icon: <DollarSign className="h-4 w-4" />,
  },
];

const bedrooms: FilterOption[] = [
  { label: "Studio", value: "0", icon: <Bed className="h-4 w-4" /> },
  { label: "1 Bedroom", value: "1", icon: <Bed className="h-4 w-4" /> },
  { label: "2 Bedrooms", value: "2", icon: <Bed className="h-4 w-4" /> },
  { label: "3 Bedrooms", value: "3", icon: <Bed className="h-4 w-4" /> },
  { label: "4+ Bedrooms", value: "4+", icon: <Bed className="h-4 w-4" /> },
];

const statuses: FilterOption[] = [
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
];

interface PropertyFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedPropertyTypes: string[];
  onPropertyTypeChange: (value: string[]) => void;
  selectedBedrooms: string[];
  onBedroomsChange: (value: string[]) => void;
  selectedPriceRange: string[];
  onPriceRangeChange: (value: string[]) => void;
  selectedStatus: string[];
  onStatusChange: (value: string[]) => void;
  onResetFilters: () => void;
  // Tenant filter props
  tenants: Tenant[];
  selectedTenant: string;
  onTenantChange: (value: string) => void;
  // Add Property button
  // Sort options
  sortOption: string;
  onSortChange: (value: string) => void;
  sortOptions: { label: string; value: string; icon?: React.ReactNode }[];
  setIsModalOpen: (value: boolean) => void;
}

export function PropertyFilters({
  searchQuery,
  onSearchChange,
  selectedPropertyTypes,
  onPropertyTypeChange,
  selectedBedrooms,
  onBedroomsChange,
  selectedPriceRange,
  onPriceRangeChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  // Tenant filter props
  tenants,
  selectedTenant,
  onTenantChange,
  // Sort options
  sortOption,
  onSortChange,
  sortOptions,
  setIsModalOpen,
}: PropertyFiltersProps) {
  const hasActiveFilters =
    selectedPropertyTypes.length > 0 ||
    selectedBedrooms.length > 0 ||
    selectedPriceRange.length > 0 ||
    selectedStatus.length > 0 ||
    selectedTenant !== "all";

  // Get all active filters to display them
  const getActiveFilters = () => {
    const filters: { label: string; value: string; group: string }[] = [];

    selectedPropertyTypes.forEach((value) => {
      const option = propertyTypes.find((opt) => opt.value === value);
      if (option)
        filters.push({ label: option.label, value, group: "propertyType" });
    });

    selectedBedrooms.forEach((value) => {
      const option = bedrooms.find((opt) => opt.value === value);
      if (option)
        filters.push({ label: option.label, value, group: "bedrooms" });
    });

    selectedPriceRange.forEach((value) => {
      const option = priceRanges.find((opt) => opt.value === value);
      if (option)
        filters.push({ label: option.label, value, group: "priceRange" });
    });

    selectedStatus.forEach((value) => {
      const option = statuses.find((opt) => opt.value === value);
      if (option) filters.push({ label: option.label, value, group: "status" });
    });

    // Add tenant filter if selected
    if (selectedTenant !== "all") {
      const tenant = tenants.find((t) => t.id === selectedTenant);
      if (tenant) {
        filters.push({
          label: `Tenant: ${tenant.name}`,
          value: selectedTenant,
          group: "tenant",
        });
      }
    }

    return filters;
  };

  const removeFilter = (filter: { value: string; group: string }) => {
    switch (filter.group) {
      case "propertyType":
        onPropertyTypeChange(
          selectedPropertyTypes.filter((v) => v !== filter.value)
        );
        break;
      case "bedrooms":
        onBedroomsChange(selectedBedrooms.filter((v) => v !== filter.value));
        break;
      case "priceRange":
        onPriceRangeChange(
          selectedPriceRange.filter((v) => v !== filter.value)
        );
        break;
      case "status":
        onStatusChange(selectedStatus.filter((v) => v !== filter.value));
        break;
      case "tenant":
        onTenantChange("all");
        break;
    }
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar - Full width at the top */}
      <div className="relative w-full flex justify-between items-center">
        <div className="flex items-center gap-2 w-3/4 pr-4">
          <div className="relative w-full">
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 pr-10 w-full"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-1/4">
          <Plus />
          Add Property
        </Button>
      </div>

      {/* Filters Grid Layout */}
      <div className="flex justify-between items-start">
        {/* Left side: Filters in a grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 flex-grow">
          <SortFilter
            options={sortOptions}
            value={[sortOption]}
            onChange={(values) => onSortChange(values[0] || "newest")}
            className="w-full"
          />
          <FacetedFilter
            title="Property Type"
            options={propertyTypes}
            value={selectedPropertyTypes}
            onChange={onPropertyTypeChange}
            className="w-full"
          />
          <FacetedFilter
            title="Bedrooms"
            options={bedrooms}
            value={selectedBedrooms}
            onChange={onBedroomsChange}
            className="w-full"
          />
          <FacetedFilter
            title="Price"
            options={priceRanges}
            value={selectedPriceRange}
            onChange={onPriceRangeChange}
            className="w-full"
          />
          <FacetedFilter
            title="Status"
            options={statuses}
            value={selectedStatus}
            onChange={onStatusChange}
            className="w-full"
          />
        </div>
      </div>

      {/* Reset button and active filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onResetFilters}
            className="h-9 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}

        {/* Display active filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="py-1 px-2">
                {filter.label}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter)}
                  className="h-auto p-0 ml-2 -mr-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </Button>
              </Badge>
            ))}
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="text-xs h-7 px-2"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Update the FacetedFilter component to accept a className prop
interface FacetedFilterProps {
  title: string;
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

function FacetedFilter({
  title,
  options,
  value,
  onChange,
  className,
}: FacetedFilterProps) {
  const selectedValues = new Set(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 border-dashed", className)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const newSelectedValues = new Set(selectedValues);
                      if (isSelected) {
                        newSelectedValues.delete(option.value);
                      } else {
                        newSelectedValues.add(option.value);
                      }
                      onChange(Array.from(newSelectedValues));
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    {option.icon && (
                      <span className="mr-2 h-4 w-4 text-muted-foreground">
                        {option.icon}
                      </span>
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Add the SortFilter component
function SortFilter({
  options,
  value,
  onChange,
  className,
}: {
  options: { label: string; value: string; icon?: React.ReactNode }[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}) {
  const selectedValue = value[0] || options[0].value;
  const selectedOption =
    options.find((opt) => opt.value === selectedValue) || options[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-9", className)}>
          <ArrowDownUp className="mr-2 h-4 w-4" />
          {selectedOption.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => onChange([option.value])}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    {option.icon && (
                      <span className="mr-2 h-4 w-4 text-muted-foreground">
                        {option.icon}
                      </span>
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
