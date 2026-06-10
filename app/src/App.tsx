import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AppointmentDetails from "./pages/AppointmentDetails";
import ProviderDetails from "./pages/ProviderDetails";
import SearchPatient from "./pages/SearchPatient";
import DoctorAppointments from "./pages/DoctorAppointments";
import UserList from "./pages/UserList";
import UserTypes from "./pages/UserTypes";
import CreateUser from "./pages/CreateUser";
import EditUser from "./pages/EditUser";
import EditUserType from "./pages/EditUserType";
import StateDetails from "./pages/StateDetails";
import CreatePatient from "./pages/CreatePatient";
import CareNavAppointments from "./pages/CareNavAppointments";
import NurseAppointments from "./pages/NurseAppointments";
import SupervisorAppointments from "./pages/SupervisorAppointments";
import Forms from "./pages/Forms";
import AppointmentTypes from "./pages/AppointmentTypes";
import FormSetup from "./pages/FormSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointment-details" element={<AppointmentDetails />} />
          <Route path="/provider-details" element={<ProviderDetails />} />
          <Route path="/state-details" element={<StateDetails />} />
          <Route path="/appointments" element={<Index />} />
          <Route path="/search-patient" element={<SearchPatient />} />
          <Route path="/doctor-appointments" element={<DoctorAppointments />} />
          <Route path="/user-list" element={<UserList />} />
          <Route path="/user-types" element={<UserTypes />} />
          <Route path="/edit-user-type/:id" element={<EditUserType />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/edit-user/:id" element={<EditUser />} />
          <Route path="/create-patient" element={<CreatePatient />} />
          <Route path="/care-nav-appointments" element={<CareNavAppointments />} />
          <Route path="/nurse-appointments" element={<NurseAppointments />} />
          <Route path="/supervisor-appointments" element={<SupervisorAppointments />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/appointment-types" element={<AppointmentTypes />} />
          <Route path="/form-setup" element={<FormSetup />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
