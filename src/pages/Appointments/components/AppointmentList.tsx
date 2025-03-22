import { AlertCircle, CheckCircle } from "lucide-react";
import { Appointment } from "../types";
import { getStatusClass, getStatusIcon } from "../utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AppointmentListProps {
  appointments: Appointment[];
  onViewDetails: (appointment: Appointment) => void;
}

export function AppointmentList({
  appointments,
  onViewDetails,
}: AppointmentListProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Applicant</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                <div className="font-medium">{appointment.properties.name}</div>
                <div className="text-muted-foreground text-xs">
                  {appointment.properties.address}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{appointment.name}</div>
                <div className="text-muted-foreground text-xs">
                  {appointment.email}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div>
                  {new Date(appointment.preferred_date).toLocaleDateString()}
                </div>
                <div>{appointment.preferred_time}</div>
              </TableCell>
              <TableCell>
                {appointment.documents_verified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Pending
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                    appointment.status
                  )}`}
                >
                  {getStatusIcon(appointment.status)}
                  <span className="ml-1 capitalize">{appointment.status}</span>
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(appointment)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
