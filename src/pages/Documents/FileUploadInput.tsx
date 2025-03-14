import { Upload } from "lucide-react";
import React, { useRef } from "react";

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
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add("border-indigo-500", "bg-indigo-50");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-indigo-500", "bg-indigo-50");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-indigo-500", "bg-indigo-50");
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const event = {
        target: {
          files: e.dataTransfer.files,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  return (
    <div className="space-y-2">
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors duration-200"
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md ${
              disabled
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "text-white bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Choose File
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {selectedFile
            ? selectedFile.name
            : "Drag & drop a file here, or click to select"}
        </p>
        <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={onChange}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
};
