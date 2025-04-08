import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { PropertyModal } from "./components/PropertyModal";
import { useProperties } from "./hooks/useProperties";

/**
 * PropertyDetails component for displaying detailed information about a specific property
 */
export function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Use the properties hook with autoLoad set to false since we're loading a specific property
  const { loadProperty, deleteProperty: deletePropertyAction } = useProperties({
    autoLoad: false,
  });

  const isLessor = user?.role === "lessor";

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

  return (
    <>
      <div className="w-full h-full">
        <Card className="h-full border-none shadow-none">
          {/* Header with navigation */}
          <PropertyHeader
            property={property}
            isLessor={isLessor}
            onDelete={handleDelete}
            onEditClick={() => setIsEditing(true)}
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

      {/* Property Edit Modal */}
      <PropertyModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={() => {
          setIsEditing(false);
          if (id) loadPropertyData(id);
        }}
        editingProperty={property}
      />

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
