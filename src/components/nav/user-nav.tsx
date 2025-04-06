import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  BadgeCheck,
  Bell,
  CreditCard,
  ChevronsUpDown,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";

export function UserNav() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
        return;
      }
      navigate("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const handleNavigation = (path: string) => () => {
    navigate(path);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {user?.email?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.email ?? t("user.noEmail", "No email")}
                </span>
                <span className="truncate text-xs">
                  {user?.role ?? t("user.noRole", "No role")}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {user?.email?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.email ?? t("user.noEmail", "No email")}
                  </span>
                  <span className="truncate text-xs">
                    {user?.role ?? t("user.noRole", "No role")}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleNavigation("/dashboard/account")}
              >
                <BadgeCheck className="mr-2 h-4 w-4" />
                {t("user.account", "Account")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleNavigation("/dashboard/billing")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {t("user.billing", "Billing")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleNavigation("/dashboard/notifications")}
              >
                <Bell className="mr-2 h-4 w-4" />
                {t("user.notifications", "Notifications")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleNavigation("/dashboard/settings")}
              >
                <User className="mr-2 h-4 w-4" />
                {t("user.profile", "Profile")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("user.logout", "Log out")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
