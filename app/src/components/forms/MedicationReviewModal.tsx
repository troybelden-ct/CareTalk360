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
import { Plus, Download, Link2, AlertCircle } from "lucide-react";

interface Medication {
  id: number;
  name: string;
  category: string;
  categoryColor: "cardiovascular" | "diabetes" | "controlled" | "respiratory" | "neurological" | "gastrointestinal" | "musculoskeletal" | "endocrine" | "psychiatric" | "dermatological";
  dosage: string;
  frequency: string;
  startDate: string;
  instructions: string;
}

const mockMedications: Medication[] = [
  { id: 1, name: "Lisinopril", category: "Cardiovascular", categoryColor: "cardiovascular", dosage: "10 mg", frequency: "Once daily", startDate: "2023-01-15", instructions: "Take in the morning" },
  { id: 2, name: "Metformin", category: "Diabetes", categoryColor: "diabetes", dosage: "500 mg", frequency: "Twice daily", startDate: "2023-02-10", instructions: "Take with meals" },
  { id: 3, name: "Oxycodone", category: "Controlled", categoryColor: "controlled", dosage: "5 mg", frequency: "Every 6 hours as needed", startDate: "2023-03-15", instructions: "For moderate to severe pain. Do not drive or operate machinery" },
  { id: 4, name: "Albuterol Inhaler", category: "Respiratory", categoryColor: "respiratory", dosage: "90 mcg", frequency: "As needed", startDate: "2022-09-10", instructions: "2 puffs every 4-6 hours as needed for shortness of breath" },
  { id: 5, name: "Gabapentin", category: "Neurological", categoryColor: "neurological", dosage: "300 mg", frequency: "Three times daily", startDate: "2023-04-20", instructions: "Take with or without food" },
  { id: 6, name: "Omeprazole", category: "Gastrointestinal", categoryColor: "gastrointestinal", dosage: "20 mg", frequency: "Once daily", startDate: "2022-11-05", instructions: "Take 30 minutes before breakfast" },
  { id: 7, name: "Ibuprofen", category: "Musculoskeletal", categoryColor: "musculoskeletal", dosage: "400 mg", frequency: "As needed", startDate: "2023-05-01", instructions: "Take with food. Do not exceed 1200mg per day" },
  { id: 8, name: "Levothyroxine", category: "Endocrine", categoryColor: "endocrine", dosage: "50 mcg", frequency: "Once daily", startDate: "2022-08-15", instructions: "Take on empty stomach, 30-60 min before breakfast" },
  { id: 9, name: "Sertraline", category: "Psychiatric", categoryColor: "psychiatric", dosage: "100 mg", frequency: "Once daily", startDate: "2023-01-20", instructions: "Take in the morning with food" },
  { id: 10, name: "Hydrocortisone Cream", category: "Dermatological", categoryColor: "dermatological", dosage: "1%", frequency: "Twice daily", startDate: "2023-06-10", instructions: "Apply thin layer to affected areas" },
];

const categoryStyles: Record<string, string> = {
  cardiovascular: "bg-cyan-100 text-cyan-700 border-cyan-200",
  diabetes: "bg-teal-100 text-teal-700 border-teal-200",
  controlled: "bg-red-100 text-red-700 border-red-200",
  respiratory: "bg-green-100 text-green-700 border-green-200",
  neurological: "bg-purple-100 text-purple-700 border-purple-200",
  gastrointestinal: "bg-amber-100 text-amber-700 border-amber-200",
  musculoskeletal: "bg-orange-100 text-orange-700 border-orange-200",
  endocrine: "bg-indigo-100 text-indigo-700 border-indigo-200",
  psychiatric: "bg-pink-100 text-pink-700 border-pink-200",
  dermatological: "bg-lime-100 text-lime-700 border-lime-200",
};

interface MedicationReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MedicationReviewModal = ({ open, onOpenChange }: MedicationReviewModalProps) => {
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
  const totalCount = mockMedications.length;
  const completionPct = totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold">Medication Review</DialogTitle>
          <DialogDescription>Review and confirm patient medications</DialogDescription>
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
            <Plus className="mr-1 h-4 w-4" /> Add Medication
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" /> Export ({confirmedCount})
          </Button>
        </div>

        {/* Medication List */}
        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-3">
            {mockMedications.map((med) => (
              <div
                key={med.id}
                className={`rounded-lg border p-4 transition-colors ${
                  confirmed.has(med.id)
                    ? "bg-green-50 border-green-200"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={confirmed.has(med.id)}
                    onCheckedChange={() => toggleConfirm(med.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link2 className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">{med.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryStyles[med.categoryColor]}`}>
                        {med.category}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                      <span>Dosage: <span className="text-foreground">{med.dosage}</span></span>
                      <span className="mx-1">•</span>
                      <span>Frequency: <span className="text-foreground">{med.frequency}</span></span>
                      <span className="mx-1">•</span>
                      <span>Start Date: <span className="text-foreground">{med.startDate}</span></span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Instructions: <span className="text-foreground">{med.instructions}</span>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
                      <AlertCircle className="mr-1 h-3 w-3" /> Contraindications
                    </Button>
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

export default MedicationReviewModal;
