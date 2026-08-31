import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import TopNav from "./TopNav";

export default function BorrowerPortalLayout({
  activeBorrowerId,
  currentRole,
  onSelectPersona,
  dark,
  onToggleTheme,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "dashboard", label: "My Loan & Repayments", icon: "📋", path: "/borrower/dashboard" },
    { id: "apply", label: "Apply for Loan (Wizard)", icon: "✦", path: "/borrower/apply" },
    { id: "marketplace", label: "Live Marketplace", icon: "🔍", path: "/marketplace" },
  ];

  const getActiveTab = () => {
    if (location.pathname.includes("/apply")) return "apply";
    if (location.pathname.includes("/marketplace")) return "marketplace";
    return "dashboard";
  };

  const handleTabChange = (tabId) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) navigate(tab.path);
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors"
      data-portal="borrower"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <TopNav
        tabs={tabs}
        activeTabId={getActiveTab()}
        onTabChange={handleTabChange}
        portalLabel="Borrower Portal"
        portalRole="MSME Applicant"
        currentRole={currentRole}
        activeId={activeBorrowerId}
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
          <span>PeerPulse Borrower Portal · Regulated NBFC-P2P Platform</span>
          <span>RBI Master Directions (2017/2023) · 0% Default Loss Guarantee</span>
        </div>
      </footer>
    </div>
  );
}
