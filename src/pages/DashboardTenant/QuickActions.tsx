import {
  ArrowRight,
  Calendar,
  CreditCard,
  FileBarChart,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[
        {
          to: "/dashboard/marketplace",
          icon: Search,
          title: "Find Properties",
          description: "Browse available properties",
          action: "Browse Now",
          gradient: "from-blue-500 to-indigo-600",
          badge: "New",
        },
        {
          to: "/dashboard/documents",
          icon: FileBarChart,
          title: "Upload Documents",
          description: "Submit required documentation",
          action: "Upload Now",
          gradient: "from-purple-500 to-pink-600",
        },
        {
          to: "/dashboard/payments",
          icon: CreditCard,
          title: "Make Payment",
          description: "Pay rent or schedule auto-pay",
          action: "Pay Now",
          gradient: "from-green-500 to-emerald-600",
        },
        {
          to: "/dashboard/appointments",
          icon: Calendar,
          title: "Schedule Viewing",
          description: "Book property viewings",
          action: "Schedule Now",
          gradient: "from-orange-500 to-red-600",
        },
      ].map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="group relative bg-white overflow-hidden shadow rounded-xl p-6 hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105"
          aria-label={`${item.title} - ${item.description}`}
        >
          <div className="relative z-10">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-r from-white/10 to-white/20 backdrop-blur-sm shadow-inner">
              <item.icon className="h-6 w-6 text-white transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            {item.badge && (
              <span className="absolute -top-2 -right-2 bg-white px-2 py-0.5 rounded-full text-xs font-semibold text-indigo-600 shadow-sm">
                {item.badge}
              </span>
            )}
            <h3 className="mt-4 text-lg font-semibold text-white transform group-hover:translate-x-1 transition-transform duration-300">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-white/80 transform group-hover:translate-x-1 transition-transform duration-300 delay-75">
              {item.description}
            </p>
            <div className="mt-4 flex items-center text-white">
              <span className="text-sm font-medium transform group-hover:translate-x-1 transition-transform duration-300 delay-100">
                {item.action}
              </span>
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-2 transition-transform duration-300 delay-150" />
            </div>
          </div>
          <div
            className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-90`}
          >
            <div
              className="absolute inset-0 bg-pattern opacity-10"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 17.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15zm0-2.5a5 5 0 110-10 5 5 0 010 10z' fill='%23ffffff' fill-opacity='0.4'/%3E%3C/svg%3E\")",
              }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
