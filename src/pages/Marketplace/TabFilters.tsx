import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Building, Building2, Hotel } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import React from "react";

interface TabFiltersProps {
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

export function TabFilters({ filters, setFilters }: TabFiltersProps) {
  const handlePropertyTypeClick = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type === type ? "" : type,
    }));
  };

  const handleBedroomClick = (beds: string) => {
    setFilters((prev) => ({
      ...prev,
      bedrooms: prev.bedrooms === beds ? "" : beds,
    }));
  };

  return (
    <Tabs defaultValue="type" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="type">Type of place</TabsTrigger>
        <TabsTrigger value="price">Price range</TabsTrigger>
        <TabsTrigger value="rooms">Rooms</TabsTrigger>
      </TabsList>

      <TabsContent value="type" className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={filters.type === "house" ? "default" : "outline"}
            className="h-24 flex-col gap-2"
            onClick={() => handlePropertyTypeClick("house")}
          >
            <Home className="h-8 w-8" />
            <span>House</span>
          </Button>
          <Button
            variant={filters.type === "apartment" ? "default" : "outline"}
            className="h-24 flex-col gap-2"
            onClick={() => handlePropertyTypeClick("apartment")}
          >
            <Building className="h-8 w-8" />
            <span>Apartment</span>
          </Button>
          <Button
            variant={filters.type === "condo" ? "default" : "outline"}
            className="h-24 flex-col gap-2"
            onClick={() => handlePropertyTypeClick("condo")}
          >
            <Building2 className="h-8 w-8" />
            <span>Condo</span>
          </Button>
          <Button
            variant={filters.type === "townhouse" ? "default" : "outline"}
            className="h-24 flex-col gap-2"
            onClick={() => handlePropertyTypeClick("townhouse")}
          >
            <Hotel className="h-8 w-8" />
            <span>Townhouse</span>
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="price" className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-6">Price Range</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Minimum</label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minPrice: e.target.value,
                    }))
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Maximum</label>
                <Input
                  type="number"
                  placeholder="$5000+"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxPrice: e.target.value,
                    }))
                  }
                  className="mt-2"
                />
              </div>
            </div>
            <Slider
              defaultValue={[0, 5000]}
              max={5000}
              step={100}
              className="mt-6"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="rooms" className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-4">Bedrooms</h3>
          <div className="flex gap-2 mb-6">
            <Button
              variant={filters.bedrooms === "any" ? "default" : "outline"}
              size="lg"
              className="flex-1"
              onClick={() => handleBedroomClick("any")}
            >
              Any
            </Button>
            {["1", "2", "3", "4+"].map((num) => (
              <Button
                key={num}
                variant={filters.bedrooms === num ? "default" : "outline"}
                size="lg"
                className="flex-1"
                onClick={() => handleBedroomClick(num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-4">Location</h3>
          <div className="space-y-3">
            <Input
              placeholder="City"
              value={filters.city}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, city: e.target.value }))
              }
            />
            <Input
              placeholder="State"
              value={filters.state}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, state: e.target.value }))
              }
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
