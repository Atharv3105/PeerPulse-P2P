import React from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import PersonaSwitcher from "../PersonaSwitcher";
import ThemeToggle from "../ui/ThemeToggle";
import { Sun, Moon, Home } from "lucide-react";

export default function LenderPortalLayout({
  activeLenderId,
  currentRole,
  onSelectPersona,
  dark,
  onToggleTheme,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "portfolio", label: "Portfolio Overview", icon: "📊", path: "/lender" },
    { id: "discover", label: "Discover Listings", icon: "🔍", path: "/marketplace", badge: 3 },
    { id: "onboard", label: "Account Setup & Sizing", icon: "⚙️", path: "/lender/onboard" },
    { id: "metrics", label: "RBI Disclosures", icon: "📜", path: "/metrics" },
  ];

  const bottomItems = [
    { id: "help", label: "Help & FAQ", icon: "❓" },
  ];

  const getActiveId = () => {
    if (location.pathname.includes("/onboard")) return "onboard";
    if (location.pathname.includes("/marketplace")) return "discover";
    if (location.pathname.includes("/metrics")) return "metrics";
    return "portfolio";
  };

  const handleSelect = (id) => {
    const item = navItems.find((n) => n.id === id);
    if (item) navigate(item.path);
  };

  return (
    <div
      className="min-h-screen flex transition-colors"
      data-portal="lender"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <Sidebar
        items={navItems}
        activeId={getActiveId()}
        onSelect={handleSelect}
        bottomItems={bottomItems}
        portalLabel="Lender Portal"
        portalRole="Retail Investor"
        accentColor="#059669"
        dark={dark}
        onToggleTheme={onToggleTheme}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for Lender Portal */}
        <header
          className="sticky top-0 z-30 border-b flex items-center justify-between px-6 h-16 backdrop-blur-md transition-colors"
          style={{
            backgroundColor: "var(--glass-bg)",
            borderColor: "var(--border)",
          }}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">
              Retail Investor Workspace
            </span>
            <h2 className="text-base font-bold font-display text-[var(--fg)]">
              PeerPulse Fractional P2P
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {onSelectPersona && (
              <PersonaSwitcher
                currentRole={currentRole}
                activeId={activeLenderId}
                onSelectPersona={onSelectPersona}
              />
            )}

            <ThemeToggle dark={dark} onToggleTheme={onToggleTheme} />

            <Link
              to="/"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors border"
              style={{
                backgroundColor: "var(--muted-bg)",
                borderColor: "var(--border)",
                color: "var(--muted-fg)",
              }}
              title="Return to Landing Page"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>

        <footer
          className="border-t py-6 text-center text-xs"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card-bg)",
            color: "var(--muted-fg)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>PeerPulse Lender Portal · ₹10L Max Platform Aggregate Exposure</span>
            <span>RBI Master Directions (2017/2023) · 0% DLG Guarantee</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
