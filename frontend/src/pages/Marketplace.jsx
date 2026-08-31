import React, { useState, useEffect } from 'react';
import { 
  Landmark, Filter, ShieldCheck, TrendingUp, Search, 
  Coins, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import LoanCard from '../components/LoanCard';
import MarketplaceTicker from '../components/simulation/MarketplaceTicker';
import { useLiveSync } from '../services/useLiveSync';

export default function Marketplace({ activeLenderId }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedTenure, setSelectedTenure] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedGrade !== 'ALL') filters.grade = selectedGrade;
      if (selectedSector !== 'all') filters.sector = selectedSector;
      if (selectedTenure !== 'ALL') filters.tenure = selectedTenure;

      const data = await api.getMarketplaceLoans(filters);
      setLoans(data);
    } catch (err) {
      console.error('Failed to load marketplace loans:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [selectedGrade, selectedSector, selectedTenure]);

  // Live Real-Time Multi-User / Multi-Tab Synchronization via SSE
  useLiveSync((event) => {
    if (event.type === 'tranche_funded' || event.type === 'loan_listed' || event.type === 'timeline_advanced') {
      fetchLoans();
    }
  });

  // Client-side text search
  const filteredLoans = loans.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.borrowerName && l.borrowerName.toLowerCase().includes(q)) ||
      (l.businessName && l.businessName.toLowerCase().includes(q)) ||
      (l.purpose && l.purpose.toLowerCase().includes(q)) ||
      (l.applicationId && l.applicationId.toLowerCase().includes(q)) ||
      (l.sector && l.sector.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredLoans.length / pageSize) || 1;
  const paginatedLoans = filteredLoans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Banner */}
      <div className="rounded-3xl p-8 border border-[var(--border)] relative overflow-hidden bg-[var(--card-bg)] shadow-sm space-y-4">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--gold)] bg-[var(--muted-bg)] text-[var(--gold-dark)] text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[var(--gold-dark)]" />
            <span>ACIE Telemetry Live · RBI-Compliant Fractional Pooling</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--fg)] tracking-tight leading-tight">
            Fractional P2P Credit Marketplace
          </h1>

          <p className="text-sm text-[var(--muted-fg)] leading-relaxed">
            Verified Indian MSMEs underwritten with 5-dimensional telemetry: Forensic PDF validation, NetworkX UPI graph cycles, Overdraft OD/CC account analytics, and GSTR-1 turnover reconciliation.
          </p>

          {/* Key Platform Safeguards */}
          <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-[var(--muted-fg)]">
            <div className="flex items-center gap-1.5 font-medium text-[var(--fg)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>₹50K Single-Borrower Cap</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-[var(--fg)]">
              <Coins className="w-4 h-4 text-[var(--gold-dark)]" />
              <span>Pro-Rata Daily EMI Distribution</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-[var(--fg)]">
              <Landmark className="w-4 h-4 text-indigo-500" />
              <span>0% Default Loss Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Live Tranche Activity Feed Ticker */}
      <MarketplaceTicker onTrancheFunded={fetchLoans} />

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Search & Grade Chips */}
        <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--muted-fg)]" />
            <input
              type="text"
              placeholder="Search enterprise MSME..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="neu-input w-full pl-9 pr-3 py-1.5 text-xs"
            />
          </div>

          {/* Grade Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'A', label: 'Grade A (Prime)' },
              { id: 'B', label: 'Grade B (Standard)' },
              { id: 'C', label: 'Grade C (Subprime)' }
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedGrade === g.id
                    ? 'bg-[#1A211D] text-white border-[#1A211D] dark:bg-[var(--gold)] dark:text-black dark:border-[var(--gold)]'
                    : 'bg-[var(--muted-bg)] text-[var(--muted-fg)] border-[var(--border)] hover:text-[var(--fg)]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-fg)]">Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="neu-input px-3 py-1.5 text-xs font-medium cursor-pointer"
            >
              <option value="all">All Sectors</option>
              <option value="textile">Textile & Apparel</option>
              <option value="manufacturing">Precision Manufacturing</option>
              <option value="retail">Retail Stores</option>
              <option value="auto_ancillary">Auto Ancillary</option>
              <option value="pharma_distribution">Pharma Bulk</option>
              <option value="fmcg_wholesale">FMCG Wholesale</option>
              <option value="services">Freight & Logistics</option>
              <option value="plastics_packaging">Plastics & Packaging</option>
              <option value="electronics_hardware">Electronics Hardware</option>
              <option value="food_processing">Food Processing</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-fg)]">Tenure:</span>
            <select
              value={selectedTenure}
              onChange={(e) => setSelectedTenure(e.target.value)}
              className="neu-input px-3 py-1.5 text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Tenures</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="9">9 Months</option>
              <option value="12">12 Months</option>
              <option value="24">24 Months</option>
              <option value="36">36 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header with Counts */}
      <div className="flex items-center justify-between text-xs text-[var(--muted-fg)] px-1 font-mono">
        <span>
          Showing {filteredLoans.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} –{' '}
          {Math.min(currentPage * pageSize, filteredLoans.length)} of {filteredLoans.length} listings
        </span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Loan Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[var(--muted-fg)] font-mono">Loading fractional loan listings...</p>
        </div>
      ) : paginatedLoans.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
          <p className="text-sm font-semibold text-[var(--fg)] font-serif">No active listings match your filter.</p>
          <p className="text-xs text-[var(--muted-fg)] mt-1">Try selecting a different credit grade or sector filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedLoans.map((loan) => (
            <LoanCard
              key={loan._id || loan.applicationId}
              loan={loan}
              activeLenderId={activeLenderId}
              onFundSuccess={fetchLoans}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-xs font-semibold disabled:opacity-40 hover:bg-[var(--muted-bg)] transition-colors cursor-pointer"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-1 font-mono text-xs">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
              let pageNum = idx + 1;
              if (totalPages > 7 && currentPage > 4) {
                pageNum = currentPage - 3 + idx;
                if (pageNum > totalPages) return null;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-bold transition-all border ${
                    currentPage === pageNum
                      ? 'bg-[#1A211D] text-white border-[#1A211D] dark:bg-[var(--gold)] dark:text-black dark:border-[var(--gold)]'
                      : 'bg-[var(--card-bg)] text-[var(--muted-fg)] border-[var(--border)] hover:text-[var(--fg)]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-xs font-semibold disabled:opacity-40 hover:bg-[var(--muted-bg)] transition-colors cursor-pointer"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
