import { useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const formsData = [
  { id: 181, name: "Quarterly Follow Up Note", createdAt: "04/10/2026" },
  { id: 180, name: "Hero and Care Management Initial Visit", createdAt: "04/10/2026" },
  { id: 179, name: "Plan", createdAt: "04/06/2026" },
  { id: 178, name: "PHQ2", createdAt: "04/06/2026" },
  { id: 177, name: "PHQ9", createdAt: "04/06/2026" },
  { id: 176, name: "Universal Follow-Up Order Form", createdAt: "04/01/2026" },
  { id: 175, name: "SUPD Order Form NEW", createdAt: "04/01/2026" },
  { id: 174, name: "SPC Order NEW", createdAt: "04/01/2026" },
  { id: 173, name: "EED Order Form NEW", createdAt: "04/01/2026" },
  { id: 172, name: "KED Order Form NEW", createdAt: "04/01/2026" },
  { id: 171, name: "BCS Order Form", createdAt: "03/28/2026" },
  { id: 170, name: "COL Order Form", createdAt: "03/28/2026" },
  { id: 169, name: "HBA1C Order Form", createdAt: "03/28/2026" },
  { id: 168, name: "Vitals Form", createdAt: "03/20/2026" },
  { id: 167, name: "Assessment Template", createdAt: "03/20/2026" },
  { id: 166, name: "ROS Template", createdAt: "03/15/2026" },
  { id: 165, name: "HPI Template", createdAt: "03/15/2026" },
  { id: 164, name: "Exam Template", createdAt: "03/10/2026" },
  { id: 163, name: "Medical History Form", createdAt: "03/10/2026" },
  { id: 162, name: "Intake Form", createdAt: "03/05/2026" },
];

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const FormSetup = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(formsData.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const pageData = formsData.slice(startIdx, startIdx + rowsPerPage);

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
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <span className="text-primary font-medium underline">Dashboard</span>
        <span className="text-muted-foreground">›</span>
        <span className="text-muted-foreground">Form Setup</span>
      </div>

      <h1 className="text-2xl font-bold text-foreground underline mb-2">Forms</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Welcome to the section of CareTalk 360. Browse the list to view all The Forms, their details. For edits, use the pencil icon, For Preview, use the scope icon, For delete, use trash icon
      </p>

      <h2 className="text-lg font-semibold text-foreground underline mb-4">Forms List</h2>

      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead className="font-bold text-primary w-[80px]">ID</TableHead>
              <TableHead className="font-bold text-primary">Form Name</TableHead>
              <TableHead className="font-bold text-primary w-[140px]">Created At</TableHead>
              <TableHead className="font-bold text-primary w-[120px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((form, idx) => (
              <TableRow key={form.id} className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                <TableCell className="text-center">{form.id}</TableCell>
                <TableCell className="text-center">{form.name}</TableCell>
                <TableCell className="text-center">{form.createdAt}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <button className="text-primary hover:text-primary/80"><Search className="h-4 w-4" /></button>
                    <button className="text-primary hover:text-primary/80"><Pencil className="h-4 w-4" /></button>
                    <button className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                  </div>
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
              className="border border-border rounded px-1 py-0.5 text-sm bg-background"
            >
              {ROWS_PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span>Go to</span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="border border-border rounded px-1 py-0.5 text-sm bg-background"
            >
              {Array.from({ length: totalPages }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-2 py-1 border border-border rounded text-sm disabled:opacity-50">«</button>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 border border-border rounded text-sm disabled:opacity-50">‹</button>
          {getPageNumbers().map((p, i) =>
            typeof p === "string" ? (
              <span key={i} className="px-2 py-1 text-sm">…</span>
            ) : (
              <button
                key={i}
                onClick={() => setCurrentPage(p)}
                className={`px-2 py-1 border rounded text-sm ${p === currentPage ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
              >{p}</button>
            )
          )}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2 py-1 border border-border rounded text-sm disabled:opacity-50">›</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-2 py-1 border border-border rounded text-sm disabled:opacity-50">»</button>
        </div>
      </div>
    </div>
  );
};

export default FormSetup;
