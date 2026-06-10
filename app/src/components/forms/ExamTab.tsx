import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const examQuestions = [
  { system: "Constitutional", options: ["Well Nourished, Developed, and Kept", "Unkept, Obese, or Thin"], abnormalIndex: 1 },
  { system: "HEENT", options: ["Normal", "Abnormal"], abnormalIndex: 1 },
  { system: "Mental Status *", options: ["Cooperative, Alert, Interactive, Normal Eye Contact", "Uncooperative, Lethargic, Unreactive, or Poor Eye Contact"], abnormalIndex: 1 },
  { system: "Mood / Affect", options: ["Appropriate Mood / Affect", "Flat, Anxious, Withdrawn or Irritable / Angry"], abnormalIndex: 1 },
  { system: "Orientation *", options: ["Oriented to Person", "Oriented to Time", "Oriented to Place"], abnormalIndex: -1 },
  { system: "Memory *", options: ["Recent and Remote Memory Intact", "Memory not Intact"], abnormalIndex: 1 },
  { system: "Language *", options: ["Fluent, Articulation Normal, and Comprehension", "Speech is Broken, Poor Articulation, Lacks Comprehension"], abnormalIndex: 1 },
  { system: "Neurologic", options: ["No Abnormal Movements", "Abnormal Movements"], abnormalIndex: 1 },
  { system: "Extremities", options: ["Normal Movements of All Extremities", "Abnormal Movement of all or some Extremities"], abnormalIndex: 1 },
  { system: "Respiratory", options: ["Easy Work of Breathing by Observation", "Difficult Work of Breathing by Observation"], abnormalIndex: 1 },
  { system: "Cardiovascular", options: ["Well Perfused, No Cyanosis", "Poorly Perfused, Signs of Cyanosis"], abnormalIndex: 1 },
  { system: "Skin", options: ["No Visible Rashes or Lesions", "Observation of Visible Rashes or Lesions"], abnormalIndex: 1 },
];

const ExamTab = ({ onCompletionChange }: { onCompletionChange?: (complete: boolean) => void }) => {
  const [values, setValues] = useState<string[]>(Array(examQuestions.length).fill(""));

  const setValue = (index: number, v: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
  };

  useEffect(() => {
    onCompletionChange?.(values.every((v) => v !== ""));
  }, [values, onCompletionChange]);

  return (
    <ScrollArea className="h-[420px] pr-4">
      <div className="space-y-0">
        <div className="pb-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Exam</h2>
          <p className="text-sm text-muted-foreground mt-1">
            If abnormalities observed check the option and notate in the textbox.
          </p>
        </div>
        {examQuestions.map((q, i) => {
          const showTextarea = q.abnormalIndex >= 0 ? values[i] === q.options[q.abnormalIndex] : false;
          return (
            <div key={q.system} className="space-y-2 py-4 border-b border-border last:border-b-0">
              <label className="text-sm font-semibold text-foreground">
                Q{i + 1}: {q.system} – List any abnormalities in the textbox.
              </label>
              <div className="pl-4 space-y-2">
                <RadioGroup value={values[i]} onValueChange={(v) => setValue(i, v)} className="space-y-1">
                  {q.options.map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <RadioGroupItem value={opt} id={`exam-q${i + 1}-${opt}`} />
                      <Label htmlFor={`exam-q${i + 1}-${opt}`} className="text-sm text-muted-foreground font-normal cursor-pointer">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {showTextarea && (
                  <Textarea placeholder={`Describe ${q.system.replace(" *", "").toLowerCase()} abnormalities...`} className="max-w-md" />
                )}
              </div>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground pt-4 italic">
          * Please see attached personalized plan of services (PPS).
        </p>
      </div>
    </ScrollArea>
  );
};

export default ExamTab;
