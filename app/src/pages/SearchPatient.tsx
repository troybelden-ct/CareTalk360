import MainLayout from "@/components/layout/MainLayout";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import AppointmentTable from "@/components/appointments/AppointmentTable";

const SearchPatient = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-primary underline underline-offset-4">
          Search Patient
        </h1>

        {/* Filters Section */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <AppointmentFilters />
        </div>

        {/* Table Section */}
        <div>
          <h2 className="text-lg font-semibold text-accent mb-4 underline underline-offset-2">
            Search Patient
          </h2>
          <AppointmentTable />
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchPatient;
