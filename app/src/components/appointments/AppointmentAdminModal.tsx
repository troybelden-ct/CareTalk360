import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: number;
  firstName: string;
  lastName: string;
  date: string;
  time: string;
}

interface AppointmentAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

const AppointmentAdminModal = ({ isOpen, onClose, appointment }: AppointmentAdminModalProps) => {
  const [selectedAction, setSelectedAction] = useState<string>("");

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[706px] min-h-[400px] p-0 gap-0 overflow-hidden text-[0.67rem]">
        {/* Header + Description */}
        <div className="space-y-0">
          <DialogHeader className="bg-primary text-primary-foreground h-10 px-3 flex items-center justify-center relative">
            <DialogTitle className="text-center text-base font-semibold m-0">
              Appointment Administration
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground px-4 pt-[3px] mt-0 mb-0 leading-none text-xs">
            Make changes to scheduled appointments.
          </p>
          {/* Status */}
          <div className="text-center pt-[3px]">
            <span className="text-accent font-semibold text-xs">
              Appointment Status: (Scheduled)
            </span>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-4 gap-3 text-xs px-4 py-3 mt-3">
            <div>
              <span className="text-muted-foreground">Appointment Id: </span>
              <span className="font-medium">12</span>
            </div>
            <div>
              <span className="text-muted-foreground">Patient id: </span>
              <span className="font-medium">1887</span>
            </div>
            <div>
              <span className="text-muted-foreground">Date: </span>
              <span className="font-medium">{appointment.date}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Time: </span>
              <span className="font-medium">{appointment.time}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border mx-4 mt-3" />

          {/* Section Labels */}
          <div className="grid grid-cols-2 gap-x-6 px-4 mt-3 mb-1">
            <div className="font-semibold underline ml-[9px] text-xs">Provider Reasons</div>
            <div className="font-semibold underline text-xs">Patient Reasons</div>
          </div>

          {/* Radio Options */}
          <div className="p-3 mx-4">
            <RadioGroup value={selectedAction} onValueChange={setSelectedAction}>
              <div className="grid grid-cols-2 gap-x-6 items-start">
                {/* Provider Reasons - 4 items */}
                <div className="flex flex-col gap-y-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="option-e" id="option-e" />
                    <Label htmlFor="option-e" className="font-normal cursor-pointer">
                      Provider Reschedule
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="option-g" id="option-g" />
                    <Label htmlFor="option-g" className="font-normal cursor-pointer">
                      Reset Appointment (Same Provider)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="option-a" id="option-a" />
                    <Label htmlFor="option-a" className="font-normal cursor-pointer">
                      Reassign Appointment (New Provider)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="cancel" id="cancel" />
                    <Label htmlFor="cancel" className="font-normal cursor-pointer">
                      Provider Canceled Appointment
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="suppress" id="suppress" />
                    <Label htmlFor="suppress" className="font-normal cursor-pointer">
                      Suppress
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="admin-cancel" id="admin-cancel" />
                    <Label htmlFor="admin-cancel" className="font-normal cursor-pointer">
                      Admin Cancel
                    </Label>
                  </div>
                </div>
                {/* Patient Reasons - 6 items */}
                <div className="flex flex-col gap-y-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="option-f" id="option-f" />
                    <Label htmlFor="option-f" className="font-normal cursor-pointer">
                      Patient No-Show/No Answer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="option-b" id="option-b" />
                    <Label htmlFor="option-b" className="font-normal cursor-pointer">
                      Patient Requests Reschedule
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="option-h" id="option-h" />
                    <Label htmlFor="option-h" className="font-normal cursor-pointer">
                      Patient Deceased
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="one" id="one" />
                    <Label htmlFor="one" className="font-normal cursor-pointer">
                      Unable to Verify
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="three" id="three" />
                    <Label htmlFor="three" className="font-normal cursor-pointer">
                      Do Not Call
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="option-d" id="option-d" />
                    <Label htmlFor="option-d" className="font-normal cursor-pointer">
                      No Longer Interested
                    </Label>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end px-4 pb-4 -mt-[15px]">
          <Button size="sm" onClick={() => {
            if (selectedAction === "option-f") {
              toast({
                title: "Appt_Status = 2",
              });
            } else if (selectedAction === "option-h") {
              toast({
                title: "Appt_Status = 5",
              });
            } else if (selectedAction === "option-b") {
              toast({
                title: "Appt_Status = 4",
              });
            } else if (selectedAction === "option-d") {
              toast({
                title: "Appt_Status = 6",
              });
            } else if (selectedAction === "one") {
              toast({
                title: "Appt_Status = 7",
              });
            } else if (selectedAction === "three") {
              toast({
                title: "Appt_Status = 8",
              });
            } else if (selectedAction === "option-e") {
              toast({
                title: "Appt_Status = 91",
              });
            } else if (selectedAction === "option-g") {
              toast({
                title: "Appt_Status = ''",
              });
            } else if (selectedAction === "option-a") {
              toast({
                title: "Appt_Status = ''",
              });
            } else if (selectedAction === "cancel") {
              toast({
                title: "Appt_Status = 95",
              });
            } else if (selectedAction === "suppress") {
              toast({
                title: "Appt_Status = 92",
              });
            } else if (selectedAction === "admin-cancel") {
              toast({
                title: "Appt_Status = 93",
              });
            }
            onClose();
          }}>
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentAdminModal;
