interface CreditCategoriesProps {
  currentCategory: string;
}

export function CreditCategories({ currentCategory }: CreditCategoriesProps) {
  const categories = [
    { range: "300-579", label: "Poor", color: "hsl(var(--chart-4))" },
    { range: "580-669", label: "Fair", color: "hsl(var(--chart-3))" },
    { range: "670-749", label: "Good", color: "hsl(var(--chart-2))" },
    { range: "750-850", label: "Excellent", color: "hsl(var(--chart-1))" },
  ];

  return (
    <div className="flex w-full justify-between mb-2">
      {categories.map((item) => (
        <div key={item.label} className="text-center">
          <div
            className="w-4 h-1.5 mx-auto rounded-full mb-1"
            style={{ backgroundColor: item.color }}
          />
          <div
            className={`text-xs font-medium ${
              currentCategory === item.label ? "text-primary" : ""
            }`}
          >
            {item.label}
          </div>
          <div className="text-xs text-muted-foreground">{item.range}</div>
        </div>
      ))}
    </div>
  );
}
