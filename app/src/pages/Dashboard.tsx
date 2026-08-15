import MainLayout from "@/components/layout/MainLayout";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ViewMode = "daily" | "weekly" | "monthly";

interface ChartDataPoint {
  date: string;
  day?: string;
  completed: number;
  remaining: number;
  scheduled: number;
  rawDate?: Date;
  trend?: number;
}

const Dashboard = () => {
  // Top chart state (per hour)
  const [hourOffset, setHourOffset] = useState<number>(0);
  const [hourView, setHourView] = useState<ViewMode>("daily");

  // Bottom chart state (total appts)
  const [offset, setOffset] = useState<number>(0);
  const [view, setView] = useState<ViewMode>("daily");

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // -- Per-Hour Data --
  const hourDailyData = useMemo(() => {
    const data: ChartDataPoint[] = [];
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - hourOffset * 30);
    const baseRate = 2.5;
    const growthPerDay = 0.05;
    for (let i = 29; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - i);
      const isSunday = date.getDay() === 0;
      const dayIndex = 29 - i;
      const trendingRate =
        baseRate + dayIndex * growthPerDay + (Math.random() * 1.5 - 0.75);
      const scheduledPerHr = isSunday
        ? 0
        : Math.round(Math.max(trendingRate, 1.5) * 10) / 10;
      const completedPerHr = isSunday
        ? 0
        : Math.round(
            Math.min(
              scheduledPerHr,
              scheduledPerHr * (0.5 + Math.random() * 0.4)
            ) * 10
          ) / 10;
      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        day: days[date.getDay()],
        completed: completedPerHr,
        remaining:
          Math.round((scheduledPerHr - completedPerHr) * 10) / 10,
        scheduled: scheduledPerHr,
        rawDate: date,
      });
    }
    for (let i = 0; i < data.length; i++) {
      const windowStart = Math.max(0, i - 6);
      const windowSlice = data
        .slice(windowStart, i + 1)
        .filter((d) => d.scheduled > 0);
      data[i].trend =
        windowSlice.length > 0
          ? Math.round(
              (windowSlice.reduce((sum, d) => sum + d.scheduled, 0) /
                windowSlice.length) *
                10
            ) / 10
          : 0;
    }
    return data;
  }, [hourOffset]);

  const hourWeeklyData = useMemo(() => {
    const weeks: ChartDataPoint[] = [];
    let wC = 0,
      wS = 0,
      count = 0;
    let weekStart = hourDailyData[0]?.date || "";
    hourDailyData.forEach((d, i) => {
      if (d.scheduled > 0) {
        wC += d.completed;
        wS += d.scheduled;
        count++;
      }
      const isEndOfWeek = d.rawDate?.getDay() === 6;
      const isLastDay = i === hourDailyData.length - 1;
      if (isEndOfWeek || isLastDay) {
        const avgS =
          count > 0 ? Math.round((wS / count) * 10) / 10 : 0;
        const avgC =
          count > 0 ? Math.round((wC / count) * 10) / 10 : 0;
        weeks.push({
          date: `${weekStart} \u2013 ${d.date}`,
          completed: avgC,
          remaining: Math.round((avgS - avgC) * 10) / 10,
          scheduled: avgS,
        });
        wC = 0;
        wS = 0;
        count = 0;
        weekStart = hourDailyData[i + 1]?.date || "";
      }
    });
    return weeks;
  }, [hourDailyData]);

  const hourMonthlyData = useMemo(() => {
    const months: Record<
      string,
      { completed: number; scheduled: number; count: number }
    > = {};
    hourDailyData.forEach((d) => {
      if (d.scheduled === 0 || !d.rawDate) return;
      const key = d.rawDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!months[key])
        months[key] = { completed: 0, scheduled: 0, count: 0 };
      months[key].completed += d.completed;
      months[key].scheduled += d.scheduled;
      months[key].count++;
    });
    return Object.entries(months).map(([date, v]) => ({
      date,
      completed: Math.round((v.completed / v.count) * 10) / 10,
      remaining:
        Math.round(
          ((v.scheduled - v.completed) / v.count) * 10
        ) / 10,
      scheduled: Math.round((v.scheduled / v.count) * 10) / 10,
    }));
  }, [hourDailyData]);

  const hourChartData =
    hourView === "daily"
      ? hourDailyData
      : hourView === "weekly"
        ? hourWeeklyData
        : hourMonthlyData;

  // -- Total Appointments Data --
  const dailyData = useMemo(() => {
    const data: ChartDataPoint[] = [];
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - offset * 30);
    const baseScheduled = 20;
    const growthPerDay = 0.8;
    for (let i = 29; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - i);
      const isSunday = date.getDay() === 0;
      const dayIndex = 29 - i;
      const trending = Math.floor(
        baseScheduled +
          dayIndex * growthPerDay +
          (Math.random() * 10 - 5)
      );
      const scheduled = isSunday ? 0 : Math.max(trending, 15);
      const completed = isSunday
        ? 0
        : Math.floor(Math.random() * scheduled * 0.6) +
          Math.floor(scheduled * 0.3);
      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        day: days[date.getDay()],
        completed,
        remaining: scheduled - completed,
        scheduled,
        rawDate: date,
      });
    }
    for (let i = 0; i < data.length; i++) {
      const windowStart = Math.max(0, i - 6);
      const windowSlice = data
        .slice(windowStart, i + 1)
        .filter((d) => d.scheduled > 0);
      data[i].trend =
        windowSlice.length > 0
          ? Math.round(
              windowSlice.reduce((sum, d) => sum + d.scheduled, 0) /
                windowSlice.length
            )
          : 0;
    }
    return data;
  }, [offset]);

  const weeklyData = useMemo(() => {
    const weeks: ChartDataPoint[] = [];
    let weekCompleted = 0,
      weekScheduled = 0;
    let weekStart = dailyData[0]?.date || "";
    dailyData.forEach((d, i) => {
      weekCompleted += d.completed;
      weekScheduled += d.scheduled;
      const isEndOfWeek = d.rawDate?.getDay() === 6;
      const isLastDay = i === dailyData.length - 1;
      if (isEndOfWeek || isLastDay) {
        weeks.push({
          date: `${weekStart} \u2013 ${d.date}`,
          completed: weekCompleted,
          remaining: weekScheduled - weekCompleted,
          scheduled: weekScheduled,
        });
        weekCompleted = 0;
        weekScheduled = 0;
        weekStart = dailyData[i + 1]?.date || "";
      }
    });
    return weeks;
  }, [dailyData]);

  const monthlyData = useMemo(() => {
    const months: Record<
      string,
      { completed: number; scheduled: number }
    > = {};
    dailyData.forEach((d) => {
      if (!d.rawDate) return;
      const key = d.rawDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!months[key]) months[key] = { completed: 0, scheduled: 0 };
      months[key].completed += d.completed;
      months[key].scheduled += d.scheduled;
    });
    return Object.entries(months).map(([date, vals]) => ({
      date,
      completed: vals.completed,
      remaining: vals.scheduled - vals.completed,
      scheduled: vals.scheduled,
    }));
  }, [dailyData]);

  const chartData =
    view === "daily"
      ? dailyData
      : view === "weekly"
        ? weeklyData
        : monthlyData;

  const renderChart = (
    title: string,
    data: ChartDataPoint[],
    currentView: ViewMode,
    setCurrentView: (v: ViewMode) => void,
    currentOffset: number,
    setCurrentOffset: React.Dispatch<React.SetStateAction<number>>,
    unit: string
  ) => (
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
            {title}
          </h2>
          {/* Toggle buttons */}
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
                onClick={() => setCurrentView(v)}
                className="border-none cursor-pointer capitalize transition-colors"
                style={{
                  padding: "4px 12px",
                  fontSize: "13px",
                  fontWeight: 500,
                  backgroundColor:
                    currentView === v ? "#1a3a5c" : "#fff",
                  color: currentView === v ? "#fff" : "#555",
                }}
                onMouseEnter={(e) => {
                  if (currentView !== v) {
                    e.currentTarget.style.backgroundColor = "#f0f0f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentView !== v) {
                    e.currentTarget.style.backgroundColor = "#fff";
                  }
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        {/* Nav buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentOffset((o) => o + 1)}
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
            <ChevronLeft
              style={{ width: "14px", height: "14px", marginRight: "4px" }}
            />
            Back 30 Days
          </button>
          {currentOffset > 0 && (
            <button
              type="button"
              onClick={() => setCurrentOffset((o) => o - 1)}
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
              Forward 30 Days
              <ChevronRight
                style={{
                  width: "14px",
                  height: "14px",
                  marginLeft: "4px",
                }}
              />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            stroke="#999"
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#999" />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as ChartDataPoint;
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
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "14px",
                      margin: "0 0 4px",
                      color: "#1a1a1a",
                    }}
                  >
                    {label} {d.day ? `(${d.day})` : ""}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      margin: "0 0 2px",
                      color: "#666",
                    }}
                  >
                    Scheduled: {d.scheduled}
                    {unit}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      margin: 0,
                      color: "#1a3a5c",
                    }}
                  >
                    Completed: {d.completed}
                    {unit}
                  </p>
                </div>
              );
            }}
          />
          <Legend />
          <Bar
            dataKey="completed"
            stackId="appts"
            name="Completed"
            fill="#1a3a5c"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="remaining"
            stackId="appts"
            name="Scheduled"
            fill="#b8c9dc"
            radius={[4, 4, 0, 0]}
          />
          {currentView === "daily" && (
            <Line
              dataKey="trend"
              name="Trend"
              stroke="#333"
              strokeWidth={2}
              dot={false}
              type="linear"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <MainLayout>
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
          Dashboard
        </h1>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "16px",
          }}
        >
          {[
            { label: "Today's Appts", value: 53 },
            { label: "CPT Today", value: 18 },
            { label: "Sched. Today", value: 35 },
            { label: "Sched. MTD", value: 312 },
            { label: "CPT-MTD", value: 187 },
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

        {renderChart(
          "Appts Per Hour \u2014 Rolling 30 Days",
          hourChartData,
          hourView,
          setHourView,
          hourOffset,
          setHourOffset,
          "/hr"
        )}
        {renderChart(
          "Appointments \u2014 Rolling 30 Days",
          chartData,
          view,
          setView,
          offset,
          setOffset,
          ""
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
