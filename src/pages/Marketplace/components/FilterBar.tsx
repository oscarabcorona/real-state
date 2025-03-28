import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Waves,
  Castle,
  Mountain,
  Home,
  Trees,
  Tent,
  Building,
  Droplets,
} from "lucide-react";

interface FilterOption {
  icon: React.ElementType;
  label: string;
  value: string;
}

const filterOptions: FilterOption[] = [
  { icon: Waves, label: "En el lago", value: "lakeside" },
  { icon: Castle, label: "Icónicos", value: "iconic" },
  { icon: Mountain, label: "Vista increíble", value: "incredible-view" },
  { icon: Home, label: "Casas de campo", value: "countryside" },
  { icon: Building, label: "Bed and breakfasts", value: "bnb" },
  { icon: Tent, label: "Camping", value: "camping" },
  { icon: Droplets, label: "Albercas", value: "pools" },
  { icon: Trees, label: "En la naturaleza", value: "nature" },
];

interface FilterBarProps {
  selectedFilter: string;
  onFilterChange: (value: string) => void;
}

export function FilterBar({ selectedFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="border-b">
      <div className="container py-4">
        <ScrollArea className="w-full">
          <div className="flex space-x-2 pb-4">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center gap-2 h-auto py-2 px-4",
                    selectedFilter === option.value &&
                      "border-b-2 border-foreground rounded-none"
                  )}
                  onClick={() => onFilterChange(option.value)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{option.label}</span>
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
