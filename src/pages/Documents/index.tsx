import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import * as documentService from "../../services/documentService";
import { getDocumentRequirements } from "./const";
import { FileUploadInput } from "./FileUploadInput";
import { StatusIndicator } from "./status-indicator";
import { Button } from "../../components/ui/button";
import { Filter, Trash2, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type {
  Document,
  DocumentRequirement,
  DocumentFilters,
  Country,
} from "./types";
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
import { supabase } from "../../lib/supabase";
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
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<DocumentFilters>({
    type: "",
    status: "",
    dateRange: "",
    verified: "",
    country: country as Country,
  });

  // Memoize document requirements to prevent unnecessary recalculations
  const documentRequirements = useMemo(
    () => getDocumentRequirements(country as Country),
    [country]
  );

  // Memoize filtered documents to prevent unnecessary recalculations
  const filteredDocuments = useMemo(
    () => documentService.filterDocuments(documents, currentFilters),
    [documents, currentFilters]
  );

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
    async (file: File, requirement: DocumentRequirement) => {
      try {
        setError(null);
        // Set uploading state and clear previous error
        setUploadState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [requirement.type]: undefined,
          },
        }));

        // Upload file to storage
        const filePath = `${(await supabase.auth.getUser()).data.user?.id}/${
          requirement.type
        }/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("tenant_documents")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Create document record
        const { data: uploadedDoc, error: createError } = await supabase
          .from("documents")
          .insert({
            title: file.name,
            type: requirement.type,
            file_path: filePath,
            status: "pending",
            user_id: (await supabase.auth.getUser()).data.user?.id,
            country: requirement.country,
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        // Start progress simulation
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 5;
          if (progress >= 90) {
            clearInterval(progressInterval);
          }
          setUploadState((prev) => ({
            ...prev,
            progress: { ...prev.progress, [requirement.type]: progress },
          }));
        }, 500);

        try {
          // Call OCR Edge Function
          const { data: ocrResult, error: ocrError } =
            await supabase.functions.invoke("ocr", {
              body: {
                filePath,
                options: {
                  temperature: 0.1,
                  maxTokens: 1024,
                },
              },
            });

          if (ocrError) {
            throw ocrError;
          }

          if (!ocrResult.success) {
            throw new Error(ocrResult.error || "OCR processing failed");
          }

          // Update document with OCR results
          await supabase
            .from("documents")
            .update({
              ocr_status: "completed",
              ocr_completed_at: new Date().toISOString(),
              report_data: ocrResult.ocr_results,
            })
            .eq("id", uploadedDoc.id);

          // Refresh documents list
          fetchDocuments();
        } catch (ocrError) {
          console.error("OCR Error:", ocrError);
          await supabase
            .from("documents")
            .update({
              ocr_status: "failed",
              ocr_error:
                ocrError instanceof Error
                  ? ocrError.message
                  : "OCR processing failed",
            })
            .eq("id", uploadedDoc.id);
          throw ocrError;
        }

        clearInterval(progressInterval);
        setUploadState((prev) => ({
          ...prev,
          progress: { ...prev.progress, [requirement.type]: 100 },
        }));

        // Reset progress after a delay
        setTimeout(() => {
          setUploadState((prev) => ({
            ...prev,
            progress: { ...prev.progress, [requirement.type]: 0 },
          }));
        }, 1000);
      } catch (error) {
        console.error("Upload Error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload document";
        const formattedError = formatErrorMessage(errorMessage);

        // Show toast with detailed error and retry action
        toast.error(formattedError.title, {
          description: formattedError.description,
          action: {
            label: "Try Again",
            onClick: () => handleUpload(file, requirement),
          },
          duration: 5000,
        });

        // Update error state for visual feedback
        setUploadState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [requirement.type]: errorMessage,
          },
        }));
      }
    },
    [fetchDocuments, formatErrorMessage]
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
        <Button
          variant="outline"
          size="default"
          className="flex items-center gap-2"
          onClick={() => setFilterDialogOpen(true)}
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
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
          documentRequirements.map((requirement) => {
            const document = filteredDocuments.find(
              (d) => d.type === requirement.type
            );
            const progress = uploadState.progress[requirement.type] || 0;
            const error = uploadState.errors[requirement.type];

            return (
              <div
                key={requirement.type}
                className="rounded-lg border bg-white p-4 flex flex-col h-full"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#EEF4FF] flex items-center justify-center shrink-0">
                    {requirement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium truncate">
                        {requirement.label}
                      </h3>
                      {document && <StatusIndicator status={document.status} />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {requirement.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <FileUploadInput
                    requirement={requirement}
                    onUpload={(file) => handleUpload(file, requirement)}
                    onRemove={() => {}}
                    isUploading={progress > 0}
                    uploadProgress={progress}
                    error={error}
                    currentFile={
                      document?.file_path
                        ? new File([], document.file_path)
                        : undefined
                    }
                  />
                </div>

                {document && (
                  <div className="mt-3 flex gap-2">
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
                )}

                {document?.ocr_status === "completed" &&
                  document.report_data && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium mb-1">
                        Extracted Information
                      </h4>
                      <div className="text-xs max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(document.report_data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
              </div>
            );
          })
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

      {/* Filter Dialog */}
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApplyFilters={handleApplyFilters}
        currentFilters={currentFilters}
      />
    </div>
  );
}
