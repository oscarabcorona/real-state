import { useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  ClipboardCheck,
  FileText,
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
import { useTranslation } from "react-i18next";

export function MainNav() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const menuItems = [
    {
      key: "dashboard",
      title: t("sidebar.dashboard", "Dashboard"),
      url: "/dashboard",
      icon: ClipboardCheck,
    },
    ...(user?.role === "tenant"
      ? [
          {
            key: "marketplace",
            title: t("sidebar.marketplace", "Marketplace"),
            url: "/dashboard/marketplace",
            icon: Search,
          },
          {
            key: "reports",
            title: t("sidebar.reports", "Reports"),
            url: "/dashboard/reports",
            icon: FileBarChart,
          },
          {
            key: "documents",
            title: t("sidebar.documents", "Documents"),
            url: "/dashboard/documents",
            icon: FileText,
          },
        ]
      : [
          {
            key: "properties",
            title: t("sidebar.properties", "Properties"),
            url: "/dashboard/properties",
            icon: Home,
          },
        ]),
    {
      key: "payments",
      title: t("sidebar.payments", "Payments"),
      url: "/dashboard/payments",
      icon: CreditCard,
    },
    {
      key: "appointments",
      title: t("sidebar.appointments", "Appointments"),
      url: "/dashboard/appointments",
      icon: Calendar,
    },
    {
      key: "settings",
      title: t("sidebar.settings", "Settings"),
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("sidebar.platform", "Platform")}</SidebarGroupLabel>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.key}>
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
