import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Coins, Clock, ShieldCheck, AlertTriangle, 
  Calendar, ArrowRight, RefreshCw, CheckCircle2, AlertOctagon, 
  HelpCircle, Sparkles, Plus, Check, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import NachMandateModal from '../components/NachMandateModal';
import { generateLoanContractPdf } from '../services/contractGenerator';
import { useLiveSync } from '../services/useLiveSync';
import { Download, CreditCard } from 'lucide-react';

export default function BorrowerDashboard({ activeBorrowerId }) {
  const [borrower, setBorrower] = useState(null);
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repayment, setRepayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMandateOpen, setIsMandateOpen] = useState(false);

  // Settlement Module state
  const [showSettlement, setShowSettlement] = useState(false);
  const [selectedOption, setSelectedOption] = useState('MORATORIUM');
  const [moratoriumMonths, setMoratoriumMonths] = useState(2);
  const [newTenure, setNewTenure] = useState(18);
  const [otsAmount, setOtsAmount] = useState(350000);
  const [settlementSuccess, setSettlementSuccess] = useState(null);
  const [isSubmittingRestructure, setIsSubmittingRestructure] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const bId = activeBorrowerId || 'BOR-PRIYA-001';
      const bData = await api.getBorrower(bId);
      setBorrower(bData);

      if (bData.activeApplications && bData.activeApplications.length > 0) {
        const fullLoans = await Promise.all(
          bData.activeApplications.map(app => api.getLoanDetails(app._id || app))
        );
        setLoans(fullLoans);
        setSelectedLoan(fullLoans[0]);

        // Fetch repayment
        if (fullLoans[0]?._id) {
          const rep = await api.getRepayment(fullLoans[0]._id).catch(() => null);
          setRepayment(rep);
        }
      }
    } catch (err) {
      console.error('Error fetching borrower dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeBorrowerId]);

  // Live Multi-tab sync for repayments or funding
  useLiveSync((event) => {
    if (event.type === 'repayment_received' || event.type === 'tranche_funded' || event.type === 'timeline_advanced') {
      fetchDashboardData();
    }
  });

  // Razorpay Instant EMI Payment
  const [payEmiLoading, setPayEmiLoading] = useState(false);
  const handlePayEmiViaRazorpay = async () => {
    if (!selectedLoan) return;
    const emiAmount = Math.round(selectedLoan.loanAmount / selectedLoan.tenure);
    setPayEmiLoading(true);
    try {
      const { order, keyId } = await api.createPaymentOrder({
        amount: emiAmount,
        purpose: 'loan_repayment',
        entityId: selectedLoan._id
      });

      if (window.Razorpay) {
        const options = {
          key: keyId,
          amount: order.amount,
          currency: 'INR',
          name: 'PeerPulse Loan Escrow',
          description: `Monthly EMI for Loan #${selectedLoan.applicationId}`,
          ...(order.id && !order.isMock && !order.id.startsWith('order_mock') ? { order_id: order.id } : {}),
          prefill: {
            name: borrower?.name || 'MSME Borrower',
            email: 'borrower@peerpulse.in',
            contact: '+919876543210'
          },
          theme: {
            color: '#10B981'
          },
          modal: {
            ondismiss: () => setPayEmiLoading(false)
          },
          handler: async (response) => {
            setPayEmiLoading(true);
            await api.payEmiViaRazorpay({
              loanId: selectedLoan._id,
              amount: emiAmount,
              razorpayOrderId: response.razorpay_order_id || order.id,
              razorpayPaymentId: response.razorpay_payment_id || 'pay_' + Math.random().toString(36).substring(2, 10),
              razorpaySignature: response.razorpay_signature || 'mock_sig'
            });
            await fetchDashboardData();
            setPayEmiLoading(false);
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          alert('Repayment Failed: ' + (response.error?.description || 'Transaction declined'));
          setPayEmiLoading(false);
        });
        rzp.open();
      } else {
        await api.payEmiViaRazorpay({
          loanId: selectedLoan._id,
          amount: emiAmount,
          razorpayOrderId: order.id,
          razorpayPaymentId: 'pay_' + Math.random().toString(36).substring(2, 10),
          razorpaySignature: 'mock_sig'
        });
        await fetchDashboardData();
        setPayEmiLoading(false);
      }
    } catch (err) {
      alert('Payment error: ' + err.message);
      setPayEmiLoading(false);
    }
  };

  // Dynamic RBI Contract PDF Download Handler
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const handleDownloadContract = async () => {
    if (!selectedLoan) return;
    setDownloadingPdf(true);
    try {
      await generateLoanContractPdf({
        borrowerName: borrower?.name || 'Priya Sharma',
        businessName: borrower?.businessName || 'Priya Textiles Surat',
        loanId: selectedLoan.applicationId || 'LN-PRIYA-810',
        loanAmount: selectedLoan.loanAmount || 500000,
        tenure: selectedLoan.tenure || 12,
        interestRate: selectedLoan.interestRate || 13.5,
        acieScore: selectedLoan.acieScore?.total || 810,
        grade: selectedLoan.acieScore?.grade || 'A',
        lenders: selectedLoan.fundingStatus?.lenders?.length > 0
          ? selectedLoan.fundingStatus.lenders.map(l => ({ name: l.lenderId || 'Syndicate Investor', tranche: l.amount || 25000, sharePct: '5.0%' }))
          : [
              { name: 'Vikram Sethi (Conservative)', tranche: 25000, sharePct: '5.0%' },
              { name: 'Ananya Roy (Moderate)', tranche: 50000, sharePct: '10.0%' },
              { name: 'Karan Singhal (Aggressive)', tranche: 25000, sharePct: '5.0%' }
            ],
        purpose: selectedLoan.purpose || 'Working Capital'
      });
    } catch (err) {
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleApplySettlement = async () => {
    if (!selectedLoan) return;
    setIsSubmittingRestructure(true);
    setSettlementSuccess(null);
    try {
      const payload = {
        loanId: selectedLoan._id,
        borrowerId: borrower?._id,
        option: selectedOption,
        params: {}
      };

      if (selectedOption === 'MORATORIUM') {
        payload.params.months = moratoriumMonths;
      } else if (selectedOption === 'TENURE_EXTENSION') {
        payload.params.newTenure = newTenure;
      } else if (selectedOption === 'OTS') {
        payload.params.proposedAmount = Number(otsAmount);
      }

      const res = await api.restructureLoan(payload);
      setSettlementSuccess(res);
      await fetchDashboardData();
    } catch (err) {
      alert('Restructure error: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmittingRestructure(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading MSME Borrower Portfolio...</p>
      </div>
    );
  }

  const isDistressed = repayment?.status === 'DELAYED' || repayment?.status === 'AT_RISK';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Top Banner: Borrower Identity */}
      <div className="rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--muted-bg)] border border-[var(--gold)] flex items-center justify-center text-[var(--gold-dark)] font-serif font-bold text-xl shadow-sm">
            {borrower?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-serif text-[var(--fg)]">{borrower?.businessName || 'Priya Textiles'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--muted-bg)] text-[var(--muted-fg)] border border-[var(--border)] uppercase tracking-wider">
                {borrower?.businessCategory || 'Textile'}
              </span>
            </div>
            <p className="text-xs text-[var(--muted-fg)] mt-0.5">
              Proprietor: <strong className="text-[var(--fg)]">{borrower?.name}</strong> • GSTIN: <span className="font-mono text-[var(--muted-fg)]">{borrower?.gstNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-[var(--muted-fg)] font-medium">Platform Trust Score</span>
            <div className="text-base font-bold font-mono text-emerald-500">
              {borrower?.platformTrustScore || 92} / 100
            </div>
          </div>

          {selectedLoan && (
            <button
              onClick={handleDownloadContract}
              disabled={downloadingPdf}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-[var(--gold)]/40 bg-[var(--card-bg)] text-[var(--gold-dark)] hover:bg-[var(--gold)]/10 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Download Formal RBI P2P Sanction Agreement (PDF)"
            >
              <Download className="w-4 h-4 text-[var(--gold-dark)]" />
              <span>{downloadingPdf ? 'Generating PDF...' : 'Sanction Agreement (PDF)'}</span>
            </button>
          )}

          <button
            onClick={() => setIsMandateOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-[var(--border)] bg-[var(--card-bg)] text-[var(--fg)] hover:bg-[var(--muted-bg)] flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>e-NACH AutoPay</span>
          </button>

          <Link
            to="/borrower/apply"
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            style={{
              backgroundColor: "var(--btn-primary-bg)",
              color: "var(--btn-primary-fg)",
            }}
          >
            <Plus className="w-4 h-4" />
            <span>New Loan Application</span>
          </Link>
        </div>
      </div>

      {/* e-NACH Mandate Setup Modal */}
      <NachMandateModal
        isOpen={isMandateOpen}
        onClose={() => setIsMandateOpen(false)}
        loan={selectedLoan}
        onMandateCreated={() => {
          fetchDashboardData();
        }}
      />

      {/* Distress Alert Banner if Delayed / At-Risk */}
      {isDistressed && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold font-serif text-sm text-[var(--fg)]">Payment Delayed — Soft Collection Active (DPD: {repayment.dpd})</h4>
              <p className="text-xs text-[var(--muted-fg)] mt-0.5">
                Overdue principal is currently accruing penal interest at 18% p.a. (₹{repayment.penalInterestAccrued?.toLocaleString('en-IN')}). Proactive restructuring is available without CIBIL impact.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSettlement(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shrink-0 shadow-sm"
          >
            Apply for Debt Restructuring
          </button>
        </div>
      )}

      {/* Settlement Module (Visible when DELAYED / AT_RISK or toggled) */}
      {showSettlement && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-amber-500/40 space-y-6 animate-in slide-in-from-top-4 shadow-glow-yellow">
          <div className="border-b border-slate-800 pb-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Stage 3 Default Resolution
            </span>
            <h3 className="text-lg font-bold text-white mt-2">Borrower Settlement & Restructuring Module</h3>
            <p className="text-xs text-slate-400">
              Select one of three RBI-compliant debt restructuring paths before Day 90 NPA escalation.
            </p>
          </div>

          {settlementSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2 shadow-glow-green">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Restructuring Status: {settlementSuccess.status}</span>
                <p className="mt-0.5">{settlementSuccess.message}</p>
              </div>
            </div>
          )}

          {/* 3 Restructure Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Moratorium Card */}
            <div
              onClick={() => setSelectedOption('MORATORIUM')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedOption === 'MORATORIUM'
                  ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500 shadow-glow-green'
                  : 'bg-slate-950/80 shadow-neu-inset border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">Moratorium</span>
                {selectedOption === 'MORATORIUM' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                1–3 month pause on EMI. Interest accrues; total tenure extends by moratorium duration.
              </p>
              <div className="space-y-1 text-xs font-mono">
                <label className="text-slate-500 text-[10px] font-sans">Pause Duration:</label>
                <select
                  value={moratoriumMonths}
                  onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                  className="w-full neu-input p-2 text-xs bg-slate-950"
                >
                  <option value="1">1 Month Moratorium</option>
                  <option value="2">2 Months Moratorium</option>
                  <option value="3">3 Months Moratorium</option>
                </select>
              </div>
            </div>

            {/* Tenure Extension Card */}
            <div
              onClick={() => setSelectedOption('TENURE_EXTENSION')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedOption === 'TENURE_EXTENSION'
                  ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500 shadow-glow-green'
                  : 'bg-slate-950/80 shadow-neu-inset border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">Tenure Extension</span>
                {selectedOption === 'TENURE_EXTENSION' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Reduces monthly EMI burden by extending loan tenure. Lenders automatically notified.
              </p>
              <div className="space-y-1 text-xs font-mono">
                <label className="text-slate-500 text-[10px] font-sans">New Extended Tenure:</label>
                <select
                  value={newTenure}
                  onChange={(e) => setNewTenure(Number(e.target.value))}
                  className="w-full neu-input p-2 text-xs bg-slate-950"
                >
                  <option value="18">Extend to 18 Months</option>
                  <option value="24">Extend to 24 Months</option>
                  <option value="36">Extend to 36 Months</option>
                </select>
              </div>
            </div>

            {/* One-Time Settlement (OTS) Card */}
            <div
              onClick={() => setSelectedOption('OTS')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedOption === 'OTS'
                  ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500 shadow-glow-green'
                  : 'bg-slate-950/80 shadow-neu-inset border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">One-Time Settlement (OTS)</span>
                {selectedOption === 'OTS' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Propose lump-sum settlement. Requires &gt;60% lender approval by tranche value in 7 days.
              </p>
              <div className="space-y-1 text-xs font-mono">
                <label className="text-slate-500 text-[10px] font-sans">Proposed Settlement Amount:</label>
                <input
                  type="number"
                  step="10000"
                  value={otsAmount}
                  onChange={(e) => setOtsAmount(Number(e.target.value))}
                  className="w-full neu-input p-2 text-xs tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleApplySettlement}
              disabled={isSubmittingRestructure}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all"
            >
              {isSubmittingRestructure ? 'Submitting...' : `Submit ${selectedOption.replace('_', ' ')} Plan`}
            </button>
          </div>
        </div>
      )}

      {/* Main Loan Details & Repayment Schedule */}
      {selectedLoan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Loan Status & EMI Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-[var(--border)] space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <span className="text-xs font-bold text-[var(--muted-fg)] uppercase">Application ID: {selectedLoan.applicationId}</span>
                  <h3 className="text-lg font-bold text-[var(--fg)] mt-0.5">{selectedLoan.purpose}</h3>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedLoan.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : selectedLoan.status === 'DELAYED'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : selectedLoan.status === 'NPA'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                }`}>
                  Status: {repayment?.status || selectedLoan.status}
                </span>
              </div>

              {/* Funding / Disbursement Metric Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--muted-fg)] font-sans">Marketplace Fractional Funding</span>
                  <span className="text-[var(--fg)] font-bold">
                    ₹{(selectedLoan.fundingStatus?.funded || 0).toLocaleString('en-IN')} / ₹{(selectedLoan.loanAmount || 500000).toLocaleString('en-IN')} ({selectedLoan.fundingStatus?.percentFunded || 0}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[var(--muted-bg)] border border-[var(--border)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${selectedLoan.fundingStatus?.percentFunded || 70}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[var(--muted-fg)] pt-1">
                  <span>{selectedLoan.fundingStatus?.lenders?.length || 3} Participating Lenders</span>
                  <span>Disbursement ETA: Instant on 100% Escrow</span>
                </div>
              </div>

              {/* Key Loan Financial Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] text-xs font-mono">
                <div>
                  <span className="text-[var(--muted-fg)] text-[10px] font-sans">Principal</span>
                  <div className="text-sm font-bold text-[var(--fg)]">₹{selectedLoan.loanAmount?.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-[var(--muted-fg)] text-[10px] font-sans">Tenure</span>
                  <div className="text-sm font-bold text-[var(--fg)]">{selectedLoan.tenure} Months</div>
                </div>
                <div>
                  <span className="text-[var(--muted-fg)] text-[10px] font-sans">Interest Rate</span>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{selectedLoan.interestRate || 14.5}% p.a.</div>
                </div>
                <div>
                  <span className="text-[var(--muted-fg)] text-[10px] font-sans">Monthly EMI</span>
                  <div className="text-sm font-bold text-[var(--fg)]">₹{Math.round(selectedLoan.loanAmount / selectedLoan.tenure).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Outstanding Penal Interest (if any) */}
              {repayment?.penalInterestAccrued > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs flex justify-between items-center text-rose-600 dark:text-rose-300 font-mono">
                  <span>Accrued Penal Interest (18% p.a. daily on overdue):</span>
                  <span className="font-bold">₹{repayment.penalInterestAccrued.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Repayment Schedule Table */}
            <div className="glass-panel rounded-2xl p-6 border border-[var(--border)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[var(--fg)]">Monthly Repayment Schedule</h4>
                  <p className="text-[11px] text-[var(--muted-fg)]">e-NACH AutoPay or Instant Card/UPI via Razorpay Gateway</p>
                </div>
                <button
                  onClick={handlePayEmiViaRazorpay}
                  disabled={payEmiLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  title="Pay Monthly EMI via Razorpay Modal"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{payEmiLoading ? 'Opening Gateway...' : `Pay EMI (₹${Math.round(selectedLoan.loanAmount / selectedLoan.tenure).toLocaleString('en-IN')})`}</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--muted-fg)] text-[11px] font-mono uppercase bg-[var(--muted-bg)]">
                      <th className="p-2.5">Installment</th>
                      <th className="p-2.5">Due Date</th>
                      <th className="p-2.5">Principal</th>
                      <th className="p-2.5">Interest</th>
                      <th className="p-2.5">Total EMI</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-mono">
                    {[1, 2, 3, 4, 5, 6].map((num) => {
                      const emi = Math.round(selectedLoan.loanAmount / selectedLoan.tenure);
                      const isPast = num === 1;
                      const isCurrent = num === 2;
                      return (
                        <tr key={num} className="text-[var(--fg)] hover:bg-[var(--muted-bg)]/40 transition-colors">
                          <td className="p-2.5 font-sans font-semibold">Month {num}</td>
                          <td className="p-2.5 text-[var(--muted-fg)]">2026-0{num + 2}-05</td>
                          <td className="p-2.5">₹{Math.round(emi * 0.85).toLocaleString('en-IN')}</td>
                          <td className="p-2.5">₹{Math.round(emi * 0.15).toLocaleString('en-IN')}</td>
                          <td className="p-2.5 font-bold text-[var(--fg)]">₹{emi.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 font-sans">
                            {isPast ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">PAID</span>
                            ) : isCurrent && isDistressed ? (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold">OVERDUE</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-[var(--muted-bg)] border border-[var(--border)] text-[var(--muted-fg)] text-[10px]">UPCOMING</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Col: ACIE Score Card */}
          <div className="space-y-6">
            <ScoreGauge
              score={selectedLoan.acieScore?.total || 810}
              grade={selectedLoan.acieScore?.grade || 'A'}
              confidence={selectedLoan.acieScore?.confidence || 'High'}
              fraudRiskFlag={selectedLoan.acieScore?.fraudRiskFlag || 'None'}
            />

            {/* Score Explainability Factors */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                ACIE Underwriting Highlights
              </h4>
              
              <div className="space-y-2 text-slate-300">
                {selectedLoan.acieScore?.explainability?.positiveFactors?.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-4">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Active Applications Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Apply for your first fractional MSME credit line with our 7-step ACIE underwriting wizard.
          </p>
          <Link
            to="/borrower/apply"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/20"
          >
            Start Application Wizard
          </Link>
        </div>
      )}
    </div>
  );
}
