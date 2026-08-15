import { useState, useCallback } from "react";
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
import { Eye } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EligibleMember {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  state: string;
  zip: string;
  mspId: string;
  status: "Active" | "Inactive";
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const CLIENT_NAMES = [
  "Humana Gold Plus", "Aetna Medicare", "UHC Community Plan", "Cigna HealthSpring",
  "Molina Healthcare", "WellCare Health", "Centene Corp", "Anthem BCBS",
  "Oscar Health", "Devoted Health", "Clover Health", "Bright Health",
];

const generateMembers = (clientIndex: number): EligibleMember[] => {
  const firstNames = ["Margaret", "Robert", "Dorothy", "James", "Helen", "William", "Betty", "Richard", "Patricia", "Charles", "Barbara", "Thomas", "Nancy", "Donald", "Sandra", "George", "Carol", "Edward", "Ruth", "Frank", "Sharon", "Joseph", "Virginia", "Kenneth", "Judith"];
  const lastNames = ["Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Clark"];
  const states = ["FL", "TX", "CA", "NY", "OH", "PA", "IL", "GA", "NC", "MI"];

  const members: EligibleMember[] = [];
  const count = 15 + (clientIndex * 3) % 12;

  for (let i = 0; i < count; i++) {
    const seed = clientIndex * 100 + i;
    const fn = firstNames[(seed * 7 + 3) % firstNames.length];
    const ln = lastNames[(seed * 11 + 5) % lastNames.length];
    const st = states[(seed * 3) % states.length];
    const year = 1935 + (seed % 27);
    const month = 1 + (seed * 3) % 12;
    const day = 1 + (seed * 7) % 28;

    members.push({
      id: 1000 + seed,
      firstName: fn,
      lastName: ln,
      phoneNumber: `(${500 + (seed % 400)}) ${100 + (seed * 3) % 900}-${1000 + (seed * 7) % 9000}`,
      dateOfBirth: `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`,
      state: st,
      zip: String(10000 + (seed * 131) % 90000),
      mspId: `MSP${String(100000 + seed * 37).slice(0, 6)}`,
      status: (seed % 8 === 0) ? "Inactive" : "Active",
    });
  }
  return members;
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

const placeholderInputStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: "14px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  outline: "none",
  background: "#fff",
  width: "100%",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const EligibilityLists = () => {
  const [selectedClient, setSelectedClient] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [stateFilter, setStateFilter] = useState("All States");
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<EligibleMember[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const handleSearch = useCallback(() => {
    if (!selectedClient) return;
    const clientIndex = CLIENT_NAMES.indexOf(selectedClient);
    let members = generateMembers(clientIndex >= 0 ? clientIndex : 0);

    if (firstName.trim()) {
      members = members.filter((m) => m.firstName.toLowerCase().includes(firstName.toLowerCase()));
    }
    if (lastName.trim()) {
      members = members.filter((m) => m.lastName.toLowerCase().includes(lastName.toLowerCase()));
    }
    if (stateFilter !== "All States") {
      members = members.filter((m) => m.state === stateFilter);
    }

    setResults(members);
    setHasSearched(true);
    setCurrentPage(1);
  }, [selectedClient, firstName, lastName, stateFilter]);

  // -- Pagination -----------------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(results.length / rowsPerPage));
  const paginatedResults = results.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
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

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Eligibility Lists" },
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
          Eligibles
        </h3>

        {/* Client selector */}
        <div style={{ marginBottom: "16px" }}>
          <select
            value={selectedClient}
            onChange={(e) => {
              setSelectedClient(e.target.value);
              setHasSearched(false);
              setResults([]);
            }}
            style={{
              padding: "8px 12px",
              fontSize: "14px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              outline: "none",
              background: "#fff",
              minWidth: "200px",
              color: selectedClient ? "#333" : "#999",
            }}
          >
            <option value="" disabled>Select Client</option>
            {CLIENT_NAMES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Filter fields */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "12px", alignItems: "center" }}>
          <input
            style={placeholderInputStyle}
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <input
            style={placeholderInputStyle}
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <select
            style={{ ...placeholderInputStyle, minWidth: "140px", cursor: "pointer" }}
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="All States">All States</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSearch}
            style={{
              background: "#1a3a5c",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 24px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#244a9f")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1a3a5c")}
          >
            Search
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <input
            style={placeholderInputStyle}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <input
            style={placeholderInputStyle}
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {/* Empty spacer to match the 3-column layout above */}
          <div style={{ flex: 1 }} />
          <div style={{ minWidth: "95px" }} />
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
            aria-label="Eligibility list"
          >
            <thead>
              <tr>
                <th style={headerCellStyle}>ID</th>
                <th style={headerCellStyle}>First Name</th>
                <th style={headerCellStyle}>Last Name</th>
                <th style={headerCellStyle}>Phone Number</th>
                <th style={headerCellStyle}>Date of Birth</th>
                <th style={headerCellStyle}>State</th>
                <th style={headerCellStyle}>Zip</th>
                <th style={headerCellStyle}>MSP_ID</th>
                <th style={headerCellStyle}>Status</th>
                <th style={headerCellStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResults.map((member) => (
                <tr
                  key={member.id}
                  style={{ transition: "background 0.1s" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "#f2f2f2")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                  }
                >
                  <td style={bodyCellStyle}>{member.id}</td>
                  <td style={{ ...bodyCellStyle, textAlign: "left" }}>{member.firstName}</td>
                  <td style={{ ...bodyCellStyle, textAlign: "left" }}>{member.lastName}</td>
                  <td style={bodyCellStyle}>{member.phoneNumber}</td>
                  <td style={bodyCellStyle}>{member.dateOfBirth}</td>
                  <td style={bodyCellStyle}>{member.state}</td>
                  <td style={bodyCellStyle}>{member.zip}</td>
                  <td style={bodyCellStyle}>{member.mspId}</td>
                  <td style={bodyCellStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 12px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: member.status === "Active" ? "#e6f4ea" : "#fce8e6",
                        color: member.status === "Active" ? "#1e7e34" : "#c5221f",
                      }}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td style={bodyCellStyle}>
                    <button
                      type="button"
                      onClick={() => {}}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                        lineHeight: 0,
                      }}
                      aria-label={`View ${member.firstName} ${member.lastName}`}
                    >
                      <Eye size={18} color="#1d4c88" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}

              {hasSearched && paginatedResults.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{ ...bodyCellStyle, padding: "24px", color: "#888" }}
                  >
                    No eligible members found.
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
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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

export default EligibilityLists;
