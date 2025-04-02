import { Upload, AlertCircle } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DocumentRequirement } from "./types";

interface FileUploadInputProps {
  type: DocumentRequirement["type"];
  onUpload: (file: File) => void;
  progress: number;
  error?: string;
}

export function FileUploadInput({
  type,
  onUpload,
  progress,
  error,
}: FileUploadInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (type === "id_document") {
      // Validate ID document
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file for ID document");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("ID document image must be less than 5MB");
        return;
      }
    }
    onUpload(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          error && "border-destructive"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
          accept={type === "id_document" ? "image/*" : ".pdf,.jpg,.jpeg,.png"}
        />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="rounded-full bg-primary/10 p-2">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {progress > 0 ? "Uploading..." : "Upload Document"}
            </p>
            <p className="text-xs text-muted-foreground">
              {type === "id_document"
                ? "Upload an image file (max 5MB)"
                : "Upload a PDF or image file (max 10MB)"}
            </p>
          </div>
          {!progress && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClick}
              className="mt-2"
            >
              Select File
            </Button>
          )}
        </div>
      </div>

      {progress > 0 && (
        <div className="mt-4 space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {progress}% uploaded
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
