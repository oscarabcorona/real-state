import React from "react";
import { DollarSign, Building, BedDouble, MapPin, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FiltersProps {
  filters: {
    type: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    city: string;
    state: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      type: string;
      minPrice: string;
      maxPrice: string;
      bedrooms: string;
      city: string;
      state: string;
    }>
  >;
  showFilters: boolean;
}

export function Filters({ filters, setFilters, showFilters }: FiltersProps) {
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Only render if showFilters is true
  if (!showFilters) return null;

  return (
    <div className="py-1 flex flex-col gap-5">
      {/* Property Type Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-primary/70" />
          <Label className="text-base font-medium">Property Type</Label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: "House",
              value: "house",
              icon: <Home className="h-3 w-3" />,
            },
            {
              label: "Apartment",
              value: "apartment",
              icon: <Building className="h-3 w-3" />,
            },
            {
              label: "Condo",
              value: "condo",
              icon: <Building className="h-3 w-3" />,
            },
            {
              label: "Townhouse",
              value: "townhouse",
              icon: <Home className="h-3 w-3" />,
            },
          ].map(({ label, value, icon }) => (
            <Button
              key={value}
              variant={filters.type === value ? "default" : "outline"}
              size="sm"
              onClick={() =>
                handleFilterChange("type", filters.type === value ? "" : value)
              }
              className={`justify-start gap-2 ${
                filters.type === value ? "" : "text-muted-foreground"
              }`}
            >
              {icon}
              <span>{label}</span>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary/70" />
          <Label className="text-base font-medium">Price Range</Label>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              className="pl-7"
            />
          </div>
          <span className="text-muted-foreground">to</span>
          <div className="relative flex-1">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {["1000", "2000", "3000", "4000+"].map((price) => (
            <Button
              key={price}
              variant="outline"
              size="sm"
              onClick={() => {
                const value = price.replace("+", "");
                handleFilterChange("maxPrice", value);
              }}
              className={`py-0 h-8 ${
                filters.maxPrice === price.replace("+", "")
                  ? "border-primary/50 bg-primary/5"
                  : ""
              }`}
            >
              ${price}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Bedrooms Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BedDouble className="h-4 w-4 text-primary/70" />
          <Label className="text-base font-medium">Bedrooms</Label>
        </div>
        <RadioGroup
          value={filters.bedrooms}
          onValueChange={(value) => handleFilterChange("bedrooms", value)}
          className="flex gap-3"
        >
          {["Any", "1", "2", "3", "4+"].map((option) => {
            const value = option === "Any" ? "" : option.replace("+", "");
            return (
              <div key={option} className="flex items-center space-x-1">
                <RadioGroupItem value={value} id={`bedrooms-${option}`} />
                <Label
                  htmlFor={`bedrooms-${option}`}
                  className={`cursor-pointer ${
                    filters.bedrooms === value
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {option}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      <Separator />

      {/* Location Section */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="location" className="border-none">
          <AccordionTrigger className="py-0">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary/70" />
              <span className="text-base font-medium">Location</span>

              {/* Show active location filters as badges */}
              {(filters.city || filters.state) && (
                <div className="flex gap-1 ml-2">
                  {filters.city && (
                    <Badge variant="outline" className="text-xs">
                      {filters.city}
                    </Badge>
                  )}
                  {filters.state && (
                    <Badge variant="outline" className="text-xs">
                      {filters.state}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-3 pt-3">
              <div className="grid gap-2">
                <Label htmlFor="city" className="text-sm">
                  City
                </Label>
                <Input
                  id="city"
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state" className="text-sm">
                  State
                </Label>
                <Input
                  id="state"
                  value={filters.state}
                  onChange={(e) => handleFilterChange("state", e.target.value)}
                  placeholder="Enter state"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
