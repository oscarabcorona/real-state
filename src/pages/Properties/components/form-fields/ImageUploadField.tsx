import { useState, useRef } from "react";
import { X, Plus } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { PropertyFormValues } from "../../types";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  form: UseFormReturn<PropertyFormValues>;
}

export function ImageUploadField({ form }: ImageUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle image removal
  const handleRemoveImage = (index: number) => {
    const currentImages = form.getValues().images || [];
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    form.setValue("images", newImages);
  };

  // Functions to handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Process selected files
  const handleFiles = (files: FileList) => {
    // Convert FileList to array and process only image files
    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (fileArray.length === 0) return;

    // Read files as data URLs
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const currentImages = form.getValues().images || [];
          form.setValue("images", [
            ...currentImages,
            e.target.result as string,
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <FormField
      control={form.control}
      name="images"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel>Property Images</FormLabel>
          <FormDescription>
            High-quality images increase interest in your property. Add multiple
            photos to showcase different areas.
          </FormDescription>

          {/* Image Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Existing Images */}
            {(field.value || []).map((image, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-md overflow-hidden border border-input"
              >
                <img
                  src={image}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => handleRemoveImage(index)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Upload Box */}
            <div
              className={cn(
                "border-2 border-dashed rounded-md flex flex-col items-center justify-center aspect-square cursor-pointer transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:bg-muted/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="rounded-full bg-primary/10 p-2 mb-2">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Add Image</p>
              <p className="text-xs text-muted-foreground px-4 text-center mt-1">
                Drag & drop or click to upload
              </p>
            </div>
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
