import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProviderDetails = () => {
  const [hourOffset, setHourOffset] = useState(0);
  const [hourView, setHourView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [offset, setOffset] = useState(0);
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const hourDailyData = useMemo(() => {
    const data: any[] = [];
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
      const trendingRate = baseRate + dayIndex * growthPerDay + (Math.random() * 1.5 - 0.75);
      const scheduledPerHr = isSunday ? 0 : Math.round(Math.max(trendingRate, 1.5) * 10) / 10;
      const completedPerHr = isSunday ? 0 : Math.round(Math.min(scheduledPerHr, scheduledPerHr * (0.5 + Math.random() * 0.4)) * 10) / 10;
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        day: days[date.getDay()],
        completed: completedPerHr,
        remaining: Math.round((scheduledPerHr - completedPerHr) * 10) / 10,
        scheduled: scheduledPerHr,
        rawDate: date,
      });
    }
    for (let i = 0; i < data.length; i++) {
      const windowStart = Math.max(0, i - 6);
      const window = data.slice(windowStart, i + 1).filter((d: any) => d.scheduled > 0);
      data[i].trend = window.length > 0
        ? Math.round((window.reduce((sum: number, d: any) => sum + d.scheduled, 0) / window.length) * 10) / 10
        : 0;
    }
    return data;
  }, [hourOffset]);

  const hourWeeklyData = useMemo(() => {
    const weeks: any[] = [];
    let wC = 0, wS = 0, count = 0;
    let weekStart = hourDailyData[0]?.date || "";
    hourDailyData.forEach((d: any, i: number) => {
      if (d.scheduled > 0) { wC += d.completed; wS += d.scheduled; count++; }
      const isEndOfWeek = d.rawDate.getDay() === 6;
      const isLastDay = i === hourDailyData.length - 1;
      if (isEndOfWeek || isLastDay) {
        const avgS = count > 0 ? Math.round((wS / count) * 10) / 10 : 0;
        const avgC = count > 0 ? Math.round((wC / count) * 10) / 10 : 0;
        weeks.push({ date: `${weekStart} – ${d.date}`, completed: avgC, remaining: Math.round((avgS - avgC) * 10) / 10, scheduled: avgS });
        wC = 0; wS = 0; count = 0;
        weekStart = hourDailyData[i + 1]?.date || "";
      }
    });
    return weeks;
  }, [hourDailyData]);

  const hourMonthlyData = useMemo(() => {
    const months: Record<string, { completed: number; scheduled: number; count: number }> = {};
    hourDailyData.forEach((d: any) => {
      if (d.scheduled === 0) return;
      const key = d.rawDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (!months[key]) months[key] = { completed: 0, scheduled: 0, count: 0 };
      months[key].completed += d.completed;
      months[key].scheduled += d.scheduled;
      months[key].count++;
    });
    return Object.entries(months).map(([date, v]) => ({
      date,
      completed: Math.round((v.completed / v.count) * 10) / 10,
      remaining: Math.round(((v.scheduled - v.completed) / v.count) * 10) / 10,
      scheduled: Math.round((v.scheduled / v.count) * 10) / 10,
    }));
  }, [hourDailyData]);

  const hourChartData = hourView === "daily" ? hourDailyData : hourView === "weekly" ? hourWeeklyData : hourMonthlyData;

  const dailyData = useMemo(() => {
    const data: any[] = [];
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
      const trending = Math.floor(baseScheduled + dayIndex * growthPerDay + (Math.random() * 10 - 5));
      const scheduled = isSunday ? 0 : Math.max(trending, 15);
      const completed = isSunday ? 0 : Math.floor(Math.random() * scheduled * 0.6) + Math.floor(scheduled * 0.3);
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        day: days[date.getDay()],
        completed,
        remaining: scheduled - completed,
        scheduled,
        rawDate: date,
      });
    }
    for (let i = 0; i < data.length; i++) {
      const windowStart = Math.max(0, i - 6);
      const window = data.slice(windowStart, i + 1).filter((d: any) => d.scheduled > 0);
      data[i].trend = window.length > 0
        ? Math.round(window.reduce((sum: number, d: any) => sum + d.scheduled, 0) / window.length)
        : 0;
    }
    return data;
  }, [offset]);

  const weeklyData = useMemo(() => {
    const weeks: any[] = [];
    let weekCompleted = 0, weekScheduled = 0;
    let weekStart = dailyData[0]?.date || "";
    dailyData.forEach((d: any, i: number) => {
      weekCompleted += d.completed;
      weekScheduled += d.scheduled;
      const isEndOfWeek = d.rawDate.getDay() === 6;
      const isLastDay = i === dailyData.length - 1;
      if (isEndOfWeek || isLastDay) {
        weeks.push({ date: `${weekStart} – ${d.date}`, completed: weekCompleted, remaining: weekScheduled - weekCompleted, scheduled: weekScheduled });
        weekCompleted = 0; weekScheduled = 0;
        weekStart = dailyData[i + 1]?.date || "";
      }
    });
    return weeks;
  }, [dailyData]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { completed: number; scheduled: number }> = {};
    dailyData.forEach((d: any) => {
      const key = d.rawDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
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

  const chartData = view === "daily" ? dailyData : view === "weekly" ? weeklyData : monthlyData;

  const renderChart = (
    title: string,
    data: any[],
    currentView: "daily" | "weekly" | "monthly",
    setCurrentView: (v: "daily" | "weekly" | "monthly") => void,
    currentOffset: number,
    setCurrentOffset: React.Dispatch<React.SetStateAction<number>>,
    unit: string,
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center rounded-md border border-border overflow-hidden">
            {(["daily", "weekly", "monthly"] as const).map((v) => (
              <Button
                key={v}
                variant={currentView === v ? "default" : "ghost"}
                size="sm"
                className="rounded-none h-7 text-xs capitalize"
                onClick={() => setCurrentView(v)}
              >
                {v}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentOffset((o) => o + 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back 30 Days
          </Button>
          {currentOffset > 0 && (
            <Button variant="outline" size="sm" onClick={() => setCurrentOffset((o) => o - 1)}>
              Forward 30 Days <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-md">
                    <p className="font-medium text-sm">{label} {d.day ? `(${d.day})` : ""}</p>
                    <p className="text-sm text-muted-foreground">Scheduled: {d.scheduled}{unit}</p>
                    <p className="text-sm text-primary">Completed: {d.completed}{unit}</p>
                  </div>
                );
              }}
            />
            <Legend />
            <Bar dataKey="completed" stackId="appts" name="Completed" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="remaining" stackId="appts" name="Scheduled" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} />
            {currentView === "daily" && (
              <Line dataKey="trend" name="Trend" stroke="#000000" strokeWidth={2} dot={false} type="monotone" />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-primary underline underline-offset-4">
          Provider Dashboard
        </h1>
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Today's Appts", value: 53 },
            { label: "CPT Today", value: 18 },
            { label: "Sched. Today", value: 35 },
            { label: "Sched. MTD", value: 312 },
            { label: "CPT-MTD", value: 187 },
          ].map((item) => (
            <div key={item.label} className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="text-3xl font-bold text-primary">{item.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {renderChart("Appts Per Hour — Rolling 30 Days", hourChartData, hourView, setHourView, hourOffset, setHourOffset, "/hr")}
        {renderChart("Appointments — Rolling 30 Days", chartData, view, setView, offset, setOffset, "")}
      </div>
    </MainLayout>
  );
};

export default ProviderDetails;
