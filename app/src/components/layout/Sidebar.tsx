import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Appts. Details", href: "/appointment-details" },
  {
    label: "Client Admin",
    children: [
      { label: "Client List", href: "/client-list" },
      { label: "Eligibility Lists", href: "/eligibility-lists" },
    ],
  },
  {
    label: "User Admin",
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
    ],
  },
  {
    label: "Reporting",
    children: [
      { label: "Appointment Report", href: "/appointment-report" },
      { label: "Physician-interval", href: "/physician-interval" },
      { label: "Physician-schedules", href: "/physician-schedules" },
      { label: "Physician Capacity", href: "/physician-capacity" },
      { label: "SnapBP Report", href: "/snapbp-report" },
      { label: "Status Report", href: "/status-report" },
      { label: "Availability Report", href: "/availability-report" },
    ],
  },
  {
    label: "Doctor",
    children: [
      { label: "My Appointments", href: "/doctor-appointments" },
      { label: "My Availability", href: "/doctor-availability" },
      { label: "My Profile", href: "/doctor-profile" },
    ],
  },
  {
    label: "Settings",
    children: [
      { label: "Diseases List", href: "/diseases" },
      { label: "S3 Import Logs", href: "/s3-import-logs" },
      { label: "Forms import", href: "/form-import" },
      { label: "SMS logs", href: "/sms-logs" },
      { label: "SMS Templates", href: "/sms-templates" },
      { label: "Doses Logs", href: "/doses-logs" },
      { label: "Doses", href: "/doses" },
      { label: "CCDA Management", href: "/ccda-management" },
      { label: "TimeZone", href: "/timezone" },
      { label: "System Logs", href: "/system-logs" },
      { label: "Error Logs", href: "/error-logs" },
      { label: "Form Setup", href: "/form-setup" },
      { label: "Form Creator", href: "/form-creator" },
      { label: "GAP Type", href: "/gap-type" },
      { label: "Appointment List", href: "/appointment-types" },
      { label: "Trigger WebHooks", href: "/trigger-webhooks" },
      { label: "WebHooks Actions", href: "/webhooks-actions" },
      { label: "WebHooks Logs", href: "/webhooks-logs" },
      { label: "Service Actions", href: "/service-actions" },
      { label: "Client SubDomain", href: "/client-subdomain" },
      { label: "Admin Settings", href: "/admin-settings" },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NavSection = ({ item }: { item: NavItem }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isChildActive = item.children?.some(
    (c) => c.href && location.pathname === c.href
  );
  const isDirectActive = item.href && location.pathname === item.href;

  const hasChildren = item.children && item.children.length > 0;
  const [isOpen, setIsOpen] = useState<boolean>(!!isChildActive);

  return (
    <div style={{ margin: "8px 0" }}>
      {/* Group heading or direct link */}
      <button
        type="button"
        onClick={() => {
          if (item.href) navigate(item.href);
          if (hasChildren) setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between bg-transparent border-none cursor-pointer"
        style={{
          padding: 0,
          fontSize: "21px",
          fontWeight: 500,
          color: isDirectActive ? "#ff9f1c" : "#1d4c88",
        }}
      >
        <span>{item.label}</span>
        {hasChildren && (
          <ChevronDown
            style={{
              width: "14px",
              height: "14px",
              color: "#1d4c88",
              transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
          />
        )}
      </button>

      {/* Sub-items */}
      {isOpen && hasChildren && (
        <ul
          style={{
            listStyleType: "disc",
            paddingLeft: "25px",
            margin: "6px 0 0 0",
          }}
        >
          {item.children!.map((child, index) => {
            const active = child.href && location.pathname === child.href;
            return (
              <li
                key={index}
                style={{
                  color: active ? "#ff9f1c" : "#1d4c88",
                  marginBottom: "4px",
                }}
              >
                <a
                  href={child.href}
                  onClick={(e) => {
                    e.preventDefault();
                    if (child.href) navigate(child.href);
                  }}
                  style={{
                    fontSize: "14px",
                    fontWeight: 400,
                    color: active ? "#ff9f1c" : "#1d4c88",
                    textDecoration: "underline",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {child.label}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  return (
    <aside
      className="flex flex-col bg-white"
      style={{
        width: "230px",
        minWidth: "230px",
        minHeight: "100vh",
        borderRight: "2px solid #e0dddd",
        display: isOpen ? "flex" : "none",
      }}
    >
      {/* Logo area */}
      <div
        className="flex items-center justify-between"
        style={{ padding: "16px 25px" }}
      >
        <img
          src="/images/logo.jpg"
          alt="CareTalk 360 logo"
          style={{ maxWidth: "170px", height: "auto" }}
        />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden bg-transparent border-none cursor-pointer p-1"
            aria-label="Close sidebar"
          >
            <X style={{ width: "20px", height: "20px", color: "#1d4c88" }} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto"
        style={{ padding: "0 25px" }}
      >
        {navItems.map((item, index) => (
          <NavSection key={index} item={item} />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
