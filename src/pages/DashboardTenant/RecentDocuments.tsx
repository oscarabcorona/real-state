import { format } from "date-fns";
import {
  FileCheck,
  FileText,
  FileClock,
  FileX,
  FolderIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Document } from "../../types/dashboard.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function getDocumentStatusConfig(status: string) {
  switch (status.toLowerCase()) {
    case "signed":
      return {
        variant: "default" as const,
        icon: FileCheck,
        label: "Signed",
      };
    case "pending":
      return {
        variant: "warning" as const,
        icon: FileClock,
        label: "Pending",
      };
    case "expired":
      return {
        variant: "destructive" as const,
        icon: FileX,
        label: "Expired",
      };
    default:
      return {
        variant: "outline" as const,
        icon: FileText,
        label: status,
      };
  }
}

function DocumentItem({ doc }: { doc: Document }) {
  const status = getDocumentStatusConfig(doc.status);
  const StatusIcon = status.icon;
  const createdDate = new Date(doc.created_at);

  return (
    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <StatusIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium leading-none">{doc.title}</p>
          <p className="text-sm text-muted-foreground">
            {format(createdDate, "MMM d, yyyy")}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 min-w-[100px]">
        <Badge
          variant={status.variant}
          className="px-2 py-0.5 text-xs font-medium capitalize"
        >
          {status.label}
        </Badge>
      </div>
    </div>
  );
}

function DocumentCardSkeleton() {
  return (
    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-4 w-[60px]" />
        <Skeleton className="h-5 w-[70px] rounded-full" />
      </div>
    </div>
  );
}

export function RecentDocuments({
  documents,
  isLoading = false,
}: {
  documents: Document[];
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Manage your property documents</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard/documents">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-2">
        {isLoading ? (
          <>
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
          </>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderIcon className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-2 font-medium">No documents</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Get started by uploading a document.
            </p>
            <Button asChild>
              <Link to="/dashboard/documents/upload">Upload Document</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-2">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/dashboard/documents/${doc.id}`}
                className="block"
              >
                <DocumentItem doc={doc} />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
