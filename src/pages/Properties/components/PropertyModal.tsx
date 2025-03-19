import React, { useEffect } from "react";
import {
  Property,
  Tenant,
  PropertyFormValues,
  PropertyFormSchema,
} from "../types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { saveProperty } from "@/services/propertyService";

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
  tenants,
  onSuccess,
}: PropertyModalProps) {
  const [activeTab, setActiveTab] = React.useState("details");
  const [loading, setLoading] = React.useState(false);

  // Initialize the form with React Hook Form + Zod
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      description: "",
      tenant_id: "",
      property_type: "house",
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      square_feet: 0,
      amenities: [],
      available_date: "",
      pet_policy: "",
      lease_terms: "",
      published: false,
      images: [],
      syndication: {
        zillow: false,
        trulia: false,
        realtor: false,
        hotpads: false,
      },
    },
  });

  useEffect(() => {
    if (editingProperty) {
      form.reset({
        tenant_id: editingProperty.property_leases?.[0]?.tenant.id || "",
        name: editingProperty.name,
        address: editingProperty.address,
        city: editingProperty.city,
        state: editingProperty.state,
        zip_code: editingProperty.zip_code,
        description: editingProperty.description || "",
        price: editingProperty.price || 0,
        bedrooms: editingProperty.bedrooms || 0,
        bathrooms: editingProperty.bathrooms || 0,
        square_feet: editingProperty.square_feet || 0,
        property_type: editingProperty.property_type || "house",
        amenities: editingProperty.amenities || [],
        images: editingProperty.images || [],
        available_date: editingProperty.available_date || "",
        pet_policy: editingProperty.pet_policy || "",
        lease_terms: editingProperty.lease_terms || "",
        published: editingProperty.published || false,
        syndication: editingProperty.syndication || {
          zillow: false,
          trulia: false,
          realtor: false,
          hotpads: false,
        },
      });
    }
  }, [editingProperty, form]);

  // Handle form submission
  const onSubmit = async (data: PropertyFormValues) => {
    setLoading(true);

    try {
      await saveProperty(userId, data, editingProperty?.id);

      // Updated toast implementation using Sonner
      toast(`Property ${editingProperty ? "updated" : "created"}`, {
        description: `${data.name} has been ${
          editingProperty ? "updated" : "added"
        } successfully.`,
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error saving property:", error);

      // Updated error toast using Sonner
      toast("Error", {
        description: `Failed to ${
          editingProperty ? "update" : "create"
        } property. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle image removal
  const handleRemoveImage = (index: number) => {
    const currentImages = form.getValues().images;
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    form.setValue("images", newImages);
  };

  const handleClose = () => {
    form.reset();
    setActiveTab("details");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {editingProperty ? "Edit Property" : "Add New Property"}
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
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="publishing">Publishing</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="tenant_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tenant</FormLabel>
                          <Select
                            value={field.value || "none"}
                            onValueChange={(value) =>
                              field.onChange(value === "none" ? "" : value)
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a tenant" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {tenants.map((tenant) => (
                                <SelectItem key={tenant.id} value={tenant.id}>
                                  {tenant.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
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
                  </div>

                  <div className="col-span-2">
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
                  </div>

                  <div>
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

                  <div>
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
                  </div>

                  <div>
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
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="property_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="apartment">
                                Apartment
                              </SelectItem>
                              <SelectItem value="condo">Condo</SelectItem>
                              <SelectItem value="townhouse">
                                Townhouse
                              </SelectItem>
                              <SelectItem value="commercial">
                                Commercial
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($/month)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="square_feet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Square Feet</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea rows={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4 py-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Images</FormLabel>
                        <div className="grid grid-cols-3 gap-4">
                          {field.value.map((image, index) => (
                            <div
                              key={index}
                              className="relative rounded-md overflow-hidden h-32"
                            >
                              <img
                                src={image}
                                alt={`Property ${index}`}
                                className="w-full h-full object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => handleRemoveImage(index)}
                                type="button"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <div className="border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center h-32 cursor-pointer">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">
                                Upload Image
                              </p>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="publishing" className="space-y-4 py-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Publish Property
                          </FormLabel>
                          <FormDescription>
                            Make this property visible to the public
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div>
                    <Label className="text-base">Syndication</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select platforms to list this property
                    </p>

                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="syndication.zillow"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg">
                            <FormLabel>Zillow</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="syndication.trulia"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg">
                            <FormLabel>Trulia</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="syndication.realtor"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg">
                            <FormLabel>Realtor.com</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="syndication.hotpads"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg">
                            <FormLabel>Hotpads</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editingProperty
                  ? "Update Property"
                  : "Add Property"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
