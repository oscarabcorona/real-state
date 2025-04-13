import { useEffect, useState, useCallback } from "react";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "./components/table/data-table";
import { usePropertyColumns } from "./components/table/columns";
import { PROPERTIES_REFRESH_EVENT } from "./components/table/data-table-row-actions";
import { useProperties } from "./hooks/useProperties";
import { Property } from "./types";
import { PropertyEditForm } from "./components/PropertyEditForm";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "react-i18next";

/**
 * Properties page component for managing real estate properties
 * Displays a data table with properties and allows adding/editing properties
 */
export function Properties() {
  const { t } = useTranslation();

  // Property management state using our custom hook
  const { properties, isLoading, error, loadProperties } = useProperties({
    autoLoad: true,
    loadTenants: true,
  });

  // Get user and workspace from store
  const { user, workspace } = useAuthStore();

  // Edit mode state
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  // Memoize columns to prevent unnecessary re-renders
  const tableColumns = usePropertyColumns();

  // Handle canceling edit/create mode
  const handleCancel = useCallback(() => {
    setIsCreating(false);
    setSelectedProperty(null);
  }, []);

  // Handle property edit
  const handleEditProperty = useCallback((property: Property) => {
    setSelectedProperty(property);
    setIsCreating(false);
  }, []);

  // Handle creating a new property
  const handleCreateProperty = useCallback(() => {
    setSelectedProperty(null);
    setIsCreating(true);
  }, []);

  // Handle save completion
  const handleSaved = useCallback(async () => {
    await loadProperties();
    handleCancel();
  }, [loadProperties, handleCancel]);

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

  // If in edit/create mode, show the PropertyEditForm
  if (isCreating || selectedProperty) {
    return (
      <PropertyEditForm
        property={selectedProperty}
        userId={user?.id}
        workspaceId={workspace?.id}
        onCancel={handleCancel}
        onSaved={handleSaved}
      />
    );
  }

  // Otherwise show the properties list
  return (
    <div className="flex-1">
      <div className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("properties.title", "Properties")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("properties.subtitle", "Manage your real estate properties")}
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {properties.length} {t("common.total", "total")}
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
          isLoading={isLoading}
          onEditProperty={handleEditProperty}
          onCreateProperty={handleCreateProperty}
        />
      </div>
    </div>
  );
}

export default Properties;
