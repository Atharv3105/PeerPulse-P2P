import React from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import PersonaSwitcher from "../PersonaSwitcher";
import ThemeToggle from "../ui/ThemeToggle";
import { Sun, Moon, Home, ShieldAlert } from "lucide-react";

export default function AdminPortalLayout({
  currentRole,
  onSelectPersona,
  dark,
  onToggleTheme,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "flagged", label: "Flagged Applications", icon: "⚑", path: "/admin", badge: 4 },
    { id: "ews", label: "EWS Distress Alerts", icon: "📡", path: "/admin#ews", badge: 7 },
    { id: "recovery", label: "Recovery Pipeline", icon: "🔄", path: "/admin#recovery" },
    { id: "sql-reports", label: "Ledger Audit & SQL", icon: "💾", path: "/admin/sql-reports" },
    { id: "metrics", label: "Statutory Metrics", icon: "📜", path: "/metrics" },
  ];

  const bottomItems = [
    { id: "help", label: "Risk Policy Docs", icon: "📖" },
  ];

  const getActiveId = () => {
    if (location.pathname.includes("sql-reports")) return "sql-reports";
    if (location.hash === "#ews") return "ews";
    if (location.hash === "#recovery") return "recovery";
    return "flagged";
  };

  const handleSelect = (id) => {
    const item = navItems.find((n) => n.id === id);
    if (item) navigate(item.path);
  };

  return (
    <div
      className="min-h-screen flex transition-colors"
      data-portal="admin"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <Sidebar
        items={navItems}
        activeId={getActiveId()}
        onSelect={handleSelect}
        bottomItems={bottomItems}
        portalLabel="Risk Ops"
        portalRole="Risk Officer"
        accentColor="#64748b"
        dark={dark}
        onToggleTheme={onToggleTheme}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for Admin Portal */}
        <header
          className="sticky top-0 z-30 border-b flex items-center justify-between px-6 h-16 backdrop-blur-md transition-colors"
          style={{
            backgroundColor: "var(--glass-bg)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center text-sm font-bold border border-slate-700">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                Internal Risk & Underwriting Operations
              </span>
              <h2 className="text-base font-bold font-display text-[var(--fg)]">
                ACIE Risk Telemetry & Manual Override Panel
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onSelectPersona && (
              <PersonaSwitcher
                currentRole={currentRole}
                activeId="admin-ops"
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
            <span>PeerPulse Risk Ops Panel · LLM Forensic Reasoning + PyMuPDF Layer 1</span>
            <span>Zero Unchecked AI Overrides · All Actions Audit-Logged</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
