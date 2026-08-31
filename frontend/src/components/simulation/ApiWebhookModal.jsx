import React, { useState, useEffect } from 'react';
import { 
  Zap, Smartphone, ShieldCheck, CheckCircle2, RefreshCw, X, 
  ArrowRight, FileCode, Check, AlertCircle, Radio, Database, Landmark 
} from 'lucide-react';
import { api } from '../../services/api';

export default function ApiWebhookModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('aa'); // 'aa' | 'enach' | 'webhooks'
  const [aaState, setAaState] = useState('IDLE'); // 'IDLE' | 'PENDING' | 'APPROVED'
  const [consentHandle, setConsentHandle] = useState('');
  const [enachMandate, setEnachMandate] = useState(null);
  const [sweepStatus, setSweepStatus] = useState(null);
  const [webhookEvents, setWebhookEvents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchWebhooks = async () => {
    try {
      const events = await api.getWebhookEvents();
      setWebhookEvents(events);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWebhooks();
      const interval = setInterval(fetchWebhooks, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleInitiateAAConsent = async () => {
    setIsProcessing(true);
    try {
      const res = await api.triggerAAConsent({
        borrowerId: 'BOR-PRIYA-001',
        customerVpa: 'priya@okhdfcbank',
        phone: '+91 98251 04928'
      });
      setConsentHandle(res.consentHandle);
      setAaState('PENDING');
      fetchWebhooks();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveAAConsent = async () => {
    setIsProcessing(true);
    try {
      await api.approveAAConsent({ consentHandle });
      setAaState('APPROVED');
      fetchWebhooks();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateEnach = async () => {
    setIsProcessing(true);
    try {
      const res = await api.createEnachMandate({
        borrowerId: 'BOR-PRIYA-001',
        accountNumber: '50100492810482',
        ifsc: 'HDFC0001234',
        maxAmount: 50000
      });
      setEnachMandate(res);
      fetchWebhooks();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateSweep = async (isSuccess) => {
    setIsProcessing(true);
    try {
      const res = await api.simulateNachSweep({
        loanId: 'LN-PRIYA-810',
        amount: 4479,
        isSuccess
      });
      setSweepStatus(isSuccess ? 'SUCCESS' : 'FAILED');
      fetchWebhooks();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-9 flex items-center gap-2 px-3 rounded-xl border transition-all hover:border-amber-500/50 active:scale-95 text-xs font-semibold cursor-pointer shrink-0"
        style={{
          backgroundColor: dark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
          borderColor: isOpen ? "rgb(245, 158, 11)" : dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
          color: dark ? "#FFFFFF" : "#181B18",
        }}
        title="Live Fintech APIs & Webhook Simulator"
      >
        <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        <span className="hidden sm:inline">Fintech APIs</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--fg)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted-bg)]/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--fg)]">Live Fintech API & Webhook Simulator</h3>
                  <p className="text-xs text-[var(--muted-fg)]">Simulate Account Aggregator (AA), NPCI e-NACH, and Escrow Sweeps</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--muted-bg)] text-[var(--muted-fg)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-3 border-b border-[var(--border)] bg-[var(--muted-bg)]/30 text-xs font-bold">
              <button
                onClick={() => setActiveTab('aa')}
                className={`py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'aa' ? 'border-b-2 border-[var(--gold)] text-[var(--gold-dark)] bg-[var(--card-bg)]' : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Account Aggregator (AA)</span>
              </button>
              <button
                onClick={() => setActiveTab('enach')}
                className={`py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'enach' ? 'border-b-2 border-[var(--gold)] text-[var(--gold-dark)] bg-[var(--card-bg)]' : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>NPCI e-NACH Mandates</span>
              </button>
              <button
                onClick={() => setActiveTab('webhooks')}
                className={`py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'webhooks' ? 'border-b-2 border-[var(--gold)] text-[var(--gold-dark)] bg-[var(--card-bg)]' : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>Live Webhook Feed ({webhookEvents.length})</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs custom-scrollbar">
              {/* TAB 1: Account Aggregator */}
              {activeTab === 'aa' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-[var(--muted-bg)] border border-[var(--border)] flex items-start gap-4">
                    <Database className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-[var(--fg)]">ReBIT Financial Information Provider (FIP) Integration</h4>
                      <p className="text-[var(--muted-fg)] leading-relaxed">
                        Under RBI Master Directions, PeerPulse ingests financial telemetry directly via certified Account Aggregators (Setu / OneMoney / Anumati) eliminating manual document tampering.
                      </p>
                    </div>
                  </div>

                  {aaState === 'IDLE' && (
                    <div className="p-6 rounded-2xl border border-dashed border-[var(--border)] text-center space-y-3">
                      <div className="text-sm font-bold text-[var(--fg)]">Ready to Request Financial Consent</div>
                      <p className="text-xs text-[var(--muted-fg)] max-w-md mx-auto">
                        Simulate sending an AA consent handle request to Priya Sharma's mobile phone (+91 98251 04928).
                      </p>
                      <button
                        onClick={handleInitiateAAConsent}
                        disabled={isProcessing}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isProcessing ? 'Generating Consent Handle...' : '1. Request ReBIT AA Consent'}
                      </button>
                    </div>
                  )}

                  {aaState === 'PENDING' && (
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                          <Radio className="w-4 h-4 animate-pulse" />
                          <span>Consent Handle: {consentHandle}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          Waiting for Mobile Approval
                        </span>
                      </div>

                      {/* Mock Mobile Screen Simulation */}
                      <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] space-y-3 shadow-xs">
                        <div className="text-[11px] font-mono text-[var(--muted-fg)] uppercase">Simulated Mobile Notification</div>
                        <div className="font-bold text-xs text-[var(--fg)]">
                          "PeerPulse is requesting 12 months of banking statements from HDFC Bank & ICICI Bank for MSME Underwriting."
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleApproveAAConsent}
                            disabled={isProcessing}
                            className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                          >
                            {isProcessing ? 'Processing Approval...' : 'Approve on Setu App'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {aaState === 'APPROVED' && (
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Consent Active — 28,683 ReBIT Bank Transactions Streamed!</span>
                      </div>
                      <p className="text-xs text-[var(--fg)]">
                        HDFC (XXXX-4819) & ICICI (XXXX-9022) are now continuously verified. Running balance continuity, overdraft headroom, and UPI graphs have updated in ACIE.
                      </p>
                      <button
                        onClick={() => setAaState('IDLE')}
                        className="px-4 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--fg)] text-xs font-semibold hover:bg-[var(--muted-bg)] cursor-pointer"
                      >
                        Reset Flow
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: NPCI e-NACH Mandates */}
              {activeTab === 'enach' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-[var(--muted-bg)] border border-[var(--border)] flex items-start gap-4">
                    <Landmark className="w-6 h-6 text-indigo-500 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-[var(--fg)]">Automated NPCI e-NACH Mandate & Sweeps</h4>
                      <p className="text-[var(--muted-fg)] leading-relaxed">
                        Borrowers sign a digitally authenticated e-NACH mandate via Aadhaar eSign or NetBanking. This authorizes automated pro-rata EMI sweeps directly into the IDFC First Escrow account.
                      </p>
                    </div>
                  </div>

                  {!enachMandate ? (
                    <div className="p-6 rounded-2xl border border-dashed border-[var(--border)] text-center space-y-3">
                      <div className="text-sm font-bold text-[var(--fg)]">Register NPCI Mandate for Priya Textiles</div>
                      <p className="text-xs text-[var(--muted-fg)] max-w-md mx-auto">
                        Generates an official NPCI Unique Mandate Reference Number (UMRN) capped at ₹50,000/month.
                      </p>
                      <button
                        onClick={handleCreateEnach}
                        disabled={isProcessing}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isProcessing ? 'Registering with NPCI...' : 'Register e-NACH Mandate'}
                      </button>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                        <div>
                          <span className="text-[10px] font-mono text-[var(--muted-fg)] uppercase">NPCI Mandate Reference</span>
                          <div className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">{enachMandate.umrn}</div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          {enachMandate.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div className="p-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)]">
                          <span className="text-[10px] text-[var(--muted-fg)] font-sans">Max Sweep Cap</span>
                          <div className="font-bold text-[var(--fg)]">₹{enachMandate.maxAmount.toLocaleString('en-IN')}/mo</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)]">
                          <span className="text-[10px] text-[var(--muted-fg)] font-sans">Bank IFSC</span>
                          <div className="font-bold text-[var(--fg)]">{enachMandate.ifsc}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-[var(--muted-fg)] font-sans">Trustee Escrow</span>
                          <div className="font-bold text-indigo-500 truncate">IDFC First Bank</div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-[var(--fg)]">Simulate Automated Monthly EMI Sweep:</span>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSimulateSweep(true)}
                            disabled={isProcessing}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                          >
                            Simulate Successful Sweep (₹4,479)
                          </button>
                          <button
                            onClick={() => handleSimulateSweep(false)}
                            disabled={isProcessing}
                            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                          >
                            Simulate Bounce (Insufficient Funds)
                          </button>
                        </div>
                      </div>

                      {sweepStatus && (
                        <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                          sweepStatus === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        }`}>
                          {sweepStatus === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                          <span>
                            {sweepStatus === 'SUCCESS'
                              ? 'Sweep successful! Funds credited to Trustee Escrow. Pro-rata shares auto-distributed to 4 retail lenders.'
                              : 'Sweep bounced! NACH Reason Code 02. Loan incremented by 1 DPD. Early Warning distress flag triggered.'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Webhook Feed */}
              {activeTab === 'webhooks' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--fg)]">Live Webhook Payloads & Event Stream</span>
                    <button
                      onClick={fetchWebhooks}
                      className="p-1 rounded hover:bg-[var(--muted-bg)] text-[var(--muted-fg)] hover:text-[var(--fg)] cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {webhookEvents.map((evt) => (
                      <div
                        key={evt.eventId}
                        className="p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--border)] space-y-2 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              {evt.provider}
                            </span>
                            <span className="font-bold text-[var(--fg)]">{evt.eventType}</span>
                          </div>
                          <span className="text-[10px] text-[var(--muted-fg)]">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <pre className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-[11px] overflow-x-auto text-[var(--fg)] custom-scrollbar">
                          {JSON.stringify(evt.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
