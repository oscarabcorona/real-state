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

function getDocumentStatusConfig(status: string | null | undefined) {
  switch (status?.toLowerCase() ?? "pending") {
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
  const createdDate = new Date(doc.created_at ?? Date.now());

  return (
    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <StatusIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium leading-none">
            {doc.title ?? "Untitled Document"}
          </p>
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
    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[120px]" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-5 w-[90px] rounded-full" />
      </div>
    </div>
  );
}

function EmptyDocuments() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FolderIcon className="h-16 w-16 text-muted-foreground/40" />
      <h3 className="mt-4 text-lg font-medium">No Documents Found</h3>
      <p className="mt-2 mb-6 text-sm text-muted-foreground max-w-sm">
        You don't have any documents yet. Start by uploading your first
        document.
      </p>
      <Button asChild size="lg">
        <Link to="/dashboard/documents/upload">
          <FileText className="mr-2 h-4 w-4" />
          Upload Document
        </Link>
      </Button>
    </div>
  );
}

export function RecentDocuments({
  documents,
  isLoading = false,
}: {
  documents: Document[] | null;
  isLoading?: boolean;
}) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          {[...Array(3)].map((_, i) => (
            <DocumentCardSkeleton key={i} />
          ))}
        </>
      );
    }

    if (!documents?.length) {
      return <EmptyDocuments />;
    }

    return (
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
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading documents..."
              : documents?.length
              ? "Manage your property documents"
              : "Start managing your documents"}
          </CardDescription>
        </div>
        {!isLoading && documents && documents.length > 0 && (
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/documents">View All</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid gap-2">{renderContent()}</CardContent>
    </Card>
  );
}
