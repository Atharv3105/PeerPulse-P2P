import React, { useState } from 'react';
import { 
  CreditCard, ShieldCheck, CheckCircle2, ArrowRight, X, 
  Lock, RefreshCw, AlertTriangle, Landmark, Calendar 
} from 'lucide-react';

export default function NachMandateModal({ isOpen, onClose, loan, onMandateCreated }) {
  const [authMethod, setAuthMethod] = useState('NETBANKING'); // NETBANKING or DEBIT_CARD or UPI_AUTOPAY
  const [accountNumber, setAccountNumber] = useState('50100492819283');
  const [ifsc, setIfsc] = useState('HDFC0000240');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const emiAmount = loan?.emiAmount || Math.round((loan?.loanAmount || 500000) / (loan?.tenure || 12) * 1.14);
  const maxDebitAmount = emiAmount * 2; // Standard NPCI mandate buffer

  const handleRegisterMandate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onMandateCreated?.({
          umrn: `NPCI-NACH-MND-${Date.now()}`,
          authMethod,
          accountNumber,
          ifsc,
          maxAmount: maxDebitAmount,
          registeredAt: new Date().toISOString()
        });
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-strong)] rounded-3xl shadow-2xl overflow-hidden text-[var(--fg)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted-bg)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              e-NACH
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[var(--fg)]">
                NPCI / Razorpay AutoPay Mandate
              </h3>
              <p className="text-[10px] text-[var(--muted-fg)]">Automated Monthly EMI Debit Setup</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--card-bg)] text-[var(--muted-fg)] hover:text-[var(--fg)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {!isSuccess ? (
            <>
              <div className="space-y-1">
                <h4 className="text-base font-bold font-serif">Setup Auto-Debit for Monthly Repayments</h4>
                <p className="text-xs text-[var(--muted-fg)]">
                  Under RBI Master Directions, fractional P2P loan disbursements require an active NPCI e-Mandate or UPI AutoPay for pro-rata recovery.
                </p>
              </div>

              {/* Mandate Details Card */}
              <div className="p-4 rounded-2xl bg-[var(--muted-bg)] border border-[var(--border)] space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-fg)] font-sans">Monthly EMI:</span>
                  <span className="font-bold text-[var(--fg)]">₹{emiAmount.toLocaleString('en-IN')} / mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-fg)] font-sans">Mandate Cap (NPCI Limit):</span>
                  <span className="font-bold text-[var(--fg)]">₹{maxDebitAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-fg)] font-sans">Debit Schedule:</span>
                  <span className="text-emerald-500 font-bold">5th of Every Month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-fg)] font-sans">Default Retry Schedule:</span>
                  <span className="text-[var(--muted-fg)]">Days +3, +7, +15, +25</span>
                </div>
              </div>

              {/* Authentication Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-fg)]">
                  Mandate Authorization Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'NETBANKING', label: 'NetBanking', icon: Landmark },
                    { id: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard },
                    { id: 'UPI_AUTOPAY', label: 'UPI AutoPay', icon: ShieldCheck },
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = authMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setAuthMethod(m.id)}
                        className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 text-xs transition-all ${
                          active
                            ? 'border-[var(--gold)] bg-[var(--muted-bg)] font-bold shadow-sm'
                            : 'border-[var(--border)] text-[var(--muted-fg)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#C5A059]" />
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bank Account Fields */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[var(--muted-fg)]">Bank A/C Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="neu-input w-full px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[var(--muted-fg)]">IFSC Code</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    className="neu-input w-full px-3 py-2 text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRegisterMandate}
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#1A211D] dark:bg-[var(--gold)] dark:text-black shadow-md flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer pt-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Registering with NPCI Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Sign & Authorize e-Mandate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold font-serif text-[var(--fg)]">e-NACH Mandate Active</h4>
              <p className="text-xs text-[var(--muted-fg)] max-w-xs mx-auto">
                UMRN generated. Automated monthly EMI debit is configured and protected under RBI Fair Practices Code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
