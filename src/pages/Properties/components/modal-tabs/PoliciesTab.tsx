import { UseFormReturn } from "react-hook-form";
import { PropertyFormValues } from "../../types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TabsContent } from "@/components/ui/tabs";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PawPrint, FileText, ArrowLeft, ArrowRight } from "lucide-react";

interface PoliciesTabProps {
  form: UseFormReturn<PropertyFormValues>;
  onNextTab: () => void;
  onPrevTab: () => void;
}

export function PoliciesTab({ form, onNextTab, onPrevTab }: PoliciesTabProps) {
  return (
    <TabsContent value="policies" className="space-y-5 py-2">
      <div className="grid grid-cols-1 gap-5">
        <FormField
          control={form.control}
          name="pet_policy"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <PawPrint className="h-4 w-4 mr-2 text-muted-foreground" />
                Pet Policy
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Describe the pet policy for this property"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Are pets allowed? What types? Any restrictions or additional
                deposits?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lease_terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                Lease Terms
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Summarize the lease terms"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Specify lease duration, security deposit amount, special
                conditions, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevTab}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Features
          </Button>
          <Button
            type="button"
            onClick={onNextTab}
            className="flex items-center gap-2"
          >
            Continue to Media
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
