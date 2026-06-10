import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const systems = [
  "Constitutional",
  "Cardiovascular",
  "Endocrine",
  "Gastrointestinal",
  "Urologic",
  "Hematologic / Lymphatic",
  "Integumentary",
  "Musculoskeletal",
  "Neurologic",
  "Respiratory",
];

const ROSQuestion = ({
  number,
  system,
  value,
  onValueChange,
}: {
  number: number;
  system: string;
  value: string;
  onValueChange: (v: string) => void;
}) => (
  <div className="space-y-2 py-4 border-b border-border last:border-b-0">
    <label className="text-sm font-semibold text-foreground">
      Q{number}: {system} – List any abnormalities in the textbox.
    </label>
    <div className="pl-4 space-y-2">
      <RadioGroup value={value} onValueChange={onValueChange} className="flex gap-4">
        {["Normal", "Abnormal"].map((opt) => (
          <div key={opt} className="flex items-center gap-2">
            <RadioGroupItem value={opt} id={`ros-q${number}-${opt}`} />
            <Label htmlFor={`ros-q${number}-${opt}`} className="text-sm text-muted-foreground font-normal cursor-pointer">
              {opt}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {value === "Abnormal" && (
        <Textarea placeholder={`Describe ${system.toLowerCase()} abnormalities...`} className="max-w-md" />
      )}
    </div>
  </div>
);

const ROSTab = ({ onCompletionChange }: { onCompletionChange?: (complete: boolean) => void }) => {
  const [values, setValues] = useState<string[]>(Array(systems.length).fill(""));

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
          <h2 className="text-lg font-bold text-foreground">Review of Systems</h2>
          <p className="text-sm text-muted-foreground mt-1">
            If abnormalities observed check the option and notate in the textbox.
          </p>
        </div>
        {systems.map((system, i) => (
          <ROSQuestion key={system} number={i + 1} system={system} value={values[i]} onValueChange={(v) => setValue(i, v)} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ROSTab;
