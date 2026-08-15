import { useState, useCallback } from "react";
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
import { Pencil, Copy } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Program {
  clientId: number;
  rowId: number;
  programId: number;
  name: string;
  description: string;
  records: number;
  appointments: number;
  completed: number;
  open: number;
}

// ---------------------------------------------------------------------------
// Mock data — programs keyed by clientId
// ---------------------------------------------------------------------------

const programsByClient: Record<number, Program[]> = {
  1: [
    { clientId: 1, rowId: 1, programId: 18, name: "CareTalkHealth", description: "", records: 520, appointments: 380, completed: 310, open: 70 },
    { clientId: 1, rowId: 2, programId: 20, name: "Async", description: "", records: 410, appointments: 290, completed: 240, open: 50 },
    { clientId: 1, rowId: 3, programId: 39, name: "HERO", description: "", records: 320, appointments: 220, completed: 170, open: 50 },
  ],
  2: [
    { clientId: 2, rowId: 1, programId: 21, name: "CareTalkHealth", description: "", records: 480, appointments: 340, completed: 270, open: 70 },
    { clientId: 2, rowId: 2, programId: 22, name: "Follow-Up", description: "", records: 500, appointments: 314, completed: 240, open: 74 },
  ],
  3: [
    { clientId: 3, rowId: 1, programId: 23, name: "CareTalkHealth", description: "", records: 800, appointments: 560, completed: 470, open: 90 },
    { clientId: 3, rowId: 2, programId: 24, name: "Async", description: "", records: 620, appointments: 410, completed: 340, open: 70 },
    { clientId: 3, rowId: 3, programId: 40, name: "HERO", description: "", records: 380, appointments: 260, completed: 210, open: 50 },
    { clientId: 3, rowId: 4, programId: 41, name: "doses", description: "", records: 300, appointments: 190, completed: 160, open: 30 },
  ],
  4: [
    { clientId: 4, rowId: 1, programId: 25, name: "CareTalkHealth", description: "", records: 450, appointments: 312, completed: 278, open: 34 },
  ],
  5: [
    { clientId: 5, rowId: 1, programId: 26, name: "CareTalkHealth", description: "", records: 480, appointments: 330, completed: 270, open: 60 },
    { clientId: 5, rowId: 2, programId: 27, name: "Follow-Up", description: "", records: 300, appointments: 190, completed: 160, open: 30 },
  ],
  6: [
    { clientId: 6, rowId: 1, programId: 28, name: "CareTalkHealth", description: "", records: 700, appointments: 480, completed: 400, open: 80 },
    { clientId: 6, rowId: 2, programId: 29, name: "Async", description: "", records: 520, appointments: 340, completed: 280, open: 60 },
    { clientId: 6, rowId: 3, programId: 42, name: "doses", description: "", records: 430, appointments: 280, completed: 240, open: 40 },
  ],
  7: [
    { clientId: 7, rowId: 1, programId: 30, name: "CareTalkHealth", description: "", records: 540, appointments: 370, completed: 300, open: 70 },
    { clientId: 7, rowId: 2, programId: 31, name: "HERO", description: "", records: 350, appointments: 240, completed: 190, open: 50 },
  ],
  8: [
    { clientId: 8, rowId: 1, programId: 32, name: "CareTalkHealth", description: "", records: 1100, appointments: 750, completed: 630, open: 120 },
    { clientId: 8, rowId: 2, programId: 33, name: "Async", description: "", records: 680, appointments: 460, completed: 380, open: 80 },
    { clientId: 8, rowId: 3, programId: 34, name: "HERO", description: "", records: 520, appointments: 350, completed: 290, open: 60 },
    { clientId: 8, rowId: 4, programId: 43, name: "doses", description: "", records: 450, appointments: 310, completed: 260, open: 50 },
    { clientId: 8, rowId: 5, programId: 44, name: "Follow-Up", description: "", records: 450, appointments: 280, completed: 240, open: 40 },
  ],
  9: [
    { clientId: 9, rowId: 1, programId: 35, name: "CareTalkHealth", description: "", records: 320, appointments: 215, completed: 180, open: 35 },
  ],
  10: [
    { clientId: 10, rowId: 1, programId: 36, name: "CareTalkHealth", description: "", records: 340, appointments: 230, completed: 190, open: 40 },
    { clientId: 10, rowId: 2, programId: 37, name: "Async", description: "", records: 220, appointments: 150, completed: 120, open: 30 },
  ],
  11: [
    { clientId: 11, rowId: 1, programId: 38, name: "CareTalkHealth", description: "", records: 410, appointments: 275, completed: 220, open: 55 },
  ],
  12: [
    { clientId: 12, rowId: 1, programId: 45, name: "CareTalkHealth", description: "", records: 420, appointments: 290, completed: 240, open: 50 },
    { clientId: 12, rowId: 2, programId: 46, name: "Async", description: "", records: 280, appointments: 190, completed: 160, open: 30 },
    { clientId: 12, rowId: 3, programId: 47, name: "HERO", description: "", records: 220, appointments: 160, completed: 130, open: 30 },
  ],
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROWS_PER_PAGE_OPTIONS = [8, 20, 50];

const headerCellStyle: React.CSSProperties = {
  background: "#e5e5e5",
  fontSize: "13px",
  whiteSpace: "nowrap",
  textAlign: "center",
  border: "1px solid #c1c1c1",
  padding: "12px 5px",
  fontWeight: 600,
};

const bodyCellStyle: React.CSSProperties = {
  fontSize: "12px",
  textAlign: "center",
  border: "1px solid #c1c1c1",
  padding: "12px 5px",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ClientPrograms = () => {
  const { id } = useParams<{ id: string }>();
  const clientId = Number(id) || 0;
  const navigate = useNavigate();

  const allPrograms: Program[] = programsByClient[clientId] ?? [];

  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // -- Derived data --------------------------------------------------------

  // showAll toggle is present to match BETA layout; all mock programs are
  // shown regardless since there is no active/inactive distinction here.
  const filteredPrograms = showAll ? allPrograms : allPrograms;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPrograms.length / rowsPerPage),
  );
  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // -- Handlers ------------------------------------------------------------

  const getPageNumbers = useCallback((): (number | string)[] => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) pages.push(i);
    if (totalPages > 5) {
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages]);

  // -- Render --------------------------------------------------------------

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Client List", href: "/client-list" },
        { label: "Client Programs" },
      ]}
    >
      <div style={{ marginBottom: "24px" }}>
        {/* Page heading */}
        <h3
          style={{
            fontSize: "25px",
            fontWeight: 500,
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            marginBottom: "8px",
          }}
        >
          Program List
        </h3>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "14px",
            color: "#666",
            margin: "0 0 20px 0",
          }}
        >
          List of all Programs by client and by ID.
        </p>

        {/* Section heading row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <h4 style={{ fontSize: "20px", fontWeight: 500, margin: 0 }}>
            Programs
          </h4>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => {
                  setShowAll(e.target.checked);
                  setCurrentPage(1);
                }}
                aria-label="Show all programs"
              />
              Show All
            </label>

            <button
              type="button"
              style={{
                background: "#1a3a5c",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "5px 20px",
                fontSize: "13px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "#2e5a82")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "#1a3a5c")
              }
              aria-label="Add new program"
            >
              Add
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
            }}
            role="table"
            aria-label="Client programs list"
          >
            <thead>
              <tr>
                <th style={headerCellStyle}>Client</th>
                <th style={headerCellStyle}>ID</th>
                <th style={headerCellStyle}>Program ID</th>
                <th style={headerCellStyle}>Name</th>
                <th style={headerCellStyle}>Description</th>
                <th style={headerCellStyle}>Records</th>
                <th style={headerCellStyle}>Appointments</th>
                <th style={headerCellStyle}>Completed</th>
                <th style={headerCellStyle}>Open</th>
                <th style={headerCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPrograms.map((program) => (
                <tr
                  key={program.programId}
                  style={{ transition: "background 0.1s" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "#f2f2f2")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "transparent")
                  }
                >
                  <td style={bodyCellStyle}>{program.clientId}</td>
                  <td style={bodyCellStyle}>{program.rowId}</td>
                  <td style={bodyCellStyle}>{program.programId}</td>
                  <td style={{ ...bodyCellStyle, textAlign: "left" }}>
                    {program.name}
                  </td>
                  <td style={{ ...bodyCellStyle, textAlign: "left" }}>
                    {program.description || ""}
                  </td>
                  <td style={bodyCellStyle}>{program.records}</td>
                  <td style={bodyCellStyle}>{program.appointments}</td>
                  <td style={bodyCellStyle}>{program.completed}</td>
                  <td style={bodyCellStyle}>{program.open}</td>
                  <td style={bodyCellStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/client-list/programs/${clientId}/edit/${program.programId}`,
                          )
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px",
                          lineHeight: 0,
                        }}
                        aria-label={`Edit program ${program.name}`}
                      >
                        <Pencil
                          size={18}
                          color="#1d4c88"
                          aria-hidden="true"
                        />
                      </button>

                      <button
                        type="button"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px",
                          lineHeight: 0,
                        }}
                        aria-label={`Copy program ${program.name}`}
                      >
                        <Copy
                          size={18}
                          color="#1d4c88"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedPrograms.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      ...bodyCellStyle,
                      padding: "24px",
                      color: "#888",
                    }}
                  >
                    No programs to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm">
            <span>Rows per page</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(v) => {
                setRowsPerPage(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
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
              aria-label="Go to page"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              &laquo;
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              &lsaquo;
            </Button>
            {getPageNumbers().map((page, i) =>
              typeof page === "number" ? (
                <Button
                  key={i}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </Button>
              ) : (
                <span
                  key={i}
                  className="px-1 text-muted-foreground"
                  aria-hidden="true"
                >
                  ...
                </span>
              ),
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              &rsaquo;
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              &raquo;
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClientPrograms;
