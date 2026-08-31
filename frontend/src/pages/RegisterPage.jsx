import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building, Wallet, ArrowRight, ArrowLeft, Sparkles, 
  ShieldCheck, CheckCircle2, AlertCircle, FileText, Landmark
} from 'lucide-react';
import { api } from '../services/api';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function RegisterPage({ onRegisterSuccess, dark, onToggleTheme }) {
  const navigate = useNavigate();
  const [role, setRole] = useState('borrower'); // 'borrower' | 'lender'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Borrower Form State
  const [borrowerForm, setBorrowerForm] = useState({
    name: '',
    businessName: '',
    businessCategory: 'manufacturing',
    mobile: '',
    gstNumber: '27AABC' + Math.floor(1000 + Math.random() * 9000) + 'K1Z5',
    udyamNumber: 'UDYAM-MH-01-' + Math.floor(100000 + Math.random() * 900000)
  });

  // Lender Form State
  const [lenderForm, setLenderForm] = useState({
    name: '',
    email: '',
    mobile: '',
    riskAppetite: 'Moderate',
    initialDeposit: '200000',
    capConsent: true
  });

  const handleBorrowerSubmit = async (e) => {
    e.preventDefault();
    if (!borrowerForm.name || !borrowerForm.businessName || !borrowerForm.mobile) {
      setError('Please fill in all mandatory business fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.registerBorrower(borrowerForm);
      if (onRegisterSuccess) {
        onRegisterSuccess(res.user);
      }
      navigate('/borrower/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLenderSubmit = async (e) => {
    e.preventDefault();
    if (!lenderForm.name || !lenderForm.email || !lenderForm.mobile) {
      setError('Please fill in all mandatory investor fields.');
      return;
    }
    if (!lenderForm.capConsent) {
      setError('You must acknowledge the RBI ₹10 Lakh aggregate exposure limit to proceed.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.registerLender(lenderForm);
      if (onRegisterSuccess) {
        onRegisterSuccess(res.user);
      }
      navigate('/lender');
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

      {/* Main Form Container */}
      <main className="max-w-2xl w-full mx-auto px-4 py-8">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] shadow-xl p-6 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--gold)]/30 bg-[var(--muted-bg)] text-[var(--gold-dark)] text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Account Creation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              Join PeerPulse
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-fg)]">
              Choose your profile to access underwritten MSME credit or earn fractional yields.
            </p>
          </div>

          {/* Role Choice Cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setRole('borrower'); setError(null); }}
              className={`p-4 rounded-2xl border transition-all text-left flex items-start gap-3 cursor-pointer ${
                role === 'borrower'
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                  : 'border-[var(--border)] bg-[var(--bg)] hover:border-[var(--border)]/80'
              }`}
            >
              <div className={`p-2 rounded-xl ${role === 'borrower' ? 'bg-emerald-500 text-white' : 'bg-[var(--card-bg)] border border-[var(--border)] text-[var(--muted-fg)]'}`}>
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm">MSME Borrower</div>
                <div className="text-[11px] text-[var(--muted-fg)] leading-snug">Raise ₹1L–₹50L Working Capital</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setRole('lender'); setError(null); }}
              className={`p-4 rounded-2xl border transition-all text-left flex items-start gap-3 cursor-pointer ${
                role === 'lender'
                  ? 'border-[var(--gold)] bg-[var(--gold)]/10 shadow-sm'
                  : 'border-[var(--border)] bg-[var(--bg)] hover:border-[var(--border)]/80'
              }`}
            >
              <div className={`p-2 rounded-xl ${role === 'lender' ? 'bg-[var(--gold)] text-black' : 'bg-[var(--card-bg)] border border-[var(--border)] text-[var(--muted-fg)]'}`}>
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm">Retail Investor</div>
                <div className="text-[11px] text-[var(--muted-fg)] leading-snug">Co-Lend with ₹50K Hard Caps</div>
              </div>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Borrower Registration Form */}
          {role === 'borrower' && (
            <form onSubmit={handleBorrowerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--fg)]">
                    Authorized Signatory Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil Agarwal"
                    value={borrowerForm.name}
                    onChange={(e) => setBorrowerForm({ ...borrowerForm, name: e.target.value })}
                    className="neu-input w-full px-3 py-2 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--fg)]">
                    Registered Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Agarwal Precision Components"
                    value={borrowerForm.businessName}
                    onChange={(e) => setBorrowerForm({ ...borrowerForm, businessName: e.target.value })}
                    className="neu-input w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--fg)]">
                    Primary Business Sector
                  </label>
                  <select
                    value={borrowerForm.businessCategory}
                    onChange={(e) => setBorrowerForm({ ...borrowerForm, businessCategory: e.target.value })}
                    className="neu-input w-full px-3 py-2 text-xs cursor-pointer"
                  >
                    <option value="manufacturing">Precision Manufacturing & Tooling</option>
                    <option value="textile">Textiles & Garment Exports</option>
                    <option value="retail">General Provision & Retail</option>
                    <option value="auto_ancillary">Automotive Ancillaries</option>
                    <option value="pharma_distribution">Pharma Bulk Distribution</option>
                    <option value="fmcg_wholesale">FMCG Wholesale & Trade</option>
                    <option value="services">Freight & Logistics Services</option>
                    <option value="food_processing">Food Processing & Packaging</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--fg)]">
                    Business Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98111 22233"
                    value={borrowerForm.mobile}
                    onChange={(e) => setBorrowerForm({ ...borrowerForm, mobile: e.target.value })}
                    className="neu-input w-full px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--fg)]">
                    GSTIN (Goods & Services Tax ID)
                  </label>
                  <input
                    type="text"
                    value={borrowerForm.gstNumber}
                    onChange={(e) => setBorrowerForm({ ...borrowerForm, gstNumber: e.target.value.toUpperCase() })}
                    className="neu-input w-full px-3 py-2 text-xs font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--fg)]">
                    Udyam Registration Number
                  </label>
                  <input
                    type="text"
                    value={borrowerForm.udyamNumber}
                    onChange={(e) => setBorrowerForm({ ...borrowerForm, udyamNumber: e.target.value.toUpperCase() })}
                    className="neu-input w-full px-3 py-2 text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] text-xs text-[var(--muted-fg)] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[var(--fg)]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Automated ACIE Underwriting Ingestion</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Upon registration, you will be onboarded with a default 85 Trust Score, and can immediately simulate Account Aggregator bank ingestion or upload statements for automated credit scoring.
                </p>
              </div>

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
                  <span>Registering MSME...</span>
                ) : (
                  <>
                    <span>Complete Registration & Open Borrower Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Lender Registration Form */}
          {role === 'lender' && (
            <form onSubmit={handleLenderSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--fg)]">
                    Investor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Khurana"
                    value={lenderForm.name}
                    onChange={(e) => setLenderForm({ ...lenderForm, name: e.target.value })}
                    className="neu-input w-full px-3 py-2 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--fg)]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@investor.in"
                    value={lenderForm.email}
                    onChange={(e) => setLenderForm({ ...lenderForm, email: e.target.value })}
                    className="neu-input w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--fg)]">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98222 33344"
                    value={lenderForm.mobile}
                    onChange={(e) => setLenderForm({ ...lenderForm, mobile: e.target.value })}
                    className="neu-input w-full px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--fg)]">
                    Risk Appetite Profile
                  </label>
                  <select
                    value={lenderForm.riskAppetite}
                    onChange={(e) => setLenderForm({ ...lenderForm, riskAppetite: e.target.value })}
                    className="neu-input w-full px-3 py-2 text-xs cursor-pointer"
                  >
                    <option value="Conservative">Conservative (Grade A Prime Only · 12-14% yield)</option>
                    <option value="Moderate">Moderate (Grade A & B · 14-16% yield)</option>
                    <option value="Aggressive">Aggressive (Grade A, B, & C · Up to 20% yield)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--fg)] flex justify-between">
                  <span>Initial Sandbox Wallet Balance</span>
                  <span className="text-[10px] text-[var(--gold-dark)] font-mono font-bold">Max ₹10,00,000 (RBI Cap)</span>
                </label>
                <select
                  value={lenderForm.initialDeposit}
                  onChange={(e) => setLenderForm({ ...lenderForm, initialDeposit: e.target.value })}
                  className="neu-input w-full px-3 py-2 text-xs cursor-pointer"
                >
                  <option value="100000">₹1,00,000 (Sandbox Wallet)</option>
                  <option value="250000">₹2,50,000 (Sandbox Wallet)</option>
                  <option value="500000">₹5,00,000 (Sandbox Wallet)</option>
                  <option value="750000">₹7,50,000 (Sandbox Wallet)</option>
                  <option value="1000000">₹10,00,000 (Full RBI Individual Cap)</option>
                </select>
              </div>

              {/* RBI Cap Consent Checkbox */}
              <label className="flex items-start gap-2.5 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={lenderForm.capConsent}
                  onChange={(e) => setLenderForm({ ...lenderForm, capConsent: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-[var(--gold)] focus:ring-[var(--gold)] cursor-pointer"
                />
                <span className="text-xs text-[var(--muted-fg)] leading-relaxed">
                  I understand and agree to the <strong>RBI Master Directions (2017/2023)</strong> for P2P Lending:
                  single-borrower investment is strictly capped at <strong>₹50,000</strong>, total platform exposure cannot exceed <strong>₹10,00,000</strong>, and PeerPulse maintains <strong>0% Default Loss Guarantee</strong>.
                </span>
              </label>

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
                  <span>Onboarding Investor...</span>
                ) : (
                  <>
                    <span>Create Investor Account & Enter Marketplace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Already have an account */}
          <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--muted-fg)]">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-bold text-[var(--gold-dark)] hover:underline ml-1"
            >
              Sign In Here
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
