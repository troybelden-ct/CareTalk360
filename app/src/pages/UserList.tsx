import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  mobile: string;
  email: string;
  lastLogin: string;
  status: string;
}

const mockUsers: User[] = [
  { id: 1, firstName: "Joe", lastName: "Bous", username: "JoeBous", mobile: "", email: "joebous@gmail.com", lastLogin: "03/28/2026 09:14 AM", status: "Active" },
  { id: 8, firstName: "Sam", lastName: "Micheal", username: "devTest", mobile: "", email: "test-dev@majisa.com", lastLogin: "04/01/2026 02:47 PM", status: "Active" },
  { id: 11, firstName: "Max", lastName: "Oliver", username: "maxoliver", mobile: "", email: "joe@bous.com", lastLogin: "03/30/2026 11:22 AM", status: "Active" },
  { id: 12, firstName: "Troy", lastName: "Belden", username: "troyb", mobile: "123-555-1212", email: "troy.belden@caretalkhealth.com", lastLogin: "04/02/2026 08:03 AM", status: "Active" },
  { id: 15, firstName: "Stacie", lastName: "Stoner", username: "stacies", mobile: "", email: "stacie.stoner@caretalkhealth.com", lastLogin: "03/31/2026 04:55 PM", status: "Active" },
  { id: 20, firstName: "Agent", lastName: "Team", username: "agentTB", mobile: "", email: "troy.belden@caretalkhealth.com", lastLogin: "03/25/2026 10:30 AM", status: "Active" },
  { id: 2318, firstName: "Aurelius", lastName: "Hogue", username: "tbdoc", mobile: "123-555-1212", email: "tbelden@varsitycs.com", lastLogin: "04/01/2026 07:19 PM", status: "Active" },
  { id: 2340, firstName: "Bonnie", lastName: "Sloma", username: "Bonnie", mobile: "123-555-1212", email: "bonnie.sloma@caretalkhealth.com", lastLogin: "03/29/2026 01:08 PM", status: "Active" },
  { id: 2369, firstName: "Test", lastName: "ES", username: "testES", mobile: "123-555-1212", email: "t@w.com", lastLogin: "03/27/2026 03:42 PM", status: "Active" },
  { id: 2370, firstName: "Sameh", lastName: "Selim", username: "TheDoctor", mobile: "", email: "doctor@doc.com", lastLogin: "04/02/2026 06:11 AM", status: "Active" },
];

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const UserList = () => {
  const navigate = useNavigate();
  const [lastNameFilter, setLastNameFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesName = !lastNameFilter || user.lastName.toLowerCase().includes(lastNameFilter.toLowerCase());
    return matchesName;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) pages.push(i);
    if (totalPages > 5) {
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <MainLayout breadcrumbs={[{ label: "Users" }, { label: "User List" }]}>
      <div className="mb-6">

        <h1 className="text-2xl font-bold underline mb-2">User List</h1>
        <p className="text-muted-foreground mb-6">
          The table below contains a list of all users. You can filter based on role and search based on last name.
        </p>

        {/* Filters */}
        <div className="flex items-end gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Last Name</label>
            <Input
              value={lastNameFilter}
              onChange={(e) => { setLastNameFilter(e.target.value); setCurrentPage(1); }}
              className="w-48"
              placeholder=""
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">User Role</label>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto">
            <Button>View All Admins</Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-primary">ID</TableHead>
                <TableHead className="font-semibold text-primary">First Name</TableHead>
                <TableHead className="font-semibold text-primary">Last Name</TableHead>
                <TableHead className="font-semibold text-primary">Username</TableHead>
                <TableHead className="font-semibold text-primary">Mobile</TableHead>
                <TableHead className="font-semibold text-primary">Email</TableHead>
                <TableHead className="font-semibold text-primary">Last Login</TableHead>
                <TableHead className="font-semibold text-primary">Status</TableHead>
                <TableHead className="font-semibold text-primary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.mobile}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-primary hover:text-primary/80"
                        onClick={() => navigate(`/edit-user/${user.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <Switch defaultChecked={user.status === "Active"} className="h-4 w-8 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-4" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm">
            <span>Rows per page</span>
            <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="ml-4">Go to</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const p = Number(e.target.value);
                if (p >= 1 && p <= totalPages) setCurrentPage(p);
              }}
              className="w-16 h-8"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>‹</Button>
            {getPageNumbers().map((page, i) =>
              typeof page === "number" ? (
                <Button
                  key={i}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ) : (
                <span key={i} className="px-1 text-muted-foreground">...</span>
              )
            )}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>›</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserList;
