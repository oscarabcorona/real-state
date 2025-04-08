import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { Property, Tenant } from "./types";
import { Badge } from "@/components/ui/badge";
import {
  fetchProperties,
  fetchTenants,
  deleteProperty,
  togglePropertyPublishStatus,
} from "@/services/propertyService";
import { PropertyModal } from "./components/PropertyModal";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export function Properties() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load tenants when component mounts
  useEffect(() => {
    if (user) {
      loadTenants();
    }
  }, [user]);

  // Load properties when component mounts or a tenant is selected
  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  // Load tenants from API
  const loadTenants = async () => {
    try {
      const fetchedTenants = await fetchTenants();
      setTenants(fetchedTenants);
    } catch (error) {
      console.error("Error loading tenants:", error);
    }
  };

  // Load properties from API
  const loadProperties = async () => {
    try {
      const fetchedProperties = await fetchProperties();
      setProperties(fetchedProperties);
    } catch (error) {
      console.error("Error loading properties:", error);
    }
  };

  return (
    <div className="flex-1">
      <div className="container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Properties
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your real estate properties
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {properties.length} total
          </Badge>
        </div>

        <DataTable
          columns={columns}
          data={properties}
          setIsModalOpen={setIsModalOpen}
        />

        {/* Property Modal */}
        <PropertyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={loadProperties}
        />
      </div>
    </div>
  );
}

export default Properties;
