import React from "react";
import { Clock, CheckCircle, Upload } from "lucide-react";
import { Document } from "../types";
import { DOCUMENT_REQUIREMENTS } from "../const";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentRequirementsProps {
  documents: Document[];
  onUpload: (type: Document["type"]) => void;
}

export const DocumentRequirements: React.FC<DocumentRequirementsProps> = ({
  documents,
  onUpload,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold tracking-tight mb-6">
        Required Documents
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DOCUMENT_REQUIREMENTS.map((req) => {
          const doc = documents.find((d) => d.type === req.type);
          const isComplete = doc?.verified;
          const isPending = doc?.status === "pending";
          const isRejected = doc?.status === "rejected";

          return (
            <TooltipProvider key={req.type}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Card
                      className={cn(
                        "p-4 hover:shadow-md transition-all cursor-pointer h-full",
                        isComplete &&
                          "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30",
                        isPending &&
                          "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/30",
                        isRejected &&
                          "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/30",
                        !doc && "hover:border-primary/30"
                      )}
                      onClick={() =>
                        !isComplete && !isPending && onUpload(req.type)
                      }
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div
                          className={cn(
                            "p-2 rounded-lg flex-shrink-0",
                            isComplete &&
                              "bg-primary/10 text-primary dark:bg-primary/20",
                            isPending &&
                              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                            isRejected &&
                              "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                            !doc && "bg-muted text-muted-foreground"
                          )}
                        >
                          {req.icon}
                        </div>
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <h3 className="font-medium truncate">{req.label}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {req.description}
                          </p>
                          <div className="pt-1">
                            {isComplete ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </Badge>
                            ) : isPending ? (
                              <Badge
                                variant="outline"
                                className="gap-1 border-yellow-300 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50"
                              >
                                <Clock className="h-3 w-3" />
                                Pending Review
                              </Badge>
                            ) : isRejected ? (
                              <Badge variant="destructive" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Rejected
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 w-full justify-center mt-1 border-dashed text-xs px-1"
                              >
                                <Upload className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">Upload</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isComplete
                    ? "Document verified"
                    : isPending
                    ? "Waiting for verification"
                    : isRejected
                    ? `Document was rejected${
                        doc?.rejection_reason ? `: ${doc.rejection_reason}` : ""
                      }`
                    : "Click to upload this document"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};
