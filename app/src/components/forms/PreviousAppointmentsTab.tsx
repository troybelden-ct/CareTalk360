import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const previousAppointments = [
  { date: "11/15/2025", type: "Annual Wellness Visit", provider: "Dr. Smith", location: "Main Clinic", status: "Completed", diagnosis: "Z00.00 - General Exam", notes: "HRA completed" },
  { date: "08/22/2025", type: "Follow-Up", provider: "Dr. Johnson", location: "Main Clinic", status: "Completed", diagnosis: "E11.9 - Type 2 Diabetes", notes: "A1C reviewed" },
  { date: "05/10/2025", type: "Sick Visit", provider: "Dr. Smith", location: "Telehealth", status: "Completed", diagnosis: "J06.9 - Upper Resp. Infection", notes: "Antibiotics prescribed" },
  { date: "02/18/2025", type: "Follow-Up", provider: "Dr. Williams", location: "Main Clinic", status: "Completed", diagnosis: "I10 - Hypertension", notes: "BP stable, continue meds" },
  { date: "11/20/2024", type: "Annual Wellness Visit", provider: "Dr. Smith", location: "Main Clinic", status: "Completed", diagnosis: "Z00.01 - General Exam w/ Abnormal", notes: "Referred to cardiology" },
  { date: "07/03/2024", type: "ER Follow-Up", provider: "Dr. Johnson", location: "Main Clinic", status: "Completed", diagnosis: "R55 - Syncope", notes: "Cardiac workup ordered" },
  { date: "03/12/2024", type: "Follow-Up", provider: "Dr. Williams", location: "Telehealth", status: "No Show", diagnosis: "—", notes: "Patient rescheduled" },
  { date: "11/18/2023", type: "Annual Wellness Visit", provider: "Dr. Smith", location: "Main Clinic", status: "Completed", diagnosis: "Z00.00 - General Exam", notes: "HRA completed" },
];

const statusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "No Show":
      return "bg-red-100 text-red-800 border-red-200";
    case "Cancelled":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const PreviousAppointmentsTab = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Previous Appointments</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {previousAppointments.length} previous encounters on record
        </p>
      </div>
      <ScrollArea className="h-[360px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Visit Type</TableHead>
              <TableHead className="text-xs">Provider</TableHead>
              <TableHead className="text-xs">Location</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Diagnosis</TableHead>
              <TableHead className="text-xs">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {previousAppointments.map((appt, i) => (
              <TableRow key={i} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="text-sm font-medium">{appt.date}</TableCell>
                <TableCell className="text-sm">{appt.type}</TableCell>
                <TableCell className="text-sm">{appt.provider}</TableCell>
                <TableCell className="text-sm">{appt.location}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${statusColor(appt.status)}`}>
                    {appt.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{appt.diagnosis}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{appt.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default PreviousAppointmentsTab;
