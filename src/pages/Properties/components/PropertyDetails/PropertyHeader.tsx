import { ArrowLeft, Building2, Edit, Trash2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Property } from "../../types";
import { Button } from "@/components/ui/button";
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
import { CardHeader } from "@/components/ui/card";
import { getPropertyStatusDetails } from "../../utils/property-utils";

interface PropertyHeaderProps {
  property: Property;
  isLessor: boolean;
  onDelete: () => Promise<void>;
  onEditClick: () => void;
  onScheduleClick: () => void;
}

export function PropertyHeader({
  property,
  isLessor,
  onDelete,
  onEditClick,
  onScheduleClick,
}: PropertyHeaderProps) {
  const navigate = useNavigate();
  const statusDetails = getPropertyStatusDetails(property);

  return (
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
            <Badge variant={statusDetails.color} className="ml-3">
              {statusDetails.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {isLessor ? (
          <>
            <Button variant="outline" onClick={onEditClick}>
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
                    Are you sure you want to delete "{property.name}"? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <Button variant="default" onClick={onScheduleClick}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Viewing
          </Button>
        )}
      </div>
    </CardHeader>
  );
}
