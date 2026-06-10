import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface NotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotesModal = ({ open, onOpenChange }: NotesModalProps) => {
  const [notes, setNotes] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col p-6 gap-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Notes</DialogTitle>
        </DialogHeader>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter notes here..."
          className="min-h-[300px] resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesModal;
