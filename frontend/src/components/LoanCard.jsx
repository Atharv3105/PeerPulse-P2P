import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, Clock, Users, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function LoanCard({ loan, activeLenderId, onFundSuccess }) {
  const [isFunding, setIsFunding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTranche, setSelectedTranche] = useState(25000);
  const [errorMsg, setErrorMsg] = useState(null);

  const grade = loan.grade || loan.acieScore?.grade || 'B';
  const score = loan.score || loan.acieScore?.total || 700;
  const fundingPercent = loan.fundingPercent !== undefined ? loan.fundingPercent : Math.round((loan.fundedAmount / loan.targetAmount) * 100);

  const getGradeStyle = () => {
    switch (grade) {
      case 'A': return { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40', cardGlow: 'hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)] hover:border-emerald-500/40', label: 'Prime' };
      case 'B': return { badge: 'bg-blue-500/15 text-blue-400 border-blue-500/40', cardGlow: 'hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)] hover:border-blue-500/40', label: 'Standard' };
      case 'C': return { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40', cardGlow: 'hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)] hover:border-amber-500/40', label: 'Subprime' };
      default: return { badge: 'bg-rose-500/15 text-rose-400 border-rose-500/40', cardGlow: 'hover:shadow-[0_0_25px_-5px_rgba(239,68,68,0.3)] hover:border-rose-500/40', label: 'Declined' };
    }
  };

  const style = getGradeStyle();

  const handleFund = async () => {
    if (!activeLenderId) {
      setErrorMsg('Please select a lender persona from the top navbar first.');
      return;
    }
    setIsFunding(true);
    setErrorMsg(null);
    try {
      const res = await api.fundTranche({
        lenderId: activeLenderId,
        applicationId: loan.applicationId,
        amount: selectedTranche
      });
      setShowModal(false);
      if (onFundSuccess) onFundSuccess(res);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between group bg-[var(--card-bg)] border-[var(--border)] hover:border-[var(--gold)] hover:shadow-md">
        <div>
          {/* Header: Grade & Sector */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${style.badge}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                Grade {grade} • {score}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--muted-bg)] text-[var(--muted-fg)] border border-[var(--border)] uppercase tracking-wider">
                {loan.sector || loan.businessCategory || 'MSME'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-emerald-500 font-mono font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="tabular-nums">{loan.interestRate || loan.roi || 14.5}% p.a.</span>
            </div>
          </div>

          {/* Business & Purpose */}
          <div className="mb-4">
            <h3 className="font-bold font-serif text-base text-[var(--fg)] group-hover:text-[var(--gold-dark)] transition-colors">
              {loan.businessName || 'MSME Business'}
            </h3>
            <p className="text-xs text-[var(--muted-fg)] line-clamp-2 mt-1">
              {loan.purpose || 'Working capital and raw material procurement.'}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] text-xs mb-4">
            <div>
              <span className="text-[var(--muted-fg)] text-[11px]">Loan Target</span>
              <div className="font-bold font-mono tabular-nums text-[var(--fg)] text-sm">₹{(loan.loanAmount || loan.targetAmount || 500000).toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-[var(--muted-fg)] text-[11px]">Tenure</span>
              <div className="font-bold font-mono tabular-nums text-[var(--fg)] flex items-center gap-1 text-sm">
                <Clock className="w-3.5 h-3.5 text-[var(--muted-fg)]" />
                {loan.tenure || 12} Months
              </div>
            </div>
          </div>

          {/* Fraud / Caution Indicators */}
          {(loan.fraudRiskFlag === 'Caution' || (loan.fraudFlags && loan.fraudFlags.length > 0)) && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs flex items-start gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <div className="line-clamp-2 text-[11px]">
                {loan.fraudFlags?.[0] || 'Caution Flag: Mismatch detected in cashflow reconciliation.'}
              </div>
            </div>
          )}

          {/* Explainability Highlight */}
          {loan.positiveFactors && loan.positiveFactors.length > 0 && (
            <div className="text-[11px] text-[var(--muted-fg)] flex items-center gap-1.5 mb-4">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{loan.positiveFactors[0]}</span>
            </div>
          )}
        </div>

        {/* Footer: Funding Progress & CTA Button */}
        <div>
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--muted-fg)]">
                ₹{(loan.fundedAmount || 0).toLocaleString('en-IN')} <span className="text-[10px]">({fundingPercent}%)</span>
              </span>
              <span className="text-[var(--muted-fg)] flex items-center gap-1 text-[11px]">
                <Users className="w-3.5 h-3.5" />
                {loan.lenderCount || 0} Tranches
              </span>
            </div>
            <div className="w-full bg-[var(--muted-bg)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(fundingPercent, 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            disabled={fundingPercent >= 100}
            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: fundingPercent >= 100 ? "var(--muted-bg)" : "var(--btn-primary-bg)",
              color: fundingPercent >= 100 ? "var(--muted-fg)" : "var(--btn-primary-fg)",
            }}
          >
            <span>{fundingPercent >= 100 ? 'Fully Funded' : 'Fund ₹25K Tranche'}</span>
            {fundingPercent < 100 && <ArrowUpRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Fund Tranche Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] text-[var(--fg)] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h4 className="font-bold text-[var(--fg)] text-base">Fund Fractional Tranche</h4>
                <p className="text-xs text-[var(--muted-fg)]">Application: {loan.applicationId}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
                Grade {grade}
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-semibold text-[var(--fg)]">Select Tranche Size (RBI Cap: ₹50K per borrower)</label>
              <div className="grid grid-cols-3 gap-2">
                {[5000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSelectedTranche(amt)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedTranche === amt
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'bg-[var(--muted-bg)] border-[var(--border)] text-[var(--fg)] hover:border-[var(--gold)]'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] text-xs space-y-2 font-mono">
              <div className="flex justify-between text-[var(--muted-fg)] font-sans">
                <span>Expected Annual Return:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{loan.interestRate || loan.roi || 14.5}% p.a.</span>
              </div>
              <div className="flex justify-between text-[var(--muted-fg)] font-sans">
                <span>Monthly Pro-Rata Share:</span>
                <span className="text-[var(--fg)] font-bold tabular-nums">₹{Math.round((selectedTranche * (loan.interestRate || 14.5) / 100 / 12) + (selectedTranche / (loan.tenure || 12))).toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="flex justify-between text-[var(--muted-fg)] font-sans text-[11px] pt-1.5 border-t border-[var(--border)]">
                <span>DLG Protection:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">0% (RBI Master Directions)</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--border)] text-[var(--fg)] text-xs font-semibold transition-all cursor-pointer border border-[var(--border)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFund}
                disabled={isFunding}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isFunding ? 'Executing Escrow...' : `Confirm ₹${selectedTranche.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
