import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import PersonaSwitcher from '../PersonaSwitcher';
import ThemeToggle from '../ui/ThemeToggle';
import { Building, ShieldCheck, Home } from 'lucide-react';

export default function InstitutionalPortalLayout({
  activeInstitutionalId,
  currentRole,
  onSelectPersona,
  dark,
  onToggleTheme,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'co-lending', label: 'Co-Lending Desk', icon: '🏛️', path: '/institutional' },
    { id: 'marketplace', label: 'MSME Pool Market', icon: '🔍', path: '/marketplace' },
    { id: 'metrics', label: 'RBI Disclosures', icon: '📜', path: '/metrics' },
  ];

  const bottomItems = [
    { id: 'help', label: 'Institutional API Docs', icon: '📄' },
  ];

  const getActiveId = () => {
    if (location.pathname.includes('/marketplace')) return 'marketplace';
    if (location.pathname.includes('/metrics')) return 'metrics';
    return 'co-lending';
  };

  const handleSelect = (id) => {
    const item = navItems.find((n) => n.id === id);
    if (item) navigate(item.path);
  };

  return (
    <div
      className="min-h-screen flex transition-colors"
      data-portal="institutional"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <Sidebar
        items={navItems}
        activeId={getActiveId()}
        onSelect={handleSelect}
        bottomItems={bottomItems}
        portalLabel="NBFC Co-Lending"
        portalRole="Institutional Desk"
        accentColor="#4f46e5"
        dark={dark}
        onToggleTheme={onToggleTheme}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header
          className="sticky top-0 z-30 border-b flex items-center justify-between px-6 h-16 backdrop-blur-md transition-colors"
          style={{
            backgroundColor: "var(--glass-bg)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/15 border border-indigo-600/30 flex items-center justify-center text-indigo-500 font-bold text-sm">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                NBFC Institutional Co-Lending Desk (80:20 Model)
              </span>
              <h2 className="text-base font-bold font-serif text-[var(--fg)]">
                Bajaj Finserv NBFC Co-Investment Facility
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onSelectPersona && (
              <PersonaSwitcher
                currentRole={currentRole}
                activeId={activeInstitutionalId || 'NBFC-BAJAJ-01'}
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
            <span>PeerPulse Phase 2 Institutional Gateway · Co-Lending Model 2 (Direct Assignment)</span>
            <span>RBI Master Directions for Co-Lending by Banks and NBFCs to Priority Sector</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
