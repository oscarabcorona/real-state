import { supabase } from "../lib/supabase";
import { Document, DocumentFilters } from "@/pages/Documents/types";

interface UploadDocumentData {
  userId: string;
  title: string;
  type: Document["type"];
  file: File;
  propertyId?: string;
}

// Helper function to validate and convert document types
function validateDocumentType(type: string): Document["type"] {
  const validTypes: Record<string, Document["type"]> = {
    "credit_report": "credit_report",
    "income_verification": "income_verification", 
    "criminal_report": "criminal_report",
    "eviction_report": "eviction_report",
    "id_document": "id_document",
  };

  return validTypes[type] || "other";
}

/**
 * Fetch all documents for a specific user
 */
export async function fetchUserDocuments(userId: string): Promise<Document[]> {
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
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Transform the data to ensure it matches the Document type
    return (data || []).map(doc => ({
      ...doc,
      // Validate and convert the document type to ensure it's a valid enum value
      type: validateDocumentType(doc.type),
      // Ensure status is one of the valid enum values
      status: (doc.status || "pending") as Document["status"],
      // Handle nullable fields
      created_at: doc.created_at || new Date().toISOString(),
      updated_at: doc.updated_at,
      verified: doc.verified || false,
    })) as Document[];
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
}

/**
 * Fetch properties that a tenant has access to
 */
export async function fetchTenantProperties(userId: string) {
  // Use the utility service function instead
  return await import("./utilityService").then(util => util.fetchTenantProperties(userId));
}

/**
 * Upload a document to storage and create a database record
 */
export async function uploadDocument(
  documentData: UploadDocumentData,
  onProgressUpdate?: (progress: number) => void
): Promise<Document> {
  const { userId, title, type, file, propertyId } = documentData;

  try {
    // Generate a unique file path
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from("tenant_documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // If progress callback is provided, set to 100% on successful upload
    if (onProgressUpdate) {
      onProgressUpdate(100);
    }

    // Create document record in database
    const { data, error: dbError } = await supabase.from("documents").insert([
      {
        user_id: userId,
        type: type,
        title: title || file.name.split(".")[0],
        file_path: filePath,
        status: "pending",
        verified: false,
        property_id: propertyId || null,
      },
    ]).select().single();

    if (dbError) throw dbError;
    if (!data) throw new Error("Failed to create document record");

    return {
      ...data,
      type: validateDocumentType(data.type),
      status: (data.status || "pending") as Document["status"],
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at,
      verified: data.verified || false,
    } as Document;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

/**
 * Update a document's data
 */
export async function updateDocument(
  id: string,
  updates: Partial<Document>
): Promise<void> {
  try {
    const { error } = await supabase
      .from("documents")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
}

/**
 * Delete a document from storage and database
 */
export async function deleteDocument(id: string, filePath: string): Promise<void> {
  try {
    // Remove from storage
    const { error: storageError } = await supabase.storage
      .from("tenant_documents")
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

/**
 * Download a document from storage
 */
export async function downloadDocument(filePath: string): Promise<Blob> {
  try {
    const { data, error } = await supabase.storage
      .from("tenant_documents")
      .download(filePath);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error downloading document:", error);
    throw error;
  }
}

/**
 * Verify a document
 */
export async function verifyDocument(id: string, notes: string = ""): Promise<void> {
  try {
    const { error } = await supabase
      .from("documents")
      .update({
        status: "signed",
        verified: true,
        verification_date: new Date().toISOString(),
        notes: notes || "Document verified",
      })
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error verifying document:", error);
    throw error;
  }
}

/**
 * Reject a document
 */
export async function rejectDocument(id: string, reason: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("documents")
      .update({
        status: "rejected",
        verified: false,
        rejection_reason: reason,
        notes: `Rejected: ${reason}`,
      })
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error rejecting document:", error);
    throw error;
  }
}

/**
 * Filter documents based on criteria
 */
export function filterDocuments(documents: Document[], filters: DocumentFilters): Document[] {
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

  return filtered;
}

/**
 * Validate a document file
 */
export function validateDocumentFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only PDF and Word documents are allowed" };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" };
  }

  return { valid: true };
}
