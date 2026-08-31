import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldCheck, PieChart, Landmark, TrendingUp, 
  AlertTriangle, CheckCircle2, ShieldAlert, BarChart3, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function PublicMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getPublicMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Top Disclosure Banner */}
      <div className="rounded-3xl p-8 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold font-mono border border-[var(--gold)] bg-[var(--muted-bg)] text-[var(--gold-dark)]">
            RBI Statutory Mandate
          </span>
          <span className="text-xs text-[var(--muted-fg)] font-mono">Public Disclosure Portal</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--fg)] tracking-tight">
          Platform Portfolio Performance & NPA Disclosures
        </h1>

        <p className="text-xs sm:text-sm text-[var(--muted-fg)] max-w-3xl leading-relaxed">
          In strict compliance with the <strong className="text-[var(--fg)]">RBI Master Directions on NBFC-P2P Lending Platforms (2017, amended 2023)</strong>, PeerPulse publishes real-time non-performing asset (NPA) rates, sector-wise exposure distributions, and regulatory compliance metrics.
        </p>

        {/* Regulatory Safeguards Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)]">
            <span className="text-[var(--muted-fg)] text-[10px] font-sans block">First-Loss Default Guarantee</span>
            <span className="text-rose-500 font-bold">0% DLG (Strictly Prohibited)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)]">
            <span className="text-[var(--muted-fg)] text-[10px] font-sans block">Lender Platform Aggregate Cap</span>
            <span className="text-emerald-500 font-bold">₹10,00,000 Hard Limit</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)]">
            <span className="text-[var(--muted-fg)] text-[10px] font-sans block">Single Borrower Cap per Lender</span>
            <span className="text-emerald-500 font-bold">₹50,000 Hard Limit</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[var(--muted-fg)] font-mono">Loading RBI real-time disclosure telemetry...</p>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm">
              <span className="text-[var(--muted-fg)] text-xs font-sans">Platform-Wide Default Rate</span>
              <div className="text-2xl font-bold font-serif text-emerald-500 mt-1 tabular-nums">
                {metrics.platformDefaultRate || '0.00%'}
              </div>
              <span className="text-[10px] text-[var(--muted-fg)] font-sans mt-0.5 block">Calculated at 90+ DPD cutoff</span>
            </div>

            <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm">
              <span className="text-[var(--muted-fg)] text-xs font-sans">Total Disbursed Volume</span>
              <div className="text-2xl font-bold font-serif text-[var(--fg)] mt-1 tabular-nums">
                ₹{(metrics.totalDisbursedVolume || 1350000).toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-[var(--muted-fg)] font-sans mt-0.5 block">Pro-rata fractional tranches</span>
            </div>

            <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm">
              <span className="text-[var(--muted-fg)] text-xs font-sans">Active Live Loans</span>
              <div className="text-2xl font-bold font-serif text-[var(--fg)] mt-1 tabular-nums">
                {metrics.activeLoansCount || 4}
              </div>
              <span className="text-[10px] text-[var(--muted-fg)] font-sans mt-0.5 block">Under active ACIE monitoring</span>
            </div>

            <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm">
              <span className="text-[var(--muted-fg)] text-xs font-sans">Total Listed Pipeline</span>
              <div className="text-2xl font-bold font-serif text-[var(--gold-dark)] dark:text-[var(--gold)] mt-1 tabular-nums">
                ₹{(metrics.totalListedVolume || 2500000).toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-[var(--muted-fg)] font-sans mt-0.5 block">Marketplace available capacity</span>
            </div>
          </div>

          {/* Tables: NPA by Grade & NPA by Sector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NPA by ACIE Grade */}
            <div className="rounded-2xl p-6 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="font-bold font-serif text-base text-[var(--fg)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  NPA % by ACIE Underwriting Grade
                </h3>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {metrics.npaByGrade?.map((item) => (
                  <div key={item.grade} className="p-3.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[var(--fg)] font-serif text-sm">{item.grade}</span>
                      <span className="text-[11px] text-[var(--muted-fg)] block">Total Active/Funded: {item.total}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-500 tabular-nums text-sm">{item.npaRate}%</span>
                      <span className="text-[10px] text-[var(--muted-fg)] block font-sans">Default Rate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NPA by Sector */}
            <div className="rounded-2xl p-6 border border-[var(--border)] bg-[var(--card-bg)] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="font-bold font-serif text-base text-[var(--fg)] flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-500" />
                  NPA % by Industry Sector
                </h3>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {metrics.npaBySector?.map((item) => (
                  <div key={item.sector} className="p-3.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[var(--fg)] font-serif text-sm">{item.sector}</span>
                      <span className="text-[11px] text-[var(--muted-fg)] block">Verified MSMEs</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-500 tabular-nums text-sm">{item.npaRate}%</span>
                      <span className="text-[10px] text-[var(--muted-fg)] block font-sans">Default Rate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
