import { TrendingUp } from "lucide-react";

export function CreditStats() {
  const stats = [
    {
      label: "Utilization",
      value: "32%",
      color: "",
    },
    {
      label: "Payment History",
      value: "Excellent",
      color: "text-green-500",
    },
    {
      label: "Account Age",
      value: "6.2 yrs",
      color: "",
    },
    {
      label: "Monthly Change",
      value: "+12",
      color: "text-green-500",
      icon: <TrendingUp className="h-3 w-3 text-green-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className="p-2 rounded-lg bg-muted/30">
          <div className="text-xs text-muted-foreground">{stat.label}</div>
          <div
            className={`font-semibold flex items-center gap-1 ${stat.color}`}
          >
            <span>{stat.value}</span>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
