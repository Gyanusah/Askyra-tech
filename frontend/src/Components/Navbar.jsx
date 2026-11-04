import { useEffect, useState } from "react";
import { Menu, X, Search, ArrowUpRight } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "Services", to: "/services" },
  { label: "Service Request", to: "/service-request" },
  { label: "Register", to: "/register" },
  { label: "Contact", to: "/contact" },
];

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="AskYRA Tech home">
      <img
        className="brand-image"
        src="/askyra-logo.png"
        alt="AskYRA Tech — Cybersecurity, Development, Training"
      />
    </Link>
  );
}

export { Brand };

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [user, setUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    apiFetch("/auth/me")
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setSessionChecked(true);
      });

    return () => {
      active = false;
    };
  }, [location.pathname]);

  const visibleNavItems = navItems.filter(
    ({ label }) => !user || label !== "Register",
  );
  const dashboardPath = user ? `/dashboard/${user.role}` : "";

  function submitSearch(event) {
    if (event.key !== "Enter" || !searchText.trim()) return;

    navigate(`/courses?search=${encodeURIComponent(searchText.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header className="site-header">
      <Brand />

      <nav
        className={`nav-links ${menuOpen ? "nav-open" : ""}`}
        aria-label="Main navigation"
      >
        {visibleNavItems.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </NavLink>
        ))}

        {sessionChecked && user ? (
          <NavLink
            className={({ isActive }) =>
              `mobile-login nav-link ${isActive ? "active" : ""}`
            }
            to={dashboardPath}
            onClick={() => setMenuOpen(false)}
          >
            {user.role[0].toUpperCase() + user.role.slice(1)} Dashboard
          </NavLink>
        ) : sessionChecked ? (
          <Link
            className="mobile-login"
            to="/login"
            onClick={() => setMenuOpen(false)}
          >
            Login / Signup
          </Link>
        ) : null}
      </nav>

      <div className="header-actions">
        {searchOpen && (
          <input
            autoFocus
            className="search-input"
            placeholder="Search..."
            aria-label="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={submitSearch}
          />
        )}

        <button
          type="button"
          className="icon-button search-button"
          aria-label="Toggle search"
          onClick={() => setSearchOpen((previous) => !previous)}
        >
          {searchOpen ? <X size={19} /> : <Search size={19} />}
        </button>

        {sessionChecked && user ? (
          <Link className="login-button" to={dashboardPath}>
            {user.role[0].toUpperCase() + user.role.slice(1)} Dashboard
            <ArrowUpRight size={15} />
          </Link>
        ) : sessionChecked ? (
          <Link className="login-button" to="/login">
            Login / Signup <ArrowUpRight size={15} />
          </Link>
        ) : null}

        <button
          type="button"
          className="icon-button menu-button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
    </header>
  );
}
