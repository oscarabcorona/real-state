import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Bed,
  DollarSign,
  FileText,
  Globe,
  Home,
  ImageIcon,
  Layers,
  Loader2,
  Map,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { saveProperty } from "@/services/propertyService";
import { Property, PropertyFormSchema, PropertyFormValues } from "../types";
import { AmenityField } from "./form-fields/AmenityField";
import { ImageUploadField } from "./form-fields/ImageUploadField";

interface PropertyEditFormProps {
  property: Property | null;
  userId: string | undefined;
  workspaceId: string | undefined;
  onCancel: () => void;
  onSaved: (id: string) => void;
}

export function PropertyEditForm({
  property,
  userId,
  workspaceId,
  onCancel,
  onSaved,
}: PropertyEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const { t } = useTranslation();

  // Initialize form
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      name: property?.name || "",
      address: property?.address || "",
      city: property?.city || "",
      state: property?.state || "",
      zip_code: property?.zip_code || "",
      description: property?.description || "",
      property_type: property?.property_type || "house",
      price: property?.price || null,
      bedrooms: property?.bedrooms || null,
      bathrooms: property?.bathrooms || null,
      square_feet: property?.square_feet || null,
      amenities: property?.amenities || [],
      images: property?.images || [],
      available_date: property?.available_date || null,
      pet_policy: property?.pet_policy || null,
      lease_terms: property?.lease_terms || null,
      published: property?.published || false,
      syndication: property?.syndication || {
        zillow: false,
        trulia: false,
        realtor: false,
        hotpads: false,
      },
    },
  });

  // Handle saving the property
  const onSubmit = async (formData: PropertyFormValues) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      await saveProperty(userId, formData, property?.id, workspaceId);

      toast.success(
        property
          ? t("properties.form.success.updated")
          : t("properties.form.success.created"),
        {
          description: property
            ? t("properties.form.success.updatedDescription")
            : t("properties.form.success.createdDescription"),
        }
      );

      if (property?.id) {
        onSaved(property.id);
      }
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error(t("properties.form.error.saving"), {
        description: t("properties.form.error.savingDescription"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
      <Card className="h-full border-none shadow-none">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">
              {property
                ? t("properties.form.editProperty")
                : t("properties.form.createProperty")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form="property-edit-form"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {property
                ? t("properties.form.saveChanges")
                : t("properties.form.createButton")}
            </Button>
          </div>
        </CardHeader>

        <Separator className="my-6" />

        <CardContent>
          <Form {...form}>
            <form
              id="property-edit-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 grid grid-cols-4">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    <span>{t("properties.form.basicInfo")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="flex items-center gap-2"
                  >
                    <Layers className="h-4 w-4" />
                    <span>{t("properties.form.details")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="media"
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>{t("properties.form.media")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="publishing"
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{t("properties.form.publishing")}</span>
                  </TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-6">
                  {/* Property Name & Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            {t("properties.form.propertyName")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("properties.form.propertyName")}
                              {...field}
                            />
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
                          <FormLabel>
                            {t("properties.form.propertyType")}
                          </FormLabel>
                          <FormControl>
                            <select
                              className="w-full px-3 py-2 border rounded-md border-input bg-background"
                              {...field}
                              value={field.value || ""}
                            >
                              <option value="house">
                                {t("properties.form.types.house")}
                              </option>
                              <option value="apartment">
                                {t("properties.form.types.apartment")}
                              </option>
                              <option value="condo">
                                {t("properties.form.types.condo")}
                              </option>
                              <option value="townhouse">
                                {t("properties.form.types.townhouse")}
                              </option>
                              <option value="land">
                                {t("properties.form.types.land")}
                              </option>
                              <option value="commercial">
                                {t("properties.form.types.commercial")}
                              </option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Map className="h-5 w-5 text-muted-foreground" />
                      {t("properties.form.location")}
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("properties.form.address")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("properties.form.address")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("properties.form.city")}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("properties.form.city")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("properties.form.state")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("properties.form.state")}
                                  {...field}
                                />
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
                              <FormLabel>
                                {t("properties.form.zipCode")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("properties.form.zipCode")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("properties.form.description")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("properties.form.description")}
                            className="min-h-[150px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("properties.form.descriptionHelp")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  {/* Property Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Bed className="h-5 w-5 text-muted-foreground" />
                      {t("properties.form.propertyDetails")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              {t("properties.form.price")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t("properties.form.price")}
                                {...field}
                                value={field.value?.toString() || ""}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value) || null)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="available_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("properties.form.availableDate")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("properties.form.availableDateHelp")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("properties.form.bedrooms")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t("properties.form.bedrooms")}
                                {...field}
                                value={field.value?.toString() || ""}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value) || null)
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
                            <FormLabel>
                              {t("properties.form.bathrooms")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t("properties.form.bathrooms")}
                                {...field}
                                value={field.value?.toString() || ""}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value) || null)
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
                            <FormLabel>
                              {t("properties.form.squareFeet")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t("properties.form.squareFeet")}
                                {...field}
                                value={field.value?.toString() || ""}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value) || null)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <AmenityField form={form} />

                  {/* Policies */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      {t("properties.form.policiesTerms")}
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="pet_policy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("properties.form.petPolicy")}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("properties.form.petPolicy")}
                                className="min-h-[80px]"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("properties.form.petPolicyHelp")}
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
                            <FormLabel>
                              {t("properties.form.leaseTerms")}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("properties.form.leaseTerms")}
                                className="min-h-[80px]"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("properties.form.leaseTermsHelp")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" className="space-y-6">
                  <ImageUploadField form={form} />
                </TabsContent>

                {/* Publishing Tab */}
                <TabsContent value="publishing" className="space-y-6">
                  {/* Published Toggle */}
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t("properties.form.published")}
                          </FormLabel>
                          <FormDescription>
                            {t("properties.form.publishedHelp")}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value === true}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Syndication */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-3">
                      {t("properties.form.syndication")}
                    </h3>
                    <FormDescription className="mb-4">
                      {t("properties.form.syndicationHelp")}
                    </FormDescription>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="syndication.zillow"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 rounded-md border p-3">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!m-0 font-medium">
                              {t("properties.form.syndication.zillow")}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="syndication.trulia"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 rounded-md border p-3">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!m-0 font-medium">
                              {t("properties.form.syndication.trulia")}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="syndication.realtor"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 rounded-md border p-3">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!m-0 font-medium">
                              {t("properties.form.syndication.realtor")}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="syndication.hotpads"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 rounded-md border p-3">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!m-0 font-medium">
                              {t("properties.form.syndication.hotpads")}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
