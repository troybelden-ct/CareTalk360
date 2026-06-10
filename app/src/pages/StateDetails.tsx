import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const US_STATES = [
  "AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN",
  "KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ",
  "NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA",
  "WI","WV","WY"
];

const StateDetails = () => {
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
    if (view === "daily") return format(selectedDate, "PPP");
    if (view === "weekly") {
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    return format(selectedDate, "MMMM yyyy");
  }, [view, selectedDate]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-primary underline underline-offset-4">
          State Distribution
        </h1>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Scheduled", value: totals.totalScheduled },
            { label: "Completed", value: totals.totalCompleted },
            { label: "High State", value: totals.highState },
            { label: "Low State", value: totals.lowState },
          ].map((item) => (
            <div key={item.label} className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="text-3xl font-bold text-primary">{item.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">Appts Per Day by State</CardTitle>
              <div className="flex items-center rounded-md border border-border overflow-hidden">
                {(["daily", "weekly", "monthly"] as const).map((v) => (
                  <Button
                    key={v}
                    variant={view === v ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none h-7 text-xs capitalize"
                    onClick={() => setView(v)}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{dateLabel}</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Pick Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && setSelectedDate(d)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={stateChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="state" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-45} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-md">
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-sm" style={{ color: "hsl(210, 80%, 70%)" }}>Scheduled: {d.scheduled}</p>
                        <p className="text-sm" style={{ color: "hsl(210, 80%, 35%)" }}>Completed: {d.completed}</p>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Bar dataKey="completed" stackId="appts" name="Completed" fill="hsl(210, 80%, 35%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="remaining" stackId="appts" name="Scheduled" fill="hsl(210, 80%, 70%)" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StateDetails;
