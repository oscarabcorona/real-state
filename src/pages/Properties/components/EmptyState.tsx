import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddProperty: () => void;
}

export function EmptyState({ onAddProperty }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <Home className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        You haven't added any properties to your portfolio yet. Add your first
        property to get started.
      </p>
      <Button onClick={onAddProperty}>Add Your First Property</Button>
    </div>
  );
}
