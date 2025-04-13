import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Loader2, Save, X } from "lucide-react";
import { Property, PropertyFormSchema, PropertyFormValues } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@/store/authStore";
import {
  PropertyHeader,
  PropertyGallery,
  PropertyFeatures,
  PropertyInformation,
  AppointmentModal,
} from "./components/PropertyDetails";
import { useProperties } from "./hooks/useProperties";
import { saveProperty } from "@/services/propertyService";

/**
 * PropertyDetails component for displaying detailed information about a specific property
 * Supports simple inline editing mode
 */
export function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const navigate = useNavigate();
  const { user, workspace } = useAuthStore();
  const { t } = useTranslation();

  // Use the properties hook with autoLoad set to false since we're loading a specific property
  const { loadProperty, deleteProperty: deletePropertyAction } = useProperties({
    autoLoad: false,
  });

  const isLessor = user?.role === "lessor";

  // Initialize form
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      description: "",
      property_type: "house",
      price: null,
      bedrooms: null,
      bathrooms: null,
      square_feet: null,
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
  });

  // Check for edit query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldEditMode = searchParams.get("edit") === "true";

    // Only allow edit mode for lessors
    if (shouldEditMode && isLessor) {
      setEditMode(true);

      // Remove the query parameter without reloading the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [location.search, isLessor]);

  // Load the property when the component mounts or when the id changes
  useEffect(() => {
    if (id) {
      loadPropertyData(id);
    }
  }, [id]);

  // Reset form when property data is loaded
  useEffect(() => {
    if (property) {
      form.reset({
        name: property.name || "",
        address: property.address || "",
        city: property.city || "",
        state: property.state || "",
        zip_code: property.zip_code || "",
        description: property.description || "",
        property_type: property.property_type || "house",
        price: property.price || null,
        bedrooms: property.bedrooms || null,
        bathrooms: property.bathrooms || null,
        square_feet: property.square_feet || null,
        amenities: property.amenities || [],
        images: property.images || [],
        available_date: property.available_date || null,
        pet_policy: property.pet_policy || null,
        lease_terms: property.lease_terms || null,
        published: property.published || false,
        syndication: property.syndication || {
          zillow: false,
          trulia: false,
          realtor: false,
          hotpads: false,
        },
      });
    }
  }, [property, form]);

  // Load property data using our custom hook
  const loadPropertyData = async (propertyId: string) => {
    setIsLoading(true);
    try {
      const propertyData = await loadProperty(propertyId);
      setProperty(propertyData);
    } catch (error) {
      console.error("Error loading property details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle property deletion
  const handleDelete = async () => {
    if (!property || !isLessor || !id) return;

    try {
      const success = await deletePropertyAction(property.id);
      if (success) {
        navigate("/dashboard/properties");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  // Handle property publish/unpublish
  const handlePublishToggle = async (published: boolean) => {
    if (!user?.id || !property?.id) return;

    setIsSaving(true);
    try {
      const updatedFormData = { ...form.getValues(), published };
      await saveProperty(user.id, updatedFormData, property.id, workspace?.id);

      toast.success(
        published
          ? t("properties.form.success.published")
          : t("properties.form.success.unpublished"),
        {
          description: published
            ? t("properties.form.success.publishedDescription")
            : t("properties.form.success.unpublishedDescription"),
        }
      );

      loadPropertyData(property.id);
    } catch (error) {
      console.error("Error updating property publish status:", error);
      toast.error(t("properties.form.error.saving"), {
        description: t("properties.form.error.savingDescription"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving the property
  const handleSaveProperty = async (formData: PropertyFormValues) => {
    if (!user?.id || !property?.id) return;

    setIsSaving(true);
    try {
      await saveProperty(user.id, formData, property.id, workspace?.id);

      toast.success(t("properties.form.success.updated"), {
        description: t("properties.form.success.updatedDescription"),
      });

      setEditMode(false);
      loadPropertyData(property.id);
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error(t("properties.form.error.saving"), {
        description: t("properties.form.error.savingDescription"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading property details...</span>
      </div>
    );
  }

  // Not found state
  if (!property) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The property you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full">
        <Card className="h-full border-none shadow-none">
          {/* Header with navigation */}
          <PropertyHeader
            property={property}
            isLessor={isLessor}
            onDelete={handleDelete}
            onEditClick={() => setEditMode(true)}
            onScheduleClick={() => setShowAppointmentModal(true)}
            onPublishToggle={isLessor ? handlePublishToggle : undefined}
          />

          <Separator />

          <CardContent className="p-6">
            {editMode ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSaveProperty)}
                  className="space-y-6"
                >
                  <div className="flex justify-end space-x-2 mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditMode(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {t("properties.form.saveChanges")}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - basic information */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="zip_code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="property_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Property Type</FormLabel>
                                <FormControl>
                                  <select
                                    className="w-full px-3 py-2 border rounded-md border-input bg-background"
                                    {...field}
                                    value={field.value || ""}
                                  >
                                    <option value="house">House</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="condo">Condo</option>
                                    <option value="townhouse">Townhouse</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={5}
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Right column - property details */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="bedrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Beds</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bathrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Baths</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="square_feet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sq. Ft.</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="available_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - property images and features */}
                <div className="lg:col-span-2 space-y-6">
                  <PropertyGallery
                    images={property.images}
                    propertyName={property.name}
                  />

                  <PropertyFeatures
                    description={property.description}
                    amenities={property.amenities}
                  />
                </div>

                {/* Right column - property information */}
                <div>
                  <PropertyInformation property={property} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        property={property}
        user={user}
      />
    </>
  );
}

export default PropertyDetails;
