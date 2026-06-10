import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const options = [
  "0 - Not at all",
  "1 - Several days",
  "2 - More than half the days",
  "3 - Nearly every day",
];

const questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling asleep, or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself - or that you are a failure, or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around more than usual",
  "Thoughts that you would be better off dead or of hurting yourself in some way",
];

const getScore = (value: string) => {
  const num = parseInt(value.charAt(0));
  return isNaN(num) ? 0 : num;
};

const getSeverity = (score: number) => {
  if (score <= 4) return "Minimal depression";
  if (score <= 9) return "Mild depression";
  if (score <= 14) return "Moderate depression";
  if (score <= 19) return "Moderately severe depression";
  return "Severe depression";
};

const PHQ9Tab = ({ onCompletionChange }: { onCompletionChange?: (complete: boolean) => void }) => {
  const [values, setValues] = useState<string[]>(Array(9).fill(""));

  const setValue = (index: number, value: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const total = values.reduce((sum, v) => sum + getScore(v), 0);
  const hasAnswers = values.some((v) => v !== "");

  useEffect(() => {
    onCompletionChange?.(values.every((v) => v !== ""));
  }, [values, onCompletionChange]);

  return (
    <ScrollArea className="h-[420px] pr-4">
      <div className="space-y-0">
        <div className="pb-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">PHQ - 9: Patient Questionnaire</h2>
          <p className="text-base text-muted-foreground mt-1">Patient Health Questionnaire</p>
        </div>

        <div className="py-4 border-b border-border">
          <label className="text-sm font-semibold text-foreground">
            Q1: Over the last 2 weeks, how often have you been bothered by any of the following problems?
          </label>
        </div>

        {questions.map((question, i) => (
          <div key={i} className="space-y-2 py-4 border-b border-border">
            <label className="text-sm font-semibold text-foreground">
              Q{i + 2}: {question}
            </label>
            <div className="pl-4">
              <RadioGroup value={values[i]} onValueChange={(v) => setValue(i, v)} className="space-y-1">
                {options.map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`phq9-q${i + 2}-${opt}`} />
                    <Label htmlFor={`phq9-q${i + 2}-${opt}`} className="text-sm text-muted-foreground font-normal cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        ))}

        <div className="pt-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Total Score: <span className={total >= 10 ? "text-destructive" : "text-foreground"}>{total}</span>
            {hasAnswers && (
              <span className="ml-2 font-normal text-muted-foreground">— {getSeverity(total)}</span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            Add answers of 1, 2, and 3.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
};

export default PHQ9Tab;
