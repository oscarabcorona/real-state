import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
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
import {
  fetchProperties,
  fetchTenants,
  deleteProperty,
  togglePropertyPublishStatus,
} from "@/services/propertyService";

export function Properties() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (user) {
      loadTenants();
      loadProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedTenant]);

  const loadTenants = async () => {
    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch (error) {
      console.error("Error loading tenants:", error);
    }
  };

  const loadProperties = async () => {
    if (!user?.id) return;

    try {
      const data = await fetchProperties(user.id, selectedTenant);
      setProperties(data);
    } catch (error) {
      console.error("Error loading properties:", error);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      await deleteProperty(id);
      loadProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const handlePublish = async (property: Property) => {
    try {
      await togglePropertyPublishStatus(property);
      loadProperties();
    } catch (error) {
      console.error("Error updating property publish status:", error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
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
          onClose={handleModalClose}
          userId={user?.id || ""}
          editingProperty={editingProperty}
          tenants={tenants}
          onSuccess={loadProperties}
        />
      )}
    </div>
  );
}
