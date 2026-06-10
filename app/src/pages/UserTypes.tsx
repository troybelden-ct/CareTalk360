import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit } from "lucide-react";

interface UserRole {
  id: number;
  role: string;
}

const allRoles: UserRole[] = [
  { id: 2, role: "Admin" },
  { id: 8, role: "Certified Nursing Assistant" },
  { id: 15, role: "DEVELOPER" },
  { id: 11, role: "Engagement Specialist" },
  { id: 20, role: "Engager Hero" },
  { id: 13, role: "Medical Assistant" },
  { id: 3, role: "Provider" },
  { id: 21, role: "PSS" },
  { id: 4, role: "Registered Nurse" },
  { id: 5, role: "Scheduler" },
  { id: 14, role: "Site Admin" },
  { id: 1, role: "Super Admin" },
  { id: 10, role: "Support" },
  { id: 9, role: "Telehealth Nurse" },
];

const UserTypes = () => {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allRoles.length / rowsPerPage);
  const paginatedRoles = allRoles.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <MainLayout>
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <a href="/dashboard" className="text-primary font-semibold hover:underline">Dashboard</a>
          <span className="text-muted-foreground">{">"}</span>
          <span className="text-muted-foreground">User Types</span>
        </div>

        {/* Title and description */}
        <h1 className="text-2xl font-bold underline mb-2">User Roles</h1>
        <p className="text-sm text-foreground mb-6">
          Welcome to the <strong>User Roles Management</strong> section of CareTalk 360. Here, you can view, edit, or add different user roles for our system. Each role is defined with specific privileges to ensure smooth operations. To modify a user role, simply click on the 'Edit' icon. For adding a new user role, use the <strong>Add User Role</strong> button
        </p>

        {/* Add button */}
        <div className="flex justify-end mb-4">
          <Button className="px-6">Add User Role</Button>
        </div>

        {/* Table */}
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[120px] text-center font-semibold">ID</TableHead>
                <TableHead className="text-center font-semibold">User Role</TableHead>
                <TableHead className="w-[120px] text-center font-semibold">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="text-center">{role.id}</TableCell>
                  <TableCell className="text-center">{role.role}</TableCell>
                  <TableCell className="text-center">
                    <button className="text-primary hover:text-primary/80" onClick={() => navigate(`/edit-user-type/${role.id}`)}>
                      <Edit className="h-4 w-4 inline" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span>Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border rounded px-1 py-0.5 text-sm"
              >
                {[8, 10, 20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span>Go to</span>
              <select
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="border rounded px-1 py-0.5 text-sm"
              >
                {Array.from({ length: totalPages }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</Button>
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserTypes;
