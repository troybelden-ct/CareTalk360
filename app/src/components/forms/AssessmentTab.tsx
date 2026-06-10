import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const AssessmentTab = ({ onCompletionChange }: { onCompletionChange?: (complete: boolean) => void }) => {
  const [q1Value, setQ1Value] = useState("");
  const [q2Checked, setQ2Checked] = useState<string[]>([]);

  const toggleQ2 = (opt: string) =>
    setQ2Checked((prev) =>
      prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
    );

  useEffect(() => {
    onCompletionChange?.(q1Value !== "");
  }, [q1Value, onCompletionChange]);

  return (
    <ScrollArea className="h-[420px] pr-4">
      <div className="space-y-0">
        <div className="pb-4 border-b border-border">
          <p className="text-sm font-medium text-muted-foreground">Clinic Only</p>
          <h2 className="text-lg font-bold text-foreground mt-1">Assessment and Plan</h2>
        </div>

        <div className="space-y-2 py-4 border-b border-border">
          <label className="text-sm font-semibold text-foreground">
            Q1: Evaluation Qualification *
          </label>
          <div className="pl-4">
            <RadioGroup value={q1Value} onValueChange={setQ1Value} className="space-y-1">
              {[
                "Z00.00 Encounter for general adult medical exam without abnormal findings",
                "Z00.01 Encounter for general adult medical exam with abnormal findings",
              ].map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <RadioGroupItem value={opt} id={`assess-q1-${opt}`} />
                  <Label htmlFor={`assess-q1-${opt}`} className="text-sm text-muted-foreground font-normal cursor-pointer">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-2 py-4 border-b border-border">
          <label className="text-sm font-semibold text-foreground">
            Q2: In addition to the Exam, the patient was also seen for the below service(s):
          </label>
          <div className="pl-4 space-y-1">
            {[
              "Remote Therapeutic Monitoring. Qualifies for RTM services (Add ICD10)",
              "Remote Patient Monitoring. Qualifies for RPM Services.",
              "Chronic Care Management. Patient has 2 or more chronic conditions.",
            ].map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <Checkbox
                  id={`assess-q2-${opt}`}
                  checked={q2Checked.includes(opt)}
                  onCheckedChange={() => toggleQ2(opt)}
                />
                <Label htmlFor={`assess-q2-${opt}`} className="text-sm text-muted-foreground font-normal cursor-pointer">
                  {opt}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 space-y-3 text-sm text-muted-foreground">
          <p className="italic">** The patient may review recommendations within their patient portal.</p>
          <p>The prescribing provider will continue to monitor and treat for the above diagnosis.</p>
          <p>The prescribing provider will continue to monitor and treat for the above diagnosis.</p>
        </div>
      </div>
    </ScrollArea>
  );
};

export default AssessmentTab;
