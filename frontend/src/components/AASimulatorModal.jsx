import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, CheckCircle2, ArrowRight, X, 
  Lock, RefreshCw, KeyRound, Smartphone, AlertCircle 
} from 'lucide-react';

export default function AASimulatorModal({ isOpen, onClose, onConsentApproved }) {
  const [step, setStep] = useState(1); // 1: Bank Selection, 2: OTP, 3: Success
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const banks = [
    { id: 'HDFC', name: 'HDFC Bank', fip: 'FIP-HDFC-01', logo: '🏦' },
    { id: 'SBI', name: 'State Bank of India', fip: 'FIP-SBI-01', logo: '🏛️' },
    { id: 'ICICI', name: 'ICICI Bank', fip: 'FIP-ICICI-01', logo: '🏢' },
    { id: 'KOTAK', name: 'Kotak Mahindra Bank', fip: 'FIP-KOTAK-01', logo: '💳' },
  ];

  const handleSendOtp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setOtp('123456'); // Pre-fill test OTP for evaluator convenience
    }, 600);
  };

  const handleVerifyOtp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      setTimeout(() => {
        onConsentApproved?.({
          bank: selectedBank,
          fipId: banks.find(b => b.id === selectedBank)?.fip,
          consentHandle: `SETU-AA-${Date.now()}`,
          verifiedAt: new Date().toISOString()
        });
        onClose();
        setStep(1);
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-strong)] rounded-3xl shadow-2xl overflow-hidden text-[var(--fg)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted-bg)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              AA
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[var(--fg)]">
                RBI Account Aggregator Simulator
              </h3>
              <p className="text-[10px] text-[var(--muted-fg)]">Powered by ReBIT Open Banking Standards</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--card-bg)] text-[var(--muted-fg)] hover:text-[var(--fg)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold font-serif">Select Your Business Bank</h4>
                <p className="text-xs text-[var(--muted-fg)]">
                  Connect your verified statement directly from your bank with zero manual uploads or PDF editing risks.
                </p>
              </div>

              {/* Bank Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {banks.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBank(b.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedBank === b.id
                        ? 'border-[var(--gold)] bg-[var(--muted-bg)] shadow-sm'
                        : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <span className="text-xl">{b.logo}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--fg)] truncate">{b.name}</p>
                      <p className="text-[10px] font-mono text-[var(--muted-fg)]">{b.fip}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-fg)]">
                  Mobile Linked to Bank Account
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[var(--muted-fg)] font-mono">+91</span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="neu-input w-full pl-11 pr-3 py-2 text-xs font-mono"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {/* Consent Scope Disclosures */}
              <div className="p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] text-[11px] space-y-1 text-[var(--muted-fg)]">
                <div className="flex items-center gap-1.5 text-[var(--fg)] font-semibold">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>RBI End-to-End Encrypted Consent Scope</span>
                </div>
                <p>• Data: 12-Month Deposit Statement & Transaction History</p>
                <p>• Purpose: MSME Working Capital Credit Underwriting</p>
                <p>• Validity: Single-use one-time pull (No recurring fetch)</p>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#1A211D] dark:bg-[var(--gold)] dark:text-black shadow-md flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Requesting OTP from Bank...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate with Bank OTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold font-serif">Enter Bank Authorization OTP</h4>
                <p className="text-xs text-[var(--muted-fg)]">
                  Sent by <strong>{selectedBank} Bank</strong> to mobile ending in ••••{phone.slice(-4)}.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                <KeyRound className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Simulated Sandbox Test OTP: <strong className="font-mono">123456</strong></span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-fg)]">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="neu-input w-full px-4 py-2.5 text-center text-lg font-mono tracking-widest"
                  placeholder="123456"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-[var(--border-strong)] text-[var(--fg)] hover:bg-[var(--muted-bg)]"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length < 6}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1A211D] dark:bg-[var(--gold)] dark:text-black shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching Statement...</span>
                    </>
                  ) : (
                    <>
                      <span>Approve & Fetch Data</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold font-serif text-[var(--fg)]">Statement Successfully Ingested</h4>
              <p className="text-xs text-[var(--muted-fg)] max-w-xs mx-auto">
                ReBIT XML/JSON financial statement received directly from {selectedBank} Bank. Form populated automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
