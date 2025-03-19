import React, { useState, useEffect } from "react";
import { Plus, Filter } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { Property, Tenant } from "./types";
import { PropertyCard } from "./components/PropertyCard";
import { EmptyState } from "./components/EmptyState";
import { PropertyModal } from "./components/PropertyModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function Properties() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    tenant_id: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    description: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    square_feet: "",
    property_type: "house",
    amenities: [] as string[],
    images: [] as string[],
    available_date: "",
    pet_policy: "",
    lease_terms: "",
    published: false,
    syndication: {
      zillow: false,
      trulia: false,
      realtor: false,
      hotpads: false,
    },
  });

  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (user) {
      fetchTenants();
      fetchProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedTenant]);

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  const fetchProperties = async () => {
    try {
      let query = supabase
        .from("properties")
        .select(
          `
          *,
          property_leases (
            tenant:tenant_id (
              name
            )
          )
        `
        )
        .eq("user_id", user?.id);

      if (selectedTenant && selectedTenant !== "all") {
        query = query.eq("property_leases.tenant_id", selectedTenant);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        square_feet: parseInt(formData.square_feet),
      };

      if (editingProperty) {
        const { error } = await supabase
          .from("properties")
          .update({
            ...propertyData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProperty.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("properties").insert([
          {
            ...propertyData,
            user_id: user?.id,
            compliance_status: "pending",
          },
        ]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      resetForm();
      fetchProperties();
    } catch (error) {
      console.error("Error saving property:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tenant_id: "",
      name: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      description: "",
      price: "",
      bedrooms: "",
      bathrooms: "",
      square_feet: "",
      property_type: "house",
      amenities: [],
      images: [],
      available_date: "",
      pet_policy: "",
      lease_terms: "",
      published: false,
      syndication: {
        zillow: false,
        trulia: false,
        realtor: false,
        hotpads: false,
      },
    });
    setEditingProperty(null);
    setActiveTab("details");
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      tenant_id: property.property_leases?.[0]?.tenant?.name || "",
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      zip_code: property.zip_code,
      description: property.description || "",
      price: property.price?.toString() || "",
      bedrooms: property.bedrooms?.toString() || "",
      bathrooms: property.bathrooms?.toString() || "",
      square_feet: property.square_feet?.toString() || "",
      property_type: property.property_type || "house",
      amenities: property.amenities || [],
      images: property.images || [],
      available_date: property.available_date || "",
      pet_policy: property.pet_policy || "",
      lease_terms: property.lease_terms || "",
      published: property.published || false,
      syndication: property.syndication || {
        zillow: false,
        trulia: false,
        realtor: false,
        hotpads: false,
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);

      if (error) throw error;
      fetchProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const handlePublish = async (property: Property) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({
          published: !property.published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", property.id);

      if (error) throw error;
      fetchProperties();
    } catch (error) {
      console.error("Error publishing property:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <CardTitle>Properties</CardTitle>
            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Tenants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenants</SelectItem>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="p-6">
          {properties.length === 0 ? (
            <EmptyState onAddProperty={() => setIsModalOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPublish={handlePublish}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <PropertyModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          loading={loading}
          editingProperty={editingProperty}
          formData={formData}
          setFormData={setFormData}
          tenants={tenants}
          onSubmit={handleSubmit}
          resetForm={resetForm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}
