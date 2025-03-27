import { Button } from "@/components/ui/button";
import { Filter, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import * as documentService from "../../services/documentService";
import { useAuthStore } from "../../store/authStore";
import { DocumentList } from "./components/DocumentList";
import { PreviewModal } from "./components/PreviewModal";
import { UploadModal } from "./components/UploadModal";
import type { Document, Property } from "./types";

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
    status: "",
    type: "",
    dateRange: "",
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = [...documents];

    if (filters.status) {
      filtered = filtered.filter((doc) => doc.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter((doc) => doc.type === filters.type);
    }

    if (filters.dateRange) {
      const now = new Date();
      const docDate = (doc: Document) => new Date(doc.created_at);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last90Days = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

      switch (filters.dateRange) {
        case "today":
          filtered = filtered.filter(
            (doc) => docDate(doc).toDateString() === today.toDateString()
          );
          break;
        case "last_7_days":
          filtered = filtered.filter((doc) => docDate(doc) >= last7Days);
          break;
        case "last_30_days":
          filtered = filtered.filter((doc) => docDate(doc) >= last30Days);
          break;
        case "last_90_days":
          filtered = filtered.filter((doc) => docDate(doc) >= last90Days);
          break;
      }
    }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage your required documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="default"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            variant="default"
            size="default"
            className="flex items-center gap-2 bg-[#0F3CD9] hover:bg-[#0F3CD9]/90"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      <h2 className="text-lg font-semibold">Required Documents</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credit Report */}
        <div className="rounded-lg border p-6 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-12 w-12 rounded-lg bg-[#EEF4FF] flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-[#0F3CD9]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="font-medium text-[15px]">Credit Report</h3>
              <p className="text-sm text-muted-foreground mt-1">
                TransUnion credit report with score
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-4"
            onClick={() => {
              setUploadForm((prev) => ({ ...prev, type: "credit_report" }));
              setShowUploadModal(true);
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Criminal Background */}
        <div className="rounded-lg border p-6 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-12 w-12 rounded-lg bg-[#EEF4FF] flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-[#0F3CD9]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L4 7l8 5 8-5-8-5zM4 12l8 5 8-5M4 17l8 5 8-5" />
                </svg>
              </div>
              <h3 className="font-medium text-[15px]">Criminal Background</h3>
              <p className="text-sm text-muted-foreground mt-1">
                National criminal background report
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-4"
            onClick={() => {
              setUploadForm((prev) => ({ ...prev, type: "criminal_report" }));
              setShowUploadModal(true);
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Eviction History */}
        <div className="rounded-lg border p-6 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-12 w-12 rounded-lg bg-[#EEF4FF] flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-[#0F3CD9]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-medium text-[15px]">Eviction History</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Nationwide eviction history report
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-4"
            onClick={() => {
              setUploadForm((prev) => ({ ...prev, type: "eviction_report" }));
              setShowUploadModal(true);
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Income Verification */}
        <div className="rounded-lg border p-6 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-12 w-12 rounded-lg bg-[#EEF4FF] flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-[#0F3CD9]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-[15px]">Income Verification</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Proof of income and employment
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-4"
            onClick={() => {
              setUploadForm((prev) => ({
                ...prev,
                type: "income_verification",
              }));
              setShowUploadModal(true);
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {showFilters && (
                <div className="border-b pb-6 mb-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Status
                      </label>
                      <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Type
                      </label>
                      <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">All Types</option>
                        <option value="credit_report">Credit Report</option>
                        <option value="criminal_report">
                          Criminal Background
                        </option>
                        <option value="eviction_report">
                          Eviction History
                        </option>
                        <option value="income_verification">
                          Income Verification
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Date Range
                      </label>
                      <select
                        name="dateRange"
                        value={filters.dateRange}
                        onChange={handleFilterChange}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">All Time</option>
                        <option value="today">Today</option>
                        <option value="last_7_days">Last 7 Days</option>
                        <option value="last_30_days">Last 30 Days</option>
                        <option value="last_90_days">Last 90 Days</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {documents.length > 0 ? (
                <DocumentList
                  documents={filteredDocuments}
                  loading={loading}
                  onPreview={handlePreview}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  onUpload={() => setShowUploadModal(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-12 w-12 rounded-full bg-[#EEF4FF] flex items-center justify-center">
                    <Upload className="h-6 w-6 text-[#0F3CD9]" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">
                    No documents found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get started by uploading your first document.
                  </p>
                  <Button
                    variant="default"
                    size="default"
                    className="mt-4 bg-[#0F3CD9] hover:bg-[#0F3CD9]/90"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

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
