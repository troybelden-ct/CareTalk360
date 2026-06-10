import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const AppointmentFilters = () => {
  return (
    <div className="space-y-4">
      {/* First row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="filter-label">First name</label>
          <Input placeholder="First Name" />
        </div>
        <div>
          <label className="filter-label">Last name</label>
          <Input placeholder="Last Name" />
        </div>
        <div>
          <label className="filter-label">Start Date</label>
          <Input type="text" placeholder="01/28/2026" />
        </div>
        <div>
          <label className="filter-label">End Date</label>
          <Input type="text" placeholder="01/27/2026" />
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="filter-label">Clients</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client1">Client 1</SelectItem>
              <SelectItem value="client2">Client 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="filter-label">Programs</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="test">Test</SelectItem>
              <SelectItem value="program2">Program 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="filter-label">Provider</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hogue">Hogue</SelectItem>
              <SelectItem value="provider2">Provider 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="filter-label">Status Appointment</label>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="filter-label">State</label>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="mi">MI</SelectItem>
              <SelectItem value="ks">KS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" className="bg-muted text-foreground hover:bg-muted/80">
          Assign To
        </Button>
        <Button variant="success" className="flex items-center gap-2">
          Extract File <Download className="h-4 w-4" />
        </Button>
        <Button variant="destructive">
          Clear
        </Button>
        <Button>
          Search
        </Button>
      </div>
    </div>
  );
};

export default AppointmentFilters;
