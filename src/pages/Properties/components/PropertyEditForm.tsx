import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  ChevronLeft,
  Save,
  X,
  Home,
  Map,
  Bed,
  DollarSign,
  Layers,
  FileText,
  ImageIcon,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PropertyFormSchema, PropertyFormValues, Property } from "../types";
import { saveProperty } from "@/services/propertyService";
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

      toast.success("Property updated", {
        description: "Your property has been updated successfully.",
      });

      if (property?.id) {
        onSaved(property.id);
      }
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Error", {
        description: "There was an error updating the property.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
      <Card className="h-full border-none shadow-none">
        <CardHeader className="p-6 flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">
              {property ? "Edit Property" : "Create Property"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
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
              {property ? "Save Changes" : "Create Property"}
            </Button>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-6">
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
                    <span>Basic Info</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="flex items-center gap-2"
                  >
                    <Layers className="h-4 w-4" />
                    <span>Details</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="media"
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Media</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="publishing"
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Publishing</span>
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
                            Property Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter property name"
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
                              <option value="land">Land</option>
                              <option value="commercial">Commercial</option>
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
                      Location
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Street address" {...field} />
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
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="City" {...field} />
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
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="State" {...field} />
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
                              <FormLabel>Zip Code</FormLabel>
                              <FormControl>
                                <Input placeholder="Zip code" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Property description"
                            className="min-h-[150px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe the property in detail to attract potential
                          tenants.
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
                      Property Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              Price
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Price"
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
                            <FormLabel>Available Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              When will this property be available?
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
                            <FormLabel>Bedrooms</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Number of bedrooms"
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
                            <FormLabel>Bathrooms</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Number of bathrooms"
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
                            <FormLabel>Square Feet</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Square feet"
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
                      Policies & Terms
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="pet_policy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pet Policy</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Pet policy details"
                                className="min-h-[80px]"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Describe your pet policy (e.g., no pets, cats
                              only, pet deposit required)
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
                            <FormLabel>Lease Terms</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Lease terms details"
                                className="min-h-[80px]"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Describe lease length options and other terms
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
                          <FormLabel className="text-base">Published</FormLabel>
                          <FormDescription>
                            Make this property visible to the public
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
                    <h3 className="text-lg font-medium mb-3">Syndication</h3>
                    <FormDescription className="mb-4">
                      Select where you want to list this property
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
                              Zillow
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
                              Trulia
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
                              Realtor.com
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
                              HotPads
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
