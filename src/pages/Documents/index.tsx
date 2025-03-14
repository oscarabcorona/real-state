import {
  AlertCircle,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { DOCUMENT_REQUIREMENTS } from "./const";
import type { Document, Property } from "./types";
import { FileUploadInput } from "./FileUploadInput";

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

  const getStatusIcon = (status: string, verified: boolean) => {
    if (verified) return <CheckCircle className="h-5 w-5 text-green-500" />;

    switch (status) {
      case "signed":
        return <Check className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusClass = (status: string, verified: boolean) => {
    if (verified) return "bg-green-100 text-green-800";

    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status: string, verified: boolean) => {
    if (verified) return "Verified";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const PreviewModal = () => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Document Preview</h3>
          <button
            onClick={() => setShowPreviewModal(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {selectedDocument && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  <dd className="text-sm text-gray-900">
                    {selectedDocument.title}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="text-sm text-gray-900">
                    {selectedDocument.type
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                        selectedDocument.status,
                        selectedDocument.verified
                      )}`}
                    >
                      {getStatusText(
                        selectedDocument.status,
                        selectedDocument.verified
                      )}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Uploaded
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(selectedDocument.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Property
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {selectedDocument.property?.name}
                  </dd>
                </div>
                {selectedDocument.verification_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Verified On
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(
                        selectedDocument.verification_date
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {selectedDocument.rejection_reason && (
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Rejection Reason
                    </dt>
                    <dd className="text-sm text-red-600">
                      {selectedDocument.rejection_reason}
                    </dd>
                  </div>
                )}
                {selectedDocument.notes && (
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedDocument.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {selectedDocument.status === "pending" && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Verification Notes
                  </label>
                  <textarea
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Add any notes about the verification..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleVerifyDocument(selectedDocument)}
                    disabled={processingDocument}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt(
                        "Please provide a reason for rejection:"
                      );
                      if (reason) {
                        setRejectionReason(reason);
                        handleRejectDocument(selectedDocument);
                      }
                    }}
                    disabled={processingDocument}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  handleDownload(
                    selectedDocument.file_path,
                    `${selectedDocument.title || selectedDocument.type}.pdf`
                  )
                }
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
              <button
                onClick={() =>
                  handleDelete(selectedDocument.id, selectedDocument.file_path)
                }
                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const UploadModal = () => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Upload Document</h3>
          <button
            onClick={() => setShowUploadModal(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Document Type
            </label>
            <select
              value={uploadForm.type}
              onChange={(e) =>
                setUploadForm((prev) => ({
                  ...prev,
                  type: e.target.value as Document["type"],
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              {DOCUMENT_REQUIREMENTS.map((req) => (
                <option key={req.type} value={req.type}>
                  {req.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) =>
                setUploadForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Document title"
            />
          </div>

          <FileUploadInput
            onChange={handleFileChange}
            disabled={uploading}
            selectedFile={uploadForm.file}
          />

          {uploadError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {uploadError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Document uploaded successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {(uploading || uploadProgress > 0) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Upload progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !uploadForm.file || uploadSuccess}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Uploaded
              </>
            ) : (
              "Upload Document"
            )}
          </button>
        </form>
      </div>
    </div>
  );

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
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Required Documents
            </h2>
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DOCUMENT_REQUIREMENTS.map((req) => {
                const doc = documents.find((d) => d.type === req.type);
                const isComplete = doc?.verified;
                const isPending = doc?.status === "pending";

                return (
                  <div
                    key={req.type}
                    className={`p-4 rounded-lg border ${
                      isComplete
                        ? "bg-green-50 border-green-200"
                        : isPending
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-2 rounded-lg ${
                          isComplete
                            ? "bg-green-100"
                            : isPending
                            ? "bg-yellow-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {req.icon}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {req.label}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {req.description}
                        </p>
                        <div className="mt-2">
                          {isComplete ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setUploadForm((prev) => ({
                                  ...prev,
                                  type: req.type,
                                }));
                                setShowUploadModal(true);
                              }}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Upload
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {showFilters && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="signed">Signed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Document Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">All Types</option>
                    {DOCUMENT_REQUIREMENTS.map((req) => (
                      <option key={req.type} value={req.type}>
                        {req.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">All Time</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Verification
                  </label>
                  <select
                    value={filters.verified}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        verified: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">All Documents</option>
                    <option value="verified">Verified Only</option>
                    <option value="unverified">Unverified Only</option>
                  </select>
                </div>
              </div>

              {Object.values(filters).some((v) => v) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() =>
                      setFilters({
                        type: "",
                        status: "",
                        dateRange: "",
                        verified: "",
                      })
                    }
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No documents
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading a document.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.title ||
                          doc.type
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{doc.property?.name}</span>
                        <span className="mx-2">•</span>
                        <span>
                          Uploaded on{" "}
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                        {doc.verification_date && (
                          <>
                            <span className="mx-2">•</span>
                            <span>
                              Verified on{" "}
                              {new Date(
                                doc.verification_date
                              ).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                        doc.status,
                        doc.verified
                      )}`}
                    >
                      {getStatusIcon(doc.status, doc.verified)}
                      <span className="ml-1">
                        {getStatusText(doc.status, doc.verified)}
                      </span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="text-gray-400 hover:text-gray-500"
                        title="Preview"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(
                            doc.file_path,
                            `${doc.title || doc.type}.pdf`
                          )
                        }
                        className="text-gray-400 hover:text-gray-500"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.file_path)}
                        className="text-gray-400 hover:text-gray-500"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showUploadModal && <UploadModal />}
      {showPreviewModal && selectedDocument && <PreviewModal />}
    </div>
  );
}
