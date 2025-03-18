import { FileText } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-sm font-medium">No reports available</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload your documents to generate a screening report.
      </p>
    </div>
  );
}
