import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

const MainLayout = ({ children, breadcrumbs }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header breadcrumbs={breadcrumbs} />
        <main className="flex-1 px-6 pt-2 pb-6 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
