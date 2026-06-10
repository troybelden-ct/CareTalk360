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

interface AppointmentType {
  id: number;
  name: string;
  duration: number;
  color: string;
}

const allTypes: AppointmentType[] = [
  { id: 1, name: "Annual Wellness Visit", duration: 45, color: "#3e6093" },
  { id: 2, name: "Follow-Up", duration: 20, color: "#16a34a" },
  { id: 3, name: "New Patient", duration: 60, color: "#9333ea" },
  { id: 4, name: "Telehealth", duration: 30, color: "#0891b2" },
  { id: 5, name: "Urgent Care", duration: 15, color: "#dc2626" },
  { id: 6, name: "Mental Health", duration: 50, color: "#ca8a04" },
  { id: 7, name: "Care Navigation", duration: 30, color: "#2563eb" },
  { id: 8, name: "Chronic Care Management", duration: 40, color: "#7c3aed" },
  { id: 9, name: "Preventive Screening", duration: 25, color: "#059669" },
  { id: 10, name: "Lab Review", duration: 15, color: "#d97706" },
];

const AppointmentTypes = () => {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allTypes.length / rowsPerPage);
  const paginatedTypes = allTypes.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <MainLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }, { label: "Appointment Types" }]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold underline mb-2">Appointment Types</h1>
        <p className="text-sm text-foreground mb-6">
          Welcome to the <strong>Appointment Types Management</strong> section of CareTalk 360. Here, you can view, edit, or add different appointment types for scheduling. Each type defines the duration and category of patient visits. To modify an appointment type, click the 'Edit' icon. To add a new type, use the <strong>Add Appointment Type</strong> button.
        </p>

        <div className="flex justify-end mb-4">
          <Button className="px-6 bg-[#3e6093] hover:bg-[#345280] text-white">Add Appointment Type</Button>
        </div>

        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px] text-center font-semibold">ID</TableHead>
                <TableHead className="text-center font-semibold">Appointment Type</TableHead>
                <TableHead className="w-[120px] text-center font-semibold">Duration (min)</TableHead>
                <TableHead className="w-[100px] text-center font-semibold">Color</TableHead>
                <TableHead className="w-[80px] text-center font-semibold">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="text-center">{type.id}</TableCell>
                  <TableCell className="text-center">{type.name}</TableCell>
                  <TableCell className="text-center">{type.duration}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: type.color }} />
                      <span className="text-xs text-muted-foreground">{type.color}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <button className="text-primary hover:text-primary/80">
                      <Edit className="h-4 w-4 inline" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

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

export default AppointmentTypes;
