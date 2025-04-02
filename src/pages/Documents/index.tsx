import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import * as documentService from "../../services/documentService";
import { getDocumentRequirements } from "./const";
import { FileUploadInput } from "./FileUploadInput";
import { StatusIndicator } from "./status-indicator";
import { Button } from "../../components/ui/button";
import { Trash2, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { Document, DocumentFilters, Country } from "./types";
import { FilterDialog } from "./components/FilterDialog";
import { useLocale } from "../../hooks/useLocale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Alert, AlertDescription } from "../../components/ui/alert";

interface UploadState {
  progress: Record<string, number>;
  errors: Record<string, string | undefined>;
}

export function Documents() {
  const { user, country, isLoading: isLocationLoading } = useAuthStore();
  const { isLoading: isLocaleLoading } = useLocale();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: {},
    errors: {},
  });
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [deleteDocument, setDeleteDocument] = useState<Document | null>(null);
  const [currentFilters, setCurrentFilters] = useState<DocumentFilters>({
    type: "all",
    status: "all",
    dateRange: "all",
    verified: "all",
    country: country as Country,
  });

  // Memoize filtered documents to prevent unnecessary recalculations
  const filteredDocuments = useMemo(
    () => documentService.filterDocuments(documents, currentFilters),
    [documents, currentFilters]
  );

  // Memoize document requirements to prevent unnecessary recalculations
  const documentRequirements = useMemo(
    () => getDocumentRequirements(country as Country),
    [country]
  );

  // Memoize the documents to display based on filters
  const documentsToDisplay = useMemo(() => {
    if (currentFilters.type === "all") {
      return documentRequirements.map((req) => {
        const doc = filteredDocuments.find((d) => d.type === req.type);
        return {
          ...req,
          document: doc,
        };
      });
    }
    return documentRequirements
      .filter((req) => req.type === currentFilters.type)
      .map((req) => {
        const doc = filteredDocuments.find((d) => d.type === req.type);
        return {
          ...req,
          document: doc,
        };
      });
  }, [documentRequirements, filteredDocuments, currentFilters]);

  // Memoize fetch documents function
  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const docs = await documentService.fetchUserDocuments(user.id);
      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch documents"
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

  // Memoize handlers to prevent unnecessary rerenders
  const handleDelete = useCallback(async () => {
    if (!deleteDocument) return;

    try {
      await documentService.deleteDocument(
        deleteDocument.id,
        deleteDocument.file_path
      );
      setDocuments((prev) =>
        prev.filter((doc) => doc.id !== deleteDocument.id)
      );
      setDeleteDocument(null);
    } catch (error) {
      console.error("Error deleting document:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete document"
      );
    }
  }, [deleteDocument]);

  const handlePreview = useCallback(async (document: Document) => {
    try {
      const blob = await documentService.downloadDocument(document.file_path);
      const url = URL.createObjectURL(blob);
      setPreviewDocument({ ...document, previewUrl: url });
    } catch (error) {
      console.error("Error previewing document:", error);
      setError(
        error instanceof Error ? error.message : "Failed to preview document"
      );
    }
  }, []);

  const handleApplyFilters = useCallback((filters: DocumentFilters) => {
    setCurrentFilters(filters);
  }, []);

  // Memoize error message formatter
  const formatErrorMessage = useCallback((error: string) => {
    if (error.includes("File size")) {
      return {
        title: "File too large",
        description: "Please upload a smaller file (max 10MB).",
      };
    }
    if (error.includes("File type")) {
      return {
        title: "Invalid file type",
        description: "Please upload a supported file format (PDF, JPG, PNG).",
      };
    }
    if (error.includes("network")) {
      return {
        title: "Network error",
        description: "Please check your connection and try again.",
      };
    }
    if (error.includes("permission")) {
      return {
        title: "Permission denied",
        description: "You don't have permission to upload this file.",
      };
    }
    return {
      title: "Upload failed",
      description: error,
    };
  }, []);

  const handleUpload = useCallback(
    async (file: File, type: string) => {
      if (!user) return;

      try {
        setUploadState((prev) => ({
          ...prev,
          errors: { ...prev.errors, [type]: undefined },
        }));

        const document = await documentService.uploadDocument(
          {
            userId: user.id,
            title: file.name,
            type: type as Document["type"],
            file,
          },
          (progress) => {
            setUploadState((prev) => ({
              ...prev,
              progress: { ...prev.progress, [type]: progress },
            }));
          }
        );

        setDocuments((prev) => [...prev, document]);
        setUploadState((prev) => ({
          ...prev,
          progress: { ...prev.progress, [type]: 0 },
        }));
      } catch (error) {
        console.error("Error uploading document:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload document";
        setUploadState((prev) => ({
          ...prev,
          errors: { ...prev.errors, [type]: errorMessage },
        }));

        const { title, description } = formatErrorMessage(errorMessage);
        toast.error(title, {
          description,
          action: {
            label: "Try Again",
            onClick: () => handleUpload(file, type),
          },
        });
      }
    },
    [user, formatErrorMessage]
  );

  // Show loading state while initializing
  if (isLocaleLoading || isLocationLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage your required documents for {country}
          </p>
        </div>
        <FilterDialog
          onApplyFilters={handleApplyFilters}
          currentFilters={currentFilters}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          documentsToDisplay.map(
            ({ type, label, description, icon, document }) => {
              const progress = uploadState.progress[type] || 0;
              const error = uploadState.errors[type];

              return (
                <div
                  key={type}
                  className="rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium leading-none">
                          {label}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {description}
                        </p>
                      </div>
                      <div className="rounded-full bg-primary/10 p-2">
                        {icon}
                      </div>
                    </div>

                    {document ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <StatusIndicator status={document.status} />
                          <span className="text-xs text-muted-foreground">
                            {new Date(document.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handlePreview(document)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => setDeleteDocument(document)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>

                        {document?.ocr_status === "completed" &&
                          document.report_data && (
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <h4 className="text-sm font-medium mb-1">
                                Extracted Information
                              </h4>
                              <div className="text-xs max-h-32 overflow-y-auto">
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(
                                    document.report_data,
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <FileUploadInput
                        type={type}
                        onUpload={(file) => handleUpload(file, type)}
                        progress={progress}
                        error={error}
                      />
                    )}
                  </div>
                </div>
              );
            }
          )
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewDocument}
        onOpenChange={() => setPreviewDocument(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewDocument?.title}</DialogTitle>
          </DialogHeader>
          {previewDocument?.previewUrl && (
            <iframe
              src={previewDocument.previewUrl}
              className="w-full h-[600px]"
              title={previewDocument.title}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteDocument}
        onOpenChange={() => setDeleteDocument(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
