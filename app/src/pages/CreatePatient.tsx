import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY",
];

const CLIENTS = ["Client A", "Client B", "Client C", "Client D"];
const PROGRAMS = ["Program 1", "Program 2", "Program 3", "Program 4"];
const GENDERS = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];

const CreatePatient = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    client: "",
    program: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    zipCode: "",
    state: "",
    phone: "",
    mbi: "",
    recordId: "",
    leadId: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setSelect = (field: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const RequiredMark = () => <span className="text-destructive ml-0.5">*</span>;

  return (
    <MainLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Create Patient" }]}>
      <div className="space-y-6">

        <h1 className="text-2xl font-bold text-primary underline underline-offset-4">
          Create Patient
        </h1>

        <p className="text-muted-foreground">
          Welcome to the <strong>Patient</strong> section of CareTalk 360. Begin by filling out the essential fields marked with an asterisk (*). After registration, the created user will receive an email with a link to set their password and complete their profile.
        </p>

        {/* Row 1: First name, Last name, Email */}
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="font-semibold text-primary">First name<RequiredMark /></Label>
            <Input value={form.firstName} onChange={set("firstName")} />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-primary">Last name<RequiredMark /></Label>
            <Input value={form.lastName} onChange={set("lastName")} />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-primary">Email<RequiredMark /></Label>
            <Input type="email" value={form.email} onChange={set("email")} />
          </div>
        </div>

        {/* Row 2: Clients, Programs, Date of Birth */}
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="font-semibold text-primary">Clients<RequiredMark /></Label>
            <Select value={form.client} onValueChange={setSelect("client")}>
              <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
              <SelectContent>
                {CLIENTS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-primary">Programs<RequiredMark /></Label>
            <Select value={form.program} onValueChange={setSelect("program")}>
              <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
              <SelectContent>
                {PROGRAMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-primary">Date of Birth<RequiredMark /></Label>
            <Input type="date" value={form.dob} onChange={set("dob")} />
          </div>
        </div>

        {/* Row 3: Gender, Address, City */}
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="font-semibold text-primary">Gender<RequiredMark /></Label>
            <Select value={form.gender} onValueChange={setSelect("gender")}>
              <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-primary">Address<RequiredMark /></Label>
            <Input value={form.address} onChange={set("address")} />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-primary">City<RequiredMark /></Label>
            <Input value={form.city} onChange={set("city")} />
          </div>
        </div>

        {/* Row 4: Zip Code, State, Phone number */}
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="font-semibold text-primary">Zip Code<RequiredMark /></Label>
            <Input value={form.zipCode} onChange={set("zipCode")} />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-primary">State<RequiredMark /></Label>
            <Select value={form.state} onValueChange={setSelect("state")}>
              <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-primary">Phone number<RequiredMark /></Label>
            <Input value={form.phone} onChange={set("phone")} />
          </div>
        </div>

        {/* Row 5: MBI, Record ID, Lead ID */}
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="font-semibold text-primary">MBI<RequiredMark /></Label>
            <Input value={form.mbi} onChange={set("mbi")} />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-primary">Record ID</Label>
            <Input value={form.recordId} onChange={set("recordId")} />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-primary">Lead ID</Label>
            <Input value={form.leadId} onChange={set("leadId")} />
          </div>
        </div>

        <Separator />

        <p className="text-sm text-muted-foreground">
          <span className="text-destructive">*</span> When you hit 'Create' during registration, we'll send a code for password confirmation, allowing him to resume profile editing.
        </p>

        <div className="flex justify-center">
          <Button className="px-12">Save</Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreatePatient;
