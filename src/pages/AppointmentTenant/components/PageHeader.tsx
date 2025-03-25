import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  showListView: boolean;
  onToggleView: () => void;
}

export function PageHeader({ showListView, onToggleView }: PageHeaderProps) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500 mt-1">
          Manage your property viewing appointments
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {showListView ? "Appointments List" : "Viewing Calendar"}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={onToggleView}>
              {showListView ? "Show Calendar" : "Show List View"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {showListView
              ? "Switch to calendar view to see appointments visually"
              : "Switch to list view to see all appointments in a list"}
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator className="mb-6" />
    </>
  );
}
