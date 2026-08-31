import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Wallet, ArrowRight, ArrowLeft, CheckCircle2, 
  PieChart, Building2, Clock, Check, TrendingUp, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function LenderOnboarding({ onOnboardSuccess }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Vikram Sethi',
    email: 'vikram.sethi@example.com',
    mobile: '+919811122233',
    riskAppetite: 'Conservative',
    sectorPreference: 'any',
    tenurePreference: [3, 6, 12],
    denominationPreference: 25000,
    walletTopUp: 500000
  });

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      const res = await api.onboardLender(formData);
      if (onOnboardSuccess) onOnboardSuccess(res);
      navigate('/lender');
    } catch (err) {
      alert('Onboarding failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Step Header */}
      <div className="text-center mb-8">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Retail Investor Onboarding
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-2">
          P2P Fractional Lending Account Setup
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          RBI Master Directions: Platform aggregate investment capped at ₹10,00,000.
        </p>

        {/* 4 Steps Indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40'
                  : step > s
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-500'
              }`}>
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              {s < 4 && <div className={`w-8 h-0.5 ${step > s ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Screen 1: Email & Mobile */}
      {step === 1 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-5 animate-in fade-in">
          <h3 className="font-bold text-base text-white">Step 1: Contact & KYC Verification</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Legal Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full neu-input px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full neu-input px-3.5 py-2.5 text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Mobile Phone (OTP Verified)</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full neu-input px-3.5 py-2.5 text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl btn-approve text-xs flex items-center gap-2"
            >
              <span>Next: Risk Appetite</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Screen 2: Risk Appetite (Exact Radio Cards) */}
      {step === 2 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-5 animate-in fade-in">
          <div>
            <h3 className="font-bold text-base text-white">Step 2: Risk Appetite Profile</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Matches you automatically with verified ACIE grade bands.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { type: 'Conservative', roi: '12% – 14.5% p.a.', desc: 'Exclusively Grade A (Prime) loans. High cash-flow discipline and verified collateral/GST records.', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-glow-green' },
              { type: 'Moderate', roi: '14.5% – 17% p.a.', desc: 'Grade A & Grade B (Standard) loans. Balanced yield with high stability.', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-glow-blue' },
              { type: 'Aggressive', roi: '17% – 21% p.a.', desc: 'Grade A, B, and Grade C (Subprime) tranches for maximum annualized portfolio yield.', color: 'border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-glow-yellow' }
            ].map((r) => (
              <div
                key={r.type}
                onClick={() => setFormData({ ...formData, riskAppetite: r.type })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                  formData.riskAppetite === r.type ? r.color : 'bg-slate-950/80 shadow-neu-inset border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{r.type}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 tabular-nums">{r.roi}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg">{r.desc}</p>
                </div>
                {formData.riskAppetite === r.type && <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />}
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl btn-approve text-xs flex items-center gap-2"
            >
              <span>Next: Sector & Tenure</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Screen 3: Sector & Tenure Preferences */}
      {step === 3 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-bold text-base text-white">Step 3: Sector & Tenure Preferences</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customizes auto-match filters for incoming MSME borrowing requests.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Preferred MSME Industry Sector</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'any', label: 'All Sectors' },
                  { id: 'manufacturing', label: 'Manufacturing' },
                  { id: 'retail', label: 'Retail Stores' },
                  { id: 'textile', label: 'Textiles' }
                ].map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, sectorPreference: sec.id })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      formData.sectorPreference === sec.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-glow-green'
                        : 'bg-slate-950/80 shadow-neu-inset border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Accepted Loan Tenures (Months)</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[3, 6, 9, 12, 24, 36].map((t) => {
                  const selected = formData.tenurePreference.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const updated = selected
                          ? formData.tenurePreference.filter(item => item !== t)
                          : [...formData.tenurePreference, t];
                        setFormData({ ...formData, tenurePreference: updated.length ? updated : [12] });
                      }}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        selected
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-glow-green'
                          : 'bg-slate-950/80 shadow-neu-inset border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {t}M
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl btn-approve text-xs flex items-center gap-2"
            >
              <span>Next: Denomination & Wallet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Screen 4: Denomination & Wallet Top-up */}
      {step === 4 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-bold text-base text-white">Step 4: Tranche Sizing & Wallet Funding</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              RBI Cap: Maximum ₹50,000 per borrower, ₹10,00,000 total platform exposure.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Default Tranche Denomination Preference</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[1000, 5000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFormData({ ...formData, denominationPreference: amt })}
                    className={`py-3 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                      formData.denominationPreference === amt
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-glow-green'
                        : 'bg-slate-950/80 shadow-neu-inset border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Initial Escrow Wallet Deposit (₹)</label>
              <input
                type="number"
                min="10000"
                max="1000000"
                step="50000"
                value={formData.walletTopUp}
                onChange={(e) => setFormData({ ...formData, walletTopUp: Number(e.target.value) })}
                className="w-full neu-input px-3.5 py-2.5 text-sm font-mono tabular-nums"
              />
              <span className="text-[11px] text-slate-500">Funds held in RBI-mandated Escrow account. Zero platform blending.</span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleCompleteOnboarding}
              disabled={loading}
              className="px-8 py-3 rounded-xl btn-approve text-xs flex items-center gap-2"
            >
              {loading ? 'Creating Portfolio...' : 'Complete Onboarding & Enter Dashboard'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
