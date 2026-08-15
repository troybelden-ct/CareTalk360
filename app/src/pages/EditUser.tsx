import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UserData {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  title: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  userManager: string;
  department: string;
  delegatedApprover: string;
  userRole: string;
  npi: string;
  appointmentSlotSize: string;
  password: string;
  isActive: boolean;
}

type TabKey = "profile" | "licenses" | "availability" | "assignments";

interface ClientPrograms {
  programs: string[];
  appointmentTypes: Record<string, string[]>;
}

/* ------------------------------------------------------------------ */
/*  Mock data — all 10 users from UserList                             */
/* ------------------------------------------------------------------ */

const MOCK_USERS: UserData[] = [
  { id: 1, username: "JoeBous", firstName: "Joe", lastName: "Bous", title: "Mr", mobile: "", email: "joebous@gmail.com", address: "", city: "", state: "District Of Columbia", zipCode: "12345", userManager: "", department: "", delegatedApprover: "", userRole: "Super Admin", npi: "", appointmentSlotSize: "", password: "", isActive: true },
  { id: 8, username: "devTest", firstName: "Sam", lastName: "Micheal", title: "", mobile: "", email: "test-dev@majisa.com", address: "", city: "", state: "", zipCode: "", userManager: "", department: "", delegatedApprover: "", userRole: "Admin", npi: "", appointmentSlotSize: "", password: "", isActive: true },
  { id: 11, username: "maxoliver", firstName: "Max", lastName: "Oliver", title: "", mobile: "", email: "joe@bous.com", address: "", city: "", state: "", zipCode: "", userManager: "", department: "", delegatedApprover: "", userRole: "Doctor", npi: "", appointmentSlotSize: "30", password: "", isActive: true },
  { id: 12, username: "troyb", firstName: "Troy", lastName: "Belden", title: "Mr", mobile: "6053101479", email: "troy.belden@caretalkhealth.com", address: "", city: "", state: "South Dakota", zipCode: "", userManager: "", department: "Operations", delegatedApprover: "", userRole: "Super Admin", npi: "", appointmentSlotSize: "", password: "", isActive: true },
  { id: 15, username: "stacies", firstName: "Stacie", lastName: "Stoner", title: "", mobile: "", email: "stacie.stoner@caretalkhealth.com", address: "", city: "", state: "", zipCode: "", userManager: "", department: "", delegatedApprover: "", userRole: "Admin", npi: "", appointmentSlotSize: "", password: "", isActive: true },
  { id: 20, username: "agentTB", firstName: "Agent", lastName: "Team", title: "", mobile: "", email: "troy.belden@caretalkhealth.com", address: "", city: "", state: "", zipCode: "", userManager: "", department: "", delegatedApprover: "", userRole: "Care Navigator", npi: "", appointmentSlotSize: "", password: "", isActive: true },
  { id: 2318, username: "tbdoc", firstName: "Aurelius", lastName: "Hogue", title: "Dr", mobile: "6053101479", email: "tbelden@varsitycs.com", address: "123 Any Street", city: "Castlewood", state: "South Dakota", zipCode: "57223", userManager: "", department: "", delegatedApprover: "", userRole: "Doctor", npi: "12345678901", appointmentSlotSize: "30", password: "", isActive: true },
  { id: 2340, username: "Bonnie", firstName: "Bonnie", lastName: "Sloma", title: "", mobile: "", email: "bonnie.sloma@caretalkhealth.com", address: "", city: "", state: "", zipCode: "", userManager: "", department: "", delegatedApprover: "", userRole: "Supervisor", npi: "", appointmentSlotSize: "", password: "", isActive: true },
  { id: 2369, username: "testES", firstName: "Test", lastName: "ES", title: "", mobile: "", email: "t@w.com", address: "", city: "", state: "", zipCode: "", userManager: "", department: "", delegatedApprover: "", userRole: "Nurse", npi: "", appointmentSlotSize: "15", password: "", isActive: true },
  { id: 2370, username: "TheDoctor", firstName: "Sameh", lastName: "Selim", title: "Dr", mobile: "", email: "doctor@doc.com", address: "", city: "", state: "", zipCode: "", userManager: "", department: "", delegatedApprover: "", userRole: "Doctor", npi: "", appointmentSlotSize: "30", password: "", isActive: true },
];

/* ------------------------------------------------------------------ */
/*  US States (full names) — 50 states + DC                            */
/* ------------------------------------------------------------------ */

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "District Of Columbia", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

/* ------------------------------------------------------------------ */
/*  User Role options                                                  */
/* ------------------------------------------------------------------ */

const USER_ROLES = [
  "Super Admin", "Admin", "Doctor", "Nurse", "Care Navigator", "Supervisor",
];

/* ------------------------------------------------------------------ */
/*  Appointment Slot Size options                                      */
/* ------------------------------------------------------------------ */

const SLOT_SIZES = ["15", "20", "30", "45", "60"];

/* ------------------------------------------------------------------ */
/*  Assignments mock data                                              */
/* ------------------------------------------------------------------ */

const ASSIGNMENTS_DATA: Record<string, ClientPrograms> = {
  CareTalkHealth: {
    programs: ["AWVs", "Follow-Up"],
    appointmentTypes: {
      "AWVs": ["AWV Initial", "AWV Subsequent", "Follow-Up"],
      "Follow-Up": ["Follow-Up Visit"],
    },
  },
  CTHTEST: {
    programs: ["Test Program"],
    appointmentTypes: { "Test Program": ["Test Appt"] },
  },
  "Heroes Testing": {
    programs: ["Hero Program"],
    appointmentTypes: { "Hero Program": ["HeroMonthlyTest", "HeroInitialTest"] },
  },
  Cents: {
    programs: ["Cents Program"],
    appointmentTypes: { "Cents Program": ["Cents Initial", "Cents Follow-Up"] },
  },
  TrainingClient: {
    programs: ["Training"],
    appointmentTypes: { Training: ["Training Session", "Orientation"] },
  },
  Every: {
    programs: ["Every Program"],
    appointmentTypes: { "Every Program": ["Every Appt"] },
  },
  HummingBird: {
    programs: ["AWVs", "AsynchTest"],
    appointmentTypes: {
      AWVs: ["HeroMonthlyTest", "HeroInitialTest", "Hummingbird"],
      AsynchTest: ["AsynchTest"],
    },
  },
  Cary: {
    programs: ["Cary Program"],
    appointmentTypes: { "Cary Program": ["Cary Initial", "Cary Follow-Up"] },
  },
};

const CLIENT_NAMES = Object.keys(ASSIGNMENTS_DATA);

/* ------------------------------------------------------------------ */
/*  Availability time slots                                            */
/* ------------------------------------------------------------------ */

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ */
/*  Shared inline styles                                               */
/* ------------------------------------------------------------------ */

const labelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#333",
  marginBottom: "4px",
  display: "block",
};

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: "14px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
  backgroundColor: "#fff",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "auto" as const,
};

const checkboxStyle: React.CSSProperties = {
  width: "18px",
  height: "18px",
  accentColor: "#244a9f",
  cursor: "pointer",
};

/* ------------------------------------------------------------------ */
/*  Helper: get current week dates (Sun-Sat)                           */
/* ------------------------------------------------------------------ */

function getWeekDates(refDate: Date): Date[] {
  const dates: Date[] = [];
  const day = refDate.getDay();
  const sunday = new Date(refDate);
  sunday.setDate(refDate.getDate() - day);
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatMMDD(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function formatMMDDYYYY(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

/* ------------------------------------------------------------------ */
/*  Helper: build default availability schedule                        */
/* ------------------------------------------------------------------ */

function buildDefaultSchedule(): Record<string, boolean> {
  const schedule: Record<string, boolean> = {};
  // Monday (day index 1): 09:00 AM, 10:00 AM, 11:00 AM
  ["09:00 AM", "10:00 AM", "11:00 AM"].forEach((t) => {
    schedule[`1-${t}`] = true;
  });
  // Thursday (day index 4) and Friday (day index 5): 12:00 PM through 05:00 PM
  [4, 5].forEach((dayIdx) => {
    ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"].forEach((t) => {
      schedule[`${dayIdx}-${t}`] = true;
    });
  });
  return schedule;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = Number(id);

  const userData = MOCK_USERS.find((u) => u.id === userId) || MOCK_USERS[0];

  const [form, setForm] = useState<UserData>({ ...userData });
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  /* -- Licenses state -- */
  const [licenseStates, setLicenseStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    US_STATES.forEach((s) => { initial[s] = true; });
    return initial;
  });
  const [alaskaSupervisor, setAlaskaSupervisor] = useState("Bonnie Sloma");

  const allChecked = US_STATES.every((s) => licenseStates[s]);

  const handleUncheckAll = () => {
    const newVal = !allChecked;
    setLicenseStates((prev) => {
      const next = { ...prev };
      US_STATES.forEach((s) => { next[s] = newVal; });
      return next;
    });
  };

  const toggleLicenseState = (stateName: string) => {
    setLicenseStates((prev) => ({ ...prev, [stateName]: !prev[stateName] }));
  };

  /* -- Availability state -- */
  const today = useMemo(() => new Date(), []);
  const weekDates = useMemo(() => getWeekDates(today), [today]);
  const [schedule, setSchedule] = useState<Record<string, boolean>>(buildDefaultSchedule);
  const [dayOffs, setDayOffs] = useState<Record<number, boolean>>({});
  const [showPrevious, setShowPrevious] = useState(false);

  const toggleSlot = (dayIdx: number, time: string) => {
    const key = `${dayIdx}-${time}`;
    setSchedule((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDayOff = (dayIdx: number) => {
    setDayOffs((prev) => ({ ...prev, [dayIdx]: !prev[dayIdx] }));
  };

  /* -- Assignments state -- */
  const [selectedClient, setSelectedClient] = useState("HummingBird");
  const [selectedProgram, setSelectedProgram] = useState("AWVs");
  const [assignmentChecks, setAssignmentChecks] = useState<Record<string, boolean>>(() => ({
    Hummingbird: true,
  }));

  const clientData = ASSIGNMENTS_DATA[selectedClient];
  const currentApptTypes = clientData?.appointmentTypes[selectedProgram] || [];

  const handleSelectClient = (client: string) => {
    setSelectedClient(client);
    const data = ASSIGNMENTS_DATA[client];
    if (data && data.programs.length > 0) {
      setSelectedProgram(data.programs[0]);
    }
    setAssignmentChecks({});
  };

  const handleSelectProgram = (program: string) => {
    setSelectedProgram(program);
    setAssignmentChecks({});
  };

  const toggleAssignmentCheck = (apptType: string) => {
    setAssignmentChecks((prev) => ({ ...prev, [apptType]: !prev[apptType] }));
  };

  /* -- Profile state -- */
  const updateField = (field: keyof UserData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* -- Tab definitions -- */
  const TAB_LABELS: { key: TabKey; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "licenses", label: "Licenses" },
    { key: "availability", label: "Availability" },
    { key: "assignments", label: "Assignments" },
  ];

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Manage Patients (Doctor)", href: "/user-list" },
        { label: "Edit Admin" },
      ]}
    >
      <div style={{ marginBottom: "24px" }}>
        {/* ---- Tabs ---- */}
        <div
          style={{
            display: "flex",
            gap: "0",
            borderBottom: "1px solid #e0e0e0",
            marginBottom: "20px",
          }}
          role="tablist"
          aria-label="Edit user tabs"
        >
          {TAB_LABELS.map(({ key, label }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#1a3a5c",
                  background: "none",
                  border: "none",
                  borderBottom: isActive ? "3px solid #244a9f" : "3px solid transparent",
                  padding: "10px 24px",
                  cursor: "pointer",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                aria-selected={isActive}
                role="tab"
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ---- Profile Tab ---- */}
        {activeTab === "profile" && (
          <div>
            {/* Active checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => updateField("isActive", e.target.checked)}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "#244a9f",
                  cursor: "pointer",
                }}
                id="active-checkbox"
                aria-label="User active status"
              />
              <label
                htmlFor="active-checkbox"
                style={{ fontSize: "14px", fontWeight: 500, color: "#333", cursor: "pointer" }}
              >
                Active
              </label>
            </div>

            {/* 3-column form grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "20px",
                rowGap: "16px",
              }}
            >
              {/* Row 1 */}
              <div>
                <label style={labelStyle} htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  style={inputStyle}
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  style={inputStyle}
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  style={inputStyle}
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />
              </div>

              {/* Row 2 */}
              <div>
                <label style={labelStyle} htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="mobile">Mobile</label>
                <input
                  id="mobile"
                  type="text"
                  style={inputStyle}
                  value={form.mobile}
                  onChange={(e) => updateField("mobile", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="email">Email</label>
                <input
                  id="email"
                  type="text"
                  style={inputStyle}
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              {/* Row 3 */}
              <div>
                <label style={labelStyle} htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  style={inputStyle}
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  style={inputStyle}
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle} htmlFor="state">State</label>
                  <select
                    id="state"
                    style={selectStyle}
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle} htmlFor="zipCode">Zip code</label>
                  <input
                    id="zipCode"
                    type="text"
                    style={inputStyle}
                    value={form.zipCode}
                    onChange={(e) => updateField("zipCode", e.target.value)}
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div>
                <label style={labelStyle} htmlFor="userManager">User Manager</label>
                <select
                  id="userManager"
                  style={selectStyle}
                  value={form.userManager}
                  onChange={(e) => updateField("userManager", e.target.value)}
                >
                  <option value=""></option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label style={labelStyle} htmlFor="department">Department</label>
                <input
                  id="department"
                  type="text"
                  style={inputStyle}
                  value={form.department}
                  onChange={(e) => updateField("department", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="delegatedApprover">Delegated Approver</label>
                <input
                  id="delegatedApprover"
                  type="text"
                  style={inputStyle}
                  value={form.delegatedApprover}
                  onChange={(e) => updateField("delegatedApprover", e.target.value)}
                />
              </div>

              {/* Row 5 */}
              <div>
                <label style={labelStyle} htmlFor="userRole">User Role</label>
                <select
                  id="userRole"
                  style={selectStyle}
                  value={form.userRole}
                  onChange={(e) => updateField("userRole", e.target.value)}
                >
                  <option value="">Select role</option>
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle} htmlFor="npi">NPI</label>
                <input
                  id="npi"
                  type="text"
                  style={inputStyle}
                  value={form.npi}
                  onChange={(e) => updateField("npi", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="appointmentSlotSize">Appointment Slot size</label>
                <select
                  id="appointmentSlotSize"
                  style={selectStyle}
                  value={form.appointmentSlotSize}
                  onChange={(e) => updateField("appointmentSlotSize", e.target.value)}
                >
                  <option value=""></option>
                  {SLOT_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Row 6 */}
              <div>
                <label style={labelStyle} htmlFor="changePassword">Change Password</label>
                <input
                  id="changePassword"
                  type="password"
                  style={inputStyle}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                />
              </div>
            </div>

            {/* Action buttons -- centered */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                marginTop: "40px",
              }}
            >
              <button
                type="button"
                style={{
                  backgroundColor: "#1a3a5c",
                  color: "#fff",
                  borderRadius: "6px",
                  padding: "10px 48px",
                  fontSize: "15px",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Save
              </button>
              <button
                type="button"
                style={{
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  borderRadius: "6px",
                  padding: "10px 48px",
                  fontSize: "15px",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Deactivate User
              </button>
            </div>
          </div>
        )}

        {/* ---- Licenses Tab ---- */}
        {activeTab === "licenses" && (
          <div>
            {/* Heading */}
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 500,
                color: "#1a3a5c",
                margin: "0 0 4px 0",
                borderBottom: "1px solid #333",
                paddingBottom: "6px",
              }}
            >
              Provider Licenses
            </h2>
            <p style={{ fontSize: "15px", color: "#333", margin: "8px 0 20px 0" }}>
              Name: {form.firstName} {form.lastName}
            </p>

            {/* Uncheck All */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <input
                type="checkbox"
                checked={allChecked}
                onChange={handleUncheckAll}
                style={checkboxStyle}
                id="uncheck-all"
                aria-label="Toggle all state licenses"
              />
              <label
                htmlFor="uncheck-all"
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#333",
                  cursor: "pointer",
                }}
              >
                Uncheck All
              </label>
            </div>

            {/* State checkboxes — 3-column grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px 24px",
              }}
            >
              {US_STATES.map((stateName) => (
                <div
                  key={stateName}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!licenseStates[stateName]}
                    onChange={() => toggleLicenseState(stateName)}
                    style={checkboxStyle}
                    id={`license-${stateName}`}
                    aria-label={`License for ${stateName}`}
                  />
                  <label
                    htmlFor={`license-${stateName}`}
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      cursor: "pointer",
                    }}
                  >
                    {stateName}
                  </label>

                  {/* Alaska special treatment — SV badge + supervisor dropdown */}
                  {stateName === "Alaska" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "4px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          backgroundColor: "#e8a020",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "3px",
                          lineHeight: "1",
                        }}
                        title="Supervising Physician required"
                      >
                        SV
                      </span>
                      <select
                        value={alaskaSupervisor}
                        onChange={(e) => setAlaskaSupervisor(e.target.value)}
                        style={{
                          fontSize: "13px",
                          padding: "2px 6px",
                          border: "1px solid #ccc",
                          borderRadius: "3px",
                          fontFamily: "inherit",
                          backgroundColor: "#fff",
                        }}
                        aria-label="Alaska supervising physician"
                      >
                        <option value="Bonnie Sloma">Bonnie Sloma</option>
                        <option value="Joe Bous">Joe Bous</option>
                        <option value="Sameh Selim">Sameh Selim</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- Availability Tab ---- */}
        {activeTab === "availability" && (
          <div>
            {/* Heading */}
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 500,
                color: "#1a3a5c",
                margin: "0 0 4px 0",
              }}
            >
              My Availability
            </h2>
            <p style={{ fontSize: "14px", color: "#666", margin: "4px 0 20px 0", lineHeight: "1.5" }}>
              To set up your schedule select either every week or a specific week and check the box
              for the day and hour you are available for appointments.
            </p>

            {/* Week header bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#e8edf2",
                padding: "10px 16px",
                borderRadius: "4px 4px 0 0",
              }}
            >
              <span style={{ color: "#244a9f", fontWeight: 600, fontSize: "14px" }}>
                {form.username} - Week of {formatMMDDYYYY(weekDates[0])}
              </span>
              <input
                type="date"
                defaultValue={weekDates[0].toISOString().split("T")[0]}
                style={{
                  fontSize: "13px",
                  padding: "4px 8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                  backgroundColor: "#fff",
                }}
                aria-label="Select week start date"
              />
            </div>

            {/* Day header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px repeat(7, 1fr)",
                backgroundColor: "#e5e5e5",
                borderBottom: "1px solid #ccc",
              }}
            >
              {/* Save button cell */}
              <div style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <button
                  type="button"
                  style={{
                    backgroundColor: "#244a9f",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 16px",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Save
                </button>
              </div>

              {/* Day columns */}
              {weekDates.map((d, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "8px 4px",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#333",
                    borderLeft: "1px solid #ccc",
                  }}
                >
                  <div>{DAY_NAMES[idx]}, {formatMMDD(d)}</div>
                  <div style={{ marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                    <input
                      type="checkbox"
                      checked={!!dayOffs[idx]}
                      onChange={() => toggleDayOff(idx)}
                      style={{
                        width: "14px",
                        height: "14px",
                        accentColor: "#4a90d9",
                        cursor: "pointer",
                      }}
                      aria-label={`${DAY_NAMES[idx]} day off`}
                    />
                    <span style={{ fontSize: "11px", color: "#666" }}>day off</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Show Previous toggle */}
            <div
              style={{
                textAlign: "center",
                padding: "6px 0",
                borderBottom: "1px solid #e0e0e0",
                cursor: "pointer",
              }}
              onClick={() => setShowPrevious(!showPrevious)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowPrevious(!showPrevious); }}
              aria-expanded={showPrevious}
              aria-label="Toggle show previous time slots"
            >
              <span style={{ fontSize: "13px", color: "#666" }}>
                <span style={{
                  display: "inline-block",
                  transform: showPrevious ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  marginRight: "4px",
                }}>
                  &#9650;
                </span>
                Show Previous
              </span>
            </div>

            {/* Time slot grid */}
            <div>
              {TIME_SLOTS.map((time) => (
                <div
                  key={time}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px repeat(7, 1fr)",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {/* Time label */}
                  <div
                    style={{
                      padding: "8px",
                      fontSize: "13px",
                      color: "#333",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {time}
                  </div>

                  {/* 7 day checkboxes */}
                  {DAY_NAMES.map((_, dayIdx) => {
                    const key = `${dayIdx}-${time}`;
                    return (
                      <div
                        key={dayIdx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "8px 0",
                          borderLeft: "1px solid #f0f0f0",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!schedule[key]}
                          onChange={() => toggleSlot(dayIdx, time)}
                          style={{
                            width: "18px",
                            height: "18px",
                            accentColor: "#4a90d9",
                            cursor: "pointer",
                          }}
                          aria-label={`${DAY_NAMES[dayIdx]} ${time}`}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- Assignments Tab ---- */}
        {activeTab === "assignments" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "0",
                border: "1px solid #ddd",
                borderRadius: "4px",
                overflow: "hidden",
                minHeight: "400px",
              }}
            >
              {/* Column 1: Clients */}
              <div style={{ borderRight: "1px solid #ddd" }}>
                <div
                  style={{
                    padding: "12px 16px",
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "#1a3a5c",
                    backgroundColor: "#f5f7fa",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Clients
                </div>
                {CLIENT_NAMES.map((client) => {
                  const isSelected = selectedClient === client;
                  return (
                    <div
                      key={client}
                      onClick={() => handleSelectClient(client)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelectClient(client); }}
                      role="button"
                      tabIndex={0}
                      style={{
                        padding: "10px 16px",
                        fontSize: "14px",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#244a9f" : "#fff",
                        color: isSelected ? "#fff" : "#333",
                        borderBottom: "1px solid #eee",
                        fontWeight: isSelected ? 500 : 400,
                      }}
                      aria-selected={isSelected}
                    >
                      {client}
                    </div>
                  );
                })}
              </div>

              {/* Column 2: Programs */}
              <div style={{ borderRight: "1px solid #ddd" }}>
                <div
                  style={{
                    padding: "12px 16px",
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "#1a3a5c",
                    backgroundColor: "#f5f7fa",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Programs
                </div>
                <div style={{ padding: "12px 16px" }}>
                  {clientData?.programs.map((program) => (
                    <div
                      key={program}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 0",
                      }}
                    >
                      <input
                        type="radio"
                        name="program"
                        checked={selectedProgram === program}
                        onChange={() => handleSelectProgram(program)}
                        style={{
                          width: "18px",
                          height: "18px",
                          accentColor: "#244a9f",
                          cursor: "pointer",
                        }}
                        id={`program-${program}`}
                        aria-label={`Select program ${program}`}
                      />
                      <label
                        htmlFor={`program-${program}`}
                        style={{
                          fontSize: "14px",
                          color: "#333",
                          cursor: "pointer",
                        }}
                      >
                        {program}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Appointment Types */}
              <div>
                <div
                  style={{
                    padding: "12px 16px",
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "#1a3a5c",
                    backgroundColor: "#f5f7fa",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Appointment Types
                </div>
                <div style={{ padding: "12px 16px" }}>
                  {currentApptTypes.map((apptType) => (
                    <div
                      key={apptType}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 0",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!assignmentChecks[apptType]}
                        onChange={() => toggleAssignmentCheck(apptType)}
                        style={checkboxStyle}
                        id={`appt-${apptType}`}
                        aria-label={`Appointment type ${apptType}`}
                      />
                      <label
                        htmlFor={`appt-${apptType}`}
                        style={{
                          fontSize: "14px",
                          color: "#333",
                          cursor: "pointer",
                        }}
                      >
                        {apptType}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Assignments button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                type="button"
                style={{
                  backgroundColor: "#1a3a5c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 32px",
                  fontSize: "15px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Save Assignments
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default EditUser;
