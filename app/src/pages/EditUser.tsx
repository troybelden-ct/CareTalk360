import { useState, useMemo } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { ChevronUp } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM",
];

const DEFAULT_AVAILABILITY: Record<number, string[]> = {
  1: [], // Sun
  2: ["10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM"], // Mon
  3: ["09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM"], // Tue
  4: ["09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM"], // Wed
  5: [], // Thu
  6: ["10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM"], // Fri
  7: [], // Sat
};

const AvailabilityTab = ({ username, fullName }: { username: string; fullName: string }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 2, 1));
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [daysOff, setDaysOff] = useState<string[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);

  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 0 }), [selectedDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const getSlots = (day: Date): string[] => {
    const key = format(day, "yyyy-MM-dd");
    if (availability[key] !== undefined) return availability[key];
    const dayOfWeek = day.getDay() + 1; // 1=Sun
    return DEFAULT_AVAILABILITY[dayOfWeek] || [];
  };

  const toggleSlot = (day: Date, slot: string) => {
    const key = format(day, "yyyy-MM-dd");
    const current = getSlots(day);
    const updated = current.includes(slot)
      ? current.filter((s) => s !== slot)
      : [...current, slot];
    setAvailability((prev) => ({ ...prev, [key]: updated }));
  };

  const toggleDayOff = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    setDaysOff((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">My Availability - {fullName}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        To set up your schedule select either every week or a specific week and check the box for the day and hour you are available for appointments.
      </p>

      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-primary font-semibold">
            {username} - Week of {format(weekStart, "MM/dd/yyyy")}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-between">
                {format(selectedDate, "MM/dd/yyyy")}
                <ChevronUp className="h-4 w-4 rotate-180" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-3 text-left">
                  <Button size="sm" className="px-6">Save</Button>
                </th>
                {weekDays.map((day) => (
                  <th key={day.toISOString()} className="p-3 text-center">
                    <div className="font-semibold">{format(day, "EEE, MM/dd")}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Checkbox
                        checked={daysOff.includes(format(day, "yyyy-MM-dd"))}
                        onCheckedChange={() => toggleDayOff(day)}
                      />
                      <span className="text-xs text-muted-foreground">day off</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="text-center py-2 border-b cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setShowPrevious(!showPrevious)}>
                  <div className="flex items-center justify-center gap-1">
                    <ChevronUp className={cn("h-4 w-4 transition-transform", !showPrevious && "rotate-180")} />
                    <span className="text-sm">Show Previous</span>
                  </div>
                </td>
              </tr>
              {TIME_SLOTS.map((slot) => (
                <tr key={slot} className="border-b">
                  <td className="p-3 text-muted-foreground whitespace-nowrap">{slot}</td>
                  {weekDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const isDayOff = daysOff.includes(key);
                    return (
                      <td key={day.toISOString()} className="p-3 text-center">
                        <Checkbox
                          checked={!isDayOff && getSlots(day).includes(slot)}
                          onCheckedChange={() => toggleSlot(day, slot)}
                          disabled={isDayOff}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SCHEDULE_TIME_SLOTS = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM",
];

const ScheduleTab = ({ fullName }: { fullName: string }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 2, 1));
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [daysOff, setDaysOff] = useState<string[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);

  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 0 }), [selectedDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const getSlots = (day: Date): string[] => {
    const key = format(day, "yyyy-MM-dd");
    if (availability[key] !== undefined) return availability[key];
    const dayOfWeek = day.getDay() + 1;
    return DEFAULT_AVAILABILITY[dayOfWeek] || [];
  };

  const toggleSlot = (day: Date, slot: string) => {
    const key = format(day, "yyyy-MM-dd");
    const current = getSlots(day);
    const updated = current.includes(slot)
      ? current.filter((s) => s !== slot)
      : [...current, slot];
    setAvailability((prev) => ({ ...prev, [key]: updated }));
  };

  const toggleDayOff = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    setDaysOff((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Schedule - {fullName}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        To set up your schedule select either every week or a specific week and check the box for the day and hour you are available for appointments.
      </p>

      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-primary font-semibold">
            Week of {format(weekStart, "MM/dd/yyyy")}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-between">
                {format(selectedDate, "MM/dd/yyyy")}
                <ChevronUp className="h-4 w-4 rotate-180" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-3 text-left">
                  <Button size="sm" className="px-6">Save</Button>
                </th>
                {weekDays.map((day) => (
                  <th key={day.toISOString()} className="p-3 text-center">
                    <div className="font-semibold">{format(day, "EEE, MM/dd")}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Checkbox
                        checked={daysOff.includes(format(day, "yyyy-MM-dd"))}
                        onCheckedChange={() => toggleDayOff(day)}
                      />
                      <span className="text-xs text-muted-foreground">day off</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="text-center py-2 border-b cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setShowPrevious(!showPrevious)}>
                  <div className="flex items-center justify-center gap-1">
                    <ChevronUp className={cn("h-4 w-4 transition-transform", !showPrevious && "rotate-180")} />
                    <span className="text-sm">Show Previous</span>
                  </div>
                </td>
              </tr>
              {SCHEDULE_TIME_SLOTS.map((slot) => (
                <tr key={slot} className="border-b">
                  <td className="p-3 text-muted-foreground whitespace-nowrap">{slot}</td>
                  {weekDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const isDayOff = daysOff.includes(key);
                    return (
                      <td key={day.toISOString()} className="p-3 text-center">
                        <Checkbox
                          checked={!isDayOff && getSlots(day).includes(slot)}
                          onCheckedChange={() => toggleSlot(day, slot)}
                          disabled={isDayOff}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MOCK_CLIENTS = [
  "CareTalkHealth", "TestClient", "CTHTEST", "Heroes Testing",
  "Cents", "TrainingClient", "Every", "HummingBird", "Cary",
];

const MOCK_PROGRAMS: Record<string, string[]> = {
  HummingBird: ["AWVs", "AsynchTest"],
  CareTalkHealth: ["Primary Care", "Wellness"],
  TestClient: ["Demo Program"],
};

const MOCK_APPT_TYPES: Record<string, string[]> = {
  AWVs: ["Hummingbird"],
  AsynchTest: ["Follow-up"],
  "Primary Care": ["In-person", "Telehealth"],
};

const AssignmentsTab = ({ fullName }: { fullName: string }) => {
  const [selectedClient, setSelectedClient] = useState<string>("HummingBird");
  const [selectedProgram, setSelectedProgram] = useState<string>("AWVs");
  const [selectedApptTypes, setSelectedApptTypes] = useState<string[]>(["Hummingbird"]);

  const programs = MOCK_PROGRAMS[selectedClient] || [];
  const apptTypes = MOCK_APPT_TYPES[selectedProgram] || [];

  const toggleApptType = (type: string) => {
    setSelectedApptTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-4">Assignments - {fullName}</h2>
      <div className="flex gap-8">
      {/* Clients */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Clients</h3>
        <div className="border rounded">
          {MOCK_CLIENTS.map((client) => (
            <div
              key={client}
              className={cn(
                "px-4 py-3 cursor-pointer border-b last:border-b-0 text-sm",
                selectedClient === client
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-muted/50"
              )}
              onClick={() => {
                setSelectedClient(client);
                const progs = MOCK_PROGRAMS[client] || [];
                setSelectedProgram(progs[0] || "");
                setSelectedApptTypes([]);
              }}
            >
              {client}
            </div>
          ))}
        </div>
      </div>

      {/* Programs */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Programs</h3>
        <div className="space-y-1">
          {programs.map((prog) => (
            <div
              key={prog}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded cursor-pointer text-sm",
                selectedProgram === prog ? "bg-muted" : ""
              )}
              onClick={() => {
                setSelectedProgram(prog);
                setSelectedApptTypes([]);
              }}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                selectedProgram === prog ? "border-primary" : "border-muted-foreground"
              )}>
                {selectedProgram === prog && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              {prog}
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Types */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Appointment Types</h3>
        <div className="space-y-2">
          {apptTypes.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                checked={selectedApptTypes.includes(type)}
                onCheckedChange={() => toggleApptType(type)}
              />
              <label className="text-sm">{type}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Save button positioned bottom-right */}
      <Button className="absolute bottom-6 right-6 px-6">Save Assignments</Button>
      </div>
    </div>
  );
};

const mockUserData: Record<string, any> = {
  "2318": {
    username: "tbdoc", firstName: "Aurelius", lastName: "Hogue",
    title: "Dr.", mobile: "6053101479", email: "tbelden@varsitycs.com",
    address: "123 Any Street", city: "Castlewood", state: "South Dakota", zipCode: "57223",
    userManager: "", department: "", delegatedApprover: "",
    userRole: "Provider", npi: "12345678901", appointmentSlotSize: "",
    active: true,
  },
  "1": {
    username: "JoeBous", firstName: "Joe", lastName: "Bous",
    title: "", mobile: "", email: "joebous@gmail.com",
    address: "", city: "", state: "", zipCode: "",
    userManager: "", department: "", delegatedApprover: "",
    userRole: "", npi: "", appointmentSlotSize: "",
    active: true,
  },
};

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = mockUserData[id || ""] || mockUserData["2318"];

  const [form, setForm] = useState({ ...userData });
  const [licenses, setLicenses] = useState<string[]>([...US_STATES]);

  const allChecked = licenses.length === US_STATES.length;

  const toggleAll = () => {
    setLicenses(allChecked ? [] : [...US_STATES]);
  };

  const toggleState = (state: string) => {
    setLicenses((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  // Sort states alphabetically across columns (top-to-bottom, left-to-right)
  const statesPerColumn = Math.ceil(US_STATES.length / 4);
  const sortedStates = [...US_STATES].sort();
  const columns = Array.from({ length: 4 }, (_, i) =>
    sortedStates.slice(i * statesPerColumn, (i + 1) * statesPerColumn)
  );

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Manage Patients (Doctor)", href: "/user-list" },
      { label: "Edit Admin" },
    ]}>
      <div className="mb-6">

        <Tabs defaultValue="profile">
          <TabsList className="bg-transparent border-b rounded-none w-full justify-start gap-0 h-auto p-0">
            {["Profile", "Licenses", "Availability", "Schedule", "Assignments"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase()}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-medium"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Profile - {form.firstName} {form.lastName}</h2>
            {/* Active checkbox */}
            <div className="flex items-center gap-2 mb-6">
              <Checkbox
                checked={form.active}
                onCheckedChange={(checked) => updateField("active", !!checked)}
              />
              <label className="text-sm font-medium">Active</label>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-3 gap-x-8 gap-y-5">
              {/* Row 1 */}
              <div>
                <label className="text-sm font-medium mb-1 block">Username</label>
                <Input value={form.username} onChange={(e) => updateField("username", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">First Name</label>
                <Input value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Last Name</label>
                <Input value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
              </div>

              {/* Row 2 */}
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Mobile</label>
                <Input value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input value={form.email} onChange={(e) => updateField("email", e.target.value)} />
              </div>

              {/* Row 3 */}
              <div>
                <label className="text-sm font-medium mb-1 block">Address</label>
                <Input value={form.address} onChange={(e) => updateField("address", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">City</label>
                <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">State</label>
                  <Select value={form.state} onValueChange={(v) => updateField("state", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Zip code</label>
                  <Input value={form.zipCode} onChange={(e) => updateField("zipCode", e.target.value)} />
                </div>
              </div>

              {/* Row 4 */}
              <div>
                <label className="text-sm font-medium mb-1 block">User Manager</label>
                <Select value={form.userManager} onValueChange={(v) => updateField("userManager", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Department</label>
                <Input value={form.department} onChange={(e) => updateField("department", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Delegated Approver</label>
                <Input value={form.delegatedApprover} onChange={(e) => updateField("delegatedApprover", e.target.value)} />
              </div>

              {/* Row 5 */}
              <div>
                <label className="text-sm font-medium mb-1 block">User Role</label>
                <Select value={form.userRole} onValueChange={(v) => updateField("userRole", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Provider">Provider</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Nurse">Nurse</SelectItem>
                    <SelectItem value="Agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">NPI</label>
                <Input value={form.npi} onChange={(e) => updateField("npi", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Appointment Slot size</label>
                <Select value={form.appointmentSlotSize} onValueChange={(v) => updateField("appointmentSlotSize", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 6 */}
              <div>
                <label className="text-sm font-medium mb-1 block">Change Password</label>
                <Input type="password" value="" onChange={() => {}} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4 mt-10">
              <Button className="px-10">Save</Button>
              <Button variant="destructive" className="px-8">Deactivate User</Button>
            </div>
          </TabsContent>

          <TabsContent value="licenses" className="mt-6">
            <h2 className="text-xl font-semibold underline text-foreground mb-1">Provider Licenses - {form.firstName} {form.lastName}</h2>
            <p className="text-sm text-foreground mb-6">Name: {form.firstName} {form.lastName}</p>

            <div className="flex items-center gap-2 mb-4">
              <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
              <label className="text-sm font-bold">{allChecked ? "Uncheck All" : "Check All"}</label>
            </div>

            <div className="grid grid-cols-4 gap-x-8 gap-y-2">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-2">
                  {col.map((state) => (
                    <div key={state} className="flex items-center gap-2">
                      <Checkbox
                        checked={licenses.includes(state)}
                        onCheckedChange={() => toggleState(state)}
                      />
                      <label className="text-sm text-muted-foreground">{state}</label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="availability" className="mt-6">
            <AvailabilityTab username={form.username} fullName={`${form.firstName} ${form.lastName}`} />
          </TabsContent>
          <TabsContent value="schedule" className="mt-6">
            <ScheduleTab fullName={`${form.firstName} ${form.lastName}`} />
          </TabsContent>
          <TabsContent value="assignments" className="mt-6">
            <AssignmentsTab fullName={`${form.firstName} ${form.lastName}`} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default EditUser;
