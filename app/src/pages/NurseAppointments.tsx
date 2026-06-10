import MainLayout from "@/components/layout/MainLayout";
import AppointmentTable from "@/components/appointments/AppointmentTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";
import { useState } from "react";

const NurseAppointments = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("open");

  const handleSearch = () => {
    console.log("Searching for:", { firstName, lastName, phone });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-primary underline underline-offset-4">
          Appointments-N
        </h1>
        <div className="grid grid-cols-4 gap-4">
          {(() => {
            const assigned = 18;
            const completed = 11;
            const open = 7;
            return [
              { label: "Appts Today", value: 24 },
              { label: "Assigned", value: assigned },
              { label: "Open", value: open },
              { label: "Completed", value: completed },
            ];
          })().map((item) => (
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
          <Button onClick={() => console.log("Refresh")}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <AppointmentTable hideAdminActions statusFilter={status} />
      </div>
    </MainLayout>
  );
};

export default NurseAppointments;
