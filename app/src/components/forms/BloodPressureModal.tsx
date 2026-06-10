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

const bpData = [
  { date: "Jul 2023", systolic: 132, diastolic: 73 },
  { date: "Apr 2024", systolic: 118, diastolic: 59 },
  { date: "May 2025", systolic: 145, diastolic: 88 },
  { date: "Jun 2025", systolic: 128, diastolic: 68 },
  { date: "Jul 2025", systolic: 136, diastolic: 78 },
  { date: "Aug 2025", systolic: 120, diastolic: 60 },
  { date: "Sep 2025", systolic: 130, diastolic: 72 },
  { date: "Oct 2025", systolic: 138, diastolic: 82 },
  { date: "Jan 2026", systolic: 134, diastolic: 80 },
  { date: "Feb 2026", systolic: 136, diastolic: 82 },
];

interface BloodPressureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BloodPressureModal = ({ open, onOpenChange }: BloodPressureModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="bg-primary px-6 py-3 rounded-t-lg">
          <DialogTitle className="text-primary-foreground text-lg font-bold">Analysis</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <h3 className="text-base font-bold text-foreground mb-4">Blood Pressure History</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={bpData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 160]} tick={{ fontSize: 12 }} />
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
                dataKey="systolic"
                name="Systolic"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                name="Diastolic"
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
};

export default BloodPressureModal;
