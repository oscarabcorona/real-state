import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import * as documentService from "../../services/documentService";
import { getDocumentRequirements } from "./const";
import { FileUploadInput } from "./FileUploadInput";
import { StatusIndicator } from "./status-indicator";
import { Button } from "../../components/ui/button";
import { Trash2, Eye, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Document, DocumentFilters } from "./types";
import { FilterDialog } from "./components/FilterDialog";
import { PreviewModal } from "./components/PreviewModal";
import { Progress } from "../../components/ui/progress";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";

interface UploadState {
  progress: Record<string, number>;
  errors: Record<string, string | undefined>;
}

interface DeleteState {
  documentId: string | null;
  filePath: string | null;
  isDeleting: boolean;
}

export function Documents() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [verificationNote, setVerificationNote] = useState("");
  const [processingDocument, setProcessingDocument] = useState(false);
  const [deleteState, setDeleteState] = useState<DeleteState>({
    documentId: null,
    filePath: null,
    isDeleting: false,
  });
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: {},
    errors: {},
  });
  const [filters, setFilters] = useState<DocumentFilters>({
    type: "all",
    status: "all",
    dateRange: "all",
    verified: "all",
    country: "GUATEMALA",
  });

  const requirements = useMemo(
    () => getDocumentRequirements(filters.country),
    [filters.country]
  );

  const isTenant = user?.role === "tenant";

  // Calculate completion status for each document type
  const documentStatus = useMemo(() => {
    const status: Record<string, { uploaded: boolean; verified: boolean }> = {};
    requirements.forEach((req) => {
      const doc = documents.find((d) => d.type === req.type);
      status[req.type] = {
        uploaded: !!doc,
        verified: doc?.status === "verified",
      };
    });
    return status;
  }, [documents, requirements]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const total = requirements.length;
    const uploaded = Object.values(documentStatus).filter(
      (s) => s.uploaded
    ).length;
    const verified = Object.values(documentStatus).filter(
      (s) => s.verified
    ).length;
    return {
      uploaded: Math.round((uploaded / total) * 100),
      verified: Math.round((verified / total) * 100),
    };
  }, [documentStatus, requirements]);

  useEffect(() => {
    if (user?.id) {
      loadDocuments();
    }
  }, [user?.id]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await documentService.fetchUserDocuments(user!.id);
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (type: Document["type"], file: File) => {
    if (!user) return;

    try {
      setUploadState((prev) => ({
        ...prev,
        progress: { ...prev.progress, [type]: 0 },
        errors: { ...prev.errors, [type]: undefined },
      }));

      const doc = await documentService.uploadDocument(
        {
          userId: user.id,
          type,
          title: file.name,
          file,
        },
        (progress) =>
          setUploadState((prev) => ({
            ...prev,
            progress: { ...prev.progress, [type]: progress },
          }))
      );

      setDocuments((prev) => [doc, ...prev]);
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Error uploading document:", error);
      setUploadState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [type]:
            error instanceof Error
              ? error.message
              : "Failed to upload document",
        },
      }));
      toast.error("Failed to upload document", {
        action: {
          label: "Try Again",
          onClick: () => handleUpload(type, file),
        },
      });
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    try {
      setDeleteState((prev) => ({ ...prev, isDeleting: true }));
      await documentService.deleteDocument(id, filePath);

      // Find the document to get its type before removing it
      const deletedDoc = documents.find((doc) => doc.id === id);

      // Remove document from the list
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));

      // Reset upload progress and errors for the deleted document type
      if (deletedDoc) {
        setUploadState((prev) => ({
          progress: {
            ...prev.progress,
            [deletedDoc.type]: 0,
          },
          errors: {
            ...prev.errors,
            [deletedDoc.type]: undefined,
          },
        }));
      }

      toast.success("Document deleted successfully");
      setDeleteState({ documentId: null, filePath: null, isDeleting: false });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
      setDeleteState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteClick = (id: string, filePath: string) => {
    setDeleteState({ documentId: id, filePath, isDeleting: false });
  };

  const handlePreview = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleClosePreview = () => {
    setSelectedDocument(null);
    setVerificationNote("");
  };

  const handleVerify = async (document: Document) => {
    try {
      setProcessingDocument(true);
      await documentService.verifyDocument(document.id, verificationNote);
      await loadDocuments();
      toast.success("Document verified successfully");
      handleClosePreview();
    } catch (error) {
      console.error("Error verifying document:", error);
      toast.error("Failed to verify document");
    } finally {
      setProcessingDocument(false);
    }
  };

  const handleReject = async (document: Document) => {
    try {
      setProcessingDocument(true);
      await documentService.updateDocument(document.id, {
        status: "rejected",
        notes: verificationNote,
      });
      await loadDocuments();
      toast.success("Document rejected");
      handleClosePreview();
    } catch (error) {
      console.error("Error rejecting document:", error);
      toast.error("Failed to reject document");
    } finally {
      setProcessingDocument(false);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const blob = await documentService.downloadDocument(filePath);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1 w-full bg-background">
        <div className="w-full h-full px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                Documents
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Upload and manage your required documents for {filters.country}
              </p>
            </div>
            <div className="flex-shrink-0">
              <FilterDialog
                currentFilters={filters}
                onApplyFilters={setFilters}
              />
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl">
                Document Completion Progress
              </CardTitle>
              <CardDescription className="text-sm">
                Track your document submission status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      Documents Uploaded
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {overallProgress.uploaded}%
                    </span>
                  </div>
                  <Progress value={overallProgress.uploaded} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      Documents Verified
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {overallProgress.verified}%
                    </span>
                  </div>
                  <Progress value={overallProgress.verified} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6 auto-rows-fr">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse flex flex-col min-w-0">
                    <CardHeader className="pb-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-3 bg-muted rounded-lg w-10 h-10 flex-shrink-0" />
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="h-5 w-32 bg-muted rounded" />
                          <div className="h-4 w-40 bg-muted rounded" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4 flex-1">
                      <div className="h-24 bg-muted rounded-lg" />
                    </CardContent>
                  </Card>
                ))
              : requirements.map((requirement) => {
                  const doc = documents.find(
                    (d) => d.type === requirement.type
                  );
                  const status = documentStatus[requirement.type];
                  const uploadProgress =
                    uploadState.progress[requirement.type] || 0;
                  const error = uploadState.errors[requirement.type];

                  return (
                    <Card
                      key={requirement.type}
                      className={`group relative transition-all duration-200 hover:shadow-md flex flex-col h-full ${
                        status.verified
                          ? "border-green-200 bg-green-50/50 hover:border-green-300"
                          : status.uploaded
                          ? "border-blue-200 bg-blue-50/50 hover:border-blue-300"
                          : "hover:border-gray-300"
                      }`}
                    >
                      <CardHeader className="pb-3 space-y-3 block">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`p-2.5 rounded-lg transition-colors flex-shrink-0 ${
                                status.verified
                                  ? "bg-green-100 text-green-700"
                                  : status.uploaded
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {requirement.icon}
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-base font-semibold truncate">
                                {requirement.label}
                              </CardTitle>
                              <CardDescription className="text-sm mt-1 line-clamp-2">
                                {requirement.description}
                              </CardDescription>
                            </div>
                          </div>
                          {status.verified ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="p-1.5 rounded-full bg-green-100 flex-shrink-0">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Document verified</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : status.uploaded ? (
                            <div className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex-shrink-0">
                              Pending
                            </div>
                          ) : null}
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1">
                        {doc ? (
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm/6 font-medium text-gray-900">
                                Document
                              </span>
                              <StatusIndicator status={doc.status} />
                            </div>
                            <ul
                              role="list"
                              className="divide-y divide-gray-100 rounded-md border border-gray-200"
                            >
                              <li className="flex items-center justify-between py-3 px-4 text-sm/6">
                                <div className="flex w-0 flex-1 items-center">
                                  <div className="ml-1 flex min-w-0 flex-1 gap-2">
                                    <span className="truncate font-medium">
                                      {doc.title}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4 shrink-0">
                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {new Date(
                                      doc.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </li>
                            </ul>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <FileUploadInput
                              type={requirement.type}
                              onUpload={(file) =>
                                handleUpload(requirement.type, file)
                              }
                              progress={uploadProgress}
                              error={error}
                            />
                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span>Uploading...</span>
                                  <span>{uploadProgress}%</span>
                                </div>
                                <Progress
                                  value={uploadProgress}
                                  className="h-1 bg-gray-100"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>

                      {error ? (
                        <CardFooter className="bg-red-50 border-t border-red-100 p-3">
                          <div className="flex items-center text-red-700 text-sm gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-2 flex-1">{error}</span>
                          </div>
                        </CardFooter>
                      ) : doc ? (
                        <CardFooter className="border-t bg-gray-50/50 p-3">
                          <div className="flex gap-2 w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-white hover:bg-gray-50/50 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-300 active:bg-gray-100 text-xs h-8"
                              onClick={() => handlePreview(doc)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-white hover:bg-red-50 border border-gray-200 text-gray-700 hover:text-red-600 shadow-sm transition-all duration-200 hover:border-red-200 active:bg-red-100/50 group text-xs h-8"
                              onClick={() =>
                                doc.id &&
                                handleDeleteClick(doc.id, doc.file_path)
                              }
                              disabled={deleteState.isDeleting}
                            >
                              {deleteState.isDeleting &&
                              deleteState.documentId === doc.id ? (
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 group-hover:text-red-600" />
                              )}
                              {deleteState.isDeleting &&
                              deleteState.documentId === doc.id
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </div>
                        </CardFooter>
                      ) : null}
                    </Card>
                  );
                })}
          </div>
        </div>
      </div>

      {selectedDocument && (
        <PreviewModal
          document={selectedDocument}
          verificationNote={verificationNote}
          rejectionReason=""
          onVerificationNoteChange={setVerificationNote}
          onVerify={handleVerify}
          onReject={handleReject}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onClose={handleClosePreview}
          processingDocument={processingDocument}
          isTenant={isTenant}
        />
      )}

      <AlertDialog
        open={!!deleteState.documentId}
        onOpenChange={(open) => {
          if (!open)
            setDeleteState({
              documentId: null,
              filePath: null,
              isDeleting: false,
            });
        }}
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
            <AlertDialogCancel disabled={deleteState.isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteState.documentId && deleteState.filePath) {
                  handleDelete(deleteState.documentId, deleteState.filePath);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteState.isDeleting}
            >
              {deleteState.isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Documents;
