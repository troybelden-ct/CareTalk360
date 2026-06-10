import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { date: "Jul 2023", weight: 84.2 },
  { date: "Apr 2024", weight: 85.1 },
  { date: "May 2025", weight: 87.3 },
  { date: "Jun 2025", weight: 86.0 },
  { date: "Jul 2025", weight: 86.8 },
  { date: "Aug 2025", weight: 85.5 },
  { date: "Sep 2025", weight: 86.2 },
  { date: "Oct 2025", weight: 87.0 },
  { date: "Jan 2026", weight: 86.9 },
  { date: "Feb 2026", weight: 86.6 },
];

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

const WeightModal = ({ open, onOpenChange }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
      <DialogHeader className="bg-primary px-6 py-3 rounded-t-lg">
        <DialogTitle className="text-primary-foreground text-lg font-bold">Analysis</DialogTitle>
      </DialogHeader>
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-4">Body Weight</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="weight" name="Weight (kg)" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DialogContent>
  </Dialog>
);

export default WeightModal;
