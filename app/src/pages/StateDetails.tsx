import MainLayout from "@/components/layout/MainLayout";
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const US_STATES = [
  "AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN",
  "KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ",
  "NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA",
  "WI","WV","WY"
];

const StateDetails = () => {
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [offset, setOffset] = useState(0);

  const selectedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - offset * 30);
    return d;
  }, [offset]);

  const getDailyData = (st: string, date: Date) => {
    const seed = st.charCodeAt(0) + st.charCodeAt(1) + date.getDate() + date.getMonth() * 31;
    const scheduled = Math.floor(((seed * 7 + 13) % 40) + 5);
    const completed = Math.floor(scheduled * (0.4 + ((seed * 3) % 50) / 100));
    return { scheduled, completed };
  };

  const stateChartData = useMemo(() => {
    return US_STATES.map((st) => {
      let totalScheduled = 0;
      let totalCompleted = 0;

      if (view === "daily") {
        const d = getDailyData(st, selectedDate);
        totalScheduled = d.scheduled;
        totalCompleted = d.completed;
      } else if (view === "weekly") {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        for (let i = 0; i < 7; i++) {
          const day = new Date(weekStart);
          day.setDate(weekStart.getDate() + i);
          const d = getDailyData(st, day);
          totalScheduled += d.scheduled;
          totalCompleted += d.completed;
        }
      } else {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          const day = new Date(year, month, i);
          const d = getDailyData(st, day);
          totalScheduled += d.scheduled;
          totalCompleted += d.completed;
        }
      }

      return { state: st, scheduled: totalScheduled, completed: totalCompleted, remaining: totalScheduled - totalCompleted };
    });
  }, [selectedDate, view]);

  const fmt = (n: number) => n.toLocaleString();

  const totals = useMemo(() => {
    const totalScheduled = stateChartData.reduce((s, d) => s + d.scheduled, 0);
    const totalCompleted = stateChartData.reduce((s, d) => s + d.completed, 0);
    const highState = stateChartData.reduce((max, d) => d.scheduled > max.scheduled ? d : max, stateChartData[0]);
    const lowState = stateChartData.reduce((min, d) => d.scheduled < min.scheduled ? d : min, stateChartData[0]);
    return { totalScheduled: fmt(totalScheduled), totalCompleted: fmt(totalCompleted), highState: `${highState.state} (${fmt(highState.scheduled)})`, lowState: `${lowState.state} (${fmt(lowState.scheduled)})` };
  }, [stateChartData]);

  const periodLabel = view === "daily" ? "Today" : view === "weekly" ? "This Week" : "MTD";

  const dateLabel = useMemo(() => {
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    if (view === "daily") return selectedDate.toLocaleDateString("en-US", opts);
    if (view === "weekly") {
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", opts)}`;
    }
    return selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [view, selectedDate]);

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "State Details" },
      ]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#1d4c88",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            margin: 0,
          }}
        >
          State Distribution
        </h1>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {[
            { label: `Scheduled (${periodLabel})`, value: totals.totalScheduled },
            { label: `Completed (${periodLabel})`, value: totals.totalCompleted },
            { label: "Highest State", value: totals.highState },
            { label: "Lowest State", value: totals.lowState },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                padding: "20px 16px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#1a3a5c",
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginTop: "4px",
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "10px",
            padding: "20px 16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Chart header */}
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: "16px" }}
          >
            <div className="flex items-center gap-3">
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  margin: 0,
                }}
              >
                Appts Per Day by State
              </h2>
              <div
                className="flex items-center"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                {(["daily", "weekly", "monthly"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className="border-none cursor-pointer capitalize transition-colors"
                    style={{
                      padding: "4px 12px",
                      fontSize: "13px",
                      fontWeight: 500,
                      backgroundColor: view === v ? "#1a3a5c" : "#fff",
                      color: view === v ? "#fff" : "#555",
                    }}
                    onMouseEnter={(e) => {
                      if (view !== v) {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (view !== v) {
                        e.currentTarget.style.backgroundColor = "#fff";
                      }
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: "13px", color: "#666" }}>{dateLabel}</span>
              <button
                type="button"
                onClick={() => setOffset((o) => o + 1)}
                className="flex items-center cursor-pointer transition-colors"
                style={{
                  padding: "6px 14px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  color: "#333",
                  fontSize: "13px",
                }}
              >
                <ChevronLeft style={{ width: "14px", height: "14px", marginRight: "4px" }} />
                Back
              </button>
              {offset > 0 && (
                <button
                  type="button"
                  onClick={() => setOffset((o) => o - 1)}
                  className="flex items-center cursor-pointer transition-colors"
                  style={{
                    padding: "6px 14px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    color: "#333",
                    fontSize: "13px",
                  }}
                >
                  Forward
                  <ChevronRight style={{ width: "14px", height: "14px", marginLeft: "4px" }} />
                </button>
              )}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={stateChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="state" tick={{ fontSize: 9 }} stroke="#999" interval={0} angle={-45} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 12 }} stroke="#999" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        padding: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <p style={{ fontWeight: 500, fontSize: "14px", margin: "0 0 4px", color: "#1a1a1a" }}>{label}</p>
                      <p style={{ fontSize: "13px", margin: "0 0 2px", color: "#666" }}>Scheduled: {d.scheduled}</p>
                      <p style={{ fontSize: "13px", margin: 0, color: "#1a3a5c" }}>Completed: {d.completed}</p>
                    </div>
                  );
                }}
              />
              <Legend />
              <Bar dataKey="completed" stackId="appts" name="Completed" fill="#1a3a5c" radius={[0, 0, 0, 0]} />
              <Bar dataKey="remaining" stackId="appts" name="Scheduled" fill="#b8c9dc" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  );
};

export default StateDetails;
