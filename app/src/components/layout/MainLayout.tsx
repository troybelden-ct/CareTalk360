import { ReactNode, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { CTH_SURFACE } from "@/lib/design-tokens";

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
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Header
          breadcrumbs={breadcrumbs}
          onToggleSidebar={handleToggleSidebar}
        />
        <main
          className="flex-1 overflow-auto"
          style={{
            // GL-003 v2.3 §13.3: the improvised `#f0f1f7` page ground COLLAPSED
            // into `--cth-surface-canvas` under the §13.1(5) test (Δ 3/6/3 per
            // channel) — it was never a fidelity requirement, just a gap §10.1a
            // now closes. White cards on Canvas are 1.03:1, so every card here
            // must carry its own border or shadow; the fill is not the edge.
            backgroundColor: CTH_SURFACE.canvas,
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
