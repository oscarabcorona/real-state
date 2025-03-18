import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Export the type so we can import it in other files
export type CreditCategory = "Excellent" | "Good" | "Fair" | "Poor";

export interface CreditCategoriesProps {
  currentCategory: CreditCategory;
  orientation?: "vertical" | "horizontal";
}

export function CreditCategories({
  currentCategory,
  orientation = "vertical",
}: CreditCategoriesProps) {
  const categories: Array<{
    name: CreditCategory;
    range: string;
    color: string;
    position: string; // For positioning on scale
  }> = [
    {
      name: "Excellent",
      range: "750-850",
      color: "hsl(var(--chart-1))",
      position: orientation === "vertical" ? "top-0" : "left-0",
    },
    {
      name: "Good",
      range: "670-749",
      color: "hsl(var(--chart-2))",
      position: orientation === "vertical" ? "top-1/4" : "left-1/4",
    },
    {
      name: "Fair",
      range: "580-669",
      color: "hsl(var(--chart-3))",
      position: orientation === "vertical" ? "top-1/2" : "left-1/2",
    },
    {
      name: "Poor",
      range: "300-579",
      color: "hsl(var(--chart-4))",
      position: orientation === "vertical" ? "top-3/4" : "left-3/4",
    },
  ];

  if (orientation === "horizontal") {
    return (
      <div className="space-y-3 w-full">
        <h3 className="text-sm font-medium">Credit Score Scale</h3>
        <div className="relative h-16 border-b-2 mb-2">
          {/* Horizontal scale markings */}
          <div className="absolute w-full bottom-0 flex justify-between">
            {categories.map((_, i) => (
              <span key={i} className="h-2.5 w-0.5 bg-border"></span>
            ))}
          </div>

          {/* Category markers */}
          {categories.map((category) => (
            <div
              key={category.name}
              className={cn(
                "absolute bottom-0 transform -translate-x-1/2 translate-y-1/2 transition-all",
                category.position,
                currentCategory === category.name ? "scale-110 z-10" : ""
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center border-2",
                  currentCategory === category.name
                    ? "border-white shadow-lg"
                    : "border-muted"
                )}
                style={{ backgroundColor: category.color }}
              >
                {currentCategory === category.name && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Label row */}
        <div className="flex justify-between text-center">
          {categories.map((category) => (
            <div
              key={`label-${category.name}`}
              className={cn(
                "flex-1 text-center px-1",
                currentCategory === category.name ? "font-medium" : ""
              )}
            >
              <span
                className={cn(
                  "text-xs block",
                  currentCategory === category.name
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {category.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {category.range}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Original vertical layout
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Credit Score Scale</h3>
      <div className="relative h-[300px] border-l-2 ml-4 pl-6">
        {/* Vertical scale markings */}
        <div className="absolute h-full -left-[5px] flex flex-col justify-between">
          <span className="w-2.5 h-0.5 bg-border"></span>
          <span className="w-2.5 h-0.5 bg-border"></span>
          <span className="w-2.5 h-0.5 bg-border"></span>
          <span className="w-2.5 h-0.5 bg-border"></span>
          <span className="w-2.5 h-0.5 bg-border"></span>
        </div>

        {/* Category markers */}
        {categories.map((category) => (
          <div
            key={category.name}
            className={cn(
              "absolute left-0 transform -translate-x-1/2 -translate-y-1/2 transition-all",
              category.position,
              currentCategory === category.name ? "scale-110 z-10" : ""
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2",
                currentCategory === category.name
                  ? "border-white shadow-lg"
                  : "border-muted"
              )}
              style={{ backgroundColor: category.color }}
            >
              {currentCategory === category.name && (
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        ))}

        {/* Category labels */}
        {categories.map((category) => (
          <div
            key={`label-${category.name}`}
            className={cn(
              "absolute left-8 transform -translate-y-1/2 transition-all flex gap-3 items-center",
              category.position
            )}
          >
            <div
              className={cn(
                "flex flex-col",
                currentCategory === category.name ? "font-medium" : ""
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  currentCategory === category.name
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {category.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {category.range}
              </span>
            </div>

            {currentCategory === category.name && (
              <Badge
                className="ml-2 whitespace-nowrap"
                style={{ backgroundColor: category.color }}
              >
                Current
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
