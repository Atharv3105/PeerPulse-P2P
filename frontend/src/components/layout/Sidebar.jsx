import React, { useState } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";

export default function Sidebar({
  items = [],
  activeId,
  onSelect,
  bottomItems = [],
  portalLabel = "Portal",
  portalRole = "Role",
  accentColor = "var(--accent)",
  dark,
  onToggleTheme,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <aside
      className="flex flex-col h-full border-r transition-all duration-200 shrink-0 sticky top-0"
      style={{
        width: collapsed ? 68 : 230,
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border)",
        height: "100vh",
      }}
    >
      {/* Header / Brand */}
      <div
        className="flex items-center h-16 px-3.5 border-b shrink-0 justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-serif text-sm font-bold border shrink-0 shadow-sm"
            style={{
              backgroundColor: "var(--muted-bg)",
              borderColor: "var(--border)",
              color: "var(--gold-dark)",
            }}
          >
            P.
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p
                className="text-base font-bold font-serif truncate leading-tight"
                style={{ color: "var(--fg)" }}
              >
                PeerPulse
              </p>
              <p
                className="text-[11px] font-semibold truncate"
                style={{ color: "var(--gold-dark)" }}
              >
                {portalLabel}
              </p>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--muted-bg)]"
          style={{ color: "var(--muted-fg)" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto custom-scrollbar">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                collapsed ? "justify-center p-2.5" : "px-3 py-2.5 gap-2.5"
              }`}
              style={{
                backgroundColor: active ? "var(--accent-soft)" : "transparent",
                color: active ? "var(--accent)" : "var(--muted-fg)",
                border: active ? "1px solid var(--accent-ring)" : "1px solid transparent",
              }}
            >
              <span className="text-base shrink-0 flex items-center justify-center">
                {item.icon}
              </span>
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: active ? "var(--accent)" : "var(--muted-bg)",
                    color: active ? "#ffffff" : "var(--muted-fg)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div
        className="p-2.5 border-t space-y-1"
        style={{ borderColor: "var(--border)" }}
      >
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            title={collapsed ? item.label : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-colors text-left ${
              collapsed ? "justify-center p-2.5" : "px-3 py-2 gap-2.5"
            }`}
            style={{ color: "var(--muted-fg)" }}
          >
            <span className="text-base shrink-0">{item.icon}</span>
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
          </button>
        ))}

        {onToggleTheme && !collapsed && (
          <div className="pt-1 pb-1 flex justify-center">
            <ThemeToggle dark={dark} onToggleTheme={onToggleTheme} size="sm" />
          </div>
        )}

        <Link
          to="/"
          className={`w-full flex items-center rounded-xl text-xs font-semibold transition-colors text-left hover:text-rose-400 ${
            collapsed ? "justify-center p-2.5" : "px-3 py-2 gap-2.5"
          }`}
          style={{ color: "var(--muted-fg)" }}
          title="Exit to Landing"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="flex-1 truncate">Exit to Home</span>}
        </Link>
      </div>
    </aside>
  );
}
