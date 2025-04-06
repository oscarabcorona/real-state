import { supabase } from "../lib/supabase";
import { Document, DocumentFilters, Country } from "@/pages/Documents/types";

interface UploadDocumentData {
  userId: string;
  title: string;
  type: Document["type"];
  file: File;
  propertyId?: string;
  country?: Country;
}

// Helper function to validate and convert document types
function validateDocumentType(type: string): Document["type"] {
  const validTypes: Record<string, Document["type"]> = {
    "credit_report": "credit_report",
    "criminal_report": "criminal_report",
    "eviction_report": "eviction_report",
    "income_verification": "income_verification",
    "id_document": "government_id",
    "government_id": "government_id",
    "lease": "lease",
    "other": "other",
    "bank_statements": "bank_statements",
    "employment_letter": "employment_letter"
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
  const { userId, title, type, file, propertyId, country } = documentData;

  try {
    // Generate a unique file path
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Check if this document type needs OCR processing
    const supportedOcrTypes = [
      "government_id", 
      "credit_report", 
      "income_verification", 
      "criminal_report", 
      "eviction_report", 
      "lease", 
      "bank_statements", 
      "employment_letter"
    ];
    const needsOcr = supportedOcrTypes.includes(type);
    
    // Progress stages (percentage-based):
    // - File upload: 0-60%
    // - Database record: 60-75%
    // - OCR processing (if needed): 75-100%
    // - If no OCR: 75-100% is quick completion

    // Simulate progress updates since Supabase doesn't provide upload progress
    let progressInterval: ReturnType<typeof setInterval> | null = null;
    let lastReportedProgress = 0;
    
    if (onProgressUpdate) {
      // Start with 5% to show immediate feedback
      onProgressUpdate(5);
      lastReportedProgress = 5;
      
      let currentProgress = 5;
      progressInterval = setInterval(() => {
        // Simulate progress up to 60%, the rest will be for database and OCR
        if (currentProgress < 60) {
          // Move faster at the beginning, slower as we approach 60%
          const increment = Math.max(1, Math.floor((60 - currentProgress) / 10));
          currentProgress += increment;
          
          // Only update if progress changed to avoid unnecessary renders
          if (currentProgress > lastReportedProgress) {
            lastReportedProgress = currentProgress;
            onProgressUpdate(currentProgress);
          }
        }
      }, 300);
    }

    try {
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("tenant_documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;
    } finally {
      // Clear progress interval regardless of success/failure
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }

    // Update to 65% after storage upload, before database operations
    if (onProgressUpdate && lastReportedProgress < 65) {
      lastReportedProgress = 65;
      onProgressUpdate(65);
      
      // Small delay to ensure UI has time to update
      await new Promise(resolve => setTimeout(resolve, 200));
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
        ocr_status: needsOcr ? "pending" : "completed",
        country: country || null,
      },
    ]).select().single();

    if (dbError) throw dbError;
    if (!data) throw new Error("Failed to create document record");

    // After database record is created, update to 75%
    if (onProgressUpdate && lastReportedProgress < 75) {
      lastReportedProgress = 75;
      onProgressUpdate(75);
      
      // Small delay to ensure UI has time to update
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const resultDocument = {
      ...data,
      type: validateDocumentType(data.type),
      status: (data.status || "pending") as Document["status"],
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at,
      verified: data.verified || false,
    } as Document;

    // Handle OCR for supported document types
    if (needsOcr) {
      // Start OCR progress simulation (75% to 95%)
      if (onProgressUpdate) {
        let ocrProgress = 75;
        progressInterval = setInterval(() => {
          if (ocrProgress < 95) {
            const increment = Math.max(1, Math.floor((95 - ocrProgress) / 10));
            ocrProgress += increment;
            
            if (ocrProgress > lastReportedProgress) {
              lastReportedProgress = ocrProgress;
              onProgressUpdate(ocrProgress);
            }
          }
        }, 400);
      }

      try {
        // Map document types to OCR document types
        const documentTypeMap: Record<string, string> = {
          "government_id": "id_document",
          "credit_report": "credit_report",
          "income_verification": "income_verification",
          "criminal_report": "criminal_report",
          "eviction_report": "eviction_report",
          "lease": "lease",
          "bank_statements": "bank_statements",
          "employment_letter": "employment_letter"
        };
        
        const documentType = documentTypeMap[type] || type;
        
        console.log(`Invoking OCR function for ${type} with filePath:`, filePath);
        
        const { error: ocrError } = await supabase.functions.invoke('ocr', {
          body: {
            filePath: filePath,
            documentType: documentType,
            country: country,
            options: {
              temperature: 0,
              maxTokens: 1024
            }
          }
        });

        if (ocrError) {
          console.error("OCR processing error:", ocrError);
          // Update document with error status
          await supabase
            .from('documents')
            .update({
              ocr_status: 'failed',
              ocr_error: ocrError.message || 'Failed to process document',
              ocr_completed_at: new Date().toISOString()
            })
            .eq('file_path', filePath);
            
          resultDocument.ocr_status = 'failed';
          resultDocument.ocr_error = ocrError.message || 'Failed to process document';
        } else {
          // Update document status to reflect successful OCR processing
          resultDocument.ocr_status = 'completed';
        }
      } catch (ocrError) {
        console.error("Failed to invoke OCR function:", ocrError);
        // Update document with error status
        await supabase
          .from('documents')
          .update({
            ocr_status: 'failed',
            ocr_error: ocrError instanceof Error ? ocrError.message : 'Failed to process document',
            ocr_completed_at: new Date().toISOString()
          })
          .eq('file_path', filePath);
          
        resultDocument.ocr_status = 'failed';
        resultDocument.ocr_error = ocrError instanceof Error ? ocrError.message : 'Failed to process document';
      } finally {
        // Clear OCR progress interval
        if (progressInterval) {
          clearInterval(progressInterval);
        }
      }
    }

    // Complete the process at 100%
    if (onProgressUpdate && lastReportedProgress < 100) {
      onProgressUpdate(100);
    }

    return resultDocument;
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

  if (filters.type && filters.type !== "all") {
    filtered = filtered.filter((doc) => doc.type === filters.type);
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((doc) => doc.status === filters.status);
  }

  if (filters.dateRange && filters.dateRange !== "all") {
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

  if (filters.verified && filters.verified !== "all") {
    filtered = filtered.filter((doc) =>
      filters.verified === "verified" ? doc.status === "verified" : doc.status !== "verified"
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
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heic",
    "image/heif"
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only PDF, Word documents, and common image formats are allowed" };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" };
  }

  return { valid: true };
}

/**
 * Upload a document and process it with OCR if it's a government ID or credit report
 */
export async function uploadAndProcessDocument(
  file: File,
  userId: string,
  type: Document["type"] = "government_id",
  country?: Country
): Promise<Document> {
  try {
    // 1. Upload the file to storage
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("tenant_documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Create document record
    const { data: document, error: dbError } = await supabase
      .from("documents")
      .insert([
        {
          user_id: userId,
          type: type,
          title: file.name.split(".")[0],
          file_path: filePath,
          status: "pending",
          verified: false,
          ocr_status: "pending",
          country: country || null,
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;
    if (!document) throw new Error("Failed to create document record");

    // 3. Process with OCR for supported document types
    const supportedOcrTypes = [
      "government_id", 
      "credit_report", 
      "income_verification", 
      "criminal_report", 
      "eviction_report", 
      "lease", 
      "bank_statements", 
      "employment_letter"
    ];
    
    if (supportedOcrTypes.includes(type)) {
      try {
        // Add a small delay to ensure the document is fully uploaded
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(`Invoking OCR function for ${type} with filePath:`, filePath);
        
        // Map document types to OCR document types
        const documentTypeMap: Record<string, string> = {
          "government_id": "id_document",
          "credit_report": "credit_report",
          "income_verification": "income_verification",
          "criminal_report": "criminal_report",
          "eviction_report": "eviction_report",
          "lease": "lease",
          "bank_statements": "bank_statements",
          "employment_letter": "employment_letter"
        };
        
        const documentType = documentTypeMap[type] || type;
        
        const { error: ocrError } = await supabase.functions.invoke('ocr', {
          body: {
            filePath: filePath,
            documentType: documentType,
            country: country,
            options: {
              temperature: 0,
              maxTokens: 1024
            }
          }
        });

        if (ocrError) {
          console.error("OCR processing error:", ocrError);
          // Update document with error status
          await supabase
            .from('documents')
            .update({
              ocr_status: 'failed',
              ocr_error: ocrError.message || 'Failed to process document',
              ocr_completed_at: new Date().toISOString()
            })
            .eq('file_path', filePath);
        }
      } catch (ocrError) {
        console.error("Failed to invoke OCR function:", ocrError);
        // Update document with error status
        await supabase
          .from('documents')
          .update({
            ocr_status: 'failed',
            ocr_error: ocrError instanceof Error ? ocrError.message : 'Failed to process document',
            ocr_completed_at: new Date().toISOString()
          })
          .eq('file_path', filePath);
      }
    }

    return document as Document;
  } catch (error) {
    console.error("Error uploading and processing document:", error);
    throw error;
  }
}
