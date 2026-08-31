import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, TrendingUp, Landmark, PieChart, 
  ArrowRight, CheckCircle2, Layers, Coins, Sparkles, RefreshCw 
} from 'lucide-react';
import EscrowAuditCard from '../components/EscrowAuditCard';

export default function InstitutionalDashboard() {
  const [coLendingFacility] = useState({
    name: "Bajaj Finserv Priority Co-Lending Fund",
    facilitySize: 50000000, // ₹5.0 Cr
    utilized: 18400000,    // ₹1.84 Cr
    available: 31600000,   // ₹3.16 Cr
    weightedYield: 14.2,
    activeMSMEs: 38
  });

  const [opportunities, setOpportunities] = useState([
    {
      id: "LN-MEGA-101",
      businessName: "Kalyan Textiles & Exports Ltd.",
      proprietor: "Kalyanaraman S.",
      city: "Coimbatore, Tamil Nadu",
      sector: "Textile / Export",
      totalTicket: 2500000,   // ₹25L
      nbfcTranche80: 2000000, // ₹20L (80%)
      retailTranche20: 500000,// ₹5L (20% across 10 retail lenders)
      acieGrade: "A",
      acieScore: 825,
      interestRate: 13.8,
      status: "PENDING_CO_LEND"
    },
    {
      id: "LN-MEGA-102",
      businessName: "Precision Auto Hydraulics Pvt Ltd",
      proprietor: "Rajendra Deshmukh",
      city: "Pune, Maharashtra",
      sector: "Auto Ancillary",
      totalTicket: 1500000,   // ₹15L
      nbfcTranche80: 1200000, // ₹12L (80%)
      retailTranche20: 300000,// ₹3L (20%)
      acieGrade: "A",
      acieScore: 810,
      interestRate: 14.2,
      status: "PENDING_CO_LEND"
    }
  ]);

  const [fundedLoans, setFundedLoans] = useState([]);

  const handleApproveCoLend = (id) => {
    const opp = opportunities.find(o => o.id === id);
    if (!opp) return;

    setFundedLoans(prev => [...prev, id]);
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status: 'FUNDED_80_20' } : o));
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-600/30 flex items-center justify-center text-indigo-500 font-serif font-bold text-xl shadow-sm">
            BF
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-serif text-[var(--fg)]">{coLendingFacility.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-indigo-500/30 bg-indigo-500/10 text-indigo-500 font-mono">
                Model 2 Co-Lending Active
              </span>
            </div>
            <p className="text-xs text-[var(--muted-fg)] mt-0.5">
              Anchor Institutional Facility: <strong className="font-mono text-[var(--fg)]">₹{(coLendingFacility.facilitySize / 10000000).toFixed(1)} Cr</strong> • Co-Lending Ratio: <strong className="text-indigo-500 font-mono">80% NBFC : 20% Retail P2P</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--border)]">
            <span className="text-[10px] text-[var(--muted-fg)] font-sans block">Uncommitted Balance</span>
            <span className="text-base font-bold text-emerald-500">₹{(coLendingFacility.available / 100000).toFixed(1)}L</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-1">
          <span className="text-[var(--muted-fg)] font-sans">Active Co-Lended Capital</span>
          <div className="text-2xl font-bold font-serif text-[var(--fg)]">
            ₹{(coLendingFacility.utilized / 100000).toFixed(1)}L
          </div>
          <span className="text-[10px] text-emerald-500 font-sans block">Across {coLendingFacility.activeMSMEs} Priority MSMEs</span>
        </div>

        <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-1">
          <span className="text-[var(--muted-fg)] font-sans">Weighted Portfolio Yield</span>
          <div className="text-2xl font-bold font-serif text-emerald-500">
            {coLendingFacility.weightedYield}% p.a.
          </div>
          <span className="text-[10px] text-[var(--muted-fg)] font-sans block">Net of Platform Service Fee</span>
        </div>

        <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-1">
          <span className="text-[var(--muted-fg)] font-sans">Gross NPA (Co-Lending)</span>
          <div className="text-2xl font-bold font-serif text-emerald-500">
            0.00%
          </div>
          <span className="text-[10px] text-[var(--muted-fg)] font-sans block">ACIE 5D Telemetry Gated</span>
        </div>

        <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-1">
          <span className="text-[var(--muted-fg)] font-sans">Priority Sector Lending (PSL)</span>
          <div className="text-2xl font-bold font-serif text-indigo-500">
            100%
          </div>
          <span className="text-[10px] text-[var(--muted-fg)] font-sans block">Qualifies for RBI PSL Targets</span>
        </div>
      </div>

      {/* 80:20 Co-Lending Mechanism Visualizer */}
      <div className="rounded-3xl p-6 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
          <Layers className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold font-serif text-[var(--fg)]">
            How PeerPulse 80:20 Fractional Co-Lending Works
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[var(--muted-bg)] border border-[var(--border)] space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-500 uppercase font-mono">1. Anchor Liquidity (80%)</span>
            <p className="font-bold text-[var(--fg)] font-serif">NBFC Anchor Capital</p>
            <p className="text-[11px] text-[var(--muted-fg)] leading-relaxed">
              NBFC funds the senior 80% tranche of qualified Grade A/B MSME loans in a single automated API call.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--muted-bg)] border border-[var(--border)] space-y-1.5">
            <span className="text-[10px] font-bold text-amber-500 uppercase font-mono">2. Fractional Pool (20%)</span>
            <p className="font-bold text-[var(--fg)] font-serif">Retail P2P Crowd</p>
            <p className="text-[11px] text-[var(--muted-fg)] leading-relaxed">
              Retail investors fund the remaining 20% in ₹50K fractional tranches, democratizing yields.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--muted-bg)] border border-[var(--border)] space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-500 uppercase font-mono">3. Unified Escrow Return</span>
            <p className="font-bold text-[var(--fg)] font-serif">Pro-Rata Settlement</p>
            <p className="text-[11px] text-[var(--muted-fg)] leading-relaxed">
              IDFC Trustee Escrow splits monthly borrower EMI debits 80:20 simultaneously with 0% DLG risk.
            </p>
          </div>
        </div>
      </div>

      {/* Available Large-Ticket Co-Lending Opportunities */}
      <div className="rounded-3xl p-6 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <h3 className="text-sm font-bold font-serif text-[var(--fg)]">
              Large-Ticket MSME Pipeline (Ready for 80% Co-Lending)
            </h3>
          </div>
          <span className="text-xs font-mono text-[var(--muted-fg)]">{opportunities.length} Pipeline Opportunities</span>
        </div>

        <div className="space-y-4">
          {opportunities.map((opp) => {
            const isFunded = fundedLoans.includes(opp.id);
            return (
              <div
                key={opp.id}
                className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted-bg)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      ACIE Grade {opp.acieGrade} • Score {opp.acieScore}
                    </span>
                    <span className="text-xs font-mono text-[var(--muted-fg)]">{opp.id}</span>
                  </div>
                  <h4 className="text-base font-bold font-serif text-[var(--fg)]">{opp.businessName}</h4>
                  <p className="text-xs text-[var(--muted-fg)]">
                    Proprietor: {opp.proprietor} • {opp.city} • Sector: {opp.sector}
                  </p>
                </div>

                {/* Tranche Breakdown */}
                <div className="flex items-center gap-6 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--muted-fg)] block">Total Ticket</span>
                    <span className="font-bold text-[var(--fg)]">₹{(opp.totalTicket / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-500">
                    <span className="text-[10px] block">NBFC 80% Tranche</span>
                    <span className="font-bold">₹{(opp.nbfcTranche80 / 100000).toFixed(1)}L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted-fg)] block">Retail 20% Pool</span>
                    <span className="font-bold text-[var(--fg)]">₹{(opp.retailTranche20 / 100000).toFixed(1)}L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted-fg)] block">Yield</span>
                    <span className="font-bold text-emerald-500">{opp.interestRate}% p.a.</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleApproveCoLend(opp.id)}
                  disabled={isFunded}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isFunded
                      ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer'
                  }`}
                >
                  {isFunded ? '✓ 80% Tranche Committed' : 'Approve 80% Co-Lend Tranche'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Escrow Audit Panel */}
      <EscrowAuditCard />
    </div>
  );
}
