import { ArrowLeft, Building2, Edit, Trash2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Property } from "../../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-4 py-3">
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
              {t("common.edit")}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("common.delete")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("common.delete")} {property.name}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{property.name}"? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("common.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <Button variant="default" onClick={onScheduleClick}>
            <Calendar className="h-4 w-4 mr-2" />
            {t("properties.schedule", "Schedule Viewing")}
          </Button>
        )}
      </div>
    </div>
  );
}
