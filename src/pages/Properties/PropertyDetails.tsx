import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bath,
  Bed,
  Building2,
  CalendarClock,
  Calendar,
  Edit,
  Globe,
  Home,
  Loader2,
  MapPin,
  Square,
  Trash2,
  Users,
} from "lucide-react";
import {
  fetchPropertyById,
  deleteProperty,
  fetchTenants,
} from "@/services/propertyService";
import { Property } from "./index.types";
import { formatArea, Tenant } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PropertyModal } from "./components/PropertyModal";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";

export function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isLessor = user?.role === "lessor";
  const isTenant = user?.role === "tenant";

  useEffect(() => {
    if (id) {
      loadProperty(id);
      if (isLessor) {
        loadTenants();
      }

      // Pre-fill appointment form if user is logged in
      if (user) {
        setAppointmentForm((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
        }));
      }
    }
  }, [id, isLessor, user]);

  const loadProperty = async (propertyId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchPropertyById(propertyId);
      setProperty(data);
    } catch (error) {
      console.error("Error loading property details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch (error) {
      console.error("Error loading tenants:", error);
    }
  };

  const handleDelete = async () => {
    if (!property || !isLessor) return;

    try {
      await deleteProperty(property.id);
      navigate("/dashboard/properties");
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const handleAppointmentSubmit = async () => {
    if (!property) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase.from("appointments").insert([
        {
          property_id: property.id,
          name: appointmentForm.name,
          email: appointmentForm.email,
          phone: appointmentForm.phone,
          preferred_date: appointmentForm.date,
          preferred_time: appointmentForm.time,
          message: appointmentForm.message,
          status: "pending",
          tenant_user_id: user?.id || null,
        },
      ]);

      if (error) throw error;

      setShowAppointmentModal(false);
      setAppointmentForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        date: "",
        time: "",
        message: "",
      });

      alert("Appointment request submitted successfully!");
    } catch (error) {
      console.error("Error submitting appointment:", error);
      alert("Failed to submit appointment request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading property details...</span>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The property you're looking for doesn't exist or has been removed.
        </p>
        <Button
          onClick={() =>
            isLessor
              ? navigate("/dashboard/properties")
              : navigate("/dashboard/marketplace")
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {isLessor ? "Properties" : "Marketplace"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full ">
        <Card className="h-full border-none shadow-none">
          {/* Header with navigation */}
          <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  isLessor
                    ? navigate("/dashboard/properties")
                    : navigate("/dashboard/marketplace")
                }
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <Building2 className="h-6 w-6 text-primary mr-2" />
                <h2 className="text-xl font-semibold">{property.name}</h2>
                {isLessor && (
                  <Badge
                    variant={property.published ? "default" : "outline"}
                    className="ml-3"
                  >
                    {property.published ? "Published" : "Draft"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isLessor ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Property
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Property</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{property.name}"?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <Button
                  variant="default"
                  onClick={() => setShowAppointmentModal(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Viewing
                </Button>
              )}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - property images */}
              <div className="lg:col-span-2">
                <div className="rounded-lg overflow-hidden aspect-video bg-muted">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <Home className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Image thumbnails */}
                {property.images && property.images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {property.images.slice(1).map((image, index) => (
                      <div
                        key={index + 1}
                        className="h-20 w-32 flex-shrink-0 rounded-md overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`${property.name} ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Property description */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {property.description || "No description provided."}
                  </p>
                </div>

                {/* Property amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {property.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - property details */}
              <div>
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-lg font-medium mb-4">Property Details</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">
                          Price
                        </span>
                        <span className="font-medium">
                          $
                          {property.price
                            ? property.price.toLocaleString()
                            : "N/A"}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">
                          Property Type
                        </span>
                        <span className="font-medium capitalize">
                          {property.property_type || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">
                            {property.bedrooms || 0}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            Beds
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Bath className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">
                            {property.bathrooms || 0}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            Baths
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Square className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">
                            {formatArea(property)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Address</span>
                          <p className="text-sm text-muted-foreground">
                            {property.address}, {property.city},{" "}
                            {property.state} {property.zip_code}
                          </p>
                        </div>
                      </div>

                      {property.region && (
                        <div className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium">Region</span>
                            <p className="text-sm text-muted-foreground">
                              {property.region.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>
                      )}

                      {property.available_date && (
                        <div className="flex items-start gap-2">
                          <CalendarClock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium">Available From</span>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(property.available_date)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {isLessor && property.property_leases?.[0]?.tenant && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium">Tenant</span>
                            <p className="text-sm text-muted-foreground">
                              {property.property_leases[0].tenant.name}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Show schedule viewing button in details panel for tenants */}
                    {isTenant && !isLessor && (
                      <div className="mt-6">
                        <Button
                          className="w-full"
                          variant="default"
                          onClick={() => setShowAppointmentModal(true)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Viewing
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Modal */}
      <Dialog
        open={showAppointmentModal}
        onOpenChange={setShowAppointmentModal}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule a Viewing</DialogTitle>
            <DialogDescription>
              Fill out the form below to request a viewing for this property.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={appointmentForm.name}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className="col-span-3"
                value={appointmentForm.email}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    email: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                className="col-span-3"
                value={appointmentForm.phone}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    phone: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                value={appointmentForm.date}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    date: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                className="col-span-3"
                value={appointmentForm.time}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    time: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <Textarea
                id="message"
                className="col-span-3"
                value={appointmentForm.message}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    message: e.target.value,
                  })
                }
                placeholder="Any additional information..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAppointmentModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleAppointmentSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isEditing && isLessor && (
        <PropertyModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          userId={user?.id || ""}
          editingProperty={property}
          tenants={tenants}
          onSuccess={() => {
            loadProperty(property.id);
            setIsEditing(false);
          }}
        />
      )}
    </>
  );
}
