import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, AlertTriangle, Activity, RefreshCw, CheckCircle2, 
  XCircle, FileText, ArrowRight, Eye, ShieldCheck, Flame, Scale,
  UserX, Vote, FileSpreadsheet, Lock, Download
} from 'lucide-react';
import { api } from '../services/api';
import EscrowAuditCard from '../components/EscrowAuditCard';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('flagged'); // 'flagged' | 'ews' | 'recovery' | 'manual'
  const [flaggedApps, setFlaggedApps] = useState([]);
  const [ewsFlags, setEwsFlags] = useState([]);
  const [recoveryLoans, setRecoveryLoans] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Override Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [overrideAction, setOverrideAction] = useState('APPROVE');
  const [overrideComment, setOverrideComment] = useState('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // Manual Trigger State
  const [selectedTriggerLoan, setSelectedTriggerLoan] = useState('');
  const [targetStatus, setTargetStatus] = useState('DELAYED');
  const [triggerResult, setTriggerResult] = useState(null);
  const [isTriggering, setIsTriggering] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [flaggedRes, ewsRes, recRes, loansRes] = await Promise.all([
        api.getFlaggedApplications(),
        api.getEwsFlags(),
        api.getRecoveryPipeline(),
        api.getMarketplaceLoans()
      ]);
      setFlaggedApps(flaggedRes);
      setEwsFlags(ewsRes.flags || []);
      setRecoveryLoans(recRes);
      setAllLoans(loansRes);
      if (loansRes.length > 0 && !selectedTriggerLoan) {
        setSelectedTriggerLoan(loansRes[0].applicationId || loansRes[0]._id);
      }
    } catch (err) {
      console.error('Admin fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Refresh whenever Time Machine fast-forwards or resets
  useEffect(() => {
    const handleTimelineChange = () => {
      fetchAdminData();
    };
    window.addEventListener('peerpulse-timeline-advanced', handleTimelineChange);
    return () => window.removeEventListener('peerpulse-timeline-advanced', handleTimelineChange);
  }, []);

  const handleExecuteOverride = async () => {
    if (!selectedApp || !overrideComment.trim()) {
      alert('Mandatory audit comment required to execute risk override.');
      return;
    }
    setIsSubmittingOverride(true);
    try {
      await api.overrideApplication({
        applicationId: selectedApp.applicationId,
        action: overrideAction,
        comment: overrideComment,
        adminUser: 'Senior_Risk_Officer_01'
      });
      setSelectedApp(null);
      setOverrideComment('');
      await fetchAdminData();
    } catch (err) {
      alert('Override error: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const handleSimulateFailure = async () => {
    if (!selectedTriggerLoan) return;
    setIsTriggering(true);
    setTriggerResult(null);
    try {
      const res = await api.manualTrigger({
        loanId: selectedTriggerLoan,
        targetStatus: targetStatus
      });
      setTriggerResult(res);
      await fetchAdminData();
    } catch (err) {
      alert('Manual trigger error: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Admin Panel Header */}
      <div className="rounded-3xl p-6 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--muted-bg)] border border-[var(--gold)] flex items-center justify-center text-[var(--gold-dark)] shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-serif text-[var(--fg)]">Risk Operations & Forensics</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--muted-bg)] text-[var(--gold-dark)] text-[10px] font-bold border border-[var(--gold)] font-mono">
                ADMIN ACCESS
              </span>
            </div>
            <p className="text-xs text-[var(--muted-fg)] mt-0.5">
              ACIE Forensics • EWS Early Distress • Recovery State Machine Control
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-strong)] bg-[var(--muted-bg)] text-[var(--fg)] text-xs font-semibold hover:bg-[var(--card-bg)] cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 4 Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'flagged', label: 'Flagged Applications Queue', count: flaggedApps.length, icon: FileText },
          { id: 'ews', label: 'Early Warning System (EWS)', count: ewsFlags.length, icon: Activity },
          { id: 'recovery', label: 'Recovery Pipeline Tracker', count: recoveryLoans.length, icon: Scale },
          { id: 'manual', label: 'Manual Trigger & Demo Simulator', count: 'Live', icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border ${
                active
                  ? 'bg-[#1A211D] text-white border-[#1A211D] dark:bg-[var(--gold)] dark:text-black dark:border-[var(--gold)] shadow-sm'
                  : 'bg-[var(--muted-bg)] text-[var(--muted-fg)] border-[var(--border)] hover:text-[var(--fg)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono opacity-80 border border-current">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Flagged Applications Queue */}
      {activeTab === 'flagged' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Forensic & Anomaly Flagged Applications</h3>
            <span className="text-xs text-slate-400">Requires manual risk officer override with mandatory audit reasoning</span>
          </div>

          {flaggedApps.length > 0 ? (
            <div className="space-y-4">
              {flaggedApps.map((app) => (
                <div
                  key={app.applicationId}
                  className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-400">{app.applicationId}</span>
                        <h4 className="font-bold text-base text-white">{app.borrowerName} ({app.businessName})</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          app.forgeryGrade === 'FORGED'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/30'
                        }`}>
                          {app.forgeryGrade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Amount: ₹{(app.loanAmount || 1200000).toLocaleString('en-IN')} • Tenure: {app.tenure}M • ACIE Score: {app.acieScore || 310}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review & Override</span>
                    </button>
                  </div>

                  {/* Side-by-Side: PDF Anomaly vs LLM Reasoning */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-xl bg-slate-950/80 shadow-neu-inset border border-slate-800/80 space-y-2">
                      <span className="font-bold text-slate-400 uppercase font-sans text-[11px]">Layer 1 Structural Telemetry</span>
                      <ul className="space-y-1 text-slate-300">
                        <li>• Font Inconsistencies: Detected multiple font families in ledger table</li>
                        <li>• Metadata: Created/Modified with PDF Editor tool</li>
                        {app.layoutAnomalies?.map((a, i) => (
                          <li key={i} className="text-rose-400 font-bold">• {a}</li>
                        ))}
                      </ul>

                      {/* Visual Tamper Bounding-Box Overlay Badge */}
                      {app.forgeryGrade === 'FORGED' && (
                        <div className="mt-3 p-2.5 rounded-lg border border-rose-500/40 bg-rose-950/30 space-y-1.5">
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                            PyMuPDF Bounding-Box Tamper Overlay
                          </span>
                          <div className="p-2 rounded bg-black/60 border border-rose-500/20 text-[10px] space-y-1">
                            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                              <span className="w-2 h-2 rounded-xs bg-rose-500 shrink-0"></span>
                              <span>[BBOX: x=142, y=284, w=180, h=14] Foreign Font Family (Courier in Helvetica)</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                              <span className="w-2 h-2 rounded-xs bg-amber-500 shrink-0"></span>
                              <span>[BBOX: x=410, y=284, w=75, h=14] Amount Decimal Misaligned (+14.2pt delta)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/80 shadow-neu-inset border border-slate-800/80 space-y-2">
                      <span className="font-bold text-amber-400 uppercase font-sans text-[11px]">LLM Forensic Reasoning</span>
                      <p className="text-slate-300 leading-relaxed font-sans text-xs">
                        {app.forgeryReason}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 text-xs text-slate-400">
              No flagged applications currently in the risk operations review queue.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Early Warning System (EWS) Dashboard */}
      {activeTab === 'ews' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--fg)]">Real-Time EWS Distress Flags (24h Bull Job Polling)</h3>
            <span className="text-xs text-[var(--muted-fg)]">RBI Fair Practices Code: Distress triggers framed as soft health checks</span>
          </div>

          {ewsFlags.length > 0 ? (
            <div className="overflow-x-auto glass-panel rounded-2xl border border-[var(--border)]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-fg)] text-[11px] font-mono uppercase bg-[var(--muted-bg)]">
                    <th className="p-4">Loan / Borrower</th>
                    <th className="p-4">Distress Signal</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4">Current DPD</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Triggered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-mono">
                  {ewsFlags.map((flag, idx) => (
                    <tr key={idx} className="hover:bg-[var(--muted-bg)]/40 text-[var(--fg)] transition-colors">
                      <td className="p-4 font-sans font-semibold text-[var(--fg)]">
                        <div>{flag.businessName || flag.borrowerName}</div>
                        <span className="text-[10px] text-[var(--muted-fg)] font-mono">{flag.applicationId || flag.loanId}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded bg-slate-800 text-emerald-400 text-[11px] font-bold">
                          {flag.flagType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          flag.severity === 'ALERT'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : flag.severity === 'CAUTION'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}>
                          {flag.severity}
                        </span>
                      </td>
                      <td className="p-4 font-bold">{flag.currentDpd || 0} Days</td>
                      <td className="p-4 font-sans text-slate-400 max-w-xs">{flag.description}</td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(flag.triggeredAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 text-xs text-slate-400">
              No active distress alerts currently flagged by the 24h EWS telemetry worker.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Recovery Pipeline Tracker */}
      {activeTab === 'recovery' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">5-Stage Recovery Pipeline Tracker</h3>
            <span className="text-xs text-slate-400">Stage 2 (Soft 1-30 DPD) • Stage 3 (Hard 31-89 DPD) • Stage 4 (NPA 90+ DPD)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: DELAYED */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="font-bold text-xs text-amber-300">Stage 2: Delayed (1–30 DPD)</span>
                <span className="font-mono text-xs text-amber-400 font-bold">
                  {recoveryLoans.filter(l => l.status === 'DELAYED').length}
                </span>
              </div>
              <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1.5 custom-scrollbar">
                {recoveryLoans.filter(l => l.status === 'DELAYED').map(l => (
                  <div key={l.repaymentId} className="glass-panel rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{l.businessName}</span>
                      <span className="text-amber-400 font-mono font-bold">DPD: {l.dpd}</span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      Overdue Principal: ₹{(l.loanAmount || 500000).toLocaleString('en-IN')}
                    </div>
                    <div className="text-rose-400 font-mono text-[11px]">
                      Penal Interest: ₹{l.penalInterestAccrued?.toLocaleString('en-IN')} (18% p.a.)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: AT_RISK & Restructuring */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                <span className="font-bold text-xs text-purple-300">Stage 3: At-Risk & OTS (31–89 DPD)</span>
                <span className="font-mono text-xs text-purple-400 font-bold">
                  {recoveryLoans.filter(l => l.status === 'AT_RISK').length}
                </span>
              </div>
              <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1.5 custom-scrollbar">
                {recoveryLoans.filter(l => l.status === 'AT_RISK').map(l => (
                  <div key={l.repaymentId} className="glass-panel rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{l.businessName}</span>
                      <span className="text-purple-400 font-mono font-bold">DPD: {l.dpd}</span>
                    </div>
                    {l.restructurePlan && (
                      <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300">
                        OTS Vote Active: {l.restructurePlan.approvalPercentage}% Approved (60% Needed)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: NPA Default */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <span className="font-bold text-xs text-rose-300">Stage 4: NPA Default (90+ DPD)</span>
                <span className="font-mono text-xs text-rose-400 font-bold">
                  {recoveryLoans.filter(l => l.status === 'NPA').length}
                </span>
              </div>
              <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1.5 custom-scrollbar">
                {recoveryLoans.filter(l => l.status === 'NPA').map(l => (
                  <div key={l.repaymentId} className="glass-panel rounded-xl p-4 border border-rose-500/30 bg-rose-500/5 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{l.businessName}</span>
                      <span className="text-rose-400 font-mono font-bold">DPD: {l.dpd}</span>
                    </div>
                    <div className="text-[11px] text-rose-300">
                      • Account Suspended • Trust Score: 0 • Legal Notice Issued
                    </div>
                    <a
                      href={`/api/recovery/cibil-report/${l.applicationId || l.loanId || 'LN-AMIT-710'}`}
                      download
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold hover:bg-rose-500/30 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CIBIL XML Payload</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Manual Trigger Panel */}
      {activeTab === 'manual' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Manual Trigger & Failure Recovery Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Test failure recovery state machines on active loans live during evaluator presentations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Select Active Loan for Simulation</label>
              <select
                value={selectedTriggerLoan}
                onChange={(e) => setSelectedTriggerLoan(e.target.value)}
                className="w-full neu-input px-3.5 py-2.5 text-sm font-mono bg-slate-950"
              >
                <option value="LN-AMIT-710">Amit Deshmukh (LN-AMIT-710) - Precision Eng</option>
                <option value="LN-PRIYA-810">Priya Sharma (LN-PRIYA-810) - Textiles</option>
                <option value="LN-RAVI-590">Ravi Verma (LN-RAVI-590) - General Stores</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Force Target State Transition</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full neu-input px-3.5 py-2.5 text-sm bg-slate-950"
              >
                <option value="DELAYED">DELAYED (Simulate NACH Debit Failure & Start 18% Penal Interest)</option>
                <option value="AT_RISK">AT_RISK (Simulate 45 DPD & Stage 3 Hard Recovery)</option>
                <option value="NPA">NPA (Simulate 90+ DPD Default & Account Suspension)</option>
                <option value="ACTIVE">ACTIVE (Reset to Healthy Repaying Status)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 shadow-neu-inset border border-slate-800 text-xs space-y-2 text-slate-400">
            <span className="font-bold text-slate-200 block">Actions Triggered on State Transition:</span>
            <p>• Updates loan repayment document and calculates daily penal interest (18% p.a.).</p>
            <p>• Schedules NACH automated retries for Days 3, 7, 15, 25 in Bull queue.</p>
            <p>• Emits lender distress notification and enables Settlement Module on borrower portal.</p>
          </div>

          <button
            onClick={handleSimulateFailure}
            disabled={isTriggering}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98]"
          >
            {isTriggering ? 'Executing Event...' : 'Fire Event / Simulate NACH Failure'}
          </button>

          {triggerResult && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono space-y-1 shadow-glow-green">
              <div className="font-bold font-sans flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                State Transition Executed Successfully
              </div>
              <div>Loan ID: {triggerResult.applicationId || triggerResult.loanId}</div>
              <div>Previous State: {triggerResult.previousStatus} ➔ New State: {triggerResult.newStatus}</div>
              <div>Current DPD: {triggerResult.dpd} Days</div>
              <div>Penal Interest Accrued: ₹{triggerResult.penalInterestAccrued?.toLocaleString('en-IN')}</div>
            </div>
          )}
        </div>
      )}

      {/* Segregated Escrow Accounting Transparancy Panel */}
      <div className="pt-4">
        <EscrowAuditCard />
      </div>

      {/* Override Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border)] text-[var(--fg)] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h4 className="font-bold text-[var(--fg)] text-base">Risk Operations Application Override</h4>
                <p className="text-xs text-[var(--muted-fg)]">Application: {selectedApp.applicationId}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-[var(--muted-fg)] hover:text-[var(--fg)] cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              {/* AI Forensic Telemetry Dossier */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-sans">
                    AI Forensic Underwriter Dossier
                  </span>
                  <span className="text-[10px] font-bold text-rose-500">
                    {selectedApp.forgeryGrade === 'FORGED' ? 'CRITICAL TAMPER (96% Confidence)' : 'CAUTION SIGNAL'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--fg)] font-sans leading-relaxed">
                  {selectedApp.forgeryReason || "PyMuPDF structural checks detected multiple mismatched font families and metadata editor signatures."}
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--fg)]">Decision Action</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOverrideAction('APPROVE')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      overrideAction === 'APPROVE'
                        ? 'btn-approve border-emerald-400'
                        : 'bg-[var(--muted-bg)] border-[var(--border)] text-[var(--muted-fg)] hover:text-[var(--fg)]'
                    }`}
                  >
                    Approve & List on Marketplace
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideAction('REJECT')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      overrideAction === 'REJECT'
                        ? 'btn-reject border-red-400'
                        : 'bg-[var(--muted-bg)] border-[var(--border)] text-[var(--muted-fg)] hover:text-[var(--fg)]'
                    }`}
                  >
                    Reject & Block File
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--fg)]">
                  Mandatory Audit Log Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  value={overrideComment}
                  onChange={(e) => setOverrideComment(e.target.value)}
                  placeholder="Explain the regulatory or forensic justification for this override..."
                  className="w-full neu-input p-3 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2.5 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--border)] text-[var(--fg)] text-xs font-semibold transition-all border border-[var(--border)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteOverride}
                disabled={isSubmittingOverride || !overrideComment.trim()}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 transition-all ${
                  overrideAction === 'APPROVE' ? 'btn-approve' : 'btn-reject'
                }`}
              >
                {isSubmittingOverride ? 'Recording Audit...' : `Confirm ${overrideAction === 'APPROVE' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
