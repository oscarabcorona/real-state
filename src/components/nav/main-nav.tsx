import { useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  ClipboardCheck,
  FileText,
  Bell,
  Settings,
  CreditCard,
  Home,
  Search,
  FileBarChart,
  Calendar,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "../ui/sidebar";

export function MainNav() {
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: ClipboardCheck },
    ...(user?.role === "tenant"
      ? [
          { title: "Marketplace", url: "/dashboard/marketplace", icon: Search },
          { title: "Reports", url: "/dashboard/reports", icon: FileBarChart },
          { title: "Documents", url: "/dashboard/documents", icon: FileText },
        ]
      : [{ title: "Properties", url: "/dashboard/properties", icon: Home }]),
    { title: "Payments", url: "/dashboard/payments", icon: CreditCard },
    { title: "Appointments", url: "/dashboard/appointments", icon: Calendar },
    { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === item.url}
              tooltip={item.title}
            >
              <Link to={item.url}>
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
