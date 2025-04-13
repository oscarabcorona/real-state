import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Property } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import {
  PropertyHeader,
  PropertyGallery,
  PropertyFeatures,
  PropertyInformation,
  AppointmentModal,
} from "./components/PropertyDetails";
import { useProperties } from "./hooks/useProperties";
import { PropertyEditForm } from "./components/PropertyEditForm";

/**
 * PropertyDetails component for displaying detailed information about a specific property
 * Supports inline editing mode
 */
export function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const navigate = useNavigate();
  const { user, workspace } = useAuthStore();

  // Use the properties hook with autoLoad set to false since we're loading a specific property
  const { loadProperty, deleteProperty: deletePropertyAction } = useProperties({
    autoLoad: false,
  });

  const isLessor = user?.role === "lessor";

  // Check for edit query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldEditMode = searchParams.get("edit") === "true";

    // Only allow edit mode for lessors
    if (shouldEditMode && isLessor) {
      setEditMode(true);

      // Remove the query parameter without reloading the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [location.search, isLessor]);

  // Load the property when the component mounts or when the id changes
  useEffect(() => {
    if (id) {
      loadPropertyData(id);
    }
  }, [id]);

  // Load property data using our custom hook
  const loadPropertyData = async (propertyId: string) => {
    setIsLoading(true);
    try {
      const propertyData = await loadProperty(propertyId);
      setProperty(propertyData);
    } catch (error) {
      console.error("Error loading property details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle property deletion
  const handleDelete = async () => {
    if (!property || !isLessor || !id) return;

    try {
      const success = await deletePropertyAction(property.id);
      if (success) {
        navigate("/dashboard/properties");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading property details...</span>
      </div>
    );
  }

  // Not found state
  if (!property) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The property you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  // Edit mode view - Using the PropertyEditForm component
  if (editMode) {
    return (
      <PropertyEditForm
        property={property}
        userId={user?.id}
        workspaceId={workspace?.id}
        onCancel={() => setEditMode(false)}
        onSaved={(id) => {
          setEditMode(false);
          loadPropertyData(id);
        }}
      />
    );
  }

  // View mode (default)
  return (
    <>
      <div className="w-full h-full">
        <Card className="h-full border-none shadow-none">
          {/* Header with navigation */}
          <PropertyHeader
            property={property}
            isLessor={isLessor}
            onDelete={handleDelete}
            onEditClick={() => setEditMode(true)}
            onScheduleClick={() => setShowAppointmentModal(true)}
          />

          <Separator />

          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - property images and features */}
              <div className="lg:col-span-2 space-y-6">
                <PropertyGallery
                  images={property.images}
                  propertyName={property.name}
                />

                <PropertyFeatures
                  description={property.description}
                  amenities={property.amenities}
                />
              </div>

              {/* Right column - property information */}
              <div>
                <PropertyInformation property={property} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        property={property}
        user={user}
      />
    </>
  );
}

export default PropertyDetails;
