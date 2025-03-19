import { FileIcon, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const FileUploadInput = ({
  onChange,
  disabled,
  selectedFile,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  selectedFile: File | null;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const event = {
        target: {
          files: e.dataTransfer.files,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  const getFileSize = (file: File) => {
    const sizeInKB = file.size / 1024;
    if (sizeInKB < 1024) {
      return `${Math.round(sizeInKB * 10) / 10} KB`;
    } else {
      return `${Math.round((sizeInKB / 1024) * 10) / 10} MB`;
    }
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all duration-200",
          isDragging && "border-primary bg-primary/5 scale-[1.02]",
          disabled && "opacity-50 cursor-not-allowed bg-muted/50",
          !disabled && "hover:border-primary/50 hover:bg-accent",
          selectedFile && "bg-muted/20 border-primary/30"
        )}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="size-12 flex items-center justify-center rounded-full bg-primary/10">
              <FileIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {getFileSize(selectedFile)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="mt-2"
            >
              Replace File
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-muted mb-2">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="mb-2"
            >
              Choose File
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Drag & drop a file here, or click to select
            </p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
    </div>
  );
};
