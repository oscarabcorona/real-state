import { format } from "date-fns";
import { TrendingUp } from "lucide-react";

export function RevenueChart({
  revenueChart,
}: {
  revenueChart: { data: number[]; labels: string[] };
}) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Monthly Revenue</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {format(new Date(), "MMMM yyyy")}
            </span>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="h-64 flex items-end space-x-2">
          {revenueChart.data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-indigo-100 rounded-t"
                style={{
                  height: `${(value / Math.max(...revenueChart.data)) * 100}%`,
                  minHeight: "20px",
                }}
              />
              <div className="text-xs text-gray-500 mt-2 -rotate-45 origin-top-left">
                {revenueChart.labels[index]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
