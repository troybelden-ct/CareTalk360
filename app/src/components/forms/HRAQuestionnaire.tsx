import { useState } from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type QuestionProps = {
  number: number;
  question: string;
  children: React.ReactNode;
};

const Question = ({ number, question, children }: QuestionProps) => (
  <div className="space-y-2 py-4 border-b border-border last:border-b-0">
    <label className="text-sm font-semibold text-foreground">
      Q{number}: {question}
    </label>
    <div className="pl-4">{children}</div>
  </div>
);

const RadioQuestion = ({
  number,
  question,
  options,
}: {
  number: number;
  question: string;
  options: string[];
}) => {
  const [value, setValue] = useState("");
  return (
    <Question number={number} question={question}>
      <RadioGroup value={value} onValueChange={setValue} className="space-y-1">
        {options.map((opt) => (
          <div key={opt} className="flex items-center gap-2">
            <RadioGroupItem value={opt} id={`q${number}-${opt}`} />
            <Label htmlFor={`q${number}-${opt}`} className="text-sm text-muted-foreground font-normal cursor-pointer">
              {opt}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </Question>
  );
};

const CheckboxQuestion = ({
  number,
  question,
  options,
}: {
  number: number;
  question: string;
  options: string[];
}) => {
  const [checked, setChecked] = useState<string[]>([]);
  const toggle = (opt: string) =>
    setChecked((prev) =>
      prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
    );
  return (
    <Question number={number} question={question}>
      <div className="space-y-1">
        {options.map((opt) => (
          <div key={opt} className="flex items-center gap-2">
            <Checkbox
              id={`q${number}-${opt}`}
              checked={checked.includes(opt)}
              onCheckedChange={() => toggle(opt)}
            />
            <Label htmlFor={`q${number}-${opt}`} className="text-sm text-muted-foreground font-normal cursor-pointer">
              {opt}
            </Label>
          </div>
        ))}
      </div>
    </Question>
  );
};

const TextQuestion = ({
  number,
  question,
}: {
  number: number;
  question: string;
}) => (
  <Question number={number} question={question}>
    <Input className="max-w-md" />
  </Question>
);

const HRAQuestionnaire = () => {
  return (
    <ScrollArea className="h-[420px] pr-4">
      <div className="space-y-0">
        <div className="pb-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Humana SNP English HRA</h2>
          <p className="text-base text-muted-foreground mt-1">HRA Questionnaire</p>
        </div>

        <TextQuestion number={1} question="Member Name" />
        <TextQuestion number={2} question="Humana Member Number" />

        <RadioQuestion
          number={3}
          question="What is your preferred language?"
          options={["English", "Spanish", "Chinese", "Korean", "Other"]}
        />

        <CheckboxQuestion
          number={4}
          question="What health conditions do you currently have or are you managing?"
          options={[
            "Diabetes",
            "Asthma",
            "Emphysema/Other lung condition",
            "COPD",
            "Stroke",
            "Cancer",
            "Heart failure",
            "High blood pressure",
            "Kidney disease/Kidney failure on dialysis",
            "Previous heart attack or acute myocardial infarction (AMI)",
            "High cholesterol",
            "Dementia",
            "None/prefer not to answer",
          ]}
        />

        <RadioQuestion
          number={5}
          question="On a scale of 0-10, what is your current day-to-day unmanaged pain level?"
          options={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
        />

        <RadioQuestion
          number={6}
          question="In the past month, how many times have you fallen?"
          options={["None", "One time", "Two times", "Three or more times", "Don't know"]}
        />

        <RadioQuestion
          number={7}
          question="In the past 12 months, how many times did you visit the ER or stay overnight at the hospital as a patient?"
          options={["None", "One time", "Two times", "Three or more times", "Don't know"]}
        />

        <CheckboxQuestion
          number={8}
          question="In the past month, did you need help with any of the following? Choose all that apply"
          options={[
            "Getting around your home (walking)",
            "Caring for yourself, including bathing",
            "Feeding yourself",
            "Dressing yourself",
            "Getting in or out of bed or a chair",
            "Using the toilet",
            "No issues at this time",
          ]}
        />

        <RadioQuestion
          number={9}
          question="In the past month have you had a mood change that caused you to have little interest or pleasure in doing things that used to interest you?"
          options={["Yes", "No", "Don't know"]}
        />

        <RadioQuestion
          number={10}
          question="In the past month have you had a mood change that caused you to be bothered by feeling down, depressed, anxious or hopeless?"
          options={["Yes", "No", "Don't know"]}
        />

        <RadioQuestion
          number={11}
          question="How often have you felt lonely or isolated from those around you?"
          options={["Never", "Rarely", "Sometimes", "Often", "Always"]}
        />

        <RadioQuestion
          number={12}
          question="In the past 12 months, have you had any problems with your short-term memory?"
          options={["Yes", "No", "Don't know"]}
        />

        <RadioQuestion
          number={13}
          question="In the past 12 months, have you had any problems with your long-term memory?"
          options={["Yes", "No", "Don't know"]}
        />

        <RadioQuestion
          number={14}
          question="How hard is it for you to pay for the very basics like food, housing, medical care (including medicines), and utilities (like electric, gas, oil, or water)? Would you say it is:"
          options={["Very hard", "Somewhat hard", "Not hard at all"]}
        />

        <RadioQuestion
          number={15}
          question="What is your living situation today?"
          options={[
            "I have a steady place to live",
            "I have a place to live today, but am worried about losing it",
            "I do not have a steady place to live",
          ]}
        />

        <CheckboxQuestion
          number={16}
          question="Think about the place you live. Do you have problems with: Choose all that apply"
          options={[
            "Pests such as bugs, ants, or mice",
            "Mold",
            "Lead paint or pipes",
            "Lack of heat",
            "Oven or stove not working",
            "Smoke detectors missing or not working",
            "Water leaks",
            "All of the above",
            "None of the above",
          ]}
        />

        <RadioQuestion
          number={17}
          question="Within the past 12 months, how often were you worried whether your food would run out before you got money to buy more?"
          options={["Often True", "Sometimes True", "Never True"]}
        />

        <CheckboxQuestion
          number={18}
          question="Has lack of transportation kept you from medical appointments, meetings, work, or from getting things needed for daily living? Check all that apply."
          options={[
            "Yes, it has kept me from medical appointments or from getting my medications",
            "Yes, it has kept me from non-medical meetings, appointments, work, or from getting things that I need",
            "No",
            "Choose not to answer",
          ]}
        />

        <TextQuestion number={19} question="What phone number do you prefer we use to contact you?" />

        <RadioQuestion
          number={20}
          question="Is there any unpaid family or support person that helps you with caregiving needs?"
          options={["Yes. If yes, please provide caregiver's name.", "No"]}
        />

        <TextQuestion number={21} question="What is your current weight?" />
        <TextQuestion number={22} question="What is your current height?" />

        <RadioQuestion
          number={23}
          question="Do you currently smoke or use tobacco products?"
          options={["Yes", "No"]}
        />

        <RadioQuestion
          number={24}
          question="How many hours a week do you engage in moderate exercise or movement (like walking or taking an exercise class)?"
          options={["None", "1-2.5 hours", "3+ hours", "Don't know"]}
        />

        <RadioQuestion
          number={25}
          question="How often does your overall health limit your ability to engage in activities that you would like to do?"
          options={["Always", "Often", "Sometimes", "Occasionally", "Never"]}
        />

        <RadioQuestion
          number={26}
          question="In the past 12 months, have you had a flu shot?"
          options={["Yes", "No", "Declined shot", "Don't know", "Not applicable (outside of age range)"]}
        />

        <RadioQuestion
          number={27}
          question="If you are 65 years or older, have you had a pneumonia shot?"
          options={["Yes", "No", "Declined shot", "Don't know", "Not applicable (outside of age range)"]}
        />

        <RadioQuestion
          number={28}
          question="If you are between 50 and 75 years old, have you had a colonoscopy in the past 10 years OR a stool sample test in the past 3 years?"
          options={["Yes", "No", "Don't know", "Not applicable (outside of age range)"]}
        />

        <RadioQuestion
          number={29}
          question="If you are a woman 52 years or older, have you had a mammogram in the past 2 years?"
          options={["Yes", "No", "Don't know", "Not applicable (outside of age range/gender)"]}
        />
      </div>
    </ScrollArea>
  );
};

export default HRAQuestionnaire;
