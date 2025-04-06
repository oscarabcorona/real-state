import { Upload, X, FileText } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  selectedFile: File | null;
}

export function FileUploadInput({
  onChange,
  disabled = false,
  selectedFile,
}: FileUploadInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0 && fileInputRef.current) {
      // Create a DataTransfer object to set the files on the input
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      fileInputRef.current.files = dataTransfer.files;

      // Trigger the onChange manually
      const event = new Event("change", { bubbles: true });
      fileInputRef.current.dispatchEvent(event);

      // Call the onChange handler
      if (onChange) {
        const changeEvent = {
          target: { files: dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(changeEvent);
      }
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Format file size in a human-readable way
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} bytes`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
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
          disabled && "opacity-60 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onChange}
          disabled={disabled}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic,.heif"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="rounded-full bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            {!disabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                    const event = {
                      target: { files: null },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }
                }}
                className="mt-2"
              >
                <X className="h-3 w-3 mr-1" />
                Remove File
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="rounded-full bg-primary/10 p-2">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {disabled ? "Uploading..." : "Upload Document"}
              </p>
              <p className="text-xs text-muted-foreground">
                Drag and drop or click to select a file
              </p>
            </div>
            {!disabled && (
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
        )}
      </div>
    </div>
  );
}
