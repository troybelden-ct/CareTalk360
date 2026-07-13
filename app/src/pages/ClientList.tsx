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
import { Pencil, Info, ChevronUp, ChevronDown } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Client {
  clientId: number;
  name: string;
  contact: string;
  programCount: number;
  records: number;
  appointments: number;
  completed: number;
  open: number;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const initialClients: Client[] = [
  { clientId: 1, name: "Humana Gold Plus", contact: "Sarah Mitchell", programCount: 3, records: 1250, appointments: 890, completed: 720, open: 170, isActive: true },
  { clientId: 2, name: "Aetna Medicare", contact: "James Rodriguez", programCount: 2, records: 980, appointments: 654, completed: 510, open: 144, isActive: true },
  { clientId: 3, name: "UHC Community Plan", contact: "Lisa Chang", programCount: 4, records: 2100, appointments: 1420, completed: 1180, open: 240, isActive: true },
  { clientId: 4, name: "Cigna HealthSpring", contact: "Michael Torres", programCount: 1, records: 450, appointments: 312, completed: 278, open: 34, isActive: true },
  { clientId: 5, name: "Molina Healthcare", contact: "Jennifer Adams", programCount: 2, records: 780, appointments: 520, completed: 430, open: 90, isActive: true },
  { clientId: 6, name: "WellCare Health", contact: "David Kim", programCount: 3, records: 1650, appointments: 1100, completed: 920, open: 180, isActive: false },
  { clientId: 7, name: "Centene Corp", contact: "Amanda White", programCount: 2, records: 890, appointments: 610, completed: 490, open: 120, isActive: true },
  { clientId: 8, name: "Anthem BCBS", contact: "Robert Chen", programCount: 5, records: 3200, appointments: 2150, completed: 1800, open: 350, isActive: true },
  { clientId: 9, name: "Oscar Health", contact: "Nicole Brown", programCount: 1, records: 320, appointments: 215, completed: 180, open: 35, isActive: true },
  { clientId: 10, name: "Devoted Health", contact: "Kevin Martinez", programCount: 2, records: 560, appointments: 380, completed: 310, open: 70, isActive: false },
  { clientId: 11, name: "Clover Health", contact: "Emily Watson", programCount: 1, records: 410, appointments: 275, completed: 220, open: 55, isActive: true },
  { clientId: 12, name: "Bright Health", contact: "Daniel Lee", programCount: 3, records: 920, appointments: 640, completed: 530, open: 110, isActive: true },
];

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

const ClientList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // -- Derived data --------------------------------------------------------

  const filteredClients = showAll
    ? clients
    : clients.filter((c) => c.isActive);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / rowsPerPage));
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // -- Handlers ------------------------------------------------------------

  const handleToggleActive = useCallback(
    (clientId: number) => {
      const target = clients.find((c) => c.clientId === clientId);
      if (!target) return;

      const action = target.isActive ? "deactivate" : "activate";
      const confirmed = window.confirm(
        `Are you sure you want to ${action} "${target.name}"?`,
      );
      if (!confirmed) return;

      setClients((prev) =>
        prev.map((c) =>
          c.clientId === clientId ? { ...c, isActive: !c.isActive } : c,
        ),
      );
    },
    [clients],
  );

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
        { label: "Client Admin" },
        { label: "Client List" },
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
            marginBottom: "16px",
          }}
        >
          Client Administration
        </h3>

        {/* Sub-heading row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <h4 style={{ fontSize: "18px", fontWeight: 500, margin: 0 }}>
            Client List
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
                aria-label="Show all clients including inactive"
              />
              Show All
            </label>

            <button
              type="button"
              onClick={() => navigate("/client-list/add")}
              style={{
                background: "#244a9f",
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
                  "#4f77ce")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "#244a9f")
              }
              aria-label="Add new client"
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
            aria-label="Client list"
          >
            <thead>
              <tr>
                <th style={headerCellStyle}>Client ID</th>
                <th style={headerCellStyle}>Prog Count</th>
                <th style={headerCellStyle}>Name</th>
                <th style={headerCellStyle}>Contact</th>
                <th style={headerCellStyle}>Records</th>
                <th style={headerCellStyle}>Appointments</th>
                <th style={headerCellStyle}>Completed</th>
                <th style={headerCellStyle}>Open</th>
                <th style={headerCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map((client) => (
                <tr
                  key={client.clientId}
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
                  <td style={bodyCellStyle}>{client.clientId}</td>
                  <td style={bodyCellStyle}>{client.programCount}</td>
                  <td style={{ ...bodyCellStyle, textAlign: "left" }}>
                    {client.name}
                  </td>
                  <td style={{ ...bodyCellStyle, textAlign: "left" }}>
                    {client.contact}
                  </td>
                  <td style={bodyCellStyle}>{client.records}</td>
                  <td style={bodyCellStyle}>{client.appointments}</td>
                  <td style={bodyCellStyle}>{client.completed}</td>
                  <td style={bodyCellStyle}>{client.open}</td>
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
                          navigate(`/client-list/edit/${client.clientId}`)
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px",
                          lineHeight: 0,
                        }}
                        aria-label={`Edit ${client.name}`}
                      >
                        <Pencil
                          size={18}
                          color="#1d4c88"
                          aria-hidden="true"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/client-list/programs/${client.clientId}`,
                          )
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px",
                          lineHeight: 0,
                        }}
                        aria-label={`View programs for ${client.name}`}
                      >
                        <Info
                          size={18}
                          color="#1d4c88"
                          aria-hidden="true"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(client.clientId)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px",
                          lineHeight: 0,
                        }}
                        aria-label={
                          client.isActive
                            ? `Deactivate ${client.name}`
                            : `Activate ${client.name}`
                        }
                      >
                        {client.isActive ? (
                          <ChevronUp
                            size={18}
                            color="#1d4c88"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronDown
                            size={18}
                            color="red"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedClients.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      ...bodyCellStyle,
                      padding: "24px",
                      color: "#888",
                    }}
                  >
                    No clients to display.
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

export default ClientList;
