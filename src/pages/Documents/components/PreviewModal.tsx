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
import { AlertCircle, CheckCircle, Download, Trash2 } from "lucide-react";
import React from "react";
import { Document } from "../types";
import { StatusIndicator } from "../status-indicator";

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
}) => {
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
                <StatusIndicator
                  status={document.status}
                  verified={document.verified}
                />
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
          </dl>
        </Card>

        {document.status === "pending" && (
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

        <Separator className="my-4" />

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
          <Button
            variant="destructive"
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to delete this document? This action cannot be undone."
                )
              ) {
                onDelete(document.id, document.file_path);
              }
            }}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
