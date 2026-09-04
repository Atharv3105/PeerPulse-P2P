import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sparkles, Minimize2, ChevronUp } from 'lucide-react';

// Layouts
import BorrowerPortalLayout from './components/layout/BorrowerPortalLayout';
import LenderPortalLayout from './components/layout/LenderPortalLayout';
import AdminPortalLayout from './components/layout/AdminPortalLayout';
import MarketplaceLayout from './components/layout/MarketplaceLayout';
import InstitutionalPortalLayout from './components/layout/InstitutionalPortalLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Marketplace from './pages/Marketplace';
import BorrowerWizard from './pages/BorrowerWizard';
import BorrowerDashboard from './pages/BorrowerDashboard';
import LenderOnboarding from './pages/LenderOnboarding';
import LenderDashboard from './pages/LenderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PublicMetrics from './pages/PublicMetrics';
import SqlReports from './pages/SqlReports';
import InstitutionalDashboard from './pages/InstitutionalDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotificationCenter from './components/NotificationCenter';
import TimeMachineBar from './components/simulation/TimeMachineBar';
import CreditCopilotModal from './components/copilot/CreditCopilotModal';
import ApiWebhookModal from './components/simulation/ApiWebhookModal';
import { api } from './services/api';

export default function App() {
  const [currentRole, setCurrentRole] = useState('borrower');
  const [activeBorrowerId, setActiveBorrowerId] = useState('BOR-PRIYA-001');
  const [activeLenderId, setActiveLenderId] = useState('LEN-VIKRAM-001');
  
  // Auth Session state
  const [authUser, setAuthUser] = useState(() => {
    return api.getCurrentSession();
  });
  
  // Theme state
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('peerpulse-theme');
    return saved ? saved === 'dark' : true;
  });

  // Dock Minimize state
  const [dockMinimized, setDockMinimized] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('peerpulse-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('peerpulse-theme', 'light');
    }
  }, [dark]);

  const handleToggleTheme = () => {
    setDark((prev) => !prev);
  };

  const handleSelectPersona = (roleOrId, id) => {
    const personaId = id || roleOrId;
    const role = id ? roleOrId : (
      personaId.startsWith('BOR-') ? 'borrower' :
      personaId.startsWith('LEN-') ? 'lender' :
      personaId.startsWith('NBFC-') ? 'institutional' : 'admin'
    );

    setCurrentRole(role);
    if (role === 'borrower') {
      setActiveBorrowerId(personaId);
      setAuthUser({
        id: personaId,
        borrowerId: personaId,
        name: personaId === 'BOR-PRIYA-001' ? 'Priya Sharma' : 'MSME Borrower',
        role: 'borrower'
      });
    } else if (role === 'lender') {
      setActiveLenderId(personaId);
      setAuthUser({
        id: personaId,
        lenderId: personaId,
        name: personaId === 'LEN-VIKRAM-001' ? 'Vikram Sethi' : 'Retail Investor',
        role: 'lender'
      });
    } else if (role === 'institutional') {
      setAuthUser({
        id: 'NBFC-BAJAJ-01',
        name: 'Bajaj Finserv NBFC',
        role: 'institutional'
      });
    } else {
      setAuthUser({
        id: 'admin-ops',
        name: 'Risk Operations Admin',
        role: 'admin'
      });
    }
  };

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
    if (user.role === 'borrower') {
      setCurrentRole('borrower');
      if (user.borrowerId) setActiveBorrowerId(user.borrowerId);
    } else if (user.role === 'lender') {
      setCurrentRole('lender');
      if (user.lenderId) setActiveLenderId(user.lenderId);
    } else if (user.role === 'institutional') {
      setCurrentRole('institutional');
    } else if (user.role === 'admin') {
      setCurrentRole('admin');
    }
  };

  const handleLogout = () => {
    api.logout();
    setAuthUser(null);
  };

  return (
    <div className="min-h-screen transition-colors duration-200">
      <Routes>
        {/* 1. Public Landing Page */}
        <Route
          path="/"
          element={
            <LandingPage
              dark={dark}
              onToggleTheme={handleToggleTheme}
              currentRole={currentRole}
              activeId={currentRole === 'borrower' ? activeBorrowerId : activeLenderId}
              onSelectPersona={handleSelectPersona}
              authUser={authUser}
              onLogout={handleLogout}
            />
          }
        />

        {/* 2. Authentication & Registration Routes */}
        <Route
          path="/login"
          element={
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              dark={dark}
              onToggleTheme={handleToggleTheme}
            />
          }
        />
        <Route
          path="/register"
          element={
            <RegisterPage
              onRegisterSuccess={handleLoginSuccess}
              dark={dark}
              onToggleTheme={handleToggleTheme}
            />
          }
        />

        {/* 2. Borrower Portal */}
        <Route
          path="/borrower"
          element={
            <BorrowerPortalLayout
              activeBorrowerId={activeBorrowerId}
              currentRole={currentRole}
              onSelectPersona={handleSelectPersona}
              dark={dark}
              onToggleTheme={handleToggleTheme}
            />
          }
        >
          <Route index element={<Navigate to="/borrower/dashboard" replace />} />
          <Route path="dashboard" element={<BorrowerDashboard activeBorrowerId={activeBorrowerId} />} />
          <Route path="apply" element={<BorrowerWizard activeBorrowerId={activeBorrowerId} />} />
        </Route>

        {/* 3. Lender Portal */}
        <Route
          path="/lender"
          element={
            <LenderPortalLayout
              activeLenderId={activeLenderId}
              currentRole={currentRole}
              onSelectPersona={handleSelectPersona}
              dark={dark}
              onToggleTheme={handleToggleTheme}
            />
          }
        >
          <Route index element={<LenderDashboard activeLenderId={activeLenderId} />} />
          <Route
            path="onboard"
            element={
              <LenderOnboarding
                onOnboardSuccess={(l) => setActiveLenderId(l.lenderId)}
              />
            }
          />
        </Route>

        {/* 4. Admin / Risk Ops Portal */}
        <Route
          path="/admin"
          element={
            <AdminPortalLayout
              currentRole={currentRole}
              onSelectPersona={handleSelectPersona}
              dark={dark}
              onToggleTheme={handleToggleTheme}
            />
          }
        >
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* 5. Institutional / NBFC Co-Lending Portal */}
        <Route
          path="/institutional"
          element={
            <InstitutionalPortalLayout
              currentRole={currentRole}
              onSelectPersona={handleSelectPersona}
              dark={dark}
              onToggleTheme={handleToggleTheme}
            />
          }
        >
          <Route index element={<InstitutionalDashboard />} />
        </Route>

        {/* 6. Public Marketplace & Statutory Metrics */}
        <Route
          element={
            <MarketplaceLayout
              activeLenderId={activeLenderId}
              currentRole={currentRole}
              onSelectPersona={handleSelectPersona}
              dark={dark}
              onToggleTheme={handleToggleTheme}
            />
          }
        >
          <Route path="/marketplace" element={<Marketplace activeLenderId={activeLenderId} />} />
          <Route path="/sql-reports" element={<SqlReports />} />
          <Route path="/metrics" element={<PublicMetrics />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Interactive Simulation & Copilot Dock */}
      <aside 
        aria-label="Simulation & AI Copilot Controls"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none max-w-[calc(100vw-2rem)]"
      >
        {dockMinimized ? (
          <button
            type="button"
            onClick={() => setDockMinimized(false)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--gold)]/50 bg-[var(--card-bg)] text-[var(--fg)] shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer font-semibold text-xs"
            title="Expand Simulation & AI Copilot Lab"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Simulation Lab</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]/95 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.35)] transition-all">
            {/* Global Time Machine Simulation Controls */}
            <TimeMachineBar dark={dark} />

            {/* Live Fintech API & Webhook Simulator */}
            <ApiWebhookModal />

            {/* AI LLM Credit Copilot Assistant */}
            <CreditCopilotModal 
              activeBorrowerId={activeBorrowerId}
              activeLenderId={activeLenderId}
              currentRole={currentRole}
              authUser={authUser}
            />

            <div className="h-5 w-px bg-[var(--border)] mx-0.5" />

            {/* Universal Multi-Channel Notification Gateway Simulator */}
            <NotificationCenter dark={dark} />

            {/* Minimize Toggle */}
            <button
              type="button"
              onClick={() => setDockMinimized(true)}
              className="w-7 h-7 rounded-xl flex items-center justify-center text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[var(--muted-bg)] transition-colors cursor-pointer"
              title="Minimize Lab Bar"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
