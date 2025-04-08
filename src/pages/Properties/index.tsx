import { useState, useEffect } from "react";
import { Building2, Plus } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { Property, Tenant } from "./types";
import { PropertyCard } from "./components/PropertyCard";
import { PropertyModal } from "./components/PropertyModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  fetchProperties,
  fetchTenants,
  deleteProperty,
  togglePropertyPublishStatus,
} from "@/services/propertyService";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { EmptyState } from "./components/EmptyState";

export function Properties() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>("newest");

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
      setIsLoading(true);
      const data = await fetchProperties(
        user.id,
        selectedTenant === "all" ? "" : selectedTenant
      );
      setProperties(data);
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
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

  const handleClearFilters = () => {
    setSelectedTenant("all");
    setSearchQuery("");
  };

  const filteredProperties = properties
    .filter(
      (property) =>
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "price-low-high":
          return (a.price || 0) - (b.price || 0);
        case "price-high-low":
          return (b.price || 0) - (a.price || 0);
        case "bedrooms":
          return (b.bedrooms || 0) - (a.bedrooms || 0);
        default:
          return (
            new Date(b.created_at || new Date()).getTime() -
            new Date(a.created_at || new Date()).getTime()
          );
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Properties</h1>
            <Badge variant="outline" className="ml-2">
              {properties.length} total
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low-high">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="price-high-low">
                  Price: High to Low
                </SelectItem>
                <SelectItem value="bedrooms">Most Bedrooms</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              placeholder="Search properties..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <EmptyState
            onAddProperty={() => setIsModalOpen(true)}
            isFiltered={searchQuery !== "" || selectedTenant !== "all"}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
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
      </div>

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

export default Properties;
