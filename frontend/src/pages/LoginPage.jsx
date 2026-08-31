import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, Smartphone, ArrowRight, Sparkles, Building, 
  Wallet, ShieldAlert, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, KeyRound
} from 'lucide-react';
import { api } from '../services/api';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function LoginPage({ onLoginSuccess, dark, onToggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'credentials'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password'
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const demoPersonas = [
    {
      id: 'BOR-PRIYA-001',
      role: 'borrower',
      name: 'Priya Sharma',
      org: 'Priya Textiles Surat',
      badge: 'MSME Borrower (Prime Grade A)',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: Building,
      details: 'Active Loan: ₹5,00,000 • Verified ReBIT Statements • Surat Silk Hub',
      targetPath: '/borrower/dashboard'
    },
    {
      id: 'LEN-VIKRAM-001',
      role: 'lender',
      name: 'Vikram Sethi',
      org: 'Retail Investor (Conservative)',
      badge: 'Retail Fractional Lender',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: Wallet,
      details: 'Wallet: ₹4,50,000 • Exposure: ₹50,000 • Strict ₹50K Hard Cap Compliance',
      targetPath: '/lender'
    },
    {
      id: 'NBFC-BAJAJ-01',
      role: 'institutional',
      name: 'Bajaj Finserv NBFC',
      org: 'Priority Sector Co-Lending Desk',
      badge: 'Institutional Anchor (80:20 Split)',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      icon: ShieldCheck,
      details: 'Facility: ₹5.0 Cr • Anchor Underwriting Pipeline • PSL Eligible',
      targetPath: '/institutional'
    },
    {
      id: 'admin-ops',
      role: 'admin',
      name: 'Risk Operations Admin',
      org: 'PeerPulse Underwriting & Ops',
      badge: 'Risk Officer (Full Permissions)',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      icon: ShieldAlert,
      details: 'ACIE Forensic Tamper Queue • EWS Radar • Recovery Kanban & OTS Approval',
      targetPath: '/admin'
    }
  ];

  const handlePersonaLogin = async (persona) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ personaId: persona.id });
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
      navigate(persona.targetPath);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your mobile number, email, or user ID.');
      return;
    }

    if (authMode === 'otp' && !otpSent) {
      setOtpSent(true);
      setOtp('123456'); // Pre-fill test OTP for sandbox ease
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.login({
        identifier: identifier.trim(),
        password: authMode === 'password' ? password : null,
        otp: authMode === 'otp' ? otp : null
      });

      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }

      // Redirect by role
      if (res.user.role === 'borrower') navigate('/borrower/dashboard');
      else if (res.user.role === 'lender') navigate('/lender');
      else if (res.user.role === 'institutional') navigate('/institutional');
      else navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col justify-between transition-colors">
      {/* Top Bar */}
      <header className="border-b border-[var(--border)] px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-serif text-sm font-bold bg-[var(--card-bg)] border border-[var(--border)] text-[var(--gold-dark)]">
            P.
          </div>
          <span className="text-xl font-bold font-serif tracking-tight">PeerPulse</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle dark={dark} onToggleTheme={onToggleTheme} />
          <Link
            to="/"
            className="text-xs font-semibold text-[var(--muted-fg)] hover:text-[var(--fg)] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Platform</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto px-4 py-8">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] shadow-xl p-6 sm:p-10 space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--gold)]/30 bg-[var(--muted-bg)] text-[var(--gold-dark)] text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Role-Based Access Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              Sign In to PeerPulse
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-fg)]">
              Select an instant verified demo persona or enter your credentials.
            </p>
          </div>

          {/* Segmented Mode Selector */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('demo');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'demo'
                  ? 'bg-[var(--card-bg)] text-[var(--fg)] shadow-sm font-bold border border-[var(--border)]'
                  : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
              }`}
            >
              ⚡ Instant 1-Click Demo Logins
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('credentials');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'credentials'
                  ? 'bg-[var(--card-bg)] text-[var(--fg)] shadow-sm font-bold border border-[var(--border)]'
                  : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
              }`}
            >
              📱 Mobile OTP / Credentials
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: 1-Click Demo Login */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--muted-fg)] font-mono">
                Click any persona card to authenticate instantly with verified credentials:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoPersonas.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePersonaLogin(p)}
                      disabled={loading}
                      className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--gold)]/60 hover:shadow-md transition-all text-left group flex flex-col justify-between space-y-2 cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center text-[var(--gold-dark)]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                          {p.role.toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-[var(--fg)] group-hover:text-[var(--gold-dark)] transition-colors">
                          {p.name}
                        </div>
                        <div className="text-xs text-[var(--muted-fg)]">{p.org}</div>
                      </div>

                      <div className="text-[11px] text-[var(--muted-fg)] pt-1 border-t border-[var(--border)] flex items-center justify-between font-mono">
                        <span className="truncate pr-2">{p.details}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--gold-dark)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Mobile OTP / Credentials */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--fg)] flex justify-between">
                  <span>Mobile Number or Email</span>
                  <span className="text-[10px] text-[var(--muted-fg)] font-mono">Try: +919820192831 (Priya) or admin</span>
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3.5 top-3 text-[var(--muted-fg)]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98201 92831 or admin"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="neu-input w-full pl-10 pr-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Mode switch */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[var(--muted-fg)]">Authentication Method:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('otp'); setOtpSent(false); }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      authMode === 'otp' ? 'bg-[var(--gold)] text-black font-bold' : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
                    }`}
                  >
                    SMS OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('password')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      authMode === 'password' ? 'bg-[var(--gold)] text-black font-bold' : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
                    }`}
                  >
                    Password
                  </button>
                </div>
              </div>

              {/* OTP Field */}
              {authMode === 'otp' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--fg)]">
                      6-Digit Security OTP
                    </label>
                    <span className="text-[10px] text-emerald-500 font-mono font-bold">
                      Sandbox Test Code: 123456
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-[var(--muted-fg)]" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="neu-input w-full pl-10 pr-24 py-2 text-xs font-mono tracking-widest text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setOtp('123456')}
                      className="absolute right-2 top-2 px-2 py-1 rounded bg-[var(--muted-bg)] text-[10px] font-bold text-[var(--gold-dark)] hover:bg-[var(--gold)]/10 cursor-pointer"
                    >
                      Autofill OTP
                    </button>
                  </div>
                </div>
              )}

              {/* Password Field */}
              {authMode === 'password' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--fg)]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[var(--muted-fg)]" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="neu-input w-full pl-10 pr-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                style={{
                  backgroundColor: dark ? "#C5A059" : "#1A211D",
                  color: dark ? "#0C0E11" : "#FFFFFF",
                }}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Footer: Register Link */}
          <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--muted-fg)]">
            <span>Don't have an account yet? </span>
            <Link
              to="/register"
              className="font-bold text-[var(--gold-dark)] hover:underline ml-1"
            >
              Create an Account (MSME or Investor)
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-[11px] text-[var(--muted-fg)] border-t border-[var(--border)]">
        PeerPulse P2P MSME Lending Platform · RBI-Regulated NBFC-P2P Architecture · 0% Platform DLG
      </footer>
    </div>
  );
}
