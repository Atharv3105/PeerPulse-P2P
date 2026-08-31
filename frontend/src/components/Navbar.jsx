import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Shield, PieChart, Landmark, ShieldCheck, FileText, User } from 'lucide-react';
import PersonaSwitcher from './PersonaSwitcher';

export default function Navbar({ currentRole, activeId, onSelectPersona }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { path: '/marketplace', label: 'Marketplace', icon: Landmark },
    { path: '/borrower', label: 'Borrower Portal', icon: User },
    { path: '/lender', label: 'Lender Portal', icon: PieChart },
    { path: '/admin', label: 'Risk Ops', icon: Shield },
    { path: '/metrics', label: 'RBI Transparency', icon: Activity },
  ];

  const handleSelect = (role, id) => {
    onSelectPersona(role, id);
    if (role === 'borrower') navigate('/borrower');
    else if (role === 'lender') navigate('/lender');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <Link to="/marketplace" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-mono">PeerPulse</span>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">P2P v2.0</span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">"Credit where credit is actually due."</p>
            </div>
          </Link>

          {/* RBI Badge */}
          <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>RBI NBFC-P2P Compliant • Zero DLG</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path === '/borrower' && location.pathname.startsWith('/borrower'));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Persona Switcher & Controls */}
        <div className="flex items-center gap-3">
          <PersonaSwitcher
            currentRole={currentRole}
            activeId={activeId}
            onSelectPersona={handleSelect}
          />
        </div>

      </div>
    </header>
  );
}
