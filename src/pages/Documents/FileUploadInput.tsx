import {
  Upload,
  X,
  FileText,
  Loader2,
  CheckCircle,
  MoveHorizontal,
  Zap,
} from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Document } from "./types";
import { Progress } from "@/components/ui/progress";

interface FileUploadInputProps {
  type: Document["type"];
  onUpload: (file: File) => void;
  progress?: number;
  error?: string;
  disabled?: boolean;
}

export function FileUploadInput({
  // We need type for TypeScript but don't use it directly in the component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type,
  onUpload,
  progress = 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  disabled = false,
}: FileUploadInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = progress > 0 && progress < 100;
  const effectiveDisabled = disabled || isUploading;

  // Handle the completion animation when progress reaches 100%
  useEffect(() => {
    if (progress === 100) {
      setShowCompletionAnimation(true);

      // Reset the animation state after a delay
      const timeout = setTimeout(() => {
        setShowCompletionAnimation(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [progress]);

  // Determine the current stage of the upload process
  const getUploadStage = () => {
    if (progress < 60) return "uploading";
    if (progress < 75) return "processing";
    if (progress < 100) return "analyzing";
    return "complete";
  };

  const uploadStage = getUploadStage();

  // Get appropriate message based on upload stage
  const getStageMessage = () => {
    switch (uploadStage) {
      case "uploading":
        return "Uploading file...";
      case "processing":
        return "Processing document...";
      case "analyzing":
        return "Analyzing content...";
      default:
        return "Upload complete";
    }
  };

  // Get appropriate icon based on upload stage
  const StageIcon = () => {
    switch (uploadStage) {
      case "uploading":
        return <Loader2 className="h-6 w-6 text-primary animate-spin" />;
      case "processing":
        return (
          <MoveHorizontal className="h-6 w-6 text-blue-600 animate-pulse" />
        );
      case "analyzing":
        return <Zap className="h-6 w-6 text-amber-600 animate-pulse" />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!effectiveDisabled) {
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

    if (effectiveDisabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      onUpload(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      onUpload(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (!effectiveDisabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  // Get color class based on upload stage
  const getProgressColorClass = () => {
    switch (uploadStage) {
      case "uploading":
        return "bg-primary";
      case "processing":
        return "bg-blue-500";
      case "analyzing":
        return "bg-amber-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : isUploading
            ? uploadStage === "uploading"
              ? "border-blue-400 bg-blue-50/30"
              : uploadStage === "processing"
              ? "border-blue-500 bg-blue-50/30"
              : "border-amber-500 bg-amber-50/30"
            : showCompletionAnimation
            ? "border-green-400 bg-green-50/30"
            : "border-muted-foreground/25",
          effectiveDisabled && "opacity-60 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          disabled={effectiveDisabled}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic,.heif"
        />

        {isUploading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-lg">
            <div className="flex flex-col items-center space-y-4 p-4 max-w-[80%]">
              <StageIcon />
              <div className="space-y-2 w-full">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {getStageMessage()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {progress}%
                  </span>
                </div>
                <Progress
                  value={progress}
                  className={cn("h-1.5", getProgressColorClass())}
                />
              </div>
            </div>
          </div>
        )}

        {showCompletionAnimation && progress === 100 && (
          <div className="absolute inset-0 bg-green-50/80 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-lg transition-opacity duration-300">
            <div className="flex flex-col items-center space-y-3">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-800">
                Upload Complete
              </p>
            </div>
          </div>
        )}

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
            {!effectiveDisabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
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
                {effectiveDisabled ? getStageMessage() : "Upload Document"}
              </p>
              <p className="text-xs text-muted-foreground">
                Drag and drop or click to select a file
              </p>
            </div>
            {!effectiveDisabled && (
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
