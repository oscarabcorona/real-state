import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import * as documentService from "../../services/documentService";
import * as ocrService from "../../services/ocrService";
import { DOCUMENT_REQUIREMENTS } from "./const";
import { FileUploadInput } from "./FileUploadInput";
import { StatusIndicator } from "./status-indicator";
import { Button } from "../../components/ui/button";
import { Filter, Trash2, Eye } from "lucide-react";
import type { Document, DocumentRequirement, DocumentFilters } from "./types";
import { FilterDialog } from "./components/FilterDialog";
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

interface UploadState {
  progress: Record<string, number>;
  errors: Record<string, string | null>;
}

export function Documents() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
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
  });

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  useEffect(() => {
    // Apply filters whenever documents or filters change
    const filtered = documentService.filterDocuments(documents, currentFilters);
    setFilteredDocuments(filtered);
  }, [documents, currentFilters]);

  const fetchDocuments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const docs = await documentService.fetchUserDocuments(user.id);
      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDocument) return;

    try {
      await documentService.deleteDocument(
        deleteDocument.id,
        deleteDocument.file_path
      );
      setDocuments(documents.filter((doc) => doc.id !== deleteDocument.id));
      setDeleteDocument(null);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handlePreview = async (document: Document) => {
    try {
      const blob = await documentService.downloadDocument(document.file_path);
      const url = URL.createObjectURL(blob);
      setPreviewDocument({ ...document, previewUrl: url });
    } catch (error) {
      console.error("Error previewing document:", error);
    }
  };

  const handleApplyFilters = (filters: DocumentFilters) => {
    setCurrentFilters(filters);
  };

  const handleUpload = async (file: File, requirement: DocumentRequirement) => {
    if (!user) return;

    try {
      // Set initial progress
      setUploadState((prev) => ({
        ...prev,
        progress: { ...prev.progress, [requirement.type]: 0 },
        errors: { ...prev.errors, [requirement.type]: null },
      }));

      // Start progress animation
      const progressInterval = setInterval(() => {
        setUploadState((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            [requirement.type]:
              prev.progress[requirement.type] >= 90
                ? 90
                : (prev.progress[requirement.type] || 0) + 10,
          },
        }));
      }, 500);

      // Upload document
      const uploadedDoc = await documentService.uploadDocument({
        userId: user.id,
        title: requirement.label,
        type: requirement.type,
        file: file,
        propertyId: "", // Optional for now
      });

      // Set initial OCR status
      await documentService.updateDocument(uploadedDoc.id, {
        ocr_status: "pending",
      });

      // Perform OCR analysis
      try {
        const ocrResult = await ocrService.analyzeDocument(
          uploadedDoc.file_path,
          requirement.type
        );

        if (ocrResult.error) {
          throw new Error(ocrResult.error);
        }

        // Parse the OCR result
        let parsedResult;
        try {
          parsedResult = JSON.parse(ocrResult.content);
        } catch (parseError) {
          console.error("Error parsing OCR result:", parseError);
          throw new Error("Failed to parse OCR results");
        }

        // Update document with OCR results
        await documentService.updateDocument(uploadedDoc.id, {
          ocr_status: "completed",
          ocr_completed_at: new Date().toISOString(),
          report_data: parsedResult,
        });

        // Refresh documents list
        fetchDocuments();
      } catch (ocrError) {
        console.error("OCR Error:", ocrError);
        await documentService.updateDocument(uploadedDoc.id, {
          ocr_status: "failed",
          ocr_error:
            ocrError instanceof Error
              ? ocrError.message
              : "OCR processing failed",
        });
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
      setUploadState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [requirement.type]:
            error instanceof Error
              ? error.message
              : "Failed to upload document",
        },
      }));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage your required documents
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

      <div className="grid gap-6">
        {DOCUMENT_REQUIREMENTS.map((requirement) => {
          const document = filteredDocuments.find(
            (d) => d.type === requirement.type
          );
          const progress = uploadState.progress[requirement.type] || 0;
          const error = uploadState.errors[requirement.type];

          return (
            <div
              key={requirement.type}
              className="rounded-lg border bg-white p-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-[#EEF4FF] flex items-center justify-center">
                  {requirement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{requirement.label}</h3>
                    {document && <StatusIndicator status={document.status} />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {requirement.description}
                  </p>

                  <div className="mt-4">
                    <FileUploadInput
                      requirement={requirement}
                      onUpload={(file) => handleUpload(file, requirement)}
                      onRemove={() => {}}
                      isUploading={progress > 0}
                      uploadProgress={progress}
                      error={error || undefined}
                      currentFile={
                        document?.file_path
                          ? new File([], document.file_path)
                          : undefined
                      }
                    />
                  </div>

                  {document && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(document)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDocument(document)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}

                  {document?.ocr_status === "completed" &&
                    document.report_data && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium mb-2">
                          Extracted Information
                        </h4>
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(document.report_data, null, 2)}
                        </pre>
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
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
