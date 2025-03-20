import { AnimatedElement } from "@/components/animated/AnimatedElement";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

const filterOptions = [
  { label: "All Notifications", value: "all" },
  { label: "Appointments", value: "appointment" },
  { label: "Documents", value: "document" },
  { label: "Payments", value: "payment" },
  { label: "Reports", value: "report" },
];

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
];

interface NotificationFiltersProps {
  onFilterChange: (type: string | null) => void;
  onSortChange: (order: "newest" | "oldest") => void;
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export function NotificationFilters({
  onFilterChange,
  onSortChange,
  unreadCount,
  onMarkAllAsRead,
}: NotificationFiltersProps) {
  const [openFilter, setOpenFilter] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filterOptions[0]);
  const [activeSort, setActiveSort] = useState(sortOptions[0]);

  const handleSortChange = (value: string) => {
    const option =
      sortOptions.find((opt) => opt.value === value) || sortOptions[0];
    setActiveSort(option);
    onSortChange(option.value as "newest" | "oldest");
    setOpenSort(false);
  };

  return (
    <AnimatedElement
      animation="fadeIn"
      duration={0.3}
      delay={0.1}
      className="w-full sm:ml-auto"
    >
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Popover open={openFilter} onOpenChange={setOpenFilter}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openFilter}
                className="flex items-center justify-between gap-1 h-8 pl-3 pr-2 text-sm w-[140px] sm:w-auto"
              >
                <Filter className="h-3.5 w-3.5 mr-1" />
                <span className="truncate">{activeFilter.label}</span>
                <ChevronsUpDown className="ml-auto h-3.5 w-3.5 opacity-50 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandList>
                  <CommandEmpty>No filters found.</CommandEmpty>
                  <CommandGroup heading="Filter By">
                    {filterOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          setActiveFilter(option);
                          onFilterChange(
                            option.value === "all" ? null : option.value
                          );
                          setOpenFilter(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            activeFilter.value === option.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Sort dropdown that works on both mobile and desktop */}
          <Popover open={openSort} onOpenChange={setOpenSort}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-8"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">{activeSort.label}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0">
              <Command>
                <CommandList>
                  <CommandGroup heading="Sort By">
                    {sortOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSortChange(option.value)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            activeSort.value === option.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs ml-auto gap-1.5"
            onClick={onMarkAllAsRead}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>
    </AnimatedElement>
  );
}
