import { useEffect, useMemo, useState, useCallback } from "react";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "./components/table/data-table";
import { columns } from "./components/table/columns";
import { PropertyModal } from "./components/PropertyModal";
import { PROPERTIES_REFRESH_EVENT } from "./components/table/data-table-row-actions";
import { useProperties } from "./hooks/useProperties";
import { Property } from "./types";

/**
 * Properties page component for managing real estate properties
 * Displays a data table with properties and allows adding/editing properties
 */
export function Properties() {
  // Property management state using our custom hook
  const { properties, tenants, isLoading, error, loadProperties } =
    useProperties({
      autoLoad: true,
      loadTenants: true,
    });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  // Memoize columns to prevent unnecessary re-renders
  const tableColumns = useMemo(() => columns, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  }, []);

  // Handle property edit
  const handleEditProperty = useCallback((property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  }, []);

  // Handle modal save
  const handleModalSave = useCallback(async () => {
    await loadProperties();
    handleModalClose();
  }, [loadProperties, handleModalClose]);

  // Listen for property refresh events
  useEffect(() => {
    // When a property refresh event is triggered, reload properties
    const handleRefresh = () => {
      loadProperties();
    };

    // Add event listener
    window.addEventListener(PROPERTIES_REFRESH_EVENT, handleRefresh);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener(PROPERTIES_REFRESH_EVENT, handleRefresh);
    };
  }, [loadProperties]);

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

        {error && (
          <div className="my-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <DataTable
          columns={tableColumns}
          data={properties}
          setIsModalOpen={setIsModalOpen}
          isLoading={isLoading}
          onEditProperty={handleEditProperty}
        />

        {/* Property Modal */}
        <PropertyModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          tenants={tenants}
          editingProperty={selectedProperty}
        />
      </div>
    </div>
  );
}

export default Properties;
