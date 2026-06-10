import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type CheckItem = { question: string; options: string[] };

const CheckboxSection = ({
  prefix,
  number,
  question,
  options,
  onCheckedChange,
}: {
  prefix: string;
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
    <div className="space-y-2 py-3 border-b border-border last:border-b-0">
      <label className="text-sm font-semibold text-foreground">
        Q{number}: {question}
      </label>
      <div className="pl-4 space-y-1">
        {options.map((opt) => (
          <div key={opt} className="flex items-start gap-2">
            <Checkbox
              id={`${prefix}-q${number}-${opt}`}
              checked={checked.includes(opt)}
              onCheckedChange={() => toggle(opt)}
              className="mt-0.5"
            />
            <Label
              htmlFor={`${prefix}-q${number}-${opt}`}
              className="text-sm text-muted-foreground font-normal cursor-pointer leading-snug"
            >
              {opt}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

const riskFactors: CheckItem[] = [
  { question: "Cardiovascular Disease", options: ["Continue monitoring BP, cholesterol, BMI."] },
  { question: "Cognitive Impairment", options: ["Continue monitoring cognitive impairment"] },
  { question: "Colorectal Cancer", options: ["Continue monitoring saturated fat and fatty red meat intake", "Get recommended colorectal screenings"] },
  { question: "Depression", options: ["Continue monitoring early warning signs of depression."] },
  { question: "Diabetes", options: ["Continue monitoring lipids, BMI, waist."] },
  { question: "Functional Capacity and Safety", options: ["Continue monitoring safety, driving habits, handrails and slippery surfaces."] },
  { question: "Osteoarthritis/Arthritis", options: ["Continue monitoring bone density.", "Consider calcium supplement."] },
  { question: "Stroke/TIA", options: ["Continue monitoring BP.", "Consider your aspirin intake."] },
];

const screeningSchedule: CheckItem[] = [
  { question: "Blood Pressure:", options: ["Measure at least yearly; goal 130/80; if diabetes, age > 65, or other medical condition, your medical provider may recommend a higher or lower goal. Discuss with your medical provider."] },
  { question: "Weight/BMI:", options: ["Age => 18 years, measure at least every 12 months. BMI goal => 18.5 and < 25"] },
  { question: "Vaccinations:", options: ["Seasonal Flu Pneumonia: Pneumovax and Prevnar (once after age 65) Tdap one dose, thereafter Td (tetanus and diphtheria) every 10 years Shingrix two-dose one-time-only after age 50 COVID-19 primary series, plus booster. People with weakened immune systems may be eligible for an additional primary shot. Discuss with your medical provider."] },
  { question: "Lab Orders:", options: ["Lipid testing once every 5 years; more frequently if being treated for elevated cholesterol, diabetes, heart disease or vascular disease. Discuss with your medical provider."] },
  { question: "Colon Cancer Screening:", options: ["Colonoscopy every 10 years starting age 50 until age 75-80; more frequently and possibly at a younger age depending on family history or medical conditions. Discuss with your medical provider who may offer other testing options."] },
  { question: "Abdominal Ultrasound", options: ["If you are a male 65 or older and have ever smoked, you may have an increased risk for an aortic aneurysm. Discuss the one-time only screening for this condition with your medical provider."] },
  { question: "Bone Density Testing", options: ["Once every two years for persons who indicate an increased risk for osteoporosis, your provider will evaluate your medical need and your appropriate bone mass measurement; testing may be more often when medically necessary. Discuss with your medical provider."] },
  { question: "Hepatitis C Testing", options: ["Recommended once for people born between 1945-1965. Discuss with your medical provider."] },
  { question: "Referrals:", options: [] },
];

const healthAdvice: CheckItem[] = [
  { question: "Fall Prevention", options: ["Your risk of falling and slipping is \"moderate.\" You should take extra precautions around your house, bathroom and outside on your walkway to have railings installed so you don't fall and suffer a setback."] },
  { question: "Nutrition", options: ["Baked or broiled fish or chicken are healthy substitutes for red meat or fried food at mealtime. Both are lower in fat and are good sources of vitamins and minerals. The omega-3 in cold-water fish protects the heart and circulation and may reduce the risk of heart disease and certain cancers."] },
  { question: "Physical Strength", options: ["Your age is 65 years or older. As you age your bones become brittle and you have muscle loss. Your provider can discuss ways that you can help strengthen bones and muscles."] },
  { question: "Tobacco Use", options: ["Cessation Treatment"] },
  { question: "Weight Loss", options: ["Consider weight loss options"] },
  { question: "Depression", options: ["Maintaining contact with your family is very important. If you are unable to do this, please talk to your provider about it immediately."] },
];

const PlanTab = ({ onCompletionChange }: { onCompletionChange?: (complete: boolean) => void }) => {
  const [mammogramAdvised, setMammogramAdvised] = useState("");
  // Track at least one selection in each major section
  const [sectionState, setSectionState] = useState({ risk: false, screen: false, advice: false });

  const updateSection = useCallback((section: "risk" | "screen" | "advice", hasSelection: boolean) => {
    setSectionState((prev) => ({ ...prev, [section]: hasSelection }));
  }, []);

  useEffect(() => {
    onCompletionChange?.(mammogramAdvised !== "" && sectionState.risk && sectionState.screen && sectionState.advice);
  }, [mammogramAdvised, sectionState, onCompletionChange]);

  // Track per-section: mark section complete if ANY item in that section has a selection
  const [riskSelections, setRiskSelections] = useState<boolean[]>(Array(riskFactors.length).fill(false));
  const [screenSelections, setScreenSelections] = useState<boolean[]>(Array(screeningSchedule.filter(s => s.options.length > 0).length).fill(false));
  const [adviceSelections, setAdviceSelections] = useState<boolean[]>(Array(healthAdvice.length).fill(false));

  useEffect(() => {
    updateSection("risk", riskSelections.some(Boolean));
  }, [riskSelections, updateSection]);

  useEffect(() => {
    updateSection("screen", screenSelections.some(Boolean));
  }, [screenSelections, updateSection]);

  useEffect(() => {
    updateSection("advice", adviceSelections.some(Boolean));
  }, [adviceSelections, updateSection]);

  return (
    <ScrollArea className="h-[420px] pr-4">
      <div className="space-y-0">
        <div className="pb-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Humana PPPS</h2>
        </div>

        <h3 className="text-base font-bold text-foreground pt-4 pb-2">Risk Factors</h3>
        {riskFactors.map((item, i) => (
          <CheckboxSection
            key={item.question}
            prefix="risk"
            number={i + 1}
            question={item.question}
            options={item.options}
            onCheckedChange={(v) => setRiskSelections((prev) => { const n = [...prev]; n[i] = v; return n; })}
          />
        ))}

        <h3 className="text-base font-bold text-foreground pt-6 pb-2 border-t border-border mt-4">Screening Schedule</h3>
        {screeningSchedule.map((item, i) => (
          item.options.length > 0 ? (
            <CheckboxSection
              key={item.question}
              prefix="screen"
              number={i + 1}
              question={item.question}
              options={item.options}
              onCheckedChange={(v) => setScreenSelections((prev) => { const n = [...prev]; n[i] = v; return n; })}
            />
          ) : (
            <div key={item.question} className="py-3 border-b border-border">
              <label className="text-sm font-semibold text-foreground">Q{i + 1}: {item.question}</label>
            </div>
          )
        ))}

        <h3 className="text-base font-bold text-foreground pt-6 pb-2 border-t border-border mt-4">Personalized Health Advice</h3>
        {healthAdvice.map((item, i) => (
          <CheckboxSection
            key={item.question}
            prefix="advice"
            number={i + 1}
            question={item.question}
            options={item.options}
            onCheckedChange={(v) => setAdviceSelections((prev) => { const n = [...prev]; n[i] = v; return n; })}
          />
        ))}

        <div className="space-y-2 py-3 border-b border-border">
          <label className="text-sm font-semibold text-foreground">
            Q7: I have advised the patient about Mammogram screening.
          </label>
          <div className="pl-4">
            <RadioGroup value={mammogramAdvised} onValueChange={setMammogramAdvised} className="flex gap-4">
              {["Yes", "No"].map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <RadioGroupItem value={opt} id={`advice-q7-${opt}`} />
                  <Label htmlFor={`advice-q7-${opt}`} className="text-sm text-muted-foreground font-normal cursor-pointer">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default PlanTab;
