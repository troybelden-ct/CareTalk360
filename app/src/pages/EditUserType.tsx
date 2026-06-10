import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const mockRoleData: Record<string, { title: string; accountType: string; privileges: string[] }> = {
  "2": {
    title: "Admin",
    accountType: "Admins",
    privileges: [
      "Add Appointment", "Appointment List", "Appointment Report",
      "Complete Appointments", "Create Patient", "Create User",
      "Dashboard", "Edit Appointment", "Edit Patient", "Edit User",
      "Monitor Patients", "Patient Search", "Provider Support",
      "User List", "User Roles",
    ],
  },
  "3": {
    title: "Provider",
    accountType: "Providers",
    privileges: [
      "Add Appointment", "Appointment List", "Complete Appointments",
      "Dashboard", "Edit Appointment", "Patient Search",
    ],
  },
  "1": {
    title: "Super Admin",
    accountType: "Admins",
    privileges: [
      "Add Appointment", "Appointment List", "Appointment Report",
      "Complete Appointments", "Create Patient", "Create User",
      "Dashboard", "Edit Appointment", "Edit Patient", "Edit User",
      "Monitor Patients", "Patient Search", "Provider Support",
      "User List", "User Roles",
    ],
  },
};

const ALL_PRIVILEGES = [
  "Add Appointment", "Appointment List", "Appointment Report",
  "Complete Appointments", "Create Patient", "Create User",
  "Dashboard", "Edit Appointment", "Edit Patient", "Edit User",
  "Monitor Patients", "Patient Search", "Provider Support",
  "User List", "User Roles",
];

const ACCOUNT_TYPES = ["Admins", "Providers", "Nurses", "Support", "Schedulers"];

const EditUserType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = mockRoleData[id || ""] || { title: "Unknown", accountType: "Admins", privileges: [] };

  const [title, setTitle] = useState(data.title);
  const [accountType, setAccountType] = useState(data.accountType);
  const [privileges, setPrivileges] = useState<string[]>(data.privileges);
  const [addPrivilege, setAddPrivilege] = useState("");

  const handleDelete = (priv: string) => {
    setPrivileges((prev) => prev.filter((p) => p !== priv));
  };

  const handleAdd = () => {
    if (addPrivilege && !privileges.includes(addPrivilege)) {
      setPrivileges((prev) => [...prev, addPrivilege].sort());
      setAddPrivilege("");
    }
  };

  const availableToAdd = ALL_PRIVILEGES.filter((p) => !privileges.includes(p));

  return (
    <MainLayout>
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <a href="/dashboard" className="text-primary font-semibold hover:underline">Dashboard</a>
          <span className="text-muted-foreground">{">"}</span>
          <a href="/user-types" className="text-primary font-semibold hover:underline">User Types</a>
          <span className="text-muted-foreground">{">"}</span>
          <span className="text-muted-foreground">Edit User Type</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold underline mb-6">Edit Type: {data.title}</h1>

        {/* Form row */}
        <div className="flex items-end gap-6 mb-6">
          <div className="flex-1 max-w-md">
            <label className="text-sm font-medium mb-1 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex-1 max-w-xs">
            <label className="text-sm font-medium mb-1 block">Account Type</label>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="px-8">Save</Button>
        </div>

        {/* Add privilege row */}
        <div className="flex items-end gap-4 mb-8">
          <div className="max-w-md">
            <label className="text-sm font-medium mb-1 block">Add privilege</label>
            <Select value={addPrivilege} onValueChange={setAddPrivilege}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {availableToAdd.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="secondary"
            className="px-8 bg-muted-foreground/50 text-white hover:bg-muted-foreground/70"
            onClick={handleAdd}
            disabled={!addPrivilege}
          >
            Add
          </Button>
        </div>

        {/* Privileges list */}
        <h2 className="text-xl font-bold underline mb-4">{title} privileges</h2>
        <div className="space-y-3 max-w-lg">
          {privileges.map((priv) => (
            <div key={priv} className="flex items-center gap-3">
              <span className="text-sm flex-1">- {priv}</span>
              <Button
                size="sm"
                variant="destructive"
                className="px-4 text-xs"
                onClick={() => handleDelete(priv)}
              >
                Delete
              </Button>
              <Button
                size="sm"
                className="px-4 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                Default
              </Button>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default EditUserType;
