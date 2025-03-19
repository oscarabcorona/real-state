import React from "react";
import { Download, Eye, FileText, Trash2, Upload } from "lucide-react";
import type { Document } from "../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusIndicator } from "../status-indicator";

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onPreview: (document: Document) => void;
  onDownload: (filePath: string, fileName: string) => void;
  onDelete: (id: string, filePath: string) => void;
  onUpload: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  onPreview,
  onDownload,
  onDelete,
  onUpload,
}) => {
  if (loading) {
    return (
      <Card className="divide-y divide-border">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-20 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="text-center py-16 border-dashed">
        <FileText className="mx-auto h-16 w-16 text-muted-foreground opacity-40" />
        <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          {documents.length === 0
            ? "Get started by uploading your first document."
            : "Try adjusting your filters or upload a new document."}
        </p>
        <div className="mt-8">
          <Button onClick={onUpload} size="lg" className="gap-2 px-6">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-border overflow-hidden">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="px-6 py-4 flex items-center justify-between hover:bg-accent/50 transition-colors group"
        >
          <div className="flex items-center flex-1 min-w-0 gap-4">
            <div className="rounded-full bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {doc.title ||
                  doc.type
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                {doc.property?.name && (
                  <>
                    <span className="font-medium">{doc.property.name}</span>
                    <span className="mx-2">•</span>
                  </>
                )}
                <span>
                  Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                </span>
                {doc.verification_date && (
                  <>
                    <span className="mx-2">•</span>
                    <span>
                      Verified on{" "}
                      {new Date(doc.verification_date).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="ml-4 flex items-center gap-4">
            <StatusIndicator status={doc.status} verified={doc.verified} />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPreview(doc)}
                title="Preview"
                className="opacity-70 hover:opacity-100"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  onDownload(doc.file_path, `${doc.title || doc.type}.pdf`)
                }
                title="Download"
                className="opacity-70 hover:opacity-100"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(doc.id, doc.file_path)}
                title="Delete"
                className="opacity-70 hover:opacity-100 text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
};
