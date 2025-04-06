import React from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { Document, Country } from "../types";
import { getDocumentRequirements } from "../const";
import { FileUploadInput } from "../FileUploadInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface UploadModalProps {
  uploadForm: {
    title: string;
    type: Document["type"];
    file: File | null;
    property_id: string;
    country: Country;
  };
  onFormChange: (form: Partial<UploadModalProps["uploadForm"]>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  uploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  uploadSuccess: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  uploadForm,
  onFormChange,
  onSubmit,
  onClose,
  uploading,
  uploadProgress,
  uploadError,
  uploadSuccess,
  handleFileChange,
}) => {
  // Get the document requirements for the selected country
  const documentRequirements = getDocumentRequirements(uploadForm.country);

  // Find the current document requirement for more context
  const currentRequirement = documentRequirements.find(
    (req) => req.type === uploadForm.type
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Upload {currentRequirement?.label || "Document"}
          </DialogTitle>
          <DialogDescription>
            {currentRequirement?.description ||
              "Upload your document for verification."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm">
                Country
              </Label>
              <Select
                value={uploadForm.country}
                onValueChange={(value) => {
                  onFormChange({
                    country: value as Country,
                    // Reset type when country changes to avoid invalid type for new country
                    type:
                      getDocumentRequirements(value as Country)[0]?.type ||
                      "government_id",
                  });
                }}
              >
                <SelectTrigger id="country" className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USA">United States</SelectItem>
                  <SelectItem value="CANADA">Canada</SelectItem>
                  <SelectItem value="MEXICO">Mexico</SelectItem>
                  <SelectItem value="GUATEMALA">Guatemala</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm">
                Document Type
              </Label>
              <Select
                value={uploadForm.type}
                onValueChange={(value) =>
                  onFormChange({ type: value as Document["type"] })
                }
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentRequirements.map((req) => (
                    <SelectItem key={req.type} value={req.type}>
                      {req.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">
                Document Title
              </Label>
              <Input
                id="title"
                value={uploadForm.title}
                onChange={(e) => onFormChange({ title: e.target.value })}
                placeholder={currentRequirement?.label || "Document title"}
                className="w-full"
              />
            </div>
          </div>

          <Card className="p-4 border-dashed">
            <FileUploadInput
              onChange={handleFileChange}
              disabled={uploading}
              selectedFile={uploadForm.file}
            />

            {!uploadForm.file && !uploading && (
              <div className="mt-4 flex items-start text-xs text-muted-foreground">
                <Info className="h-3 w-3 mr-2 mt-0.5" />
                <div>
                  <p>Accepted file formats: PDF, DOC, DOCX, JPG, PNG</p>
                  <p>Maximum file size: 10MB</p>
                </div>
              </div>
            )}
          </Card>

          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {uploadSuccess && (
            <Alert
              variant="default"
              className="bg-green-50 text-green-800 border-green-200"
            >
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Document uploaded successfully!
              </AlertDescription>
            </Alert>
          )}

          {(uploading || uploadProgress > 0) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Upload progress</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || !uploadForm.file || uploadSuccess}
              className="min-w-[120px]"
            >
              {uploading ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Uploading...
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Uploaded
                </>
              ) : (
                "Upload Document"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
