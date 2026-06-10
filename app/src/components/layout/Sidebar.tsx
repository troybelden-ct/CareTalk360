import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  active?: boolean;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    children: [
      { label: "Appt. Details", href: "/appointment-details" },
      { label: "Provider Details", href: "/provider-details" },
      { label: "State Details", href: "/state-details" },
    ],
  },
  {
    label: "Users",
    children: [
      { label: "User List", href: "/user-list" },
      { label: "User Types", href: "/user-types" },
      { label: "Create User", href: "/create-user" },
    ],
  },
  {
    label: "Patients",
    children: [
      { label: "Search Patient", href: "/search-patient" },
      { label: "Create Patient", href: "/create-patient" },
      { label: "Monitor Patients", href: "#" },
    ],
  },
  {
    label: "Reporting",
    children: [
      { label: "Appointment Report", href: "/appointments" },
      { label: "Physician-interval", href: "#" },
      { label: "Physician-schedules", href: "#" },
      { label: "Physician Capacity", href: "#" },
    ],
  },
  {
    label: "Patient Support",
    children: [
      { label: "Support Tickets", href: "#" },
    ],
  },
  {
    label: "Nurses",
    children: [
      { label: "Appointments-N", href: "/nurse-appointments" },
    ],
  },
  {
    label: "Care Navigation",
    children: [
      { label: "Cases", href: "/care-nav-appointments" },
    ],
  },
  {
    label: "Monitoring",
    children: [
      { label: "Admin", href: "#" },
    ],
  },
  {
    label: "Appointments",
    children: [
      { label: "Appointments-S", href: "/supervisor-appointments" },
      { label: "Appointments-P", href: "/doctor-appointments" },
    ],
  },
  {
    label: "Settings",
    children: [
      { label: "Appt. Admin", href: "#", children: [
        { label: "Appointment Types", href: "/appointment-types" },
        { label: "Forms", href: "#" },
      ]},
      { label: "Client Admin", href: "#", children: [
        { label: "Client List", href: "#" },
        { label: "Eligibility List", href: "#" },
      ]},
      { label: "Monitoring Admin", href: "#" },
      { label: "System Admin", href: "#", children: [
        { label: "SMS Admin", href: "#" },
        { label: "Email Admin", href: "#" },
      ]},
      { label: "Forms", href: "/form-setup" },
      { label: "User Admin", href: "#" },
    ],
  },
];

interface NavSectionProps {
  item: NavItem;
  defaultOpen?: boolean;
}

const SubNavItem = ({ child, childActive, hasSubChildren }: { child: NavItem; childActive: boolean; hasSubChildren: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [subOpen, setSubOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          if (hasSubChildren) {
            setSubOpen(!subOpen);
          } else if (child.href && child.href !== "#") {
            navigate(child.href);
          }
        }}
        className={cn(
          "sidebar-link pl-4 w-full",
          childActive && "sidebar-link-active"
        )}
      >
        <span className={cn(
          "w-1.5 h-1.5 rounded-full mr-2",
          childActive ? "bg-warning" : "bg-sidebar-primary"
        )} />
        {child.label}
        {hasSubChildren && (
          subOpen ? <ChevronDown className="h-3 w-3 ml-auto text-sidebar-foreground" /> : <ChevronRight className="h-3 w-3 ml-auto text-sidebar-foreground" />
        )}
      </button>
      {subOpen && hasSubChildren && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          {child.children?.map((sub, i) => {
            const subActive = sub.href && sub.href !== "#" && location.pathname === sub.href;
            return (
              <button
                key={i}
                onClick={() => sub.href && sub.href !== "#" ? navigate(sub.href) : undefined}
                className={cn(
                  "sidebar-link pl-4 w-full text-xs",
                  subActive && "sidebar-link-active"
                )}
              >
                <span className={cn(
                  "w-1 h-1 rounded-full mr-2",
                  subActive ? "bg-warning" : "bg-sidebar-primary"
                )} />
                {sub.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
const NavSection = ({ item, defaultOpen = false }: NavSectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isChildActive = item.children?.some(c => c.href && c.href !== "#" && location.pathname === c.href);
  const isTopLevelActive = item.href && location.pathname === item.href;

  const [isOpen, setIsOpen] = useState(defaultOpen || !!isChildActive);

  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (item.href) {
      navigate(item.href);
    }
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="mb-1">
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-sm font-semibold",
          "text-sidebar-primary hover:bg-sidebar-accent/5 rounded-md transition-colors",
          isTopLevelActive && "bg-sidebar-accent/10"
        )}
      >
        <span>{item.label}</span>
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 text-sidebar-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
          )
        ) : null}
      </button>
      
      {isOpen && hasChildren && (
        <div className="ml-2 mt-1 space-y-0.5">
          {item.children?.map((child, index) => {
            const childActive = child.href && child.href !== "#" && location.pathname === child.href;
            const hasSubChildren = child.children && child.children.length > 0;
            return (
              <SubNavItem key={index} child={child} childActive={!!childActive} hasSubChildren={!!hasSubChildren} />
            );
          })}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  return (
    <aside className="w-56 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold text-sidebar-primary italic">
            ~CareTalk~
          </span>
          <span className="text-xs text-sidebar-accent font-semibold tracking-wider ml-1">360</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {navItems.map((item, index) => (
          <NavSection 
            key={index} 
            item={item} 
            defaultOpen={false} 
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
