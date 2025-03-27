import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-16 w-16 rounded-full bg-[#EEF4FF] flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-[#0F3CD9]" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">
        No reports available
      </h3>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
        Get started by uploading your documents to generate a screening report.
        This will help you make informed decisions about potential tenants.
      </p>
      <Button asChild className="mt-6 bg-[#0F3CD9] hover:bg-[#0F3CD9]/90">
        <Link to="/dashboard/documents">
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents
        </Link>
      </Button>
    </div>
  );
}
