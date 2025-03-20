import { Button } from "@/components/ui/button";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, ImagePlus, Upload, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { PropertyFormValues } from "../../types";

interface MediaTabProps {
  form: UseFormReturn<PropertyFormValues>;
  onNextTab: () => void;
  onPrevTab: () => void;
}

export function MediaTab({ form, onNextTab, onPrevTab }: MediaTabProps) {
  // Function to handle image removal
  const handleRemoveImage = (index: number) => {
    const currentImages = form.getValues().images || [];
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    form.setValue("images", newImages);
  };

  return (
    <TabsContent value="media" className="space-y-5 py-2">
      <div className="space-y-5">
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <ImagePlus className="h-4 w-4 mr-2 text-muted-foreground" />
                Property Images
              </FormLabel>
              <FormDescription className="mb-4">
                High-quality images increase interest in your property
              </FormDescription>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(field.value || []).map((image, index) => (
                  <div
                    key={index}
                    className="relative rounded-md overflow-hidden h-36 border border-muted group"
                  >
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleRemoveImage(index)}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-2 border-dashed border-muted rounded-md flex flex-col items-center justify-center h-36 cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Upload Image</p>
                    <p className="text-xs text-muted-foreground">
                      Drag & drop or click to browse
                    </p>
                  </div>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevTab}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Policies
          </Button>
          <Button
            type="button"
            onClick={onNextTab}
            className="flex items-center gap-2"
          >
            Review & Publish
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
