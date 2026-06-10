import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";
import { type Appointment } from "@/components/appointments/AppointmentTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { BriefcaseMedical, Stethoscope, Heart, FlaskConical, Syringe, ClipboardPlus, PlusSquare, PenLine } from "lucide-react";
import MedicationReviewModal from "@/components/forms/MedicationReviewModal";
import DiagnosisReviewModal from "@/components/forms/DiagnosisReviewModal";
import HRAQuestionnaire from "@/components/forms/HRAQuestionnaire";
import MedicalHistoryTab from "@/components/forms/MedicalHistoryTab";
import ROSTab from "@/components/forms/ROSTab";
import ExamTab from "@/components/forms/ExamTab";
import AssessmentTab from "@/components/forms/AssessmentTab";
import PHQ2Tab from "@/components/forms/PHQ2Tab";
import PHQ9Tab from "@/components/forms/PHQ9Tab";
import PlanTab from "@/components/forms/PlanTab";
import PreviousAppointmentsTab from "@/components/forms/PreviousAppointmentsTab";
import HPITab from "@/components/forms/HPITab";
import BloodPressureModal from "@/components/forms/BloodPressureModal";
import HeightModal from "@/components/forms/HeightModal";
import WeightModal from "@/components/forms/WeightModal";
import HeartRateModal from "@/components/forms/HeartRateModal";
import NotesModal from "@/components/forms/NotesModal";

const calculateAge = (dob: string) => {
  const parts = dob.split("/");
  if (parts.length !== 3) return "";
  const birthDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const tabs = ["Overview", "HRA", "HPI", "Med. History", "ROS", "Exam", "PHQ2", "PHQ9", "Assessment", "Plan", "Prev."];

const Forms = () => {
  const location = useLocation();
  const appointment = (location.state as { appointment?: Appointment })?.appointment;
  const [activeTab, setActiveTab] = useState("Overview");
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [completedTabs, setCompletedTabs] = useState<Record<string, boolean>>({});
  const [reviewedTabs, setReviewedTabs] = useState<Record<string, boolean>>({});

  const markTabComplete = useCallback((tab: string, complete: boolean) => {
    setCompletedTabs((prev) => ({ ...prev, [tab]: complete }));
  }, []);

  const toggleReviewed = (tab: string) => {
    setReviewedTabs((prev) => ({ ...prev, [tab]: !prev[tab] }));
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };
  const [diagModalOpen, setDiagModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [bpModalOpen, setBpModalOpen] = useState(false);
  const [heightModalOpen, setHeightModalOpen] = useState(false);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [hrModalOpen, setHrModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [hpiHeight, setHpiHeight] = useState("");
  const [hpiWeight, setHpiWeight] = useState("");
  const [hpiBpSystolic, setHpiBpSystolic] = useState("");
  const [hpiBpDiastolic, setHpiBpDiastolic] = useState("");
  const [hpiBpDate, setHpiBpDate] = useState("");

  if (!appointment) {
    return (
      <MainLayout breadcrumbs={[]}>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No appointment selected. Please navigate from an appointment table.
        </div>
      </MainLayout>
    );
  }

  const age = calculateAge(appointment.dateOfBirth);

  return (
    <MainLayout breadcrumbs={[]}>
      <div className="space-y-0">
        {/* Patient Header Section */}
        <div className="border border-border rounded-t-lg bg-card">
          <div className="flex">
            {/* Left: Patient Demographics */}
            <div className="flex-1 p-4">
              <div className="flex gap-8">
                {/* Name & Address */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-foreground">
                      {appointment.firstName} {appointment.lastName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {appointment.dateOfBirth}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {age} Year Old / Male
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <div>123 Oak Street</div>
                    <div>Castlewood, {appointment.state} {appointment.zip}</div>
                    <div>{appointment.firstName.toLowerCase()}@email.com</div>
                    <div>H: {appointment.phone} M: {appointment.phone}</div>
                  </div>
                </div>

                {/* Insurance Info */}
                <div className="space-y-1 text-sm">
                  <div className="flex gap-4">
                    <span className="text-muted-foreground font-medium">1H76PQ92AZ5</span>
                    <span className="text-foreground">Medicare Part A & Part B</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground font-medium">900015235007</span>
                    <span className="text-foreground"><span className="text-foreground">Medica Secondary Ins.</span></span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-muted-foreground">Patient Status:</span>
                    <span className="text-foreground font-medium">Active</span>
                  </div>
                </div>

                {/* Provider Info */}
                <div className="space-y-1 text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Initiating Provider:</span>
                    <span className="text-foreground font-medium">Dr. {appointment.provider}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Initiating Visit:</span>
                    <span className="text-foreground font-medium">{appointment.date}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="text-muted-foreground">Eligible AWV:</span>
                    <span className="text-foreground font-medium">Yes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Partner Info */}
            <div className="w-56 p-4 text-sm">
              <div className="space-y-1">
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Partner:</span>
                  <span className="text-foreground font-bold"><span className="text-foreground font-bold">Humana AWV</span></span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">EligibilityId:</span>
                  <span className="text-foreground">36</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">PatientId:</span>
                  <span className="text-foreground">72</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Appointment ID:</span>
                  <span className="text-foreground">{appointment.id}</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Vitals Row */}
        <div className="border-x border-border bg-card px-4 py-1.5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-foreground">Vitals:</span>
            <div className="grid grid-cols-4 gap-2 flex-1">
              {[
                { label: "Blood Pressure", value: "136/82", unit: "mm[Hg]", date: "02/26", onClick: () => setBpModalOpen(true) },
                { label: "Heart Rate", value: "76", unit: "/min", date: "02/26", onClick: () => setHrModalOpen(true) },
                { label: "Body Weight", value: "86.6", unit: "kg", date: "02/26", onClick: () => setWeightModalOpen(true) },
                { label: "BMI", value: (86.6 / ((188 / 100) ** 2)).toFixed(1), unit: "kg/m²", date: "02/26", onClick: () => setHeightModalOpen(true) },
              ].map((vital) => (
                <div key={vital.label} className="border border-border rounded px-2 py-1 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-foreground leading-tight">{vital.label}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">{vital.value} {vital.unit}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span>{vital.date}</span>
                    <button
                      className="text-primary hover:text-primary/80 transition-colors"
                      onClick={vital.onClick}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 16V8"/><path d="M12 16v-5"/><path d="M17 16v-8"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="border-x border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground mr-2">Actions</span>
            {["BCS", "CBP", "COL", "EED", "GSD", "KED", "OMW", "SPC", "SUPD"].map((label) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-4"
              >
                {label}
              </Button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              {["Prescribe", "SnapBP", "BP List"].map((label) => (
                <Button
                  key={label}
                  size="sm"
                  className="text-xs h-7 px-4 bg-[#3e6093] hover:bg-[#345280] text-white border-none"
                >
                  {label}
                </Button>
              ))}
              <Button
                size="sm"
                className="text-xs h-7 px-4 bg-green-500 hover:bg-green-600 text-white"
                onClick={() => setCompleteModalOpen(true)}
              >
                Complete
              </Button>
            </div>
          </div>
        </div>


        {/* Main Content Area */}
        <div className="border border-border rounded-b-lg bg-card flex flex-col min-h-[500px]">
          {/* Tab Navigation */}
          <div className="border-b border-border px-4 flex items-center">
            <div className="flex gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={cn(
                    "py-2 text-sm border-b-2 transition-colors",
                    activeTab === tab
                      ? "border-accent text-accent font-bold"
                      : reviewedTabs[tab]
                        ? "border-transparent text-green-500 font-bold hover:text-green-600"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <TooltipProvider>
              <div className="ml-auto flex items-center gap-1 py-1">
                {[BriefcaseMedical, Stethoscope, Heart, FlaskConical, Syringe, ClipboardPlus, PlusSquare, PenLine].map((Icon, i) => {
                  const labels: Record<number, string> = { 0: "Medications", 1: "Diagnosis", 2: "Observations", 3: "Labs", 4: "Immunizations", 5: "Procedures", 6: "Family History", 7: "Notes" };
                  const label = labels[i];
                  const handleClick = i === 0 ? () => setMedModalOpen(true) : i === 1 ? () => setDiagModalOpen(true) : i === 7 ? () => setNotesModalOpen(true) : undefined;
                  const btn = (
                    <button key={i} className="p-1.5 rounded hover:bg-accent/10 text-primary transition-colors" onClick={handleClick}>
                      <Icon size={18} />
                    </button>
                  );
                  return label ? (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent>{label}</TooltipContent>
                    </Tooltip>
                  ) : btn;
                })}
              </div>
            </TooltipProvider>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4">
            {/* Reviewed checkbox row */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              {activeTab === "HPI" && (
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-medium text-foreground whitespace-nowrap">Current Height:</label>
                    <Input value={hpiHeight} onChange={(e) => setHpiHeight(e.target.value)} className="w-20 h-7 text-sm" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-medium text-foreground whitespace-nowrap">Current Weight:</label>
                    <Input value={hpiWeight} onChange={(e) => setHpiWeight(e.target.value)} className="w-20 h-7 text-sm" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-medium text-foreground whitespace-nowrap">Last BP:</label>
                    <Input value={hpiBpSystolic} onChange={(e) => setHpiBpSystolic(e.target.value)} className="w-14 h-7 text-sm" />
                    <span className="text-sm text-foreground">/</span>
                    <Input value={hpiBpDiastolic} onChange={(e) => setHpiBpDiastolic(e.target.value)} className="w-14 h-7 text-sm" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-medium text-foreground whitespace-nowrap">Date:</label>
                    <Input value={hpiBpDate} onChange={(e) => setHpiBpDate(e.target.value)} className="w-24 h-7 text-sm" />
                  </div>
                </div>
              )}
              {activeTab !== "HPI" && <div />}
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`reviewed-${activeTab}`}
                  checked={!!reviewedTabs[activeTab]}
                  onCheckedChange={() => toggleReviewed(activeTab)}
                />
                <label
                  htmlFor={`reviewed-${activeTab}`}
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Reviewed
                </label>
              </div>
            </div>

            {activeTab === "Overview" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Patient Overview</h2>
                <textarea
                  className="w-full min-h-[200px] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue={`Patient scheduled for Annual Wellness Visit. Health Risk Assessment provides the following.\n\n1. Patient states had a colonoscopy in the last 10 years. Need Date\n2. States has had a mammogram in the last 2 years. Obtain Date\n3. No falls in the last 30 days\n4. No food, housing or transportation insecurities.\n5. Has KED, GSD and CBP HEDIS measures open.`}
                />
              </div>
            )}
            {activeTab === "HRA" && <HRAQuestionnaire />}
            {activeTab === "HPI" && <HPITab firstName={appointment.firstName} age={age} gender="Male" />}
            {activeTab === "Med. History" && <MedicalHistoryTab onCompletionChange={(v) => markTabComplete("Med. History", v)} />}
            {activeTab === "ROS" && <ROSTab onCompletionChange={(v) => markTabComplete("ROS", v)} />}
            {activeTab === "Exam" && <ExamTab onCompletionChange={(v) => markTabComplete("Exam", v)} />}
            {activeTab === "PHQ2" && <PHQ2Tab onCompletionChange={(v) => markTabComplete("PHQ2", v)} />}
            {activeTab === "PHQ9" && <PHQ9Tab onCompletionChange={(v) => markTabComplete("PHQ9", v)} />}
            {activeTab === "Assessment" && <AssessmentTab onCompletionChange={(v) => markTabComplete("Assessment", v)} />}
            {activeTab === "Plan" && <PlanTab onCompletionChange={(v) => markTabComplete("Plan", v)} />}
            {activeTab === "Prev." && <PreviousAppointmentsTab />}
          </div>
        </div>
      </div>
      <MedicationReviewModal open={medModalOpen} onOpenChange={setMedModalOpen} />
      <DiagnosisReviewModal open={diagModalOpen} onOpenChange={setDiagModalOpen} />
      <BloodPressureModal open={bpModalOpen} onOpenChange={setBpModalOpen} />
      <HeightModal open={heightModalOpen} onOpenChange={setHeightModalOpen} />
      <WeightModal open={weightModalOpen} onOpenChange={setWeightModalOpen} />
      <HeartRateModal open={hrModalOpen} onOpenChange={setHrModalOpen} />
      <NotesModal open={notesModalOpen} onOpenChange={setNotesModalOpen} />
      <Dialog open={emergencyModalOpen} onOpenChange={setEmergencyModalOpen}>
        <DialogContent className="max-w-2xl flex items-center justify-center min-h-[300px]">
          <h1 className="text-2xl font-bold text-foreground text-center">PSAP Emergency procedure here</h1>
        </DialogContent>
      </Dialog>
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="max-w-lg">
          <h2 className="text-xl font-bold text-foreground">Complete and Sign Encounter</h2>
          <p className="text-sm text-muted-foreground mt-2">
            By submitting this form you attest that the encounter is complete and ready to process a claim.
          </p>
          <div className="flex justify-end mt-6">
            <Button onClick={() => setCompleteModalOpen(false)}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Forms;
