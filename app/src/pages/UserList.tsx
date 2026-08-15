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
import { Pencil, Info } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  manager: string;
  mobile: string;
  email: string;
  department: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockUsers: User[] = [
  { id: 1, firstName: "Joe", lastName: "Bous", username: "JoeBous", manager: "", mobile: "", email: "joebous@gmail.com", department: "", status: "Active" },
  { id: 8, firstName: "Development", lastName: "Testing", username: "devTest", manager: "", mobile: "", email: "test-dev@majisa.com", department: "", status: "Active" },
  { id: 11, firstName: "Max", lastName: "Oliver", username: "maxoliver", manager: "", mobile: "", email: "joe@bous.com", department: "", status: "Active" },
  { id: 12, firstName: "Troy", lastName: "Belden", username: "troyb", manager: "", mobile: "6053101479", email: "troy.belden@caretalkhealth.com", department: "Operations", status: "Active" },
  { id: 15, firstName: "Stacie", lastName: "Stoner", username: "stacies", manager: "", mobile: "", email: "stacie.stoner@caretalkhealth.com", department: "", status: "Active" },
  { id: 20, firstName: "Agent", lastName: "Team", username: "agentTB", manager: "", mobile: "", email: "troy.belden@caretalkhealth.com", department: "", status: "Active" },
  { id: 2318, firstName: "Aurelius", lastName: "Hogue", username: "tbdoc", manager: "", mobile: "6053101479", email: "tbelden@varsitycs.com", department: "", status: "Active" },
  { id: 2340, firstName: "Bonnie", lastName: "Sloma", username: "Bonnie", manager: "", mobile: "7165047858", email: "bonnie.sloma@caretalkhealth.com", department: "", status: "Active" },
  { id: 2369, firstName: "Test", lastName: "ES", username: "testES", manager: "", mobile: "6055551212", email: "t@w.com", department: "", status: "Active" },
  { id: 2370, firstName: "Sameh", lastName: "Selim", username: "TheDoctor", manager: "", mobile: "", email: "doctor@doc.com", department: "", status: "Active" },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];

const ROLE_OPTIONS = [
  "All types",
  "Super Admin",
  "Admin",
  "Doctor",
  "Nurse",
  "Care Navigator",
  "Supervisor",
];

const TOTAL_FAKE_PAGES = 48;

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

const UserList = () => {
  const navigate = useNavigate();
  const [lastNameFilter, setLastNameFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("All types");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // -- Derived data --------------------------------------------------------

  const filteredUsers = mockUsers.filter((user) => {
    const matchesName =
      !lastNameFilter ||
      user.lastName.toLowerCase().includes(lastNameFilter.toLowerCase());
    return matchesName;
  });

  const totalPages = Math.max(1, TOTAL_FAKE_PAGES);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // -- Helpers -------------------------------------------------------------

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
        { label: "Manage Patients (Doctor)" },
      ]}
    >
      <div style={{ marginBottom: "24px" }}>
        {/* Page heading */}
        <h1
          style={{
            fontSize: "25px",
            fontWeight: 500,
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            marginBottom: "8px",
          }}
        >
          User List
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "14px",
            color: "#666",
            marginBottom: "24px",
            marginTop: 0,
          }}
        >
          The table below contains a list of all users. You can filter based on
          role and search based on last name.
        </p>

        {/* Filter row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div>
            <label
              htmlFor="filter-last-name"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "4px",
              }}
            >
              Last Name
            </label>
            <Input
              id="filter-last-name"
              value={lastNameFilter}
              onChange={(e) => {
                setLastNameFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: "200px" }}
              aria-label="Filter by last name"
            />
          </div>
          <div>
            <label
              htmlFor="filter-role"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "4px",
              }}
            >
              User Role
            </label>
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger
                id="filter-role"
                style={{ width: "200px" }}
                aria-label="Filter by user role"
              >
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              type="button"
              style={{
                background: "#1a3a5c",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 20px",
                fontSize: "13px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "#2c5a8a")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "#1a3a5c")
              }
              aria-label="View all admins"
            >
              View All Admins
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
            aria-label="User list"
          >
            <thead>
              <tr>
                <th style={headerCellStyle}>ID</th>
                <th style={headerCellStyle}>First Name</th>
                <th style={headerCellStyle}>Last Name</th>
                <th style={headerCellStyle}>Username</th>
                <th style={headerCellStyle}>Manager</th>
                <th style={headerCellStyle}>Mobile</th>
                <th style={headerCellStyle}>Email</th>
                <th style={headerCellStyle}>Department</th>
                <th style={headerCellStyle}>Status</th>
                <th style={headerCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
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
                  <td style={bodyCellStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                      }}
                    >
                      <Info
                        size={14}
                        color="#244a9f"
                        aria-hidden="true"
                        style={{ flexShrink: 0 }}
                      />
                      {user.id}
                    </div>
                  </td>
                  <td style={bodyCellStyle}>{user.firstName}</td>
                  <td style={bodyCellStyle}>{user.lastName}</td>
                  <td style={bodyCellStyle}>{user.username}</td>
                  <td style={bodyCellStyle}>{user.manager}</td>
                  <td style={bodyCellStyle}>{user.mobile}</td>
                  <td style={{ ...bodyCellStyle, textAlign: "left" }}>
                    {user.email}
                  </td>
                  <td style={bodyCellStyle}>{user.department}</td>
                  <td style={bodyCellStyle}>{user.status}</td>
                  <td style={bodyCellStyle}>
                    <button
                      type="button"
                      onClick={() => navigate(`/edit-user/${user.id}`)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                        lineHeight: 0,
                      }}
                      aria-label={`Edit ${user.firstName} ${user.lastName}`}
                    >
                      <Pencil
                        size={18}
                        color="#1d4c88"
                        aria-hidden="true"
                      />
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      ...bodyCellStyle,
                      padding: "24px",
                      color: "#888",
                    }}
                  >
                    No users to display.
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

export default UserList;
