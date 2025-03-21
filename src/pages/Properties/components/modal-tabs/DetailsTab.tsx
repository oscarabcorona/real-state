import { PropertyFormValues, PROPERTY_REGIONS } from "../../types";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Home,
  MapPin,
  Building,
  CalendarClock,
  ArrowRight,
  Globe,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DetailsTabProps {
  form: UseFormReturn<PropertyFormValues>;
  onNextTab: () => void;
}

export function DetailsTab({ form, onNextTab }: DetailsTabProps) {
  // Get workspace from auth store to check plan type
  const { workspace } = useAuthStore();

  const isInternational = workspace?.tier === "international";

  return (
    <TabsContent value="details" className="space-y-5 py-2">
      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                  Property Name
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  Address
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          {isInternational ? (
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    Region
                  </FormLabel>
                  <Select
                    value={field.value || "USA"}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Automatically set the measurement system based on region
                      const metricRegions = [
                        "MEXICO",
                        "BRAZIL",
                        "ARGENTINA",
                        "CHILE",
                        "COLOMBIA",
                        "PERU",
                        "ECUADOR",
                        "BOLIVIA",
                        "VENEZUELA",
                        "PARAGUAY",
                        "URUGUAY",
                        "GUYANA",
                        "SURINAME",
                        "FRENCH_GUIANA",
                      ];
                      if (metricRegions.includes(value)) {
                        form.setValue("measurement_system", "metric");
                      } else {
                        form.setValue("measurement_system", "imperial");
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {PROPERTY_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The country where this property is located
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col">
                  <FormLabel className="flex items-center mb-2">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    Region
                  </FormLabel>
                  <div className="h-10 px-3 border rounded-md flex items-center justify-between opacity-50 cursor-not-allowed">
                    <span>USA (Default)</span>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormDescription className="text-sm text-muted-foreground mt-1">
                    Upgrade to International tier for global properties
                  </FormDescription>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Available with International tier only</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div>
          <FormField
            control={form.control}
            name="property_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  Property Type
                </FormLabel>
                <Select
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2">
          <FormField
            control={form.control}
            name="available_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                  Available Date
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  When is this property available for tenants?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2 flex justify-end">
          <Button
            type="button"
            onClick={onNextTab}
            className="mt-4 flex items-center gap-2"
          >
            Continue to Features
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
