import { Menu, User, ChevronRight } from "lucide-react";

interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  userName?: string;
  userRole?: string;
}

const Header = ({ 
  breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }, { label: "Appointment Report" }],
  userName = "Troy Belden",
  userRole = "Super Admin"
}: HeaderProps) => {
  return (
    <header className="bg-header text-header-foreground">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold">{userName}</div>
            <div className="text-xs text-header-foreground/80">{userRole}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-header-foreground/20 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-background px-6 pt-3 pb-1">
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              {crumb.href ? (
                <a 
                  href={crumb.href} 
                  className="text-foreground hover:text-accent transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-muted-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
