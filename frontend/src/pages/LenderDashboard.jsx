import React, { useState, useEffect } from 'react';
import { 
  PieChart, Wallet, ShieldCheck, TrendingUp, AlertTriangle, 
  CheckCircle2, Clock, Vote, Bell, ArrowUpRight, ShieldAlert,
  Coins, Filter, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import DiversificationChart from '../components/DiversificationChart';
import LoanCard from '../components/LoanCard';
import EscrowAuditCard from '../components/EscrowAuditCard';
import { useLiveSync } from '../services/useLiveSync';

export default function LenderDashboard({ activeLenderId }) {
  const [lender, setLender] = useState(null);
  const [matchedListings, setMatchedListings] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [voteMessage, setVoteMessage] = useState(null);

  const fetchLenderData = async () => {
    setLoading(true);
    try {
      const lId = activeLenderId || 'LEN-VIKRAM-001';
      const lData = await api.getLender(lId);
      setLender(lData);

      // Fetch auto-matches
      const matchRes = await api.getMatchesForLender(lData.lenderId);
      setMatchedListings(matchRes.matchedListings || []);

      // Fetch marketplace active loans to check repayment statuses
      const allLoans = await api.getMarketplaceLoans();
      setActiveLoans(allLoans);
    } catch (err) {
      console.error('Lender Dashboard error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLenderData();
  }, [activeLenderId]);

  // Refresh whenever Time Machine fast-forwards or resets
  useEffect(() => {
    const handleTimelineChange = () => {
      fetchLenderData();
    };
    window.addEventListener('peerpulse-timeline-advanced', handleTimelineChange);
    return () => window.removeEventListener('peerpulse-timeline-advanced', handleTimelineChange);
  }, [activeLenderId]);

  // Live Real-Time Multi-User Sync (SSE)
  useLiveSync((event) => {
    if (event.type === 'tranche_funded' || event.type === 'wallet_updated' || event.type === 'repayment_received') {
      fetchLenderData();
    }
  });

  // Razorpay Checkout Modal Deposit Handler
  const [depositLoading, setDepositLoading] = useState(false);
  const handleRazorpayDeposit = async (amount = 50000) => {
    setDepositLoading(true);
    try {
      const { order, keyId } = await api.createPaymentOrder({
        amount,
        purpose: 'lender_wallet_deposit',
        entityId: lender?.lenderId
      });

      if (window.Razorpay) {
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'PeerPulse Escrow',
          description: `Retail Lender Wallet Top-Up (IDFC FIRST Trustee)`,
          ...(order.id && !order.isMock && !order.id.startsWith('order_mock') ? { order_id: order.id } : {}),
          prefill: {
            name: lender?.name || 'Retail Investor',
            email: 'investor@peerpulse.in',
            contact: '+919876543210'
          },
          theme: {
            color: '#10B981'
          },
          modal: {
            ondismiss: () => setDepositLoading(false)
          },
          handler: async (response) => {
            setDepositLoading(true);
            await api.verifyWalletDeposit({
              lenderId: lender?.lenderId,
              amount,
              razorpayOrderId: response.razorpay_order_id || order.id,
              razorpayPaymentId: response.razorpay_payment_id || 'pay_' + Math.random().toString(36).substring(2, 10),
              razorpaySignature: response.razorpay_signature || 'mock_sig'
            });
            await fetchLenderData();
            setDepositLoading(false);
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          alert('Payment Failed: ' + (response.error?.description || 'Transaction declined'));
          setDepositLoading(false);
        });
        rzp.open();
      } else {
        // Fallback simulation
        await api.verifyWalletDeposit({
          lenderId: lender?.lenderId,
          amount,
          razorpayOrderId: order.id,
          razorpayPaymentId: 'pay_' + Math.random().toString(36).substring(2, 10),
          razorpaySignature: 'mock_sig'
        });
        await fetchLenderData();
        setDepositLoading(false);
      }
    } catch (err) {
      alert('Deposit error: ' + err.message);
      setDepositLoading(false);
    }
  };

  const handleVote = async (restructureId, vote) => {
    setVotingInProgress(true);
    setVoteMessage(null);
    try {
      const res = await api.voteOTS({
        restructureId,
        lenderId: lender?.lenderId || 'LEN-VIKRAM-001',
        vote
      });
      setVoteMessage(`Vote recorded: ${vote}. Current fractional approval: ${res.currentApprovalPct}% (Threshold: 60%)`);
      await fetchLenderData();
    } catch (err) {
      alert('Voting error: ' + (err.response?.data?.error || err.message));
    } finally {
      setVotingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading Retail Lender Portfolio...</p>
      </div>
    );
  }

  // Pre-calculate portfolio metrics
  const totalInvested = lender?.totalExposure || 150000;
  const walletBalance = lender?.walletBalance || 450000;
  const maxCap = 1000000; // RBI cap: 10L
  const remainingCap = Math.max(0, maxCap - totalInvested);

  // Mock OTS proposal data if Amit's loan is in recovery scenario
  const pendingOtsLoan = lender?.activeInvestments?.find(inv => inv.status === 'DELAYED' || inv.status === 'AT_RISK');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header Banner: Lender Profile & RBI Aggregate Limits */}
      <div className="rounded-3xl p-6 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--muted-bg)] border border-[var(--gold)] flex items-center justify-center text-[var(--gold-dark)] font-serif font-bold text-xl shadow-sm">
            {lender?.name?.charAt(0) || 'V'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-serif text-[var(--fg)]">{lender?.name || 'Retail Investor'}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                lender?.riskAppetite === 'Conservative'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : lender?.riskAppetite === 'Moderate'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}>
                {lender?.riskAppetite || 'Conservative'} Risk Profile
              </span>
            </div>
            <p className="text-xs text-[var(--muted-fg)] mt-0.5">
              Denomination: <strong className="font-mono text-[var(--fg)]">₹{(lender?.denominationPreference || 25000).toLocaleString('en-IN')}</strong> / tranche • Preferred Sector: <strong className="text-[var(--fg)]">{lender?.sectorPreference || 'All Sectors'}</strong>
            </p>
          </div>
        </div>

        {/* Wallet & Exposure Indicators */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--border)] flex items-center gap-3">
            <div>
              <span className="text-[var(--muted-fg)] text-[10px] font-sans block">Escrow Wallet Balance</span>
              <span className="text-base font-bold text-emerald-500 tabular-nums">₹{walletBalance.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={() => handleRazorpayDeposit(50000)}
              disabled={depositLoading}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Deposit Funds via Razorpay Sandbox"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{depositLoading ? 'Processing...' : '+ Deposit ₹50K'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--border)]">
            <span className="text-[var(--muted-fg)] text-[10px] font-sans block">Platform Exposure (Max ₹10L)</span>
            <span className="text-base font-bold text-[var(--fg)] tabular-nums">₹{totalInvested.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-1">
          <span className="text-[var(--muted-fg)] text-xs font-sans">Active P2P Loans</span>
          <div className="text-2xl font-bold font-serif text-[var(--fg)] tabular-nums">
            {lender?.activeInvestments?.length || 3}
          </div>
          <span className="text-[11px] text-emerald-500 font-sans block font-medium">100% On-Time Repayments</span>
        </div>

        <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-1">
          <span className="text-[var(--muted-fg)] text-xs font-sans">Expected Portfolio Yield</span>
          <div className="text-2xl font-bold font-serif text-emerald-500 tabular-nums">
            {lender?.riskAppetite === 'Conservative' ? '13.8%' : lender?.riskAppetite === 'Moderate' ? '15.6%' : '18.4%'} p.a.
          </div>
          <span className="text-[11px] text-[var(--muted-fg)] font-sans block">Pro-Rata Daily EMI Returns</span>
        </div>

        <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-1">
          <span className="text-[var(--muted-fg)] text-xs font-sans">Remaining RBI Cap</span>
          <div className="text-2xl font-bold font-serif text-[var(--fg)] tabular-nums">
            ₹{remainingCap.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[var(--muted-fg)] font-sans block">Cap: ₹10,00,000 platform aggregate</span>
        </div>

        <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-1">
          <span className="text-[var(--muted-fg)] text-xs font-sans">Default Loss Protection</span>
          <div className="text-2xl font-bold font-serif text-amber-500">
            0% DLG
          </div>
          <span className="text-[11px] text-[var(--muted-fg)] font-sans block">Lender Bears 100% Risk (RBI Mandate)</span>
        </div>
      </div>

      {/* OTS Voting Interface Card (If active restructuring vote exists) */}
      <div className="glass-panel rounded-2xl p-6 border border-amber-500/40 bg-amber-500/5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-[var(--fg)]">Active Fractional OTS Restructuring Ballot</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
            7-Day Voting Window Active
          </span>
        </div>

        <p className="text-xs text-[var(--fg)]">
          Borrower <span className="font-semibold text-[var(--fg)]">Amit Deshmukh (Deshmukh Precision Engineering)</span> has proposed a One-Time Settlement (OTS) of ₹3,50,000 for Loan <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">LN-AMIT-710</span>. Per RBI fractional pooling rules, &gt;60% lender approval by tranche value is required to execute the settlement.
        </p>

        {voteMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{voteMessage}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--border)]">
          <div className="text-xs font-mono text-[var(--muted-fg)]">
            <span>Your Tranche Share: </span>
            <span className="text-[var(--fg)] font-bold tabular-nums">₹50,000 (40.0% Voting Weight)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleVote('RES-AMIT-OTS', 'REJECT')}
              disabled={votingInProgress}
              className="px-4 py-2 rounded-xl btn-reject text-xs disabled:opacity-40 cursor-pointer"
            >
              Reject Proposal
            </button>
            <button
              onClick={() => handleVote('RES-AMIT-OTS', 'APPROVE')}
              disabled={votingInProgress}
              className="px-4 py-2 rounded-xl btn-approve text-xs disabled:opacity-40 cursor-pointer"
            >
              Approve 70% OTS
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Diversification & Recovery Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diversification Gauge */}
        <div className="glass-panel rounded-2xl p-6 border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--fg)]">Portfolio Diversification</h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">Score: 88/100</span>
          </div>
          <DiversificationChart investments={lender?.activeInvestments || []} />
          <p className="text-[11px] text-[var(--muted-fg)] text-center">
            RBI Limit: Max 50% wallet concentration in any single ACIE grade band.
          </p>
        </div>

        {/* Notifications & Live Recovery Feed */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--fg)] flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Notifications & Recovery Telemetry
            </h3>
            <span className="text-[11px] text-[var(--muted-fg)]">Real-time event feed</span>
          </div>

          <div className="space-y-3 custom-scrollbar max-h-64 overflow-y-auto pr-1 text-xs">
            <div className="p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] flex items-start gap-3">
              <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[var(--fg)]">Pro-Rata EMI Credited: ₹4,479</span>
                <p className="text-[var(--muted-fg)] text-[11px]">Installment received from Priya Textiles Surat (LN-PRIYA-810) into Escrow.</p>
                <span className="text-[10px] text-[var(--muted-fg)] font-mono">Today, 10:45 AM</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-600 dark:text-amber-300">Distress Telemetry (Monitor Badge): LN-AMIT-710</span>
                <p className="text-amber-700 dark:text-amber-200/80 text-[11px]">Early Warning System detected balance dip below 10%. Stage 2 Soft Collection initiated.</p>
                <span className="text-[10px] text-amber-600 dark:text-amber-400/60 font-mono">Yesterday, 04:30 PM</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[var(--fg)]">Auto-Match Opportunity Available</span>
                <p className="text-[var(--muted-fg)] text-[11px]">New Grade A listing matches your {lender?.riskAppetite || 'Conservative'} criteria in Surat Textiles.</p>
                <span className="text-[10px] text-[var(--muted-fg)] font-mono">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Matched Investment Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[var(--fg)]">Auto-Matched Loan Tranches</h2>
            <p className="text-xs text-[var(--muted-fg)]">
              Filtered for {lender?.riskAppetite || 'Conservative'} risk appetite • RBI Per-Borrower Cap: ₹50,000
            </p>
          </div>
        </div>

        {matchedListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedListings.map((loan) => (
              <LoanCard
                key={loan.applicationId}
                loan={loan}
                activeLenderId={lender?.lenderId}
                onFundSuccess={fetchLenderData}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-8 text-center border border-slate-800 text-xs text-slate-400">
            No new loan matches fitting current criteria. Check back shortly as new MSME applications are underwritten.
          </div>
        )}
      </div>

      {/* Segregated Escrow Accounting Transparency Panel */}
      <EscrowAuditCard />
    </div>
  );
}
