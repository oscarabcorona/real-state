import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Property } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { PropertyModal } from "./components/PropertyModal";
import { useProperties } from "./hooks/useProperties";
import { ChevronLeft } from "lucide-react";

/**
 * PropertyEdit component for editing a specific property
 */
export function PropertyEdit() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true); // Start in editing mode
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Use the properties hook with autoLoad set to false since we're loading a specific property
  const { loadProperty } = useProperties({
    autoLoad: false,
  });

  const isLessor = user?.role === "lessor";

  // Load the property when the component mounts or when the id changes
  useEffect(() => {
    if (id) {
      loadPropertyData(id);
    }
  }, [id]);

  // Check if user has permission to edit
  useEffect(() => {
    if (user && !isLessor) {
      // If not a lessor, redirect to view mode
      navigate(`/dashboard/properties/${id}`);
    }
  }, [user, isLessor, id, navigate]);

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
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/properties")}
        >
          Back to Properties
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full">
        <Card className="h-full border-none shadow-none">
          {/* Header with navigation */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/dashboard/properties/${id}`)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold">Edit Property</h1>
            </div>
          </div>

          <Separator />

          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                You are now editing "{property.name}". Click outside to cancel
                or save your changes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Edit Modal */}
      <PropertyModal
        isOpen={isEditing}
        onClose={() => navigate(`/dashboard/properties/${id}`)}
        onSave={() => {
          setIsEditing(false);
          navigate(`/dashboard/properties/${id}`);
        }}
        editingProperty={property}
      />
    </>
  );
}

export default PropertyEdit;
