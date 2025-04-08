import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  fetchProperties, 
  fetchTenants, 
  deleteProperty,
  togglePropertyPublishStatus,
  fetchPropertyById
} from "@/services/propertyService";
import { Property, Tenant } from "../types";
import { useAuthStore } from "@/store/authStore";

interface UsePropertiesOptions {
  autoLoad?: boolean;
  loadTenants?: boolean;
}

interface UsePropertiesState {
  properties: Property[];
  tenants: Tenant[];
  isLoading: boolean;
  error: string | null;
}

interface UsePropertiesActions {
  loadProperties: () => Promise<Property[]>;
  loadTenants: () => Promise<Tenant[]>;
  loadProperty: (id: string) => Promise<Property | null>;
  deleteProperty: (id: string) => Promise<boolean>;
  togglePublishStatus: (property: Property) => Promise<boolean>;
}

export function useProperties(options: UsePropertiesOptions = {}): UsePropertiesState & UsePropertiesActions {
  const { autoLoad = true, loadTenants: shouldLoadTenants = false } = options;
  const { user } = useAuthStore();
  const [state, setState] = useState<UsePropertiesState>({
    properties: [],
    tenants: [],
    isLoading: true,
    error: null,
  });

  // Load tenants from API
  const loadTenantsAction = useCallback(async () => {
    try {
      const fetchedTenants = await fetchTenants();
      setState(prev => ({ ...prev, tenants: fetchedTenants }));
      return fetchedTenants;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to load tenants";
      console.error("Error loading tenants:", error);
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error("Error", {
        description: errorMessage,
      });
      return [];
    }
  }, []);

  // Load properties from API
  const loadPropertiesAction = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const fetchedProperties = await fetchProperties();
      setState(prev => ({ 
        ...prev, 
        properties: fetchedProperties,
        isLoading: false,
      }));
      return fetchedProperties;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to load properties";
      console.error("Error loading properties:", error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false,
      }));
      toast.error("Error", {
        description: errorMessage,
      });
      return [];
    }
  }, []);

  // Load a specific property by ID
  const loadPropertyAction = useCallback(async (id: string): Promise<Property | null> => {
    try {
      const property = await fetchPropertyById(id);
      return property;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to load property details";
      console.error("Error loading property details:", error);
      toast.error("Error", {
        description: errorMessage,
      });
      return null;
    }
  }, []);

  // Delete a property
  const deletePropertyAction = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteProperty(id);
      toast.success("Property deleted", {
        description: "Property deleted successfully",
      });
      // Refresh the properties list
      loadPropertiesAction();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to delete property";
      console.error("Error deleting property:", error);
      toast.error("Error", {
        description: errorMessage,
      });
      return false;
    }
  }, [loadPropertiesAction]);

  // Toggle property publish status
  const togglePublishStatusAction = useCallback(async (property: Property): Promise<boolean> => {
    try {
      await togglePropertyPublishStatus(property);
      const statusAction = property.status === "published" ? "unpublished" : "published";
      
      toast.success(`Property ${statusAction}`, {
        description: `Property has been ${statusAction} successfully.`,
      });
      
      // Refresh the properties list
      loadPropertiesAction();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to update property status";
      console.error("Error updating property status:", error);
      toast.error("Error", {
        description: errorMessage,
      });
      return false;
    }
  }, [loadPropertiesAction]);

  // Load data when component mounts if autoLoad is true
  useEffect(() => {
    if (autoLoad && user) {
      loadPropertiesAction();
      if (shouldLoadTenants) {
        loadTenantsAction();
      }
    }
  }, [autoLoad, user, loadPropertiesAction, loadTenantsAction, shouldLoadTenants]);

  return {
    ...state,
    loadProperties: loadPropertiesAction,
    loadTenants: loadTenantsAction,
    loadProperty: loadPropertyAction,
    deleteProperty: deletePropertyAction,
    togglePublishStatus: togglePublishStatusAction,
  };
} 