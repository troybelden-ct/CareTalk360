import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AppointmentDetails from "./pages/AppointmentDetails";
import StateDetails from "./pages/StateDetails";
import SearchPatient from "./pages/SearchPatient";
import DoctorAppointments from "./pages/DoctorAppointments";
import UserList from "./pages/UserList";
import ClientList from "./pages/ClientList";
import UserTypes from "./pages/UserTypes";
import CreateUser from "./pages/CreateUser";
import EditUser from "./pages/EditUser";
import EditUserType from "./pages/EditUserType";
import CreatePatient from "./pages/CreatePatient";
import AppointmentTypes from "./pages/AppointmentTypes";
import FormSetup from "./pages/FormSetup";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import EligibilityLists from "./pages/EligibilityLists";
import EditClient from "./pages/EditClient";
import Placeholder from "./pages/Placeholder";
import AppointmentReport from "./pages/AppointmentReport";
import PhysicianInterval from "./pages/PhysicianInterval";
import ClientPrograms from "./pages/ClientPrograms";
import EditProgram from "./pages/EditProgram";
import PatientAppointment from "./pages/PatientAppointment";
import HedisMeasuresSettings from "./pages/HedisMeasuresSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Dashboard (top-level items) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointment-details" element={<AppointmentDetails />} />
          <Route path="/state-details" element={<StateDetails />} />

          {/* Client Admin */}
          <Route path="/client-list" element={<ClientList />} />
          <Route path="/client-list/add" element={<Placeholder title="Add Client" />} />
          <Route path="/client-list/edit/:id" element={<EditClient />} />
          <Route path="/client-list/programs/:id" element={<ClientPrograms />} />
          <Route path="/client-list/programs/:clientId/edit/:programId" element={<EditProgram />} />
          <Route path="/eligibility-lists" element={<EligibilityLists />} />

          {/* User Admin */}
          <Route path="/user-list" element={<UserList />} />
          <Route path="/user-types" element={<UserTypes />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/edit-user/:id" element={<EditUser />} />
          <Route path="/edit-user-type/:id" element={<EditUserType />} />

          {/* Patients */}
          <Route path="/search-patient" element={<SearchPatient />} />
          <Route path="/create-patient" element={<CreatePatient />} />

          {/* Reporting */}
          <Route path="/appointment-report" element={<AppointmentReport />} />
          <Route path="/patient-appointment/:id" element={<PatientAppointment />} />
          <Route path="/physician-interval" element={<PhysicianInterval />} />
          <Route path="/physician-schedules" element={<Placeholder title="Physician-schedules" />} />
          <Route path="/physician-capacity" element={<Placeholder title="Physician Capacity" />} />
          <Route path="/snapbp-report" element={<Placeholder title="SnapBP Report" />} />
          <Route path="/status-report" element={<Placeholder title="Status Report" />} />
          <Route path="/availability-report" element={<Placeholder title="Availability Report" />} />

          {/* Doctor */}
          <Route path="/doctor-appointments" element={<DoctorAppointments />} />
          <Route path="/doctor-availability" element={<Placeholder title="My Availability" />} />
          <Route path="/doctor-profile" element={<Placeholder title="My Profile" />} />

          {/* Settings */}
          <Route path="/diseases" element={<Placeholder title="Diseases List" />} />
          <Route path="/s3-import-logs" element={<Placeholder title="S3 Import Logs" />} />
          <Route path="/form-import" element={<Placeholder title="Forms import" />} />
          <Route path="/sms-logs" element={<Placeholder title="SMS logs" />} />
          <Route path="/sms-templates" element={<Placeholder title="SMS Templates" />} />
          <Route path="/doses-logs" element={<Placeholder title="Doses Logs" />} />
          <Route path="/doses" element={<Placeholder title="Doses" />} />
          <Route path="/ccda-management" element={<Placeholder title="CCDA Management" />} />
          <Route path="/timezone" element={<Placeholder title="TimeZone" />} />
          <Route path="/system-logs" element={<Placeholder title="System Logs" />} />
          <Route path="/error-logs" element={<Placeholder title="Error Logs" />} />
          <Route path="/form-setup" element={<FormSetup />} />
          <Route path="/form-creator" element={<Placeholder title="Form Creator" />} />
          <Route path="/gap-type" element={<Placeholder title="GAP Type" />} />
          <Route path="/appointment-types" element={<AppointmentTypes />} />
          <Route path="/trigger-webhooks" element={<Placeholder title="Trigger WebHooks" />} />
          <Route path="/webhooks-actions" element={<Placeholder title="WebHooks Actions" />} />
          <Route path="/webhooks-logs" element={<Placeholder title="WebHooks Logs" />} />
          <Route path="/service-actions" element={<Placeholder title="Service Actions" />} />
          <Route path="/client-subdomain" element={<Placeholder title="Client SubDomain" />} />
          <Route path="/hedis-measures" element={<HedisMeasuresSettings />} />
          <Route path="/admin-settings" element={<Placeholder title="Admin Settings" />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
