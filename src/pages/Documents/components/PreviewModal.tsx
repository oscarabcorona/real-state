import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  Download,
  Loader2,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { Document } from "../types";
import { StatusIndicator } from "../status-indicator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PreviewModalProps {
  document: Document;
  verificationNote: string;
  rejectionReason: string;
  onVerificationNoteChange: (note: string) => void;
  onVerify: (document: Document) => void;
  onReject: (document: Document) => void;
  onDownload: (filePath: string, fileName: string) => void;
  onDelete: (id: string, filePath: string) => void;
  onClose: () => void;
  processingDocument: boolean;
  isTenant: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  document,
  verificationNote,
  onVerificationNoteChange,
  onVerify,
  onReject,
  onDownload,
  onDelete,
  onClose,
  processingDocument,
  isTenant,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(document.id, document.file_path);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Document Preview</DialogTitle>
        </DialogHeader>

        <Card className="p-4 mb-4 border-dashed">
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Title</dt>
              <dd className="text-sm text-gray-900 font-medium">
                {document.title}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="text-sm text-gray-900">
                {document.type
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Status
              </dt>
              <dd>
                <StatusIndicator status={document.status} />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Uploaded</dt>
              <dd className="text-sm text-gray-900">
                {new Date(document.created_at).toLocaleDateString()} at{" "}
                {new Date(document.created_at).toLocaleTimeString()}
              </dd>
            </div>
            {document.property?.name && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Property</dt>
                <dd className="text-sm text-gray-900 font-medium">
                  {document.property.name}
                </dd>
              </div>
            )}
            {document.verification_date && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Verified On
                </dt>
                <dd className="text-sm text-green-700">
                  {new Date(document.verification_date).toLocaleDateString()} at{" "}
                  {new Date(document.verification_date).toLocaleTimeString()}
                </dd>
              </div>
            )}
            {document.rejection_reason && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Rejection Reason
                </dt>
                <dd className="text-sm text-red-600 bg-red-50 p-2 rounded mt-1">
                  {document.rejection_reason}
                </dd>
              </div>
            )}
            {document.notes && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="text-sm text-gray-900 bg-muted p-2 rounded mt-1">
                  {document.notes}
                </dd>
              </div>
            )}
            {document.ocr_status && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  OCR Status
                </dt>
                <dd className="text-sm">
                  {document.ocr_status === "pending" && (
                    <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                      Processing...
                    </span>
                  )}
                  {document.ocr_status === "completed" && (
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                      Completed
                    </span>
                  )}
                  {document.ocr_status === "failed" && (
                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                      Failed
                    </span>
                  )}
                </dd>
              </div>
            )}
            {document.ocr_error && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">OCR Error</dt>
                <dd className="text-sm text-red-600 bg-red-50 p-2 rounded mt-1">
                  {document.ocr_error}
                </dd>
              </div>
            )}
            {document.ocr_results && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  OCR Results
                </dt>
                <dd className="text-sm bg-muted p-2 rounded mt-1 space-y-2">
                  {document.ocr_results.document_type && (
                    <div>
                      <span className="font-medium">Document Type:</span>{" "}
                      {document.ocr_results.document_type}
                    </div>
                  )}
                  {document.ocr_results.full_name && (
                    <div>
                      <span className="font-medium">Full Name:</span>{" "}
                      {document.ocr_results.full_name}
                    </div>
                  )}
                  {document.ocr_results.date_of_birth && (
                    <div>
                      <span className="font-medium">Date of Birth:</span>{" "}
                      {document.ocr_results.date_of_birth}
                    </div>
                  )}
                  {document.ocr_results.document_number && (
                    <div>
                      <span className="font-medium">Document Number:</span>{" "}
                      {document.ocr_results.document_number}
                    </div>
                  )}
                  {document.ocr_results.expiration_date && (
                    <div>
                      <span className="font-medium">Expiration Date:</span>{" "}
                      {document.ocr_results.expiration_date}
                    </div>
                  )}
                  {document.ocr_results.address && (
                    <div>
                      <span className="font-medium">Address:</span>{" "}
                      {[
                        document.ocr_results.address.street,
                        document.ocr_results.address.city,
                        document.ocr_results.address.state,
                        document.ocr_results.address.zip_code,
                        document.ocr_results.address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                  {document.ocr_results.is_valid !== undefined && (
                    <div>
                      <span className="font-medium">Valid Document:</span>{" "}
                      {document.ocr_results.is_valid ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </div>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {!isTenant && document.status === "pending" && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div>
                <label
                  className="text-sm font-medium block mb-1"
                  htmlFor="notes"
                >
                  Verification Notes
                </label>
                <Textarea
                  id="notes"
                  value={verificationNote}
                  onChange={(e) => onVerificationNoteChange(e.target.value)}
                  placeholder="Add any notes about the verification..."
                  className="resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => onVerify(document)}
                  disabled={processingDocument}
                >
                  {processingDocument ? (
                    <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Verify Document
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => onReject(document)}
                  disabled={processingDocument}
                >
                  {processingDocument ? (
                    <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject Document
                </Button>
              </div>
            </div>
          </>
        )}

        {!isTenant && <Separator className="my-4" />}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() =>
              onDownload(
                document.file_path,
                `${document.title || document.type}.pdf`
              )
            }
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          {!isTenant && (
            <>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this document? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
