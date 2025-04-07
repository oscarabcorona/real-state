import { Appointment } from "../../Calendar/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTranslation } from "react-i18next";

const statuses: Record<string, string> = {
  pending: "text-yellow-700 bg-yellow-50 ring-yellow-600/20",
  confirmed: "text-green-700 bg-green-50 ring-green-600/20",
  cancelled: "text-red-700 bg-red-50 ring-red-600/20",
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface AppointmentListProps {
  appointments: Appointment[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function AppointmentList({
  appointments,
  currentPage,
  totalPages,
  onPageChange,
  onAppointmentClick,
}: AppointmentListProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow rounded-lg">
      <ul role="list" className="divide-y divide-gray-100">
        {appointments.map((appointment) => (
          <li
            key={appointment.id}
            className="flex items-center justify-between gap-x-6 py-5 px-6 hover:bg-gray-50 cursor-pointer"
            onClick={() => onAppointmentClick(appointment)}
          >
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <p className="text-sm/6 font-semibold text-gray-900">
                  {appointment.properties?.name ||
                    t("appointmentTenant.list.unknownProperty")}
                </p>
                <p
                  className={classNames(
                    statuses[appointment.status || "pending"],
                    "mt-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset"
                  )}
                >
                  {t(
                    `appointmentTenant.status.${
                      appointment.status || "pending"
                    }`
                  )}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-gray-500">
                <p className="whitespace-nowrap">
                  {new Date(appointment.preferred_date).toLocaleDateString()}
                </p>
                <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                  <circle r={1} cx={1} cy={1} />
                </svg>
                <p className="truncate">{appointment.preferred_time}</p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <button
                type="button"
                className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50 sm:block"
              >
                {t("appointmentTenant.list.viewDetails")}
              </button>
              <div className="relative">
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentClick(appointment);
                  }}
                >
                  <span className="sr-only">
                    {t("appointmentTenant.list.openOptions")}
                  </span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              >
                {t("appointmentTenant.pagination.previous")}
              </PaginationPrevious>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === page}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              >
                {t("appointmentTenant.pagination.next")}
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
