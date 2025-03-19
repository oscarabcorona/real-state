import React from "react";
import { Property, Tenant } from "../types";
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
import { Label } from "@/components/ui/label";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  editingProperty: Property | null;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  tenants: Tenant[];
  onSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export function PropertyModal({
  isOpen,
  onClose,
  loading,
  editingProperty,
  formData,
  setFormData,
  tenants,
  onSubmit,
  resetForm,
  activeTab,
  setActiveTab,
}: PropertyModalProps) {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // Add helper function to handle tenant selection
  const handleTenantSelection = (value: string) => {
    // If "none" is selected, set tenant_id to empty string in the database
    // but keep "none" as the actual selection value
    setFormData((prev: any) => ({
      ...prev,
      tenant_id: value === "none" ? "" : value,
      // Store the original selection for UI purposes
      _tenantSelection: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, [name]: checked }));
  };

  const handleSyndicationChange = (platform: string, checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      syndication: { ...prev.syndication, [platform]: checked },
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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

        <form onSubmit={onSubmit}>
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
                  <Label htmlFor="tenant_id">Tenant</Label>
                  <Select
                    value={
                      formData._tenantSelection ||
                      (formData.tenant_id ? formData.tenant_id : "none")
                    }
                    onValueChange={handleTenantSelection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="name">Property Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        property_type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($/month)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="square_feet">Square Feet</Label>
                  <Input
                    id="square_feet"
                    name="square_feet"
                    type="number"
                    value={formData.square_feet}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 py-4">
              <div className="space-y-4">
                <Label>Property Images</Label>
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((image: string, index: number) => (
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
                        onClick={() => {
                          const newImages = [...formData.images];
                          newImages.splice(index, 1);
                          setFormData((prev: any) => ({
                            ...prev,
                            images: newImages,
                          }));
                        }}
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
              </div>
            </TabsContent>

            <TabsContent value="publishing" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="published" className="text-base">
                      Publish Property
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Make this property visible to the public
                    </p>
                  </div>
                  <Switch
                    checked={formData.published}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("published", checked)
                    }
                  />
                </div>

                <Separator />

                <div>
                  <Label className="text-base">Syndication</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select platforms to list this property
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="zillow">Zillow</Label>
                      <Switch
                        id="zillow"
                        checked={formData.syndication.zillow}
                        onCheckedChange={(checked) =>
                          handleSyndicationChange("zillow", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="trulia">Trulia</Label>
                      <Switch
                        id="trulia"
                        checked={formData.syndication.trulia}
                        onCheckedChange={(checked) =>
                          handleSyndicationChange("trulia", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="realtor">Realtor.com</Label>
                      <Switch
                        id="realtor"
                        checked={formData.syndication.realtor}
                        onCheckedChange={(checked) =>
                          handleSyndicationChange("realtor", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="hotpads">Hotpads</Label>
                      <Switch
                        id="hotpads"
                        checked={formData.syndication.hotpads}
                        onCheckedChange={(checked) =>
                          handleSyndicationChange("hotpads", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={onClose}>
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
      </DialogContent>
    </Dialog>
  );
}
