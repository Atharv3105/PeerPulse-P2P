import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, ChevronDown, ShieldCheck, Building, Wallet, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';

export default function UserMenu({ authUser, onLogout, dark }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!authUser) return null;

  const handleSignOut = () => {
    api.logout();
    if (onLogout) onLogout();
    setOpen(false);
    navigate('/');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'borrower':
        return { label: 'MSME Borrower', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
      case 'lender':
        return { label: 'Retail Lender', color: 'bg-[var(--gold)]/10 text-[var(--gold-dark)] border-[var(--gold)]/20' };
      case 'institutional':
        return { label: 'Institutional NBFC', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'admin':
        return { label: 'Risk Ops Admin', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      default:
        return { label: 'Member', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'borrower': return '/borrower/dashboard';
      case 'lender': return '/lender';
      case 'institutional': return '/institutional';
      case 'admin': return '/admin';
      default: return '/';
    }
  };

  const badge = getRoleBadge(authUser.role);
  const initials = (authUser.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--muted-bg)] transition-all cursor-pointer shadow-sm text-left"
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-[var(--gold)] text-black font-mono">
          {initials}
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-bold text-[var(--fg)] leading-tight max-w-[120px] truncate">
            {authUser.name}
          </div>
          <div className="text-[10px] text-[var(--muted-fg)] leading-none truncate font-mono">
            {authUser.businessName || badge.label}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[var(--muted-fg)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-[var(--fg)]">
          {/* Header */}
          <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
            <div className="text-xs font-bold truncate">{authUser.name}</div>
            <div className="text-[11px] text-[var(--muted-fg)] truncate">{authUser.email || authUser.mobile || authUser.borrowerId || authUser.lenderId}</div>
            <div className="mt-1.5">
              <span className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-0.5">
            <Link
              to={getDashboardPath(authUser.role)}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--muted-bg)] transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[var(--gold-dark)]" />
              <span>My Dashboard</span>
            </Link>

            <Link
              to="/marketplace"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--muted-bg)] transition-colors"
            >
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span>Credit Marketplace</span>
            </Link>

            <div className="border-t border-[var(--border)] my-1" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
