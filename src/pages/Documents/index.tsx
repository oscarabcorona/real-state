import { ChevronDown, Filter, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { DocumentRequirements } from "./components/DocumentRequirements";
import { DocumentFilters } from "./components/DocumentFilters";
import { DocumentList } from "./components/DocumentList";
import { UploadModal } from "./components/UploadModal";
import { PreviewModal } from "./components/PreviewModal";
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
    filterDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, filters]);

  useEffect(() => {
    if (!showUploadModal) {
      resetUploadForm();
    }
  }, [showUploadModal]);

  const fetchProperties = async () => {
    try {
      const { data: accessData } = await supabase
        .from("tenant_property_access")
        .select("property_id")
        .eq("tenant_user_id", user?.id);

      if (accessData && accessData.length > 0) {
        const propertyIds = accessData.map((a) => a.property_id);
        const { data } = await supabase
          .from("properties")
          .select("id, name")
          .in("id", propertyIds);
        setProperties(data || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only PDF and Word documents are allowed");
    }

    if (file.size > maxSize) {
      throw new Error("File size must be less than 10MB");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(false);
    const file = e.target.files?.[0];
    if (file) {
      try {
        validateFile(file);
        setUploadForm((prev) => ({ ...prev, file }));
        if (!uploadForm.title) {
          setUploadForm((prev) => ({
            ...prev,
            file,
            title: file.name.split(".")[0],
          }));
        }
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Invalid file");
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
      const fileExt = uploadForm.file.name.split(".").pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from("tenant_documents")
        .upload(filePath, uploadForm.file);

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      setUploadProgress(100);

      const { error: dbError } = await supabase.from("documents").insert([
        {
          user_id: user.id,
          type: uploadForm.type,
          title: uploadForm.title || uploadForm.file.name.split(".")[0],
          file_path: filePath,
          status: "pending",
          verified: false,
          property_id: uploadForm.property_id || null,
        },
      ]);

      if (dbError) throw dbError;

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

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select(
          `
          *,
          property:property_id (
            name
          )
        `
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
      setFilteredDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    if (filters.type) {
      filtered = filtered.filter((doc) => doc.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter((doc) => doc.status === filters.status);
    }

    if (filters.dateRange) {
      const now = new Date();
      const past = new Date();
      switch (filters.dateRange) {
        case "7days":
          past.setDate(now.getDate() - 7);
          break;
        case "30days":
          past.setDate(now.getDate() - 30);
          break;
        case "90days":
          past.setDate(now.getDate() - 90);
          break;
      }
      filtered = filtered.filter((doc) => new Date(doc.created_at) >= past);
    }

    if (filters.verified) {
      filtered = filtered.filter((doc) =>
        filters.verified === "verified" ? doc.verified : !doc.verified
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const { error: storageError } = await supabase.storage
        .from("tenant_documents")
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("tenant_documents")
        .download(filePath);

      if (error) throw error;

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
      const { error } = await supabase
        .from("documents")
        .update({
          status: "signed",
          verified: true,
          verification_date: new Date().toISOString(),
          notes: verificationNote || "Document verified",
        })
        .eq("id", document.id);

      if (error) throw error;
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
      const { error } = await supabase
        .from("documents")
        .update({
          status: "rejected",
          verified: false,
          rejection_reason: rejectionReason,
          notes: `Rejected: ${rejectionReason}`,
        })
        .eq("id", document.id);

      if (error) throw error;
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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {Object.values(filters).some((v) => v) && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {Object.values(filters).filter((v) => v).length}
                  </span>
                )}
                <ChevronDown
                  className={`ml-2 h-4 w-4 transition-transform ${
                    showFilters ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Document Requirements */}
          <DocumentRequirements
            documents={documents}
            onUpload={handleSetDocumentType}
          />

          {/* Filters */}
          <DocumentFilters
            filters={filters}
            onFilterChange={setFilters}
            visible={showFilters}
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
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadModal
          uploadForm={uploadForm}
          onFormChange={setUploadForm}
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
