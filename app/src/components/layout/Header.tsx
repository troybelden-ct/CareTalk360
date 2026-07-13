import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, User, ChevronRight } from "lucide-react";

interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  userName?: string;
  userRole?: string;
  onToggleSidebar?: () => void;
}

const Header = ({
  breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Appointment Report" },
  ],
  userName = "Troy Belden",
  userRole = "Super Admin",
  onToggleSidebar,
}: HeaderProps) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen, handleClickOutside]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* Top navbar -- 52px, navy blue */}
      <header
        className="w-full flex items-center justify-between px-4"
        style={{
          height: "52px",
          backgroundColor: "#1d4c88",
        }}
      >
        {/* Left: hamburger */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex items-center justify-center rounded transition-colors"
          style={{ padding: "6px" }}
          aria-label="Toggle sidebar navigation"
        >
          <Menu
            className="text-white"
            style={{ width: "20px", height: "20px" }}
          />
        </button>

        {/* Right: user info + avatar */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 bg-transparent border-none cursor-pointer"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <div className="text-right">
              <div
                className="text-white"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                {userName}
              </div>
              <div
                className="text-white"
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                {userRole}
              </div>
            </div>
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#4a70a0",
              }}
            >
              <User
                className="text-white"
                style={{ width: "20px", height: "20px" }}
              />
            </div>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 bg-white shadow-lg"
              style={{
                top: "100%",
                marginTop: "4px",
                zIndex: 20,
                borderRadius: "4px",
                minWidth: "160px",
              }}
              role="menu"
            >
              <button
                type="button"
                onClick={() => setDropdownOpen(false)}
                className="block w-full text-left bg-transparent border-none cursor-pointer transition-colors"
                style={{
                  color: "#333",
                  padding: "5px 10px",
                  fontSize: "15px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#edf2f4")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                role="menuitem"
              >
                View Profile
              </button>
              <button
                type="button"
                onClick={() => setDropdownOpen(false)}
                className="block w-full text-left bg-transparent border-none cursor-pointer transition-colors"
                style={{
                  color: "#333",
                  padding: "5px 10px",
                  fontSize: "15px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#edf2f4")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                role="menuitem"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full text-left bg-transparent border-none cursor-pointer transition-colors"
                style={{
                  color: "#333",
                  padding: "5px 10px",
                  fontSize: "15px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#edf2f4")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                role="menuitem"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Breadcrumb row -- separate from header */}
      <div
        className="flex items-center px-4"
        style={{
          height: "40px",
          backgroundColor: "transparent",
        }}
      >
        <nav className="flex items-center" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight
                  className="text-gray-400 mx-1"
                  style={{ width: "14px", height: "14px" }}
                />
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="no-underline transition-colors"
                  style={{
                    color: "#143f7e",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ddd")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {crumb.label}
                </a>
              ) : (
                <span
                  style={{
                    color: "#777",
                    padding: "6px 10px",
                    fontSize: "14px",
                  }}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Header;
