import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const USER_ROLES = [
  "Admin", "Certified Nursing Assistant", "DEVELOPER", "Engagement Specialist",
  "Engager Hero", "Medical Assistant", "Provider", "PSS", "Registered Nurse",
  "Scheduler", "Site Admin", "Super Admin", "Support", "Telehealth Nurse",
];

const MANAGERS = ["John Smith", "Jane Doe", "Robert Wilson", "Sarah Johnson"];

const SLOT_SIZES = ["15", "20", "30", "45", "60"];

const CreateUser = () => {
  const [form, setForm] = useState({
    userRole: "", username: "", email: "", title: "", firstName: "", lastName: "",
    npi: "", userManager: "", department: "", address: "", city: "", state: "",
    zipCode: "", pincode: "", mobile: "", slotSize: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const RequiredMark = () => <span className="text-destructive">*</span>;

  return (
    <MainLayout>
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <a href="/dashboard" className="text-primary font-semibold hover:underline">Dashboard</a>
          <span className="text-muted-foreground">{">"}</span>
          <span className="text-muted-foreground">Create User</span>
        </div>

        <h1 className="text-2xl font-bold underline mb-2">Create</h1>
        <p className="text-sm text-foreground mb-8">
          Welcome to the <strong>Create</strong> section of CareTalk 360. Begin by filling out the essential fields marked with an asterisk (*). After registration, the created user will receive an email with a link to set their password and complete their profile.
        </p>

        {/* Row 1 */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <label className="text-sm font-semibold mb-1 block">User Role<RequiredMark /></label>
            <Select value={form.userRole} onValueChange={(v) => update("userRole", v)}>
              <SelectTrigger><SelectValue placeholder="Select User Role" /></SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Username<RequiredMark /></label>
            <Input value={form.username} onChange={(e) => update("username", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Email <RequiredMark /></label>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <label className="text-sm font-semibold mb-1 block">Title</label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">First name</label>
            <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Last name</label>
            <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <label className="text-sm font-semibold mb-1 block">NPI</label>
            <Input value={form.npi} onChange={(e) => update("npi", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">User Manager</label>
            <Select value={form.userManager} onValueChange={(v) => update("userManager", v)}>
              <SelectTrigger><SelectValue placeholder="Select User Manager" /></SelectTrigger>
              <SelectContent>
                {MANAGERS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Department</label>
            <Input value={form.department} onChange={(e) => update("department", e.target.value)} />
          </div>
        </div>

        {/* Row 4 - Address */}
        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-6 mb-6">
          <div>
            <label className="text-sm font-semibold mb-1 block">Address</label>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">City</label>
            <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">State <RequiredMark /></label>
            <Select value={form.state} onValueChange={(v) => update("state", v)}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">ZIP Code <RequiredMark /></label>
            <Input className="w-[140px]" value={form.zipCode} onChange={(e) => update("zipCode", e.target.value)} />
          </div>
        </div>

        {/* Row 5 */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <label className="text-sm font-semibold mb-1 block">Pincode</label>
            <Input value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Mobile</label>
            <Input value={form.mobile} onChange={(e) => update("mobile", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Slot size</label>
            <Select value={form.slotSize} onValueChange={(v) => update("slotSize", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SLOT_SIZES.map((s) => <SelectItem key={s} value={s}>{s} min</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm mb-4">
          <span className="text-destructive">*</span> When you hit 'Create' during registration, we'll send a code for password confirmation, allowing him to resume profile editing.
        </p>
        <div className="flex justify-center">
          <Button className="px-12">Create</Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateUser;
