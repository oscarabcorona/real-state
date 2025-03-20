import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  Share2,
  Save,
  Loader2,
  X,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { PropertyFormValues } from "../../types";
import { SyndicationField } from "../form-fields/SyndicationField";
import { DialogFooter } from "@/components/ui/dialog";
import { Property } from "../../types";

interface PublishingTabProps {
  form: UseFormReturn<PropertyFormValues>;
  onPrevTab: () => void;
  onClose: () => void;
  loading: boolean;
  editingProperty: Property | null;
}

export function PublishingTab({
  form,
  onPrevTab,
  onClose,
  loading,
  editingProperty,
}: PublishingTabProps) {
  const syndicationOptions = [
    { name: "Zillow", key: "zillow" as const, color: "blue", letter: "Z" },
    { name: "Trulia", key: "trulia" as const, color: "green", letter: "T" },
    { name: "Realtor.com", key: "realtor" as const, color: "red", letter: "R" },
    { name: "Hotpads", key: "hotpads" as const, color: "orange", letter: "H" },
  ];

  return (
    <TabsContent value="publishing" className="space-y-5 py-2">
      <div className="space-y-5">
        <div className="bg-muted/30 rounded-lg p-4 border border-muted flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">Before publishing</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Make sure all required information is complete and accurate.
              Published properties will be visible to potential tenants.
            </p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                  Publish Property
                </FormLabel>
                <FormDescription>
                  Make this property visible to the public
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Separator />

        <div>
          <Label className="text-base flex items-center">
            <Share2 className="h-4 w-4 mr-2 text-muted-foreground" />
            Syndication
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Choose third-party platforms to list this property for wider
            exposure
          </p>

          <div className="space-y-3 bg-muted/20 rounded-lg p-4 border">
            {syndicationOptions.map((option) => (
              <SyndicationField key={option.key} form={form} option={option} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevTab}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Media
          </Button>
        </div>

        {/* Add DialogFooter with save/cancel buttons */}
        <DialogFooter className="mt-6 pt-4 border-t flex justify-between w-full">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gap-2 bg-primary">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading
              ? "Saving..."
              : editingProperty
              ? "Update Property"
              : "Save Property"}
          </Button>
        </DialogFooter>
      </div>
    </TabsContent>
  );
}
