import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  AlertCircle,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DocumentRequirement } from "./types";

interface FileUploadInputProps {
  requirement: DocumentRequirement;
  onUpload: (file: File) => void;
  onRemove: () => void;
  isUploading: boolean;
  uploadProgress: number;
  error?: string;
  currentFile?: File;
}

export function FileUploadInput({
  requirement,
  onUpload,
  onRemove,
  isUploading,
  uploadProgress,
  error,
  currentFile,
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
    if (requirement.type === "id_document") {
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
          accept={requirement.type === "id_document" ? "image/*" : undefined}
          onChange={handleFileInputChange}
        />

        {currentFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentFile.type.startsWith("image/") ? (
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">{currentFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">{requirement.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {requirement.description}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleClick}
              disabled={isUploading}
            >
              Select File
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              or drag and drop
            </p>
          </div>
        )}

        {isUploading && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="h-2" />
            <p className="mt-1 text-xs text-muted-foreground text-center">
              Uploading... {uploadProgress}%
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
    </div>
  );
}
