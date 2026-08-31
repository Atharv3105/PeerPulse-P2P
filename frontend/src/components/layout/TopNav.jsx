import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PersonaSwitcher from "../PersonaSwitcher";
import ThemeToggle from "../ui/ThemeToggle";
import { Sun, Moon, Home } from "lucide-react";

export default function TopNav({
  tabs = [],
  activeTabId,
  onTabChange,
  portalLabel = "Borrower Portal",
  portalRole = "MSME Applicant",
  currentRole = "borrower",
  activeId,
  onSelectPersona,
  dark,
  onToggleTheme,
}) {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-40 border-b transition-colors"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center h-16 px-5 sm:px-8 gap-4 max-w-7xl mx-auto">
        {/* Brand & Portal Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-serif text-sm font-bold border shadow-sm"
              style={{
                backgroundColor: dark ? "#1E242D" : "#EAE2D7",
                borderColor: dark ? "rgba(212, 175, 55, 0.4)" : "rgba(0, 0, 0, 0.12)",
                color: "var(--gold-dark)",
              }}
            >
              P.
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-lg font-bold font-serif tracking-tight"
                style={{ color: "var(--fg)" }}
              >
                PeerPulse
              </span>
              <span
                className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: "var(--muted-bg)",
                  borderColor: "var(--border)",
                  color: "var(--gold-dark)",
                }}
              >
                {portalLabel}
              </span>
            </div>
          </Link>
        </div>

        {/* Tab Navigation */}
        {tabs.length > 0 && (
          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            {tabs.map((tab) => {
              const active = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                  style={{
                    color: active ? "var(--accent)" : "var(--muted-fg)",
                    backgroundColor: active ? "var(--accent-soft)" : "transparent",
                    border: active ? "1px solid var(--accent-ring)" : "1px solid transparent",
                  }}
                >
                  {tab.icon && <span>{tab.icon}</span>}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex-1" />

        {/* Right Actions: Persona Switcher, Dark Mode, Home */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onSelectPersona && (
            <PersonaSwitcher
              currentRole={currentRole}
              activeId={activeId}
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
      </div>

      {/* Mobile Tab Strip */}
      {tabs.length > 0 && (
        <div
          className="flex md:hidden items-center gap-1 px-4 py-2 border-t overflow-x-auto custom-scrollbar"
          style={{ borderColor: "var(--border)" }}
        >
          {tabs.map((tab) => {
            const active = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
                style={{
                  color: active ? "var(--accent)" : "var(--muted-fg)",
                  backgroundColor: active ? "var(--accent-soft)" : "transparent",
                }}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
