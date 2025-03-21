import { useState, useEffect } from "react";
import {
  Plus,
  Building2,
  Filter,
  Grid3X3,
  List,
  Loader2,
  Search,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [selectedTenant, setSelectedTenant] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full p-4 md:p-6">
      <Card className="h-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <CardTitle>Properties</CardTitle>
            <Badge variant="outline" className="ml-2">
              {properties.length} total
            </Badge>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </CardHeader>
        <Separator />
        <div className="px-6 py-3 flex flex-col sm:flex-row gap-4 bg-muted/20">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Tenants" />
                </div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                <DropdownMenuItem>Newest First</DropdownMenuItem>
                <DropdownMenuItem>Published Only</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="rounded-none h-9 w-9"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="rounded-none h-9 w-9"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-6 overflow-auto h-[calc(100vh-13rem)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">
                Loading properties...
              </span>
            </div>
          ) : filteredProperties.length === 0 ? (
            <EmptyState
              onAddProperty={() => setIsModalOpen(true)}
              isFiltered={searchQuery !== "" || selectedTenant !== "all"}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
                  : "flex flex-col gap-4"
              }
            >
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPublish={handlePublish}
                  viewMode={viewMode}
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
