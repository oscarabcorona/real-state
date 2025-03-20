import { UseFormReturn } from "react-hook-form";
import { PropertyFormValues } from "../../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TabsContent } from "@/components/ui/tabs";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Bed,
  Bath,
  DollarSign,
  Square,
  Tag,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { AmenityField } from "../form-fields/AmenityField";

interface FeaturesTabProps {
  form: UseFormReturn<PropertyFormValues>;
  onNextTab: () => void;
  onPrevTab: () => void;
}

export function FeaturesTab({ form, onNextTab, onPrevTab }: FeaturesTabProps) {
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
            name="square_feet"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Square className="h-4 w-4 mr-2 text-muted-foreground" />
                  Square Feet
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
