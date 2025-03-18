import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Report } from "@/pages/Reports/types";
import { ReportContent } from "./ReportContent";

interface ReportModalProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (report: Report) => void;
}

export function ReportModal({
  report,
  open,
  onOpenChange,
  onDownload,
}: ReportModalProps) {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl">
            Tenant Screening Report
          </DialogTitle>
          <DialogDescription>
            Generated on {new Date(report.created_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        {/* Use the shared ReportContent component */}
        <ReportContent
          report={report}
          onDownload={onDownload}
          context="modal"
        />
      </DialogContent>
    </Dialog>
  );
}
