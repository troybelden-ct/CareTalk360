import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Settings, FileText, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, UserX } from "lucide-react";
import AppointmentAdminModal from "./AppointmentAdminModal";
import NoShowConfirmationModal from "./NoShowConfirmationModal";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface Appointment {
  id: number;
  program: string;
  provider: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  zip: string;
  state: string;
  date: string;
  time: string;
  appointmentStatus: string;
  createdBy: string;
}

const openAppointments: Appointment[] = [
  { id: 3001, program: "Test", provider: "Hogue", firstName: "James", lastName: "Wilson", dateOfBirth: "03/15/1978", phone: "123-555-1212", zip: "30301", state: "GA", date: "03/31/2026", time: "08:00 AM", appointmentStatus: "S", createdBy: "admin1" },
  { id: 3002, program: "Test", provider: "Hogue", firstName: "Maria", lastName: "Garcia", dateOfBirth: "07/22/1985", phone: "123-555-1212", zip: "60614", state: "IL", date: "03/31/2026", time: "08:30 AM", appointmentStatus: "S", createdBy: "admin2" },
  { id: 3003, program: "Test", provider: "Hogue", firstName: "Robert", lastName: "Johnson", dateOfBirth: "11/04/1990", phone: "123-555-1212", zip: "75201", state: "TX", date: "03/31/2026", time: "09:00 AM", appointmentStatus: "S", createdBy: "admin1" },
  { id: 3004, program: "Test", provider: "Hogue", firstName: "Linda", lastName: "Martinez", dateOfBirth: "01/30/1972", phone: "123-555-1212", zip: "85001", state: "AZ", date: "03/31/2026", time: "09:30 AM", appointmentStatus: "S", createdBy: "admin3" },
  { id: 3005, program: "Test", provider: "Hogue", firstName: "David", lastName: "Brown", dateOfBirth: "05/18/1988", phone: "123-555-1212", zip: "48390", state: "MI", date: "03/31/2026", time: "10:00 AM", appointmentStatus: "S", createdBy: "sparkystoner" },
  { id: 3006, program: "Test", provider: "Hogue", firstName: "Susan", lastName: "Davis", dateOfBirth: "09/12/1965", phone: "123-555-1212", zip: "10001", state: "NY", date: "03/31/2026", time: "10:30 AM", appointmentStatus: "S", createdBy: "admin2" },
  { id: 3007, program: "Test", provider: "Hogue", firstName: "Michael", lastName: "Taylor", dateOfBirth: "02/28/1995", phone: "123-555-1212", zip: "90210", state: "CA", date: "03/31/2026", time: "11:00 AM", appointmentStatus: "S", createdBy: "admin1" },
];

const completedAppointments: Appointment[] = [
  { id: 2801, program: "Test", provider: "Hogue", firstName: "Karen", lastName: "White", dateOfBirth: "06/10/1980", phone: "123-555-1212", zip: "30301", state: "GA", date: "03/31/2026", time: "08:00 AM", appointmentStatus: "C", createdBy: "admin1" },
  { id: 2802, program: "Test", provider: "Hogue", firstName: "Thomas", lastName: "Harris", dateOfBirth: "12/05/1975", phone: "123-555-1212", zip: "60614", state: "IL", date: "03/31/2026", time: "08:15 AM", appointmentStatus: "C", createdBy: "admin2" },
  { id: 2803, program: "Test", provider: "Hogue", firstName: "Nancy", lastName: "Clark", dateOfBirth: "08/20/1992", phone: "123-555-1212", zip: "75201", state: "TX", date: "03/31/2026", time: "08:30 AM", appointmentStatus: "C", createdBy: "sparkystoner" },
  { id: 2804, program: "Test", provider: "Hogue", firstName: "Daniel", lastName: "Lewis", dateOfBirth: "04/14/1983", phone: "123-555-1212", zip: "85001", state: "AZ", date: "03/31/2026", time: "08:45 AM", appointmentStatus: "C", createdBy: "admin3" },
  { id: 2805, program: "Test", provider: "Hogue", firstName: "Betty", lastName: "Walker", dateOfBirth: "10/30/1968", phone: "123-555-1212", zip: "48390", state: "MI", date: "03/31/2026", time: "09:00 AM", appointmentStatus: "C", createdBy: "admin1" },
  { id: 2806, program: "Test", provider: "Hogue", firstName: "Steven", lastName: "Hall", dateOfBirth: "03/08/1991", phone: "123-555-1212", zip: "10001", state: "NY", date: "03/31/2026", time: "09:15 AM", appointmentStatus: "C", createdBy: "admin2" },
  { id: 2807, program: "Test", provider: "Hogue", firstName: "Dorothy", lastName: "Allen", dateOfBirth: "07/25/1977", phone: "123-555-1212", zip: "90210", state: "CA", date: "03/31/2026", time: "09:30 AM", appointmentStatus: "C", createdBy: "admin1" },
  { id: 2808, program: "Test", provider: "Hogue", firstName: "Paul", lastName: "Young", dateOfBirth: "01/12/1986", phone: "123-555-1212", zip: "67215", state: "KS", date: "03/31/2026", time: "09:45 AM", appointmentStatus: "C", createdBy: "sparkystoner" },
  { id: 2809, program: "Test", provider: "Hogue", firstName: "Sandra", lastName: "King", dateOfBirth: "11/18/1973", phone: "123-555-1212", zip: "33101", state: "FL", date: "03/31/2026", time: "10:00 AM", appointmentStatus: "C", createdBy: "admin3" },
  { id: 2810, program: "Test", provider: "Hogue", firstName: "Andrew", lastName: "Wright", dateOfBirth: "05/02/1989", phone: "123-555-1212", zip: "98101", state: "WA", date: "03/31/2026", time: "10:15 AM", appointmentStatus: "C", createdBy: "admin2" },
  { id: 2811, program: "Test", provider: "Hogue", firstName: "Margaret", lastName: "Lopez", dateOfBirth: "09/27/1970", phone: "123-555-1212", zip: "80202", state: "CO", date: "03/31/2026", time: "10:30 AM", appointmentStatus: "C", createdBy: "admin1" },
];

const formatDateShort = (dateStr: string) => {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
  }
  return dateStr;
};

interface AppointmentTableProps {
  hideAdminActions?: boolean;
  statusFilter?: string;
  emptyData?: boolean;
  externalAppointments?: Appointment[];
}

const AppointmentTable = ({ hideAdminActions = false, statusFilter, emptyData = false, externalAppointments }: AppointmentTableProps) => {
  const appointments = externalAppointments ?? (emptyData ? [] : (statusFilter === "completed" ? completedAppointments : openAppointments));
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNoShowModalOpen, setIsNoShowModalOpen] = useState(false);
  const [noShowAppointment, setNoShowAppointment] = useState<Appointment | null>(null);

  const handleSettingsClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleNoShowClick = (appointment: Appointment) => {
    setNoShowAppointment(appointment);
    setIsNoShowModalOpen(true);
  };

  const handleNoShowConfirm = () => {
    // TODO: Implement no-show logic here
    console.log("Patient marked as no-show:", noShowAppointment?.id);
    setIsNoShowModalOpen(false);
    setNoShowAppointment(null);
  };

  return (
    <div className="space-y-4">
      <div className="border border-table-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-table-header hover:bg-table-header">
              
              <TableHead className="font-semibold text-foreground">ID</TableHead>
              <TableHead className="font-semibold text-foreground">Prog.</TableHead>
              <TableHead className="font-semibold text-foreground">Provider</TableHead>
              <TableHead className="font-semibold text-foreground">First</TableHead>
              <TableHead className="font-semibold text-foreground">Last</TableHead>
              <TableHead className="font-semibold text-foreground">DOB</TableHead>
              <TableHead className="font-semibold text-foreground whitespace-nowrap">Phone</TableHead>
              <TableHead className="font-semibold text-foreground">Zip</TableHead>
              <TableHead className="font-semibold text-foreground">State</TableHead>
              <TableHead className="font-semibold text-foreground w-20">
                <div className="flex items-center gap-1">
                  Date <ArrowUp className="h-3 w-3 text-destructive" />
                </div>
              </TableHead>
              <TableHead className="font-semibold text-foreground">Time</TableHead>
              <TableHead className="font-semibold text-foreground w-16">Status</TableHead>
              <TableHead className="font-semibold text-foreground w-14">By</TableHead>
              <TableHead className="font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow 
                key={appointment.id}
                className="hover:bg-table-row-hover"
              >
                <TableCell>{appointment.id}</TableCell>
                <TableCell>{appointment.program}</TableCell>
                <TableCell>{appointment.provider}</TableCell>
                <TableCell>{appointment.firstName}</TableCell>
                <TableCell>{appointment.lastName}</TableCell>
                <TableCell>{appointment.dateOfBirth}</TableCell>
                <TableCell className="whitespace-nowrap">{appointment.phone}</TableCell>
                <TableCell>{appointment.zip}</TableCell>
                <TableCell>{appointment.state}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{formatDateShort(appointment.date)}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{appointment.time}</TableCell>
                <TableCell className="text-center">{appointment.appointmentStatus}</TableCell>
                <TableCell>00014</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="table-action-btn text-accent"
                          onClick={() => navigate("/forms", { state: { appointment } })}
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Forms</TooltipContent>
                    </Tooltip>
                    {!hideAdminActions && (
                      <>
                        <button 
                          className="table-action-btn text-destructive hover:text-destructive/80"
                          onClick={() => handleNoShowClick(appointment)}
                        >
                          <UserX className="h-5 w-5" />
                        </button>
                        <button 
                          className="table-action-btn text-muted-foreground hover:text-foreground"
                          onClick={() => handleSettingsClick(appointment)}
                        >
                          <Settings className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <select className="border border-input rounded px-2 py-1 text-sm bg-background">
            <option>20</option>
            <option>50</option>
            <option>100</option>
          </select>
          <span>Go to</span>
          <input 
            type="number" 
            defaultValue={1}
            className="w-12 border border-input rounded px-2 py-1 text-sm bg-background text-center"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon" className="h-8 w-8">
            1
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <AppointmentAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
      />
      <NoShowConfirmationModal
        isOpen={isNoShowModalOpen}
        onClose={() => {
          setIsNoShowModalOpen(false);
          setNoShowAppointment(null);
        }}
        onConfirm={handleNoShowConfirm}
      />
    </div>
  );
};

export default AppointmentTable;
