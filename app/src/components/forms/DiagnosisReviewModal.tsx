import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Download, Stethoscope } from "lucide-react";

interface Diagnosis {
  id: number;
  code: string;
  name: string;
  category: string;
  categoryColor: string;
  status: string;
  dateOfOnset: string;
  notes: string;
}

const mockDiagnoses: Diagnosis[] = [
  { id: 1, code: "I10", name: "Essential Hypertension", category: "Cardiovascular", categoryColor: "cardiovascular", status: "Active", dateOfOnset: "2020-03-15", notes: "Controlled with Lisinopril 10mg" },
  { id: 2, code: "E11.9", name: "Type 2 Diabetes Mellitus", category: "Endocrine", categoryColor: "endocrine", status: "Active", dateOfOnset: "2021-06-10", notes: "A1C last measured at 7.2%" },
  { id: 3, code: "E78.5", name: "Hyperlipidemia, Unspecified", category: "Metabolic", categoryColor: "metabolic", status: "Active", dateOfOnset: "2020-03-15", notes: "On statin therapy" },
  { id: 4, code: "J45.20", name: "Mild Intermittent Asthma", category: "Respiratory", categoryColor: "respiratory", status: "Active", dateOfOnset: "2018-09-01", notes: "Uses albuterol PRN" },
  { id: 5, code: "M54.5", name: "Low Back Pain", category: "Musculoskeletal", categoryColor: "musculoskeletal", status: "Active", dateOfOnset: "2022-11-20", notes: "Chronic, managed with PT and NSAIDs" },
  { id: 6, code: "F41.1", name: "Generalized Anxiety Disorder", category: "Psychiatric", categoryColor: "psychiatric", status: "Active", dateOfOnset: "2023-01-20", notes: "On Sertraline 100mg" },
  { id: 7, code: "K21.0", name: "GERD with Esophagitis", category: "Gastrointestinal", categoryColor: "gastrointestinal", status: "Active", dateOfOnset: "2022-11-05", notes: "On Omeprazole 20mg daily" },
  { id: 8, code: "E03.9", name: "Hypothyroidism, Unspecified", category: "Endocrine", categoryColor: "endocrine", status: "Active", dateOfOnset: "2022-08-15", notes: "On Levothyroxine 50mcg, TSH stable" },
];

const categoryStyles: Record<string, string> = {
  cardiovascular: "bg-cyan-100 text-cyan-700 border-cyan-200",
  endocrine: "bg-indigo-100 text-indigo-700 border-indigo-200",
  metabolic: "bg-violet-100 text-violet-700 border-violet-200",
  respiratory: "bg-green-100 text-green-700 border-green-200",
  musculoskeletal: "bg-orange-100 text-orange-700 border-orange-200",
  psychiatric: "bg-pink-100 text-pink-700 border-pink-200",
  gastrointestinal: "bg-amber-100 text-amber-700 border-amber-200",
};

interface DiagnosisReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DiagnosisReviewModal = ({ open, onOpenChange }: DiagnosisReviewModalProps) => {
  const [confirmed, setConfirmed] = useState<Set<number>>(new Set());

  const toggleConfirm = (id: number) => {
    setConfirmed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmedCount = confirmed.size;
  const totalCount = mockDiagnoses.length;
  const completionPct = totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold">Diagnosis Review</DialogTitle>
          <DialogDescription>Review and confirm patient diagnoses</DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mx-6 mb-4 rounded-lg bg-muted/50 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Review Progress</div>
            <div className="text-sm font-bold">{confirmedCount} of {totalCount} confirmed</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Completion</div>
            <div className={`text-lg font-bold ${completionPct === 100 ? "text-success" : "text-primary"}`}>
              {completionPct}%
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 mb-4 flex items-center gap-3">
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="mr-1 h-4 w-4" /> Add Diagnosis
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" /> Export ({confirmedCount})
          </Button>
        </div>

        {/* Diagnosis List */}
        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-3">
            {mockDiagnoses.map((dx) => (
              <div
                key={dx.id}
                className={`rounded-lg border p-4 transition-colors ${
                  confirmed.has(dx.id)
                    ? "bg-green-50 border-green-200"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={confirmed.has(dx.id)}
                    onCheckedChange={() => toggleConfirm(dx.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">{dx.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryStyles[dx.categoryColor] || "bg-muted text-muted-foreground border-border"}`}>
                        {dx.category}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                      <span>ICD-10: <span className="text-foreground font-medium">{dx.code}</span></span>
                      <span className="mx-1">•</span>
                      <span>Status: <span className="text-foreground">{dx.status}</span></span>
                      <span className="mx-1">•</span>
                      <span>Onset: <span className="text-foreground">{dx.dateOfOnset}</span></span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Notes: <span className="text-foreground">{dx.notes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DiagnosisReviewModal;
