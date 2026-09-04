import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import TopNav from "./TopNav";

export default function MarketplaceLayout({
  activeLenderId,
  currentRole,
  onSelectPersona,
  dark,
  onToggleTheme,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "marketplace", label: "Live Loan Marketplace", icon: "🔍", path: "/marketplace" },
    { id: "sql-reports", label: "SQL Reports (SSRS)", icon: "💾", path: "/sql-reports" },
    { id: "metrics", label: "RBI Statutory Metrics", icon: "📜", path: "/metrics" },
    { id: "lender", label: "Lender Dashboard", icon: "📊", path: "/lender" },
    { id: "borrower", label: "Apply as MSME", icon: "🏬", path: "/borrower/apply" },
  ];

  const getActiveTab = () => {
    if (location.pathname.includes("/sql-reports")) return "sql-reports";
    if (location.pathname.includes("/metrics")) return "metrics";
    return "marketplace";
  };

  const handleTabChange = (tabId) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) navigate(tab.path);
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors"
      data-portal="marketplace"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <TopNav
        tabs={tabs}
        activeTabId={getActiveTab()}
        onTabChange={handleTabChange}
        portalLabel="P2P Marketplace"
        portalRole="Public Listings"
        currentRole={currentRole}
        activeId={activeLenderId}
        onSelectPersona={onSelectPersona}
        dark={dark}
        onToggleTheme={onToggleTheme}
      />

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
          <span>PeerPulse Public P2P Marketplace · RBI Master Directions (2017/2023)</span>
          <span>DLG Prohibited · Lender Bears 100% Credit Risk</span>
        </div>
      </footer>
    </div>
  );
}
