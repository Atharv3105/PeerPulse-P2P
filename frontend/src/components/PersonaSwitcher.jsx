import React, { useState, useEffect } from 'react';
import { Users, RotateCcw, ChevronDown, Check, ShieldAlert, Sparkles, Building, Wallet } from 'lucide-react';
import { api } from '../services/api';

export default function PersonaSwitcher({ currentRole, activeId, onSelectPersona }) {
  const [isOpen, setIsOpen] = useState(false);
  const [personas, setPersonas] = useState({ borrowers: [], lenders: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const fetchPersonas = async () => {
    try {
      const data = await api.getPersonas();
      setPersonas(data);
    } catch (e) {
      console.warn('Failed to load personas:', e.message);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleReset = async (e) => {
    e.stopPropagation();
    setIsResetting(true);
    try {
      await api.resetSeed();
      await fetchPersonas();
      window.location.reload();
    } catch (e) {
      alert('Reset failed: ' + e.message);
    } finally {
      setIsResetting(false);
    }
  };

  // 4 Core Benchmark personas
  const benchmarkBorrowers = [
    { id: 'BOR-PRIYA-001', name: 'Priya Sharma (Surat)', desc: 'Grade A (~810) • Clean Financials', role: 'borrower', color: 'text-emerald-400' },
    { id: 'BOR-RAVI-002', name: 'Ravi Verma (General Stores)', desc: 'Grade C (~590) • GST Mismatch & Bounces', role: 'borrower', color: 'text-amber-400' },
    { id: 'BOR-KUMAR-003', name: 'Kumar Chandran (Logistics)', desc: 'BLOCKED • Forged Statement PDF', role: 'borrower', color: 'text-rose-400' },
    { id: 'BOR-AMIT-004', name: 'Amit Deshmukh (Precision)', desc: 'Funded ₹5L • Active Recovery Scenario', role: 'borrower', color: 'text-blue-400' },
  ];

  const benchmarkLenders = [
    { id: 'LEN-VIKRAM-001', name: 'Vikram Sethi', desc: 'Conservative • ₹4.5L Wallet • Grade A Only', role: 'lender', color: 'text-emerald-400' },
    { id: 'LEN-ANANYA-002', name: 'Ananya Roy', desc: 'Moderate • ₹7.0L Wallet • Grade A & B', role: 'lender', color: 'text-blue-400' },
    { id: 'LEN-KARAN-003', name: 'Karan Singhal', desc: 'Aggressive • ₹8.5L Wallet • Grade A, B, C', role: 'lender', color: 'text-purple-400' },
  ];

  // Filter dynamic enterprise personas
  const filteredEnterpriseBorrowers = (personas.borrowers || [])
    .filter(b => !benchmarkBorrowers.some(bm => bm.id === b.borrowerId))
    .filter(b => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.businessName.toLowerCase().includes(q) ||
        b.borrowerId.toLowerCase().includes(q) ||
        (b.category && b.category.toLowerCase().includes(q))
      );
    })
    .slice(0, 15); // Show top 15 matches

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 transition-all shadow-sm cursor-pointer"
      >
        <Users className="w-3.5 h-3.5 text-emerald-400" />
        <span>Demo Personas</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] flex flex-col text-slate-200">
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800 mb-2 shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Select Persona ({personas.borrowers?.length || 180} MSMEs)
            </span>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              title="Reset database to fresh seed state"
            >
              <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reset Data'}</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="px-1 mb-2 shrink-0">
            <input
              type="text"
              placeholder="Search 180+ enterprise MSMEs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3 pr-1">
            {/* Core Benchmark Personas */}
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Core Benchmark Personas</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {benchmarkBorrowers.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectPersona(b.role, b.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors hover:bg-slate-800/80 ${
                      activeId === b.id ? 'bg-slate-800 border border-slate-700' : ''
                    }`}
                  >
                    <div>
                      <div className={`font-semibold ${b.color}`}>{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.desc}</div>
                    </div>
                    {activeId === b.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Retail Lenders */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase px-2">Primary Retail Lenders</div>
              <div className="space-y-0.5 mt-1">
                {benchmarkLenders.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      onSelectPersona(l.role, l.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors hover:bg-slate-800/80 ${
                      activeId === l.id ? 'bg-slate-800 border border-slate-700' : ''
                    }`}
                  >
                    <div>
                      <div className={`font-semibold ${l.color}`}>{l.name}</div>
                      <div className="text-[10px] text-slate-400">{l.desc}</div>
                    </div>
                    {activeId === l.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Institutional Co-Lending Desk */}
            <div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase px-2">Institutional NBFC</div>
              <div className="space-y-0.5 mt-1">
                <button
                  onClick={() => {
                    onSelectPersona('institutional', 'NBFC-BAJAJ-01');
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors hover:bg-slate-800/80 ${
                    activeId === 'NBFC-BAJAJ-01' ? 'bg-slate-800 border border-slate-700' : ''
                  }`}
                >
                  <div>
                    <div className="font-semibold text-indigo-400">Bajaj Finserv NBFC Desk</div>
                    <div className="text-[10px] text-slate-400">80:20 Co-Lending • ₹5.0 Cr Facility</div>
                  </div>
                  {activeId === 'NBFC-BAJAJ-01' && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Expanded Enterprise Borrowers (Filtered) */}
            {filteredEnterpriseBorrowers.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase px-2 pt-1 border-t border-slate-800">
                  Enterprise MSME Directory ({personas.borrowers?.length || 180})
                </div>
                <div className="space-y-0.5 mt-1">
                  {filteredEnterpriseBorrowers.map((b) => (
                    <button
                      key={b.borrowerId}
                      onClick={() => {
                        onSelectPersona('borrower', b.borrowerId);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors hover:bg-slate-800/80 ${
                        activeId === b.borrowerId ? 'bg-slate-800 border border-slate-700' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-300 truncate">{b.businessName}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {b.name} • {b.category} • Trust: {b.trustScore}
                        </div>
                      </div>
                      {activeId === b.borrowerId && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Internal Admin Ops */}
          <div className="border-t border-slate-800 pt-1.5 mt-1 shrink-0">
            <button
              onClick={() => {
                onSelectPersona('admin', 'admin-ops');
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-800/80 text-amber-300 font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin / Risk Ops Panel</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                Internal
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
