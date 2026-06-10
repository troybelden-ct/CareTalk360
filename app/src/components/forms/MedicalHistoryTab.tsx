import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const CheckboxGroup = ({
  section,
  number,
  question,
  options,
  onCheckedChange,
}: {
  section: string;
  number: number;
  question: string;
  options: string[];
  onCheckedChange?: (hasSelection: boolean) => void;
}) => {
  const [checked, setChecked] = useState<string[]>([]);
  const toggle = (opt: string) => {
    setChecked((prev) => {
      const next = prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt];
      onCheckedChange?.(next.length > 0);
      return next;
    });
  };
  return (
    <div className="space-y-2 py-4 border-b border-border last:border-b-0">
      <label className="text-sm font-semibold text-foreground">
        Q{number}: {question}
      </label>
      <div className="pl-4 space-y-1">
        {options.map((opt) => (
          <div key={opt} className="flex items-center gap-2">
            <Checkbox
              id={`${section}-q${number}-${opt}`}
              checked={checked.includes(opt)}
              onCheckedChange={() => toggle(opt)}
            />
            <Label
              htmlFor={`${section}-q${number}-${opt}`}
              className="text-sm text-muted-foreground font-normal cursor-pointer"
            >
              {opt}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

const TextQuestion = ({
  section,
  number,
  question,
}: {
  section: string;
  number: number;
  question: string;
}) => (
  <div className="space-y-2 py-4 border-b border-border last:border-b-0">
    <label className="text-sm font-semibold text-foreground">
      Q{number}: {question}
    </label>
    <div className="pl-4">
      <Input className="max-w-md" />
    </div>
  </div>
);

const MedicalHistoryTab = ({ onCompletionChange }: { onCompletionChange?: (complete: boolean) => void }) => {
  const [sectionComplete, setSectionComplete] = useState({ med: false, surg: false, social: false });

  const updateSection = useCallback((section: "med" | "surg" | "social", hasSelection: boolean) => {
    setSectionComplete((prev) => ({ ...prev, [section]: hasSelection }));
  }, []);

  useEffect(() => {
    onCompletionChange?.(sectionComplete.med && sectionComplete.surg && sectionComplete.social);
  }, [sectionComplete, onCompletionChange]);

  return (
    <ScrollArea className="h-[420px] pr-4">
      <div className="space-y-0">
        <h2 className="text-lg font-bold text-foreground pb-2">Medical History</h2>

        <CheckboxGroup
          section="med"
          number={1}
          question="Have you been diagnosed with any of the following?"
          options={[
            "AFib", "Anxiety", "Arthritis (Type?)", "Asthma", "Benign Prostatic Hyperplasia",
            "Cancer (Please indicate type)", "Chronic Kidney Disease", "COPD (Do you use O2)",
            "Depression", "Diabetes", "Gout", "Dementia / Alzheimer's", "Heart Disease",
            "Heart Failure (Do you weigh yourself Daily?)", "HIV / AIDS",
            "Hypertension HTN (Do you check BP at home?)", "Hyperlipidemia",
            "Liver Problems / Hepatitis", "None of the above", "Chronic Kidney Disease",
            "Chronic Heart Disease",
          ]}
          onCheckedChange={(v) => updateSection("med", v)}
        />

        <TextQuestion section="med" number={2} question="Diagnosis from Medical Records:" />

        <h2 className="text-lg font-bold text-foreground pt-6 pb-2 border-t border-border mt-4">
          Surgical History
        </h2>

        <CheckboxGroup
          section="surg"
          number={1}
          question="Surgical History"
          options={[
            "Angioplasty", "Appendectomy", "CABG / Other Cardiac Surgery", "Cataract Surgery",
            "Cholecystectomy", "Hernia Repair", "Joint Replacement", "Mastectomy", "Thyroidectomy",
          ]}
          onCheckedChange={(v) => updateSection("surg", v)}
        />

        <TextQuestion section="surg" number={2} question="Procedures from Medical Records:" />

        <h2 className="text-lg font-bold text-foreground pt-6 pb-2 border-t border-border mt-4">
          Social History
        </h2>

        <CheckboxGroup
          section="social"
          number={1}
          question="Do you use the following:"
          options={[
            "Alcohol (Frequency & Amount)",
            "Tobacco (Frequency & Amount)",
            "Recreational Drugs (Frequency & Amount)",
          ]}
          onCheckedChange={(v) => updateSection("social", v)}
        />
      </div>
    </ScrollArea>
  );
};

export default MedicalHistoryTab;
