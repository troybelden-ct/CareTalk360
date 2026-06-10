import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface HPITabProps {
  firstName: string;
  age: string | number;
  gender: string;
}

const HPITab = ({ firstName, age, gender }: HPITabProps) => {
  const defaultNarrative = `${firstName} presents for an annual wellness telehealth video visit. The patient is a ${age} year old ${gender}. Patient report general pain as 00.`;
  const [narrative, setNarrative] = useState(defaultNarrative);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">History of Present Illness</h2>
      <Textarea
        value={narrative}
        onChange={(e) => setNarrative(e.target.value)}
        className="min-h-[200px] text-sm"
      />
      <div className="flex justify-end">
        <Button>Save</Button>
      </div>
    </div>
  );
};

export default HPITab;
