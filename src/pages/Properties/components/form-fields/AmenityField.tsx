import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { PropertyFormValues } from "../../types";
import { useTranslation } from "react-i18next";

interface AmenityFieldProps {
  form: UseFormReturn<PropertyFormValues>;
  icon?: React.ReactNode;
}

export function AmenityField({ form, icon }: AmenityFieldProps) {
  const [amenityInput, setAmenityInput] = useState("");
  const { t } = useTranslation();

  // Add amenity to the list
  const handleAddAmenity = () => {
    if (!amenityInput.trim()) return;

    const currentAmenities = form.getValues().amenities || [];
    form.setValue("amenities", [...currentAmenities, amenityInput.trim()]);
    setAmenityInput("");
  };

  // Remove amenity from the list
  const handleRemoveAmenity = (index: number) => {
    const currentAmenities = form.getValues().amenities || [];
    const newAmenities = [...currentAmenities];
    newAmenities.splice(index, 1);
    form.setValue("amenities", newAmenities);
  };

  return (
    <FormField
      control={form.control}
      name="amenities"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            {icon}
            {t("properties.form.amenities")}
          </FormLabel>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder={t("properties.form.amenities")}
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddAmenity();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddAmenity}
              variant="secondary"
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              {t("common.add")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 min-h-[50px] border rounded-md p-2 bg-muted/30">
            {(field.value || []).length === 0 ? (
              <p className="text-sm text-muted-foreground p-1">
                {t("properties.form.noAmenitiesYet")}
              </p>
            ) : (
              (field.value || []).map((amenity, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  {amenity}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 text-muted-foreground hover:text-foreground rounded-full"
                    onClick={() => handleRemoveAmenity(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
            )}
          </div>
          <FormDescription>
            {t("properties.form.popularAmenities")}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
