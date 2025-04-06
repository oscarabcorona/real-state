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
import {
  Document,
  isIdDocumentOcrResult,
  isCreditReportOcrResult,
  isIncomeVerificationOcrResult,
  isCriminalReportOcrResult,
  isEvictionReportOcrResult,
  isLeaseOcrResult,
  isBankStatementOcrResult,
  isEmploymentLetterOcrResult,
} from "../types";
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

                  {/* Display fields based on OCR result type */}
                  {isCreditReportOcrResult(document.ocr_results) ? (
                    // Credit Report fields
                    <>
                      {document.ocr_results.report_date && (
                        <div>
                          <span className="font-medium">Report Date:</span>{" "}
                          {document.ocr_results.report_date}
                        </div>
                      )}
                      {document.ocr_results.personal_info?.full_name && (
                        <div>
                          <span className="font-medium">Full Name:</span>{" "}
                          {document.ocr_results.personal_info.full_name}
                        </div>
                      )}
                      {document.ocr_results.personal_info?.social_security && (
                        <div>
                          <span className="font-medium">SSN:</span>{" "}
                          {document.ocr_results.personal_info.social_security}
                        </div>
                      )}
                      {document.ocr_results.credit_score?.score && (
                        <div>
                          <span className="font-medium">Credit Score:</span>{" "}
                          <span className="font-bold">
                            {document.ocr_results.credit_score.score}
                          </span>
                          {document.ocr_results.credit_score.score_type && (
                            <span className="ml-1 text-muted-foreground">
                              ({document.ocr_results.credit_score.score_type})
                            </span>
                          )}
                          {document.ocr_results.credit_score.score_range && (
                            <span className="ml-1 text-muted-foreground">
                              Range:{" "}
                              {document.ocr_results.credit_score.score_range}
                            </span>
                          )}
                        </div>
                      )}
                      {document.ocr_results.accounts && (
                        <div>
                          <span className="font-medium">Accounts:</span>{" "}
                          <div className="pl-4 mt-1">
                            <div>
                              Total:{" "}
                              {document.ocr_results.accounts.total_accounts ||
                                "N/A"}
                            </div>
                            <div>
                              In Good Standing:{" "}
                              {document.ocr_results.accounts
                                .accounts_in_good_standing || "N/A"}
                            </div>
                            <div>
                              Delinquent:{" "}
                              {document.ocr_results.accounts
                                .delinquent_accounts || "N/A"}
                            </div>
                          </div>
                        </div>
                      )}
                      {document.ocr_results.payment_history && (
                        <div>
                          <span className="font-medium">Payment History:</span>{" "}
                          <div className="pl-4 mt-1">
                            <div>
                              On-time Payments:{" "}
                              {document.ocr_results.payment_history
                                .on_time_payments_percentage || "N/A"}
                            </div>
                            <div>
                              Late Payments:{" "}
                              {document.ocr_results.payment_history
                                .late_payments || "N/A"}
                            </div>
                          </div>
                        </div>
                      )}
                      {document.ocr_results.derogatory_marks && (
                        <div>
                          <span className="font-medium">Derogatory Marks:</span>{" "}
                          <div className="pl-4 mt-1">
                            <div>
                              Collections:{" "}
                              {document.ocr_results.derogatory_marks
                                .collections || "N/A"}
                            </div>
                            <div>
                              Public Records:{" "}
                              {document.ocr_results.derogatory_marks
                                .public_records || "N/A"}
                            </div>
                            <div>
                              Bankruptcies:{" "}
                              {document.ocr_results.derogatory_marks
                                .bankruptcies || "N/A"}
                            </div>
                          </div>
                        </div>
                      )}
                      {document.ocr_results.credit_utilization && (
                        <div>
                          <span className="font-medium">
                            Credit Utilization:
                          </span>{" "}
                          {document.ocr_results.credit_utilization}
                        </div>
                      )}
                      {document.ocr_results.inquiries && (
                        <div>
                          <span className="font-medium">Recent Inquiries:</span>{" "}
                          {document.ocr_results.inquiries}
                        </div>
                      )}
                    </>
                  ) : isIdDocumentOcrResult(document.ocr_results) ? (
                    // ID Document fields
                    <>
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
                    </>
                  ) : isIncomeVerificationOcrResult(document.ocr_results) ? (
                    // Income Verification fields
                    <>
                      {document.ocr_results.employer_name && (
                        <div>
                          <span className="font-medium">Employer:</span>{" "}
                          {document.ocr_results.employer_name}
                        </div>
                      )}
                      {document.ocr_results.position && (
                        <div>
                          <span className="font-medium">Position:</span>{" "}
                          {document.ocr_results.position}
                        </div>
                      )}
                      {document.ocr_results.employment_status && (
                        <div>
                          <span className="font-medium">Status:</span>{" "}
                          {document.ocr_results.employment_status}
                        </div>
                      )}
                      {document.ocr_results.start_date && (
                        <div>
                          <span className="font-medium">Start Date:</span>{" "}
                          {document.ocr_results.start_date}
                        </div>
                      )}
                      {document.ocr_results.salary && (
                        <div>
                          <span className="font-medium">Salary:</span>{" "}
                          {document.ocr_results.salary.amount}{" "}
                          {document.ocr_results.salary.currency}{" "}
                          {document.ocr_results.salary.frequency}
                        </div>
                      )}
                      {document.ocr_results.documentation_type && (
                        <div>
                          <span className="font-medium">Documentation:</span>{" "}
                          {document.ocr_results.documentation_type}
                        </div>
                      )}
                    </>
                  ) : isCriminalReportOcrResult(document.ocr_results) ? (
                    // Criminal Report fields
                    <>
                      {document.ocr_results.report_date && (
                        <div>
                          <span className="font-medium">Report Date:</span>{" "}
                          {document.ocr_results.report_date}
                        </div>
                      )}
                      {document.ocr_results.personal_info?.full_name && (
                        <div>
                          <span className="font-medium">Full Name:</span>{" "}
                          {document.ocr_results.personal_info.full_name}
                        </div>
                      )}
                      {document.ocr_results.records_found !== undefined && (
                        <div>
                          <span className="font-medium">Records Found:</span>{" "}
                          {document.ocr_results.records_found ? "Yes" : "No"}
                        </div>
                      )}
                      {document.ocr_results.record_count && (
                        <div>
                          <span className="font-medium">Record Count:</span>{" "}
                          {document.ocr_results.record_count}
                        </div>
                      )}
                      {document.ocr_results.conviction_details &&
                        document.ocr_results.conviction_details.length > 0 && (
                          <div>
                            <span className="font-medium">Convictions:</span>
                            <ul className="pl-4 mt-1 list-disc list-inside">
                              {document.ocr_results.conviction_details.map(
                                (conviction, idx) => (
                                  <li key={idx} className="mt-1">
                                    <span className="font-medium">
                                      {conviction.offense}
                                    </span>{" "}
                                    ({conviction.offense_type}) -{" "}
                                    {conviction.disposition}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </>
                  ) : isEvictionReportOcrResult(document.ocr_results) ? (
                    // Eviction Report fields
                    <>
                      {document.ocr_results.report_date && (
                        <div>
                          <span className="font-medium">Report Date:</span>{" "}
                          {document.ocr_results.report_date}
                        </div>
                      )}
                      {document.ocr_results.personal_info?.full_name && (
                        <div>
                          <span className="font-medium">Full Name:</span>{" "}
                          {document.ocr_results.personal_info.full_name}
                        </div>
                      )}
                      {document.ocr_results.records_found !== undefined && (
                        <div>
                          <span className="font-medium">Records Found:</span>{" "}
                          {document.ocr_results.records_found ? "Yes" : "No"}
                        </div>
                      )}
                      {document.ocr_results.eviction_count && (
                        <div>
                          <span className="font-medium">Total Evictions:</span>{" "}
                          {document.ocr_results.eviction_count}
                        </div>
                      )}
                      {document.ocr_results.eviction_details &&
                        document.ocr_results.eviction_details.length > 0 && (
                          <div>
                            <span className="font-medium">
                              Eviction History:
                            </span>
                            <ul className="pl-4 mt-1 list-disc list-inside">
                              {document.ocr_results.eviction_details.map(
                                (eviction, idx) => (
                                  <li key={idx} className="mt-1">
                                    <div>
                                      <span className="font-medium">
                                        {eviction.filing_date}
                                      </span>{" "}
                                      - {eviction.address}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {eviction.disposition} ($
                                      {eviction.judgment_amount})
                                    </div>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </>
                  ) : isLeaseOcrResult(document.ocr_results) ? (
                    // Lease fields
                    <>
                      {document.ocr_results.property_address && (
                        <div>
                          <span className="font-medium">Property:</span>{" "}
                          {document.ocr_results.property_address}
                        </div>
                      )}
                      {document.ocr_results.lease_term && (
                        <div>
                          <span className="font-medium">Lease Term:</span>{" "}
                          {document.ocr_results.lease_term.start_date} to{" "}
                          {document.ocr_results.lease_term.end_date} (
                          {document.ocr_results.lease_term.term_length})
                        </div>
                      )}
                      {document.ocr_results.rent_details && (
                        <div>
                          <span className="font-medium">Rent:</span>{" "}
                          {document.ocr_results.rent_details.amount}{" "}
                          {document.ocr_results.rent_details.currency}{" "}
                          {document.ocr_results.rent_details.frequency}
                        </div>
                      )}
                      {document.ocr_results.security_deposit && (
                        <div>
                          <span className="font-medium">Security Deposit:</span>{" "}
                          {document.ocr_results.security_deposit}
                        </div>
                      )}
                      {document.ocr_results.landlord_info && (
                        <div>
                          <span className="font-medium">Landlord:</span>{" "}
                          {document.ocr_results.landlord_info.name} (
                          {document.ocr_results.landlord_info.company})
                        </div>
                      )}
                      {document.ocr_results.is_signed !== undefined && (
                        <div>
                          <span className="font-medium">Signed:</span>{" "}
                          {document.ocr_results.is_signed ? (
                            <span className="text-green-600">Yes</span>
                          ) : (
                            <span className="text-red-600">No</span>
                          )}
                        </div>
                      )}
                    </>
                  ) : isBankStatementOcrResult(document.ocr_results) ? (
                    // Bank Statement fields (Guatemala)
                    <>
                      {document.ocr_results.bank_name && (
                        <div>
                          <span className="font-medium">Bank:</span>{" "}
                          {document.ocr_results.bank_name}
                        </div>
                      )}
                      {document.ocr_results.account_holder && (
                        <div>
                          <span className="font-medium">Account Holder:</span>{" "}
                          {document.ocr_results.account_holder}
                        </div>
                      )}
                      {document.ocr_results.account_number && (
                        <div>
                          <span className="font-medium">Account Number:</span>{" "}
                          {document.ocr_results.account_number}
                        </div>
                      )}
                      {document.ocr_results.statement_period && (
                        <div>
                          <span className="font-medium">Period:</span>{" "}
                          {document.ocr_results.statement_period.start_date} to{" "}
                          {document.ocr_results.statement_period.end_date}
                        </div>
                      )}
                      {document.ocr_results.opening_balance && (
                        <div>
                          <span className="font-medium">Opening Balance:</span>{" "}
                          {document.ocr_results.opening_balance}{" "}
                          {document.ocr_results.currency}
                        </div>
                      )}
                      {document.ocr_results.closing_balance && (
                        <div>
                          <span className="font-medium">Closing Balance:</span>{" "}
                          {document.ocr_results.closing_balance}{" "}
                          {document.ocr_results.currency}
                        </div>
                      )}
                      {document.ocr_results.transactions && (
                        <div>
                          <span className="font-medium">Transactions:</span>
                          <div className="pl-4 mt-1">
                            <div>
                              Deposits:{" "}
                              {document.ocr_results.transactions
                                .total_deposits || "N/A"}
                            </div>
                            <div>
                              Withdrawals:{" "}
                              {document.ocr_results.transactions
                                .total_withdrawals || "N/A"}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : isEmploymentLetterOcrResult(document.ocr_results) ? (
                    // Employment Letter fields (Guatemala)
                    <>
                      {document.ocr_results.employer_name && (
                        <div>
                          <span className="font-medium">Employer:</span>{" "}
                          {document.ocr_results.employer_name}
                        </div>
                      )}
                      {document.ocr_results.employee_name && (
                        <div>
                          <span className="font-medium">Employee:</span>{" "}
                          {document.ocr_results.employee_name}
                        </div>
                      )}
                      {document.ocr_results.position && (
                        <div>
                          <span className="font-medium">Position:</span>{" "}
                          {document.ocr_results.position}
                        </div>
                      )}
                      {document.ocr_results.start_date && (
                        <div>
                          <span className="font-medium">Start Date:</span>{" "}
                          {document.ocr_results.start_date}
                        </div>
                      )}
                      {document.ocr_results.employment_duration && (
                        <div>
                          <span className="font-medium">
                            Employment Duration:
                          </span>{" "}
                          {document.ocr_results.employment_duration}
                        </div>
                      )}
                      {document.ocr_results.salary && (
                        <div>
                          <span className="font-medium">Salary:</span>{" "}
                          {document.ocr_results.salary.amount}{" "}
                          {document.ocr_results.salary.currency}{" "}
                          {document.ocr_results.salary.frequency}
                        </div>
                      )}
                      {document.ocr_results.issue_date && (
                        <div>
                          <span className="font-medium">Issue Date:</span>{" "}
                          {document.ocr_results.issue_date}
                        </div>
                      )}
                      {document.ocr_results.letterhead_verified !==
                        undefined && (
                        <div>
                          <span className="font-medium">
                            Letterhead Verified:
                          </span>{" "}
                          {document.ocr_results.letterhead_verified ? (
                            <span className="text-green-600">Yes</span>
                          ) : (
                            <span className="text-red-600">No</span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    // Fallback for unknown OCR result types
                    <div>
                      No structured data available for this document type.
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

                  {document.ocr_results.country && (
                    <div>
                      <span className="font-medium">Country:</span>{" "}
                      {document.ocr_results.country}
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
