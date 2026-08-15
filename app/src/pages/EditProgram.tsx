import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProgramDetail {
  programId: number;
  clientId: number;
  name: string;
  clientName: string;
  startDate: string;
  active: boolean;
}

interface AppointmentType {
  id: number;
  name: string;
  syncType: "S" | "A";
}

// ---------------------------------------------------------------------------
// Mock data — appointment types (matches BETA)
// ---------------------------------------------------------------------------

const appointmentTypes: AppointmentType[] = [
  { id: 1,  name: "HeroMonthlyTest",                       syncType: "S" },
  { id: 2,  name: "HeroInitialTest",                       syncType: "S" },
  { id: 3,  name: "Training Appt",                         syncType: "S" },
  { id: 4,  name: "Asynch Hogue",                          syncType: "A" },
  { id: 5,  name: "HuAsyncCosign",                         syncType: "S" },
  { id: 6,  name: "Async Appt - test",                     syncType: "A" },
  { id: 7,  name: "Cary",                                  syncType: "A" },
  { id: 8,  name: "Heroes Initiating & Quarterly",         syncType: "S" },
  { id: 9,  name: "Hummingbird",                           syncType: "S" },
  { id: 10, name: "20 Min - Initiating Clinical Training", syncType: "S" },
  { id: 11, name: "Quarterly",                             syncType: "S" },
  { id: 12, name: "Everymeds Sick Visit",                  syncType: "A" },
  { id: 13, name: "Async Encounter Refill",                syncType: "A" },
  { id: 14, name: "AWV Initial",                           syncType: "S" },
  { id: 15, name: "AWV Subsequent",                        syncType: "S" },
  { id: 16, name: "Follow-Up",                             syncType: "S" },
  { id: 17, name: "Telehealth Visit",                      syncType: "S" },
  { id: 18, name: "Care Navigation",                       syncType: "A" },
];

// ---------------------------------------------------------------------------
// Mock data — client names (mirrors EditClient / ClientList)
// ---------------------------------------------------------------------------

const clientNames: Record<number, string> = {
  1:  "Humana Gold Plus",
  2:  "Aetna Medicare",
  3:  "UHC Community Plan",
  4:  "Cigna HealthSpring",
  5:  "Molina Healthcare",
  6:  "WellCare Health",
  7:  "Centene Corp",
  8:  "Anthem BCBS",
  9:  "Oscar Health",
  10: "Devoted Health",
  11: "Clover Health",
  12: "Bright Health",
};

// ---------------------------------------------------------------------------
// Mock data — programs keyed by clientId (mirrors ClientPrograms.tsx)
// ---------------------------------------------------------------------------

interface ProgramRef {
  programId: number;
  name: string;
  startDate: string;
  checkedApptIds: number[];
}

const programsByClient: Record<number, ProgramRef[]> = {
  1: [
    { programId: 18, name: "CareTalkHealth", startDate: "01/15/2023", checkedApptIds: [1, 3, 8] },
    { programId: 20, name: "Async",          startDate: "03/10/2023", checkedApptIds: [4, 6, 13] },
    { programId: 39, name: "HERO",           startDate: "06/01/2023", checkedApptIds: [1, 2, 8, 11] },
  ],
  2: [
    { programId: 21, name: "CareTalkHealth", startDate: "02/20/2023", checkedApptIds: [14, 15, 16] },
    { programId: 22, name: "Follow-Up",      startDate: "04/05/2023", checkedApptIds: [16, 17] },
  ],
  3: [
    { programId: 23, name: "CareTalkHealth", startDate: "01/08/2023", checkedApptIds: [3, 9, 10] },
    { programId: 24, name: "Async",          startDate: "05/12/2023", checkedApptIds: [4, 6, 7, 18] },
    { programId: 40, name: "HERO",           startDate: "07/22/2023", checkedApptIds: [1, 2, 8] },
    { programId: 41, name: "doses",          startDate: "09/14/2023", checkedApptIds: [12] },
  ],
  4: [
    { programId: 25, name: "CareTalkHealth", startDate: "03/01/2023", checkedApptIds: [14, 15, 17] },
  ],
  5: [
    { programId: 26, name: "CareTalkHealth", startDate: "02/14/2023", checkedApptIds: [3, 10, 16] },
    { programId: 27, name: "Follow-Up",      startDate: "08/30/2023", checkedApptIds: [16, 17] },
  ],
  6: [
    { programId: 28, name: "CareTalkHealth", startDate: "01/25/2023", checkedApptIds: [9, 14, 15] },
    { programId: 29, name: "Async",          startDate: "04/18/2023", checkedApptIds: [4, 6, 13, 18] },
    { programId: 42, name: "doses",          startDate: "10/05/2023", checkedApptIds: [12] },
  ],
  7: [
    { programId: 30, name: "CareTalkHealth", startDate: "02/01/2024", checkedApptIds: [3, 10, 11] },
    { programId: 31, name: "HERO",           startDate: "05/15/2024", checkedApptIds: [1, 2, 8] },
  ],
  8: [
    { programId: 32, name: "CareTalkHealth", startDate: "01/10/2023", checkedApptIds: [14, 15, 16, 17] },
    { programId: 33, name: "Async",          startDate: "03/22/2023", checkedApptIds: [4, 6, 7] },
    { programId: 34, name: "HERO",           startDate: "06/14/2023", checkedApptIds: [1, 2, 8, 11] },
    { programId: 43, name: "doses",          startDate: "08/20/2023", checkedApptIds: [12] },
    { programId: 44, name: "Follow-Up",      startDate: "11/01/2023", checkedApptIds: [16, 17] },
  ],
  9: [
    { programId: 35, name: "CareTalkHealth", startDate: "04/01/2024", checkedApptIds: [3, 9, 17] },
  ],
  10: [
    { programId: 36, name: "CareTalkHealth", startDate: "03/15/2024", checkedApptIds: [10, 14, 15] },
    { programId: 37, name: "Async",          startDate: "06/20/2024", checkedApptIds: [4, 13, 18] },
  ],
  11: [
    { programId: 38, name: "CareTalkHealth", startDate: "05/01/2024", checkedApptIds: [3, 16, 17] },
  ],
  12: [
    { programId: 45, name: "CareTalkHealth", startDate: "01/20/2024", checkedApptIds: [9, 14, 15] },
    { programId: 46, name: "Async",          startDate: "04/10/2024", checkedApptIds: [4, 6, 18] },
    { programId: 47, name: "HERO",           startDate: "07/05/2024", checkedApptIds: [1, 2, 8] },
  ],
};

// ---------------------------------------------------------------------------
// Helper — find program across all clients
// ---------------------------------------------------------------------------

function findProgram(
  clientId: number,
  programId: number,
): (ProgramRef & { clientName: string }) | null {
  const programs = programsByClient[clientId];
  if (!programs) return null;
  const match = programs.find((p) => p.programId === programId);
  if (!match) return null;
  return { ...match, clientName: clientNames[clientId] ?? `Client ${clientId}` };
}

// ---------------------------------------------------------------------------
// Styles (matching EditClient patterns)
// ---------------------------------------------------------------------------

const labelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#333",
  whiteSpace: "nowrap",
};

const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  fontSize: "14px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  outline: "none",
  background: "#fff",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const EditProgram = () => {
  const { clientId: clientIdParam, programId: programIdParam } = useParams<{
    clientId: string;
    programId: string;
  }>();
  const navigate = useNavigate();

  const clientId = Number(clientIdParam) || 0;
  const programId = Number(programIdParam) || 0;

  const programData = findProgram(clientId, programId);

  const [programName, setProgramName] = useState(programData?.name ?? "");
  const [startDate, setStartDate] = useState(programData?.startDate ?? "");
  const [isActive, setIsActive] = useState(true);
  const [checkedAppts, setCheckedAppts] = useState<Set<number>>(
    new Set(programData?.checkedApptIds ?? []),
  );

  if (!programData) {
    return (
      <MainLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Update Program" },
        ]}
      >
        <div style={{ padding: "48px", textAlign: "center", color: "#888" }}>
          Program not found.
        </div>
      </MainLayout>
    );
  }

  const handleToggleAppt = (apptId: number) => {
    setCheckedAppts((prev) => {
      const next = new Set(prev);
      if (next.has(apptId)) {
        next.delete(apptId);
      } else {
        next.add(apptId);
      }
      return next;
    });
  };

  const handleUpdate = () => {
    toast({ title: "Program updated successfully" });
  };

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Update Program" },
      ]}
    >
      <div style={{ marginBottom: "24px" }}>
        {/* Page heading — plain bold, no underline per BETA */}
        <h3
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#1a3a5c",
            marginBottom: "16px",
            textDecoration: "none",
          }}
        >
          UpdateProgram
        </h3>

        {/* Info row: Client Name | Program Id | Active checkbox */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          <div>
            <span style={{ color: "#333", fontWeight: 400 }}>Client Name: </span>
            <span style={{ fontWeight: 700, color: "#333" }}>{programData.clientName}</span>
          </div>
          <div>
            <span style={{ color: "#333", fontWeight: 400 }}>Program Id: </span>
            <span style={{ fontWeight: 700, color: "#333" }}>{programId}</span>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              fontSize: "14px",
              color: "#333",
            }}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ accentColor: "#2563eb", width: "16px", height: "16px" }}
              aria-label="Active program"
            />
            Active Program
          </label>
        </div>

        {/* Form — two fields on one row */}
        <div style={{ maxWidth: "900px" }}>
          <div style={{ display: "flex", gap: "24px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <label style={labelStyle}>Program Name:</label>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                aria-label="Program name"
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <label style={labelStyle}>Start Date:</label>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="MM/DD/YYYY"
                aria-label="Start date"
              />
            </div>
          </div>

          {/* Appointment type list */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            <label style={{ ...labelStyle, paddingTop: "10px" }}>Appointment :</label>
            <div
              style={{
                flex: 1,
                border: "1px solid #ccc",
                borderRadius: "4px",
                maxHeight: "280px",
                overflowY: "auto",
                padding: "8px",
              }}
              role="group"
              aria-label="Appointment types"
            >
              {appointmentTypes.map((appt) => (
                <label
                  key={appt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#333",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checkedAppts.has(appt.id)}
                    onChange={() => handleToggleAppt(appt.id)}
                    style={{
                      accentColor: "#2563eb",
                      width: "15px",
                      height: "15px",
                      marginRight: "8px",
                      flexShrink: 0,
                    }}
                    aria-label={`${appt.name} (${appt.syncType === "S" ? "Synchronous" : "Asynchronous"})`}
                  />
                  <span style={{ flex: 1 }}>{appt.name}</span>
                  <span
                    style={{
                      fontWeight: 500,
                      color: "#555",
                      marginLeft: "12px",
                      flexShrink: 0,
                    }}
                  >
                    {appt.syncType}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Update button — bottom-right */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleUpdate}
              style={{
                background: "#1a3a5c",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 32px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#244a9f")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#1a3a5c")
              }
              aria-label="Update program"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditProgram;
