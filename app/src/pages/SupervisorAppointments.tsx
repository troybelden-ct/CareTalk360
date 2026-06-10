import MainLayout from "@/components/layout/MainLayout";
import AppointmentTable from "@/components/appointments/AppointmentTable";
import { type Appointment } from "@/components/appointments/AppointmentTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";
import { useState } from "react";

const allOpenAppointments: Appointment[] = [
  { id: 3001, program: "Test", provider: "Hogue", firstName: "James", lastName: "Wilson", dateOfBirth: "03/15/1978", phone: "(404) 555-1201", zip: "30301", state: "GA", date: "03/31/2026", time: "08:00 AM", appointmentStatus: "S", createdBy: "admin1" },
  { id: 3002, program: "Test", provider: "Hogue", firstName: "Maria", lastName: "Garcia", dateOfBirth: "07/22/1985", phone: "(312) 555-3402", zip: "60614", state: "IL", date: "03/31/2026", time: "08:30 AM", appointmentStatus: "S", createdBy: "admin2" },
  { id: 3003, program: "Test", provider: "Hogue", firstName: "Robert", lastName: "Johnson", dateOfBirth: "11/04/1990", phone: "(214) 555-7503", zip: "75201", state: "TX", date: "03/31/2026", time: "09:00 AM", appointmentStatus: "S", createdBy: "admin1" },
  { id: 3004, program: "Test", provider: "Hogue", firstName: "Linda", lastName: "Martinez", dateOfBirth: "01/30/1972", phone: "(602) 555-8504", zip: "85001", state: "AZ", date: "03/31/2026", time: "09:30 AM", appointmentStatus: "S", createdBy: "admin3" },
  { id: 3005, program: "Test", provider: "Hogue", firstName: "David", lastName: "Brown", dateOfBirth: "05/18/1988", phone: "(248) 555-4805", zip: "48390", state: "MI", date: "03/31/2026", time: "10:00 AM", appointmentStatus: "S", createdBy: "sparkystoner" },
  { id: 3006, program: "Test", provider: "Hogue", firstName: "Susan", lastName: "Davis", dateOfBirth: "09/12/1965", phone: "(212) 555-1006", zip: "10001", state: "NY", date: "03/31/2026", time: "10:30 AM", appointmentStatus: "S", createdBy: "admin2" },
  { id: 3007, program: "Test", provider: "Hogue", firstName: "Michael", lastName: "Taylor", dateOfBirth: "02/28/1995", phone: "(310) 555-9007", zip: "90210", state: "CA", date: "03/31/2026", time: "11:00 AM", appointmentStatus: "S", createdBy: "admin1" },
];

const SupervisorAppointments = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("open");
  const [refreshCount, setRefreshCount] = useState(0);

  const handleSearch = () => {
    console.log("Searching for:", { firstName, lastName, phone });
  };

  const handleRefresh = () => {
    if (refreshCount < allOpenAppointments.length) {
      setRefreshCount((prev) => prev + 1);
    }
  };

  const visibleOpenAppointments = allOpenAppointments.slice(0, refreshCount);
  const assigned = refreshCount;
  const open = refreshCount;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-primary underline underline-offset-4">
          Appointments-S
        </h1>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Appts Today", value: 24 },
            { label: "Assigned", value: assigned },
            { label: "Open", value: open },
            { label: "Completed", value: 0 },
          ].map((item) => (
            <div key={item.label} className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="text-3xl font-bold text-primary">{item.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <AppointmentTable
          hideAdminActions
          statusFilter={status}
          externalAppointments={status === "open" ? visibleOpenAppointments : []}
        />
      </div>
    </MainLayout>
  );
};

export default SupervisorAppointments;
