import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Bed,
  DollarSign,
  Square,
  Tag,
} from "lucide-react";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { PropertyFormValues } from "../../types";
import { AmenityField } from "../form-fields/AmenityField";

interface FeaturesTabProps {
  form: UseFormReturn<PropertyFormValues>;
  onNextTab: () => void;
  onPrevTab: () => void;
}

export function FeaturesTab({ form, onNextTab, onPrevTab }: FeaturesTabProps) {
  // List of regions that use metric system
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

  // Get the current measurement system based on region
  const region = form.watch("region") || "USA";
  const isMetric = metricRegions.includes(region);

  // Update measurement system when region changes
  useEffect(() => {
    // Set measurement system based on region
    const measurementSystem = isMetric ? "metric" : "imperial";

    // Only update if different to avoid unnecessary re-renders
    if (form.getValues("measurement_system") !== measurementSystem) {
      form.setValue("measurement_system", measurementSystem);

      // Convert measurements if needed
      if (isMetric) {
        const squareFeet = form.getValues().square_feet;
        if (squareFeet) {
          // Convert sq ft to m²
          const squareMeters = Math.round(squareFeet * 0.092903);
          form.setValue("square_meters", squareMeters);
        }
      } else {
        const squareMeters = form.getValues().square_meters;
        if (squareMeters) {
          // Convert m² to sq ft
          const squareFeet = Math.round(squareMeters * 10.7639);
          form.setValue("square_feet", squareFeet);
        }
      }
    }
  }, [region, isMetric, form]);

  return (
    <TabsContent value="features" className="space-y-5 py-2">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  Price ($/month)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name={isMetric ? "square_meters" : "square_feet"}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Square className="h-4 w-4 mr-2 text-muted-foreground" />
                  {isMetric ? "Square Meters" : "Square Feet"}
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  Property size in{" "}
                  {isMetric ? "square meters (m²)" : "square feet (sq ft)"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Bed className="h-4 w-4 mr-2 text-muted-foreground" />
                  Bedrooms
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Bath className="h-4 w-4 mr-2 text-muted-foreground" />
                  Bathrooms
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.5"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    name={field.name}
                    placeholder="Describe the property, its location, and special features..."
                  />
                </FormControl>
                <FormDescription>
                  A detailed description helps attract potential tenants
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2">
          <AmenityField
            form={form}
            icon={<Tag className="h-4 w-4 mr-2 text-muted-foreground" />}
          />
        </div>

        <div className="col-span-2 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevTab}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Details
          </Button>
          <Button
            type="button"
            onClick={onNextTab}
            className="flex items-center gap-2"
          >
            Continue to Policies
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
