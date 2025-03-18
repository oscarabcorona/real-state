import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function useBreadcrumb() {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname
      .split("/")
      .filter(Boolean)
      // Filter out 'dashboard' since it's always shown as root
      .filter((segment) => segment !== "dashboard")
      .map((segment) => ({
        label: segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        path: `/dashboard/${segment}`,
      }));

    return segments.map((segment, index) => ({
      ...segment,
      path: `/dashboard${segments
        .slice(0, index + 1)
        .map((s) => `/${s.path.split("/").pop()}`)
        .join("")}`,
    }));
  }, [location]);

  return breadcrumbs;
}
