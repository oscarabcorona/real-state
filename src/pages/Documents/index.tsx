import { ChevronDown, Filter, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { DocumentRequirements } from "./components/DocumentRequirements";
import { DocumentFilters } from "./components/DocumentFilters";
import { DocumentList } from "./components/DocumentList";
import { UploadModal } from "./components/UploadModal";
import { PreviewModal } from "./components/PreviewModal";
import type { Document, Property } from "./types";
import * as documentService from "../../services/documentService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Documents() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [, setProperties] = useState<Property[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processingDocument, setProcessingDocument] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    dateRange: "",
    verified: "",
  });
  const [uploadForm, setUploadForm] = useState({
    title: "",
    type: "credit_report" as Document["type"],
    file: null as File | null,
    property_id: "",
  });
  const [verificationNote, setVerificationNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (user) {
      fetchProperties();
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, filters]);

  useEffect(() => {
    if (!showUploadModal) {
      resetUploadForm();
    }
  }, [showUploadModal]);

  const fetchProperties = async () => {
    if (!user) return;
    try {
      const propertiesData = await documentService.fetchTenantProperties(
        user.id
      );
      setProperties(propertiesData);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const fetchDocuments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const docs = await documentService.fetchUserDocuments(user.id);
      setDocuments(docs);
      setFilteredDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(false);
    const file = e.target.files?.[0];
    if (file) {
      const validation = documentService.validateDocumentFile(file);
      if (validation.valid) {
        setUploadForm((prev) => ({
          ...prev,
          file,
          title: !prev.title ? file.name.split(".")[0] : prev.title,
        }));
      } else {
        setUploadError(validation.error || "Invalid file");
        setUploadForm((prev) => ({ ...prev, file: null }));
        e.target.value = "";
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !user) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);

    try {
      // Setup progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await documentService.uploadDocument(
        {
          userId: user.id,
          title: uploadForm.title,
          type: uploadForm.type,
          file: uploadForm.file,
          propertyId: uploadForm.property_id || undefined,
        },
        (progress) => setUploadProgress(progress)
      );

      clearInterval(progressInterval);
      setUploadSuccess(true);
      await fetchDocuments();

      setTimeout(() => {
        setShowUploadModal(false);
        resetUploadForm();
      }, 2000);
    } catch (error) {
      console.error("Error uploading document:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload document"
      );
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      title: "",
      type: "credit_report",
      file: null,
      property_id: "",
    });
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  const applyFilters = () => {
    const filtered = documentService.filterDocuments(documents, filters);
    setFilteredDocuments(filtered);
  };

  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await documentService.deleteDocument(id, filePath);
      await fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const data = await documentService.downloadDocument(filePath);

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document");
    }
  };

  const handlePreview = (document: Document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const handleVerifyDocument = async (document: Document) => {
    setProcessingDocument(true);
    try {
      await documentService.verifyDocument(document.id, verificationNote);
      await fetchDocuments();
      setShowPreviewModal(false);
      setVerificationNote("");
    } catch (error) {
      console.error("Error verifying document:", error);
      alert("Failed to verify document");
    } finally {
      setProcessingDocument(false);
    }
  };

  const handleRejectDocument = async (document: Document) => {
    if (!rejectionReason) {
      alert("Please provide a reason for rejection");
      return;
    }

    setProcessingDocument(true);
    try {
      await documentService.rejectDocument(document.id, rejectionReason);
      await fetchDocuments();
      setShowPreviewModal(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting document:", error);
      alert("Failed to reject document");
    } finally {
      setProcessingDocument(false);
    }
  };

  const handleSetDocumentType = (type: Document["type"]) => {
    setUploadForm((prev) => ({ ...prev, type }));
    setShowUploadModal(true);
  };

  return (
    <div className="container space-y-6 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl">Documents</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {Object.values(filters).some((v) => v) && (
                <Badge variant="secondary" className="ml-2">
                  {Object.values(filters).filter((v) => v).length}
                </Badge>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
            <Button onClick={() => setShowUploadModal(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {/* Filters - Moved up to appear below buttons but above Required Documents */}
            <DocumentFilters
              filters={filters}
              onFilterChange={setFilters}
              visible={showFilters}
            />

            {/* Document Requirements */}
            <DocumentRequirements
              documents={documents}
              onUpload={handleSetDocumentType}
            />

            {/* Document List */}
            <DocumentList
              documents={filteredDocuments}
              loading={loading}
              onPreview={handlePreview}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onUpload={() => setShowUploadModal(true)}
            />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Modals */}
      {showUploadModal && (
        <UploadModal
          uploadForm={uploadForm}
          onFormChange={(partialForm) =>
            setUploadForm((prev) => ({ ...prev, ...partialForm }))
          }
          onSubmit={handleUpload}
          onClose={() => setShowUploadModal(false)}
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          uploadSuccess={uploadSuccess}
          handleFileChange={handleFileChange}
        />
      )}

      {showPreviewModal && selectedDocument && (
        <PreviewModal
          document={selectedDocument}
          verificationNote={verificationNote}
          rejectionReason={rejectionReason}
          onVerificationNoteChange={setVerificationNote}
          onVerify={handleVerifyDocument}
          onReject={(doc) => {
            const reason = prompt("Please provide a reason for rejection:");
            if (reason) {
              setRejectionReason(reason);
              handleRejectDocument(doc);
            }
          }}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onClose={() => setShowPreviewModal(false)}
          processingDocument={processingDocument}
        />
      )}
    </div>
  );
}
