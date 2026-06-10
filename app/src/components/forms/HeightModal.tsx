import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { date: "Jul 2023", height: 188, weight: 84.2 },
  { date: "Apr 2024", height: 188, weight: 85.0 },
  { date: "May 2025", height: 188, weight: 86.1 },
  { date: "Jun 2025", height: 188, weight: 87.3 },
  { date: "Jul 2025", height: 188, weight: 85.8 },
  { date: "Aug 2025", height: 188, weight: 86.0 },
  { date: "Sep 2025", height: 188, weight: 86.9 },
  { date: "Oct 2025", height: 188, weight: 87.1 },
  { date: "Jan 2026", height: 188, weight: 86.4 },
  { date: "Feb 2026", height: 188, weight: 86.6 },
].map((d) => ({
  ...d,
  bmi: parseFloat((d.weight / ((d.height / 100) ** 2)).toFixed(1)),
}));

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

const HeightModal = ({ open, onOpenChange }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
      <DialogHeader className="bg-primary px-6 py-3 rounded-t-lg">
        <DialogTitle className="text-primary-foreground text-lg font-bold">Analysis</DialogTitle>
      </DialogHeader>
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-4">BMI History</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[20, 30]} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="bmi"
              name="BMI (kg/m²)"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DialogContent>
  </Dialog>
);

export default HeightModal;
