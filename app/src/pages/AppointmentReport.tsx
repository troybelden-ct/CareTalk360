import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { CTH_STATUS } from "@/lib/design-tokens";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Appointment {
  id: number;
  program: string;
  provider: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  zipCode: string;
  phoneNo: string;
  date: string;
  time: string;
  status: number;
  gap: number;
  createdBy: string;
  completedAt: string;
  completedById: string;
}

interface Filters {
  firstName: string;
  lastName: string;
  phone: string;
  startDate: string;
  endDate: string;
  client: string;
  program: string;
  provider: string;
  statusAppointment: string;
  state: string;
}

// ---------------------------------------------------------------------------
// Mock data — exact BETA rows + extras
// ---------------------------------------------------------------------------

const MOCK_DATA: Appointment[] = [
  { id: 2171, program: "AWVs", provider: "Pierce", firstName: "Barbara", lastName: "Clark", dateOfBirth: "12/30/1957", zipCode: "02108,MA", phoneNo: "6177848195", date: "08/03/2026", time: "10:30 AM", status: 0, gap: 0, createdBy: "RodneyLewis", completedAt: "", completedById: "" },
  { id: 2172, program: "AWVs", provider: "Pierce", firstName: "Ahmed", lastName: "Khalil", dateOfBirth: "01/29/1958", zipCode: "48126,MI", phoneNo: "3132155465", date: "08/03/2026", time: "11:00 AM", status: 0, gap: 0, createdBy: "RodneyLewis", completedAt: "", completedById: "" },
  { id: 2167, program: "Test", provider: "Pierce", firstName: "Rodney", lastName: "Pedersen", dateOfBirth: "04/20/1962", zipCode: "33614,FL", phoneNo: "8135551212", date: "08/03/2026", time: "11:30 AM", status: 0, gap: 2, createdBy: "RodneyLewis", completedAt: "", completedById: "" },
  { id: 2954, program: "AWVs", provider: "Hogue", firstName: "test", lastName: "test", dateOfBirth: "12/31/1969", zipCode: "40202,KY", phoneNo: "7325434732", date: "08/03/2026", time: "12:00 PM", status: 0, gap: 0, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2956, program: "AWVs", provider: "Hogue", firstName: "test", lastName: "pcp", dateOfBirth: "12/11/1987", zipCode: "40202,KY", phoneNo: "4771008474", date: "08/03/2026", time: "12:10 PM", status: 0, gap: 0, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2922, program: "AWVs", provider: "Hogue", firstName: "Alice", lastName: "Mouse", dateOfBirth: "06/05/1961", zipCode: "33010,FL", phoneNo: "", date: "08/03/2026", time: "12:20 PM", status: 0, gap: 0, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2953, program: "AWVs", provider: "Hogue", firstName: "Test", lastName: "ApplnA", dateOfBirth: "12/31/1979", zipCode: "40202,KY", phoneNo: "5024424997", date: "08/03/2026", time: "12:30 PM", status: 0, gap: 0, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2960, program: "AWVs", provider: "Hogue", firstName: "Maria", lastName: "Santos", dateOfBirth: "03/15/1955", zipCode: "33125,FL", phoneNo: "3059871234", date: "08/03/2026", time: "01:00 PM", status: 0, gap: 0, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2961, program: "AWVs", provider: "Pierce", firstName: "James", lastName: "Wilson", dateOfBirth: "07/22/1948", zipCode: "02109,MA", phoneNo: "6175559876", date: "08/03/2026", time: "01:30 PM", status: 0, gap: 1, createdBy: "RodneyLewis", completedAt: "", completedById: "" },
  { id: 2962, program: "Test", provider: "Hogue", firstName: "Linda", lastName: "Brown", dateOfBirth: "11/08/1963", zipCode: "40203,KY", phoneNo: "5024431122", date: "08/03/2026", time: "02:00 PM", status: 0, gap: 0, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2963, program: "AWVs", provider: "Pierce", firstName: "Robert", lastName: "Davis", dateOfBirth: "09/14/1951", zipCode: "48127,MI", phoneNo: "3134567890", date: "08/04/2026", time: "09:00 AM", status: 0, gap: 0, createdBy: "RodneyLewis", completedAt: "", completedById: "" },
  { id: 2964, program: "AWVs", provider: "Hogue", firstName: "Patricia", lastName: "Miller", dateOfBirth: "02/28/1960", zipCode: "33015,FL", phoneNo: "3051234567", date: "08/04/2026", time: "09:30 AM", status: 0, gap: 0, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2965, program: "AWVs", provider: "Pierce", firstName: "Michael", lastName: "Garcia", dateOfBirth: "05/17/1953", zipCode: "02110,MA", phoneNo: "6172223344", date: "08/04/2026", time: "10:00 AM", status: 0, gap: 0, createdBy: "RodneyLewis", completedAt: "", completedById: "" },
  { id: 2966, program: "Test", provider: "Hogue", firstName: "Jennifer", lastName: "Martinez", dateOfBirth: "08/03/1965", zipCode: "40204,KY", phoneNo: "5025556677", date: "08/04/2026", time: "10:30 AM", status: 0, gap: 1, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2967, program: "AWVs", provider: "Pierce", firstName: "William", lastName: "Anderson", dateOfBirth: "01/11/1949", zipCode: "48128,MI", phoneNo: "3137778899", date: "08/04/2026", time: "11:00 AM", status: 0, gap: 0, createdBy: "RodneyLewis", completedAt: "", completedById: "" },
  { id: 2968, program: "AWVs", provider: "Hogue", firstName: "Elizabeth", lastName: "Taylor", dateOfBirth: "10/25/1958", zipCode: "33020,FL", phoneNo: "3059998877", date: "08/04/2026", time: "11:30 AM", status: 0, gap: 0, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2969, program: "AWVs", provider: "Pierce", firstName: "David", lastName: "Thomas", dateOfBirth: "04/09/1952", zipCode: "02111,MA", phoneNo: "6176665544", date: "08/04/2026", time: "12:00 PM", status: 0, gap: 0, createdBy: "RodneyLewis", completedAt: "", completedById: "" },
  { id: 2970, program: "Test", provider: "Hogue", firstName: "Susan", lastName: "Jackson", dateOfBirth: "12/19/1967", zipCode: "40205,KY", phoneNo: "5023332211", date: "08/04/2026", time: "12:30 PM", status: 0, gap: 0, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2971, program: "AWVs", provider: "Pierce", firstName: "Charles", lastName: "White", dateOfBirth: "06/30/1946", zipCode: "48129,MI", phoneNo: "3131112233", date: "08/04/2026", time: "01:00 PM", status: 0, gap: 2, createdBy: "RodneyLewis", completedAt: "", completedById: "" },
  { id: 2972, program: "AWVs", provider: "Hogue", firstName: "Dorothy", lastName: "Harris", dateOfBirth: "03/04/1959", zipCode: "33025,FL", phoneNo: "3054443322", date: "08/04/2026", time: "01:30 PM", status: 0, gap: 0, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2973, program: "AWVs", provider: "Pierce", firstName: "Thomas", lastName: "Martin", dateOfBirth: "09/21/1950", zipCode: "02112,MA", phoneNo: "6178889900", date: "08/05/2026", time: "09:00 AM", status: 0, gap: 0, createdBy: "RodneyLewis", completedAt: "", completedById: "" },
  { id: 2974, program: "AWVs", provider: "Hogue", firstName: "Karen", lastName: "Thompson", dateOfBirth: "07/12/1964", zipCode: "40206,KY", phoneNo: "5027776655", date: "08/05/2026", time: "09:30 AM", status: 0, gap: 0, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 3009, program: "AWVs", provider: "Hogue", firstName: "Johnny", lastName: "Appleseed", dateOfBirth: "07/25/1976", zipCode: "57223,SD", phoneNo: "6053101479", date: "12/31/1969", time: "07:00 PM", status: 1, gap: 1, createdBy: "NikhilPawar", completedAt: "07/06/2026", completedById: "2318" },
  { id: 2649, program: "AWVs", provider: "Provider", firstName: "Johnny", lastName: "Appleseed", dateOfBirth: "07/25/1976", zipCode: "57223,SD", phoneNo: "6053101479", date: "04/04/2026", time: "09:00 AM", status: 2, gap: 1, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2753, program: "AWVs", provider: "Hogue", firstName: "Johnny", lastName: "Appleseed", dateOfBirth: "07/25/1976", zipCode: "57223,SD", phoneNo: "6053101479", date: "04/22/2026", time: "12:00 PM", status: 1, gap: 1, createdBy: "troyb", completedAt: "04/30/2026", completedById: "2318" },
  { id: 2773, program: "AWVs", provider: "Hogue", firstName: "Johnny", lastName: "Appleseed", dateOfBirth: "07/25/1976", zipCode: "57223,SD", phoneNo: "6053101479", date: "04/22/2026", time: "12:00 PM", status: 101, gap: 1, createdBy: "troyb", completedAt: "", completedById: "" },
  { id: 2832, program: "AWVs", provider: "Selim", firstName: "Johnny", lastName: "Appleseed", dateOfBirth: "07/25/1976", zipCode: "57223,SD", phoneNo: "6053101479", date: "04/30/2026", time: "10:00 AM", status: 101, gap: 1, createdBy: "JoeBous", completedAt: "", completedById: "" },
  { id: 2871, program: "AWVs", provider: "Hogue", firstName: "Johnny", lastName: "Appleseed", dateOfBirth: "07/25/1976", zipCode: "57223,SD", phoneNo: "6053101479", date: "05/13/2026", time: "09:00 AM", status: 101, gap: 1, createdBy: "troyb", completedAt: "", completedById: "" },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 400,
  color: "#333",
  marginBottom: "4px",
};

const inputStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "6px 10px",
  fontSize: "13px",
  height: "34px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "auto" as React.CSSProperties["appearance"],
  backgroundColor: "#fff",
};

const headerCellStyle: React.CSSProperties = {
  background: "#fff",
  fontSize: "12px",
  whiteSpace: "nowrap",
  textAlign: "left",
  borderBottom: "2px solid #dee2e6",
  borderRight: "1px solid #dee2e6",
  padding: "10px 8px",
  fontWeight: 600,
  color: "#333",
};

const bodyCellStyle: React.CSSProperties = {
  fontSize: "12px",
  textAlign: "left",
  borderBottom: "1px solid #dee2e6",
  borderRight: "1px solid #dee2e6",
  padding: "8px 8px",
  color: "#333",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AppointmentReport: React.FC = () => {
  const navigate = useNavigate();
  const todayStr = "07/24/2026";

  const [filters, setFilters] = useState<Filters>({
    firstName: "",
    lastName: "",
    phone: "",
    startDate: todayStr,
    endDate: todayStr,
    client: "",
    program: "",
    provider: "",
    statusAppointment: "All",
    state: "All",
  });

  const [sortField, setSortField] = useState<"date" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const updateFilter = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const displayedData = useMemo(() => {
    let data = [...MOCK_DATA];
    if (sortField === "date") {
      data.sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return sortDir === "asc" ? da - db : db - da;
      });
    }
    return data;
  }, [sortField, sortDir]);

  const handleSearch = useCallback(() => {
    // In production this would apply filters via API
  }, []);

  const handleClear = useCallback(() => {
    setFilters({
      firstName: "",
      lastName: "",
      phone: "",
      startDate: todayStr,
      endDate: todayStr,
      client: "",
      program: "",
      provider: "",
      statusAppointment: "All",
      state: "All",
    });
  }, []);

  const handleExport = useCallback(() => {
    // In production this would trigger CSV download
  }, []);

  const toggleDateSort = useCallback(() => {
    if (sortField === "date") {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField("date");
      setSortDir("asc");
    }
  }, [sortField]);

  // Action icons as simple SVG
  const DocIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="1" width="10" height="14" rx="1" stroke="#2563eb" strokeWidth="1.5" fill="none" />
      <line x1="5.5" y1="5" x2="10.5" y2="5" stroke="#2563eb" strokeWidth="1" />
      <line x1="5.5" y1="7.5" x2="10.5" y2="7.5" stroke="#2563eb" strokeWidth="1" />
      <line x1="5.5" y1="10" x2="8.5" y2="10" stroke="#2563eb" strokeWidth="1" />
    </svg>
  );

  const PeopleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="5" r="2.5" stroke={CTH_STATUS.success} strokeWidth="1.5" fill="none" />
      <path d="M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" stroke={CTH_STATUS.success} strokeWidth="1.5" fill="none" />
      <circle cx="11" cy="5" r="2" stroke={CTH_STATUS.success} strokeWidth="1" fill="none" />
      <path d="M11 9.5c1.8 0 3.5 1.3 3.5 3.5" stroke={CTH_STATUS.success} strokeWidth="1" fill="none" />
    </svg>
  );

  const GearIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="#1e293b" strokeWidth="1.5" fill="none" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="#1e293b" strokeWidth="1" />
    </svg>
  );

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Dashboard" },
        { label: "Appointment Report" },
      ]}
    >
      <div style={{ padding: "0" }}>
        {/* Title row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0, color: "#1a1a1a" }}>
            Patient Appointment
          </h2>
          <button
            type="button"
            style={{
              background: "#fff",
              color: "#2563eb",
              border: "1px solid #2563eb",
              borderRadius: "4px",
              padding: "6px 16px",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            New Appointments Report View
          </button>
        </div>

        {/* Filters — Row 1 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div>
            <label style={labelStyle}>First name</label>
            <input
              type="text"
              value={filters.firstName}
              onChange={(e) => updateFilter("firstName", e.target.value)}
              style={inputStyle}
              aria-label="First name"
            />
          </div>
          <div>
            <label style={labelStyle}>Last name</label>
            <input
              type="text"
              value={filters.lastName}
              onChange={(e) => updateFilter("lastName", e.target.value)}
              style={inputStyle}
              aria-label="Last name"
            />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              type="text"
              value={filters.phone}
              onChange={(e) => updateFilter("phone", e.target.value)}
              style={inputStyle}
              aria-label="Phone"
            />
          </div>
          <div>
            <label style={labelStyle}>Start Date</label>
            <input
              type="text"
              value={filters.startDate}
              onChange={(e) => updateFilter("startDate", e.target.value)}
              placeholder="MM/DD/YYYY"
              style={inputStyle}
              aria-label="Start Date"
            />
          </div>
        </div>

        {/* Filters — Row 2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div>
            <label style={labelStyle}>End Date</label>
            <input
              type="text"
              value={filters.endDate}
              onChange={(e) => updateFilter("endDate", e.target.value)}
              placeholder="MM/DD/YYYY"
              style={inputStyle}
              aria-label="End Date"
            />
          </div>
          <div>
            <label style={labelStyle}>Clients</label>
            <select
              value={filters.client}
              onChange={(e) => updateFilter("client", e.target.value)}
              style={selectStyle}
              aria-label="Clients"
            >
              <option value="">Select Client</option>
              <option value="client1">Client 1</option>
              <option value="client2">Client 2</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Programs</label>
            <select
              value={filters.program}
              onChange={(e) => updateFilter("program", e.target.value)}
              style={selectStyle}
              aria-label="Programs"
            >
              <option value="">Select Program</option>
              <option value="AWVs">AWVs</option>
              <option value="Test">Test</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Provider</label>
            <select
              value={filters.provider}
              onChange={(e) => updateFilter("provider", e.target.value)}
              style={selectStyle}
              aria-label="Provider"
            >
              <option value="">Select Provider</option>
              <option value="Pierce">Pierce</option>
              <option value="Hogue">Hogue</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status Appointment</label>
            <select
              value={filters.statusAppointment}
              onChange={(e) => updateFilter("statusAppointment", e.target.value)}
              style={selectStyle}
              aria-label="Status Appointment"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
        </div>

        {/* Filters — Row 3 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div>
            <label style={labelStyle}>State</label>
            <select
              value={filters.state}
              onChange={(e) => updateFilter("state", e.target.value)}
              style={selectStyle}
              aria-label="State"
            >
              <option value="All">All</option>
              <option value="FL">FL</option>
              <option value="MA">MA</option>
              <option value="MI">MI</option>
              <option value="KY">KY</option>
            </select>
          </div>
        </div>

        {/* Section title + action buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "#1a1a1a" }}>
            Patient Appointment
          </h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={handleExport}
              style={{
                background: CTH_STATUS.success,
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "6px 16px",
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 500,
              }}
              aria-label="Extract file"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1v9M4 7l3 3 3-3M2 12h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Extract File
            </button>
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "6px 16px",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: 500,
              }}
              aria-label="Clear filters"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSearch}
              style={{
                background: "#1e3a5f",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "6px 16px",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: 500,
              }}
              aria-label="Search"
            >
              Search
            </button>
          </div>
        </div>

        {/* Data table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              border: "1px solid #dee2e6",
            }}
            role="table"
            aria-label="Patient appointment report"
          >
            <thead>
              <tr>
                <th style={headerCellStyle}>ID</th>
                <th style={headerCellStyle}>Program</th>
                <th style={headerCellStyle}>Provider</th>
                <th style={headerCellStyle}>First Name</th>
                <th style={headerCellStyle}>Last Name</th>
                <th style={headerCellStyle}>Date Of Birth</th>
                <th style={headerCellStyle}>ZipCode</th>
                <th style={headerCellStyle}>Phone No.</th>
                <th
                  style={{ ...headerCellStyle, cursor: "pointer", userSelect: "none" }}
                  onClick={toggleDateSort}
                  aria-sort={sortField === "date" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                >
                  Date {sortField === "date" ? (sortDir === "asc" ? "\u25B2" : "\u25BC") : "\u25B2"}
                </th>
                <th style={headerCellStyle}>Time</th>
                <th style={headerCellStyle}>Status</th>
                <th style={headerCellStyle}>Gap</th>
                <th style={headerCellStyle}>Created By</th>
                <th style={headerCellStyle}>Cpt. At</th>
                <th style={headerCellStyle}>Cpt. by ID</th>
                <th style={headerCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((row) => (
                <tr key={row.id}>
                  <td style={bodyCellStyle}>{row.id}</td>
                  <td style={bodyCellStyle}>{row.program}</td>
                  <td style={bodyCellStyle}>{row.provider}</td>
                  <td style={bodyCellStyle}>{row.firstName}</td>
                  <td style={bodyCellStyle}>{row.lastName}</td>
                  <td style={bodyCellStyle}>{row.dateOfBirth}</td>
                  <td style={bodyCellStyle}>{row.zipCode}</td>
                  <td style={bodyCellStyle}>{row.phoneNo}</td>
                  <td style={bodyCellStyle}>{row.date}</td>
                  <td style={bodyCellStyle}>{row.time}</td>
                  <td style={bodyCellStyle}>{row.status}</td>
                  <td style={bodyCellStyle}>{row.gap}</td>
                  <td style={bodyCellStyle}>{row.createdBy}</td>
                  <td style={bodyCellStyle}>{row.completedAt}</td>
                  <td style={bodyCellStyle}>{row.completedById}</td>
                  <td style={{ ...bodyCellStyle, whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button type="button" onClick={() => navigate(`/patient-appointment/${row.id}`)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }} aria-label={`View document for ${row.firstName} ${row.lastName}`}>
                        <DocIcon />
                      </button>
                      <button type="button" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }} aria-label={`View patient ${row.firstName} ${row.lastName}`}>
                        <PeopleIcon />
                      </button>
                      <button type="button" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }} aria-label={`Settings for ${row.firstName} ${row.lastName}`}>
                        <GearIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {displayedData.length === 0 && (
                <tr>
                  <td
                    colSpan={16}
                    style={{ ...bodyCellStyle, padding: "24px", textAlign: "center", color: "#888" }}
                  >
                    No appointments match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default AppointmentReport;
