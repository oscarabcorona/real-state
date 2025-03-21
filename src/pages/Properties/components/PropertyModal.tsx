import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveProperty } from "@/services/propertyService";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Edit, FileText, Home, ImagePlus, Tag } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Property,
  PropertyFormSchema,
  PropertyFormValues,
  Tenant,
  parseSyndication,
} from "../types";

import { DetailsTab } from "./modal-tabs/DetailsTab";
import { FeaturesTab } from "./modal-tabs/FeaturesTab";
import { MediaTab } from "./modal-tabs/MediaTab";
import { PoliciesTab } from "./modal-tabs/PoliciesTab";
import { PublishingTab } from "./modal-tabs/PublishingTab";

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  editingProperty: Property | null;
  tenants: Tenant[];
  onSuccess: () => void;
}

export function PropertyModal({
  isOpen,
  onClose,
  userId,
  editingProperty,
  onSuccess,
}: PropertyModalProps) {
  const [activeTab, setActiveTab] = React.useState("details");
  const [loading, setLoading] = React.useState(false);

  // Get workspace from auth store
  const { workspace } = useAuthStore();

  // Initialize the form with React Hook Form + Zod
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      description: null,
      property_type: "house",
      price: null,
      bedrooms: null,
      bathrooms: null,
      square_feet: null,
      square_meters: null,
      measurement_system: "imperial",
      region: "USA",
      amenities: [],
      images: [],
      available_date: null,
      pet_policy: null,
      lease_terms: null,
      published: false,
      syndication: {
        zillow: false,
        trulia: false,
        realtor: false,
        hotpads: false,
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (editingProperty) {
      // Use the utility function to parse syndication data
      const syndication = parseSyndication(editingProperty.syndication);

      form.reset({
        tenant_id: editingProperty.property_leases?.[0]?.tenant.id || null,
        name: editingProperty.name,
        address: editingProperty.address,
        city: editingProperty.city,
        state: editingProperty.state,
        zip_code: editingProperty.zip_code,
        description: editingProperty.description,
        price: editingProperty.price,
        bedrooms: editingProperty.bedrooms,
        bathrooms: editingProperty.bathrooms,
        square_feet: editingProperty.square_feet,
        property_type: editingProperty.property_type || "house",
        amenities: editingProperty.amenities || [],
        images: editingProperty.images || [],
        available_date: editingProperty.available_date,
        pet_policy: editingProperty.pet_policy,
        lease_terms: editingProperty.lease_terms,
        published: editingProperty.published || false,
        syndication: syndication,
      });
    }
  }, [editingProperty, form]);

  // Handle form submission
  const onSubmit = async (data: PropertyFormValues) => {
    setLoading(true);

    try {
      await saveProperty(userId, data, editingProperty?.id, workspace?.id);

      toast(`Property ${editingProperty ? "updated" : "created"}`, {
        description: `${data.name} has been ${
          editingProperty ? "updated" : "added"
        } successfully.`,
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error saving property:", error);

      toast("Error", {
        description: `Failed to ${
          editingProperty ? "update" : "create"
        } property. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setActiveTab("details");
    onClose();
  };

  // Function to navigate to next tab
  const goToNextTab = () => {
    const tabs = ["details", "features", "policies", "media", "publishing"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  // Function to navigate to previous tab
  const goToPrevTab = () => {
    const tabs = ["details", "features", "policies", "media", "publishing"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {editingProperty ? (
              <>
                <Edit className="h-5 w-5 mr-2 text-muted-foreground" />
                Edit Property
              </>
            ) : (
              <>
                <Home className="h-5 w-5 mr-2 text-primary" />
                Add New Property
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Fill in the property details. Navigate between tabs to complete all
            information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-5 mb-4">
                <TabsTrigger
                  value="details"
                  className="flex items-center gap-1.5"
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Details</span>
                </TabsTrigger>
                <TabsTrigger
                  value="features"
                  className="flex items-center gap-1.5"
                >
                  <Tag className="h-4 w-4" />
                  <span className="hidden sm:inline">Features</span>
                </TabsTrigger>
                <TabsTrigger
                  value="policies"
                  className="flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Policies</span>
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="flex items-center gap-1.5"
                >
                  <ImagePlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Media</span>
                </TabsTrigger>
                <TabsTrigger
                  value="publishing"
                  className="flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">Publishing</span>
                </TabsTrigger>
              </TabsList>

              <DetailsTab form={form} onNextTab={goToNextTab} />

              <FeaturesTab
                form={form}
                onNextTab={goToNextTab}
                onPrevTab={goToPrevTab}
              />

              <PoliciesTab
                form={form}
                onNextTab={goToNextTab}
                onPrevTab={goToPrevTab}
              />

              <MediaTab
                form={form}
                onNextTab={goToNextTab}
                onPrevTab={goToPrevTab}
              />

              <PublishingTab
                form={form}
                onPrevTab={goToPrevTab}
                onClose={handleClose}
                loading={loading}
                editingProperty={editingProperty}
              />
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
