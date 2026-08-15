import { useState, useCallback, useMemo } from "react";
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
import { Search } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Physician {
  id: number;
  name: string;
  specialty: string;
  state: string;
  licensedStates: string[];
  availableHours: number;
  bookedHours: number;
  utilization: number;
  openSlots: number;
  status: "Active" | "On Leave";
}

type StateFilter = "all" | "FL" | "TX" | "CA" | "NY" | "OH" | "PA" | "IL";
type AppointmentTypeFilter =
  | "all"
  | "AWV Initial"
  | "AWV Subsequent"
  | "Follow-Up"
  | "Telehealth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toISODate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Return Monday of the current week */
function getCurrentWeekMonday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday;
}

/** Return Sunday of the current week */
function getCurrentWeekSunday(): Date {
  const monday = getCurrentWeekMonday();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

function getUtilizationColor(pct: number): string {
  if (pct < 70) return "#1e7e34";
  if (pct <= 85) return "#e6890c";
  return "#c62828";
}

function getUtilizationBgColor(pct: number): string {
  if (pct < 70) return "#e6f4ea";
  if (pct <= 85) return "#fff3e0";
  return "#fdecea";
}

function getStatusBadgeStyle(
  status: "Active" | "On Leave",
): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: 600,
    lineHeight: "18px",
  };
  if (status === "Active") {
    return { ...base, background: "#e6f4ea", color: "#1e7e34" };
  }
  return { ...base, background: "#fff3e0", color: "#e6890c" };
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const STATES = ["FL", "TX", "CA", "NY", "OH", "PA", "IL"];

const mockPhysicians: Physician[] = [
  { id: 1, name: "Dr. Sarah Mitchell", specialty: "Internal Medicine", state: "FL", licensedStates: ["FL", "TX", "NY"], availableHours: 40, bookedHours: 28, utilization: 70, openSlots: 6, status: "Active" },
  { id: 2, name: "Dr. James Rivera", specialty: "Family Medicine", state: "TX", licensedStates: ["TX", "CA"], availableHours: 36, bookedHours: 30, utilization: 83, openSlots: 3, status: "Active" },
  { id: 3, name: "Dr. Emily Chen", specialty: "Geriatrics", state: "CA", licensedStates: ["CA", "NY", "OH"], availableHours: 32, bookedHours: 15, utilization: 47, openSlots: 10, status: "Active" },
  { id: 4, name: "Dr. Michael Torres", specialty: "Internal Medicine", state: "NY", licensedStates: ["NY", "PA"], availableHours: 44, bookedHours: 40, utilization: 91, openSlots: 2, status: "Active" },
  { id: 5, name: "Dr. Lisa Park", specialty: "Family Medicine", state: "FL", licensedStates: ["FL", "OH", "IL"], availableHours: 38, bookedHours: 25, utilization: 66, openSlots: 7, status: "Active" },
  { id: 6, name: "Dr. Robert Kim", specialty: "Cardiology", state: "OH", licensedStates: ["OH", "PA", "IL"], availableHours: 30, bookedHours: 27, utilization: 90, openSlots: 1, status: "Active" },
  { id: 7, name: "Dr. Angela Davis", specialty: "Internal Medicine", state: "PA", licensedStates: ["PA", "NY"], availableHours: 42, bookedHours: 29, utilization: 69, openSlots: 7, status: "Active" },
  { id: 8, name: "Dr. William Chang", specialty: "Geriatrics", state: "IL", licensedStates: ["IL", "OH"], availableHours: 35, bookedHours: 21, utilization: 60, openSlots: 8, status: "Active" },
  { id: 9, name: "Dr. Maria Gonzalez", specialty: "Family Medicine", state: "TX", licensedStates: ["TX", "FL", "CA"], availableHours: 40, bookedHours: 32, utilization: 80, openSlots: 4, status: "Active" },
  { id: 10, name: "Dr. David Lee", specialty: "Internal Medicine", state: "CA", licensedStates: ["CA"], availableHours: 28, bookedHours: 14, utilization: 50, openSlots: 8, status: "On Leave" },
  { id: 11, name: "Dr. Jennifer Adams", specialty: "Cardiology", state: "FL", licensedStates: ["FL", "TX"], availableHours: 36, bookedHours: 26, utilization: 72, openSlots: 5, status: "Active" },
  { id: 12, name: "Dr. Thomas Brown", specialty: "Internal Medicine", state: "NY", licensedStates: ["NY", "PA", "OH"], availableHours: 44, bookedHours: 35, utilization: 80, openSlots: 5, status: "Active" },
  { id: 13, name: "Dr. Catherine Wu", specialty: "Geriatrics", state: "OH", licensedStates: ["OH", "IL"], availableHours: 30, bookedHours: 22, utilization: 73, openSlots: 4, status: "Active" },
  { id: 14, name: "Dr. Steven Patel", specialty: "Family Medicine", state: "PA", licensedStates: ["PA", "NY", "FL"], availableHours: 38, bookedHours: 34, utilization: 89, openSlots: 2, status: "Active" },
  { id: 15, name: "Dr. Rachel Moore", specialty: "Internal Medicine", state: "IL", licensedStates: ["IL", "OH", "TX"], availableHours: 40, bookedHours: 24, utilization: 60, openSlots: 9, status: "Active" },
  { id: 16, name: "Dr. Andrew Taylor", specialty: "Cardiology", state: "TX", licensedStates: ["TX", "CA"], availableHours: 34, bookedHours: 28, utilization: 82, openSlots: 3, status: "Active" },
  { id: 17, name: "Dr. Karen White", specialty: "Family Medicine", state: "CA", licensedStates: ["CA", "NY", "FL"], availableHours: 42, bookedHours: 25, utilization: 60, openSlots: 9, status: "Active" },
  { id: 18, name: "Dr. Brian Johnson", specialty: "Geriatrics", state: "NY", licensedStates: ["NY"], availableHours: 20, bookedHours: 8, utilization: 40, openSlots: 7, status: "On Leave" },
  { id: 19, name: "Dr. Sandra Martin", specialty: "Internal Medicine", state: "FL", licensedStates: ["FL", "TX", "PA"], availableHours: 40, bookedHours: 38, utilization: 95, openSlots: 1, status: "Active" },
  { id: 20, name: "Dr. Joseph Clark", specialty: "Cardiology", state: "OH", licensedStates: ["OH", "PA", "IL", "TX"], availableHours: 45, bookedHours: 32, utilization: 71, openSlots: 7, status: "Active" },
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

const PhysicianInterval = () => {
  // -- Filter state -----------------------------------------------------------

  const [dateFrom, setDateFrom] = useState<string>(
    toISODate(getCurrentWeekMonday()),
  );
  const [dateTo, setDateTo] = useState<string>(
    toISODate(getCurrentWeekSunday()),
  );
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [typeFilter, setTypeFilter] = useState<AppointmentTypeFilter>("all");
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: toISODate(getCurrentWeekMonday()),
    dateTo: toISODate(getCurrentWeekSunday()),
    state: "all" as StateFilter,
    type: "all" as AppointmentTypeFilter,
  });

  // -- Pagination state -------------------------------------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // -- Filter + derived data --------------------------------------------------

  const filteredPhysicians = useMemo(() => {
    return mockPhysicians.filter((doc) => {
      if (appliedFilters.state !== "all" && doc.state !== appliedFilters.state)
        return false;
      return true;
    });
  }, [appliedFilters]);

  // -- Summary stats ----------------------------------------------------------

  const stats = useMemo(() => {
    const totalPhysicians = filteredPhysicians.length;
    const availableSlots = filteredPhysicians.reduce(
      (sum, d) => sum + d.openSlots,
      0,
    );
    const statesCovered = new Set(filteredPhysicians.map((d) => d.state)).size;
    return { totalPhysicians, availableSlots, statesCovered };
  }, [filteredPhysicians]);

  // -- Pagination -------------------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPhysicians.length / rowsPerPage),
  );
  const paginatedPhysicians = filteredPhysicians.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // -- Handlers ---------------------------------------------------------------

  const handleSearch = useCallback(() => {
    setAppliedFilters({
      dateFrom,
      dateTo,
      state: stateFilter,
      type: typeFilter,
    });
    setCurrentPage(1);
  }, [dateFrom, dateTo, stateFilter, typeFilter]);

  const getPageNumbers = useCallback((): (number | string)[] => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) pages.push(i);
    if (totalPages > 5) {
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages]);

  // -- Render -----------------------------------------------------------------

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Reporting" },
        { label: "Physician-interval" },
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
          Physician Intervals by State
        </h3>

        {/* Filters row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          {/* Date From */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <label
              htmlFor="filter-date-from"
              style={{ fontSize: "12px", color: "#666" }}
            >
              From
            </label>
            <input
              id="filter-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "13px",
                height: "36px",
              }}
            />
          </div>

          {/* Date To */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <label
              htmlFor="filter-date-to"
              style={{ fontSize: "12px", color: "#666" }}
            >
              To
            </label>
            <input
              id="filter-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "13px",
                height: "36px",
              }}
            />
          </div>

          {/* State */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <label style={{ fontSize: "12px", color: "#666" }}>State</label>
            <Select
              value={stateFilter}
              onValueChange={(v) => setStateFilter(v as StateFilter)}
            >
              <SelectTrigger
                className="w-[130px] h-9"
                aria-label="Filter by state"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {STATES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Appointment Type */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <label style={{ fontSize: "12px", color: "#666" }}>
              Appointment Type
            </label>
            <Select
              value={typeFilter}
              onValueChange={(v) =>
                setTypeFilter(v as AppointmentTypeFilter)
              }
            >
              <SelectTrigger
                className="w-[160px] h-9"
                aria-label="Filter by appointment type"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="AWV Initial">AWV Initial</SelectItem>
                <SelectItem value="AWV Subsequent">AWV Subsequent</SelectItem>
                <SelectItem value="Follow-Up">Follow-Up</SelectItem>
                <SelectItem value="Telehealth">Telehealth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSearch}
            style={{
              background: "#244a9f",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "6px 20px",
              fontSize: "13px",
              cursor: "pointer",
              height: "36px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
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
            aria-label="Apply search filters"
          >
            <Search size={14} aria-hidden="true" />
            Search
          </button>
        </div>

        {/* Summary cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {/* Total Physicians */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderLeft: "4px solid #244a9f",
              borderRadius: "10px",
              padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{ fontSize: "28px", fontWeight: 700, color: "#244a9f" }}
            >
              {stats.totalPhysicians}
            </div>
            <div
              style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}
            >
              Total Physicians
            </div>
          </div>

          {/* Available Slots */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderLeft: "4px solid #1e7e34",
              borderRadius: "10px",
              padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{ fontSize: "28px", fontWeight: 700, color: "#1e7e34" }}
            >
              {stats.availableSlots}
            </div>
            <div
              style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}
            >
              Available Slots
            </div>
          </div>

          {/* States Covered */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderLeft: "4px solid #7b1fa2",
              borderRadius: "10px",
              padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{ fontSize: "28px", fontWeight: 700, color: "#7b1fa2" }}
            >
              {stats.statesCovered}
            </div>
            <div
              style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}
            >
              States Covered
            </div>
          </div>
        </div>

        {/* Data table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
            }}
            role="table"
            aria-label="Physician intervals by state"
          >
            <thead>
              <tr>
                <th style={headerCellStyle}>#</th>
                <th style={headerCellStyle}>Physician</th>
                <th style={headerCellStyle}>Specialty</th>
                <th style={headerCellStyle}>State</th>
                <th style={headerCellStyle}>Licensed States</th>
                <th style={headerCellStyle}>Available Hours</th>
                <th style={headerCellStyle}>Booked Hours</th>
                <th style={headerCellStyle}>Utilization</th>
                <th style={headerCellStyle}>Open Slots</th>
                <th style={headerCellStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPhysicians.map((doc, index) => (
                <tr
                  key={doc.id}
                  style={{ transition: "background 0.1s" }}
                  onMouseEnter={(e) =>
                    ((
                      e.currentTarget as HTMLTableRowElement
                    ).style.background = "#f2f2f2")
                  }
                  onMouseLeave={(e) =>
                    ((
                      e.currentTarget as HTMLTableRowElement
                    ).style.background = "transparent")
                  }
                >
                  <td style={bodyCellStyle}>
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  <td style={{ ...bodyCellStyle, textAlign: "left" }}>
                    {doc.name}
                  </td>
                  <td style={{ ...bodyCellStyle, textAlign: "left" }}>
                    {doc.specialty}
                  </td>
                  <td style={bodyCellStyle}>{doc.state}</td>
                  <td style={bodyCellStyle}>
                    {doc.licensedStates.join(", ")}
                  </td>
                  <td style={bodyCellStyle}>{doc.availableHours}</td>
                  <td style={bodyCellStyle}>{doc.bookedHours}</td>
                  <td style={bodyCellStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 600,
                        lineHeight: "18px",
                        background: getUtilizationBgColor(doc.utilization),
                        color: getUtilizationColor(doc.utilization),
                      }}
                    >
                      {doc.utilization}%
                    </span>
                  </td>
                  <td style={bodyCellStyle}>{doc.openSlots}</td>
                  <td style={bodyCellStyle}>
                    <span style={getStatusBadgeStyle(doc.status)}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}

              {paginatedPhysicians.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      ...bodyCellStyle,
                      padding: "24px",
                      color: "#888",
                    }}
                  >
                    No physicians match the current filters.
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

export default PhysicianInterval;
