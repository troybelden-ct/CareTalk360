import { ReactNode, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

const MainLayout = ({ children, breadcrumbs }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header
          breadcrumbs={breadcrumbs}
          onToggleSidebar={handleToggleSidebar}
        />
        <main
          className="flex-1 overflow-auto"
          style={{
            backgroundColor: "#f0f1f7",
            padding: "8px 24px 24px",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
