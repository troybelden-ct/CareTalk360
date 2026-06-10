import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const options = [
  "0 - Not at all",
  "1 - Several days",
  "2 - More than half the days",
  "3 - Nearly every day",
];

const getScore = (value: string) => {
  const num = parseInt(value.charAt(0));
  return isNaN(num) ? 0 : num;
};

const PHQ2Tab = ({ onCompletionChange }: { onCompletionChange?: (complete: boolean) => void }) => {
  const [q2Value, setQ2Value] = useState("");
  const [q3Value, setQ3Value] = useState("");

  const total = getScore(q2Value) + getScore(q3Value);

  useEffect(() => {
    onCompletionChange?.(q2Value !== "" && q3Value !== "");
  }, [q2Value, q3Value, onCompletionChange]);

  return (
    <div className="space-y-0">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">PHQ - 2: Patient Health Questionnaire</h2>
        <p className="text-base text-muted-foreground mt-1">Questionnaire</p>
      </div>

      <div className="py-4 border-b border-border">
        <label className="text-sm font-semibold text-foreground">
          Q1: Over the last 2 weeks, how often have you been bothered by any of the following problems?
        </label>
      </div>

      <div className="space-y-2 py-4 border-b border-border">
        <label className="text-sm font-semibold text-foreground">
          Q2: Little interest or pleasure in doing things.
        </label>
        <div className="pl-4">
          <RadioGroup value={q2Value} onValueChange={setQ2Value} className="space-y-1">
            {options.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`phq2-q2-${opt}`} />
                <Label htmlFor={`phq2-q2-${opt}`} className="text-sm text-muted-foreground font-normal cursor-pointer">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-2 py-4 border-b border-border">
        <label className="text-sm font-semibold text-foreground">
          Q3: Feeling down, depressed, or helpless
        </label>
        <div className="pl-4">
          <RadioGroup value={q3Value} onValueChange={setQ3Value} className="space-y-1">
            {options.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`phq2-q3-${opt}`} />
                <Label htmlFor={`phq2-q3-${opt}`} className="text-sm text-muted-foreground font-normal cursor-pointer">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="pt-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">
          Total Score: <span className={total > 2 ? "text-destructive" : "text-foreground"}>{total}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Total score - sum of the answers of the two questions. If PHQ2 score is greater than 2 proceed to PHQ - 9.
        </p>
        {total > 2 && (
          <p className="text-sm font-medium text-destructive">
            ⚠ Score is greater than 2. Please proceed to PHQ-9.
          </p>
        )}
      </div>
    </div>
  );
};

export default PHQ2Tab;
