import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Upload, CheckCircle2, AlertTriangle, ShieldCheck, 
  ArrowRight, ArrowLeft, Loader2, Sparkles, Building2, Coins, 
  Percent, AlertOctagon, TrendingUp, Info, HelpCircle, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import RadarChartBreakdown from '../components/RadarChartBreakdown';
import AASimulatorModal from '../components/AASimulatorModal';

export default function BorrowerWizard({ activeBorrowerId }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isAaModalOpen, setIsAaModalOpen] = useState(false);
  const [aaVerifiedBank, setAaVerifiedBank] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    borrowerName: 'Priya Sharma',
    businessName: 'Priya Textiles Surat',
    businessCategory: 'textile',
    loanAmount: 500000,
    tenure: 12,
    purpose: 'Procurement of High-Grade Silk Fabrics & Loom Automation',
    udyamNumber: 'UDYAM-GJ-01-001928',
    gstNumber: '24AABCP1928K1Z5',
    googleBusinessUrl: 'https://maps.google.com/?cid=priyatextilessurat',
    employeeCount: 6
  });

  // Upload Analysis Results
  const [statementAnalysis, setStatementAnalysis] = useState(null);
  const [gstAnalysis, setGstAnalysis] = useState(null);
  const [upiAnalysis, setUpiAnalysis] = useState(null);
  const [acieFinalScore, setAcieFinalScore] = useState(null);
  const [submittedLoan, setSubmittedLoan] = useState(null);

  // Preset Fast Selector for Evaluators
  const loadPreset = (persona) => {
    if (persona === 'priya') {
      setFormData({
        borrowerName: 'Priya Sharma',
        businessName: 'Priya Textiles Surat',
        businessCategory: 'textile',
        loanAmount: 500000,
        tenure: 12,
        purpose: 'Procurement of High-Grade Silk Fabrics & Loom Automation',
        udyamNumber: 'UDYAM-GJ-01-001928',
        gstNumber: '24AABCP1928K1Z5',
        googleBusinessUrl: 'https://maps.google.com/?cid=priyatextilessurat',
        employeeCount: 6
      });
    } else if (persona === 'ravi') {
      setFormData({
        borrowerName: 'Ravi Kumar Verma',
        businessName: 'Ravi General Stores',
        businessCategory: 'retail',
        loanAmount: 300000,
        tenure: 6,
        purpose: 'Seasonal FMCG Inventory Pre-Stocking',
        udyamNumber: 'UDYAM-MH-02-004821',
        gstNumber: '27AAACR4920M1Z2',
        googleBusinessUrl: 'https://maps.google.com/?cid=ravigeneralmumbai',
        employeeCount: 3
      });
    } else if (persona === 'kumar') {
      setFormData({
        borrowerName: 'Kumar Chandran',
        businessName: 'Kumar Logistics & Spares',
        businessCategory: 'services',
        loanAmount: 1200000,
        tenure: 24,
        purpose: 'Commercial Fleet Expansion & Spares',
        udyamNumber: 'UDYAM-KA-03-009182',
        gstNumber: '29AAACK9012J1Z3',
        googleBusinessUrl: 'https://maps.google.com/?cid=kumarlogistics',
        employeeCount: 4
      });
    }
  };

  // Step 2: Bank Statement Upload & Layer 1 Forgery Analysis
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.analyzeDocument(file, formData.businessCategory);
      setStatementAnalysis(res);
    } catch (err) {
      setErrorMsg('PDF parsing failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill mock statement if no file selected
  const handleSimulatePdf = async (type = 'clean') => {
    setLoading(true);
    setTimeout(() => {
      if (type === 'forged' || formData.borrowerName.includes('Kumar')) {
        setStatementAnalysis({
          forgeryGrade: 'FORGED',
          forgeryReason: "Metadata reveals document created/modified with unverified PDF Editor tools ('Adobe Acrobat Pro Cracked Copy') shortly before upload. Font analysis detects 3 distinct mismatched font families across transaction line items.",
          cashMetrics: { totalCredit: 5020000, totalDebit: 310000, netCashFlow: 4710000, bounceCount: 0, avgMonthlyBalance: 2250000 },
          documentScore: 15.0,
          fontMismatchCount: 4,
          layoutAnomalies: ['Non-uniform vertical row spacing (+12px delta)', 'Credit amount column misaligned by >15pt']
        });
      } else if (type === 'bounces' || formData.borrowerName.includes('Ravi')) {
        setStatementAnalysis({
          forgeryGrade: 'AUTHENTIC',
          forgeryReason: 'Document cryptographic signatures verified authentic. 2 bank bounces identified in transaction ledger.',
          cashMetrics: { totalCredit: 4120000, totalDebit: 3950000, netCashFlow: 170000, bounceCount: 2, avgMonthlyBalance: 82000 },
          documentScore: 55.0,
          fontMismatchCount: 1,
          layoutAnomalies: []
        });
      } else {
        setStatementAnalysis({
          forgeryGrade: 'AUTHENTIC',
          forgeryReason: 'Cryptographic publisher verification matches HDFC Bank statement generator. Consistent typography and layout.',
          cashMetrics: { totalCredit: 3420000, totalDebit: 2980000, netCashFlow: 440000, bounceCount: 0, avgMonthlyBalance: 285000 },
          documentScore: 85.0,
          fontMismatchCount: 1,
          layoutAnomalies: []
        });
      }
      setLoading(false);
    }, 900);
  };

  // Step 3: GST Cross-Validation
  const handleGstCheck = async () => {
    setLoading(true);
    try {
      const credit = statementAnalysis?.cashMetrics?.totalCredit || 3420000;
      const isRavi = formData.borrowerName.includes('Ravi');
      const turnover = isRavi ? 2800000 : 3420000; // Ravi declared 28L vs 41L bank credits

      const res = await api.crossValidate({
        bankTotalCredit: credit,
        gstDeclaredTurnover: turnover,
        businessCategory: formData.businessCategory,
        avgMonthlyBalance: statementAnalysis?.cashMetrics?.avgMonthlyBalance || 285000,
        loanAmount: formData.loanAmount
      });
      setGstAnalysis(res);
      setStep(4);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: UPI Graph Analysis
  const handleUpiAnalyze = async (type = 'clean') => {
    setLoading(true);
    setTimeout(async () => {
      const isCyclical = type === 'cyclical' || formData.borrowerName.includes('Ravi');
      if (isCyclical) {
        setUpiAnalysis({
          cycleCount: 3,
          cycleDetails: [
            { nodeA: 'ravistores@oksbi', nodeB: 'trader_x_associates@icici', amount: 49750, timestamps: ['2026-02-10', '2026-02-11'] },
            { nodeA: 'ravistores@oksbi', nodeB: 'friend_y_fin@hdfcbank', amount: 74500, timestamps: ['2026-02-15', '2026-02-16'] },
            { nodeA: 'ravistores@oksbi', nodeB: 'shell_z_enterprises@axisbank', amount: 99000, timestamps: ['2026-02-20', '2026-02-22'] }
          ],
          fraudScore: 65,
          statisticalFlags: ['Uniform transaction anomaly: Exactly ₹25,000.00 repeated 23 times (threshold: 23)'],
          upiSubScore: 43.0
        });
      } else {
        setUpiAnalysis({
          cycleCount: 0,
          cycleDetails: [],
          fraudScore: 0,
          statisticalFlags: [],
          upiSubScore: 78.0
        });
      }
      setLoading(false);
      setStep(5);
    }, 1100);
  };

  // Step 5 -> 6: Calculate Full ACIE Composite Score
  const handleCalculateScore = async () => {
    setLoading(true);
    try {
      const payload = {
        cashMetrics: statementAnalysis?.cashMetrics || { totalCredit: 3420000, totalDebit: 2980000, netCashFlow: 440000, bounceCount: 0, avgMonthlyBalance: 285000 },
        upiResult: upiAnalysis || { upiSubScore: 78, cycleCount: 0, statisticalFlags: [] },
        gstResult: gstAnalysis || { gstScore: 90, flagged: false, flags: [] },
        operationalData: { reviewCount: 45, sentiment: 'positive', employeeCount: formData.employeeCount },
        aaData: { consentVerified: true, hasPenalties: false },
        forgeryGrade: statementAnalysis?.forgeryGrade || 'AUTHENTIC',
        forgeryReason: statementAnalysis?.forgeryReason || ''
      };

      const res = await api.calculateScore(payload);
      setAcieFinalScore({
        ...res,
        forgeryResult: {
          forgeryGrade: statementAnalysis?.forgeryGrade || 'AUTHENTIC',
          forgeryReason: statementAnalysis?.forgeryReason || '',
          metadataFlagged: statementAnalysis?.forgeryGrade === 'FORGED',
          layoutAnomalies: statementAnalysis?.layoutAnomalies || []
        }
      });

      if (res.grade === 'A' || res.grade === 'B') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
      setStep(6);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Confirm and Submit Loan Application
  const handleSubmitApplication = async () => {
    setLoading(true);
    try {
      const res = await api.applyForLoan({
        name: formData.borrowerName,
        businessName: formData.businessName,
        businessCategory: formData.businessCategory,
        loanAmount: formData.loanAmount,
        tenure: formData.tenure,
        purpose: formData.purpose,
        udyamNumber: formData.udyamNumber,
        gstNumber: formData.gstNumber,
        acieScoreData: acieFinalScore
      });

      setSubmittedLoan(res);
      setStep(7);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Wizard Step Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-[var(--fg)] tracking-tight">MSME Loan Application Wizard</h1>
            <p className="text-xs text-[var(--muted-fg)]">7-Step Underwriting with Alternate Credit Intelligence (ACIE)</p>
          </div>

          {/* Quick Persona Preloader */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--muted-fg)] font-semibold hidden sm:inline">Pre-fill:</span>
            <button
              onClick={() => loadPreset('priya')}
              className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              Priya (Grade A)
            </button>
            <button
              onClick={() => loadPreset('ravi')}
              className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              Ravi (Grade C)
            </button>
            <button
              onClick={() => loadPreset('kumar')}
              className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-all"
            >
              Kumar (Forged)
            </button>
          </div>
        </div>

        {/* 7 Progress Bars */}
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div key={s} className="space-y-1">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= s ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-800'
              }`} />
              <span className={`text-[10px] block truncate font-medium ${
                step === s ? 'text-emerald-400 font-bold' : step > s ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Step {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* STEP 1: Loan Amount, Tenure, Purpose, Business Category */}
      {step === 1 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              Step 1: Loan Requirements & Business Profile
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              RBI Mandate: Borrowers may request between ₹25,000 and ₹50,00,000 for approved tenures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Applicant / Owner Name</label>
              <input
                type="text"
                value={formData.borrowerName}
                onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                className="w-full neu-input px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Registered Business Enterprise</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full neu-input px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Business Category <span className="text-emerald-400 font-normal">(Feeds ACIE debit plausibility check)</span>
              </label>
              <select
                value={formData.businessCategory}
                onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                className="w-full neu-input px-3.5 py-2.5 text-sm bg-slate-950"
              >
                <option value="textile">Textile Retail & Manufacturing</option>
                <option value="retail">General Retail & FMCG Stores</option>
                <option value="manufacturing">Engineering & Precision Manufacturing</option>
                <option value="services">Logistics, Fleet & Corporate Services</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Loan Amount (₹25,000 – ₹50,00,000)</label>
              <div className="space-y-2">
                <input
                  type="number"
                  min="25000"
                  max="5000000"
                  step="25000"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({ ...formData, loanAmount: Number(e.target.value) })}
                  className="w-full neu-input px-3.5 py-2.5 text-sm font-mono tabular-nums"
                />
                <input
                  type="range"
                  min="25000"
                  max="5000000"
                  step="25000"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({ ...formData, loanAmount: Number(e.target.value) })}
                  className="neu-slider"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Tenure Selection (RBI Approved Options)</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[3, 6, 9, 12, 24, 36].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, tenure: t })}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      formData.tenure === t
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-950/80 shadow-neu-inset border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {t} Months
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Loan Purpose</label>
              <textarea
                rows="2"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full neu-input px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl btn-approve text-xs flex items-center gap-2"
            >
              <span>Proceed to Document Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Bank Statement Upload & Layer 1 Forgery Analysis */}
      {step === 2 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Step 2: Bank Statement Forensic Verification (Layer 1)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              PyMuPDF structural scan + Local LLM forensic classification for font, metadata, and tabular layout anomalies.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-8 text-center bg-slate-900/40">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">Upload 12-Month Bank Statement PDF</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">Supports digital bank e-statements (HDFC, SBI, ICICI, Canara)</p>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsAaModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>⚡ Connect via RBI Account Aggregator</span>
              </button>

              <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-all">
                <span>Browse Local PDF...</span>
                <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => handleSimulatePdf('clean')}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20"
              >
                Use Clean Statement (Priya)
              </button>

              <button
                type="button"
                onClick={() => handleSimulatePdf('bounces')}
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20"
              >
                Use Statement w/ Bounces (Ravi)
              </button>

              <button
                type="button"
                onClick={() => handleSimulatePdf('forged')}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20"
              >
                Use Forged PDF (Kumar)
              </button>
            </div>
          </div>

          {/* Account Aggregator Simulator Modal */}
          <AASimulatorModal
            isOpen={isAaModalOpen}
            onClose={() => setIsAaModalOpen(false)}
            onConsentApproved={(consent) => {
              setAaVerifiedBank(consent.bank);
              handleSimulatePdf('clean');
            }}
          />

          {loading && (
            <div className="flex items-center justify-center gap-3 p-6 bg-slate-900/60 rounded-xl border border-slate-800">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              <span className="text-xs text-slate-300 font-medium">Extracting PDF bounding boxes & executing Layer 1 forensic check...</span>
            </div>
          )}

          {statementAnalysis && !loading && (
            <div className={`p-5 rounded-2xl border ${
              statementAnalysis.forgeryGrade === 'FORGED'
                ? 'bg-rose-500/10 border-rose-500/30'
                : statementAnalysis.forgeryGrade === 'SUSPICIOUS'
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Layer 1 Forensic Scan Result</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  statementAnalysis.forgeryGrade === 'FORGED'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : statementAnalysis.forgeryGrade === 'SUSPICIOUS'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}>
                  {statementAnalysis.forgeryGrade}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-mono leading-relaxed mb-4">
                {statementAnalysis.forgeryReason}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px]">Total Credits:</span>
                  <div className="font-bold text-white">₹{statementAnalysis.cashMetrics?.totalCredit?.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Net Cash Flow:</span>
                  <div className="font-bold text-emerald-400">₹{statementAnalysis.cashMetrics?.netCashFlow?.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Avg Balance:</span>
                  <div className="font-bold text-white">₹{statementAnalysis.cashMetrics?.avgMonthlyBalance?.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Bounces:</span>
                  <div className={`font-bold ${statementAnalysis.cashMetrics?.bounceCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                    {statementAnalysis.cashMetrics?.bounceCount || 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={!statementAnalysis}
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl btn-approve disabled:opacity-40 text-xs flex items-center gap-2"
            >
              <span>Proceed to GST Validation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GST Returns & Semantic Cross-Validation */}
      {step === 3 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Step 3: GST Return Reconciliation (Layer 2)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Cross-checks GSTR-1 declared turnover vs bank credits. Flags deltas &gt; 40% as potential revenue inflation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/80 shadow-neu-inset border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">GSTIN & Filing Details</span>
              <div className="font-mono text-sm text-white font-bold">{formData.gstNumber}</div>
              <div className="text-xs text-slate-400">Legal Entity: {formData.businessName}</div>
              <div className="text-xs text-slate-400">Filing Category: Regular Quarterly GSTR-1 / 3B</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 shadow-neu-inset border border-slate-800 space-y-2 font-mono text-xs">
              <span className="text-xs font-bold text-slate-400 uppercase font-sans">Bank vs GST Comparison</span>
              <div className="flex justify-between">
                <span className="text-slate-400">Statement Credits:</span>
                <span className="text-white font-bold tabular-nums">₹{(statementAnalysis?.cashMetrics?.totalCredit || 3420000).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GSTR-1 Declared:</span>
                <span className="text-white font-bold tabular-nums">
                  ₹{(formData.borrowerName.includes('Ravi') ? 2800000 : 3420000).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/70 shadow-neu-inset border border-slate-800 text-center">
            <p className="text-xs text-slate-300 mb-3">
              Trigger GSTN real-time API poll to verify filing consistency against declared banking ledger.
            </p>
            <button
              type="button"
              onClick={handleGstCheck}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl btn-approve text-xs flex items-center justify-center gap-2 mx-auto"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Execute Layer 2 Semantic Cross-Validation</span>
            </button>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: UPI Transaction CSV & Graph Cycle Analysis */}
      {step === 4 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Step 4: UPI Transaction Graph Analysis (NetworkX)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Constructs directed transaction graph. Runs DFS cycle detection for circular fund routing ($A \to B \to A$ within 72h).
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center bg-slate-900/40 space-y-4">
            <h4 className="text-sm font-bold text-white">Upload UPI Transaction Ledger CSV</h4>
            <p className="text-xs text-slate-400">
              Evaluates uniform amount repetition, velocity surges, and reciprocal round-trips.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleUpiAnalyze('clean')}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-all"
              >
                Analyze Clean UPI History (Priya)
              </button>

              <button
                type="button"
                onClick={() => handleUpiAnalyze('cyclical')}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-semibold hover:bg-amber-500/25 transition-all"
              >
                Analyze Cyclical Loop CSV (Ravi)
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 p-6 bg-slate-900/60 rounded-xl border border-slate-800">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              <span className="text-xs text-slate-300 font-medium">Running NetworkX DFS cycle detection and statistical analysis...</span>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Operational & Digital Signals */}
      {step === 5 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Step 5: Operational & Digital Footprint Signals (15%)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Google Business profile ratings, review sentiment, and physical workforce declarations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Google Business Profile / Maps URL</label>
              <input
                type="text"
                value={formData.googleBusinessUrl}
                onChange={(e) => setFormData({ ...formData, googleBusinessUrl: e.target.value })}
                className="w-full neu-input px-3.5 py-2.5 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full-Time On-Roll Employees</label>
              <input
                type="number"
                value={formData.employeeCount}
                onChange={(e) => setFormData({ ...formData, employeeCount: Number(e.target.value) })}
                className="w-full neu-input px-3.5 py-2.5 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">MSME Udyam Registration No.</label>
              <input
                type="text"
                value={formData.udyamNumber}
                onChange={(e) => setFormData({ ...formData, udyamNumber: e.target.value })}
                className="w-full neu-input px-3.5 py-2.5 text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleCalculateScore}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl btn-approve text-xs flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Compute ACIE Composite Score</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: ACIE Score Reveal */}
      {step === 6 && acieFinalScore && (
        <div className={`rounded-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 ${
          acieFinalScore.grade === 'A' ? 'glass-card-green' : acieFinalScore.grade === 'B' ? 'glass-card-blue' : acieFinalScore.grade === 'C' ? 'glass-card-yellow' : 'glass-card-red'
        }`}>
          <div className="border-b border-slate-800/80 pb-4 text-center">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              acieFinalScore.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : acieFinalScore.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : acieFinalScore.grade === 'C' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
            }`}>
              ACIE Underwriting Complete
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-2">
              Alternate Credit Intelligence Scorecard
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <ScoreGauge
              score={acieFinalScore.total}
              grade={acieFinalScore.grade}
              confidence={acieFinalScore.confidence}
              fraudRiskFlag={acieFinalScore.fraudRiskFlag}
            />

            <RadarChartBreakdown breakdown={acieFinalScore.breakdown} />
          </div>

          {/* Fraud Flags (if any) */}
          {acieFinalScore.fraudFlags && acieFinalScore.fraudFlags.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 space-y-1.5 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Risk & Fraud Indicators Flagged:
              </span>
              <ul className="text-xs text-amber-300/90 list-disc list-inside space-y-1 font-mono">
                {acieFinalScore.fraudFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Explainability Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/80 shadow-neu-inset border border-slate-800/80 space-y-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Positive Underwriting Drivers
              </span>
              <ul className="text-slate-300 space-y-1.5">
                {acieFinalScore.explainability?.positiveFactors?.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 shadow-neu-inset border border-slate-800/80 space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-400" />
                Actionable Improvement Tips
              </span>
              <ul className="text-slate-400 space-y-1.5">
                {acieFinalScore.explainability?.improvementTips?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitApplication}
              disabled={loading}
              className={`px-8 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                acieFinalScore.grade === 'DECLINED' || acieFinalScore.forgeryResult?.forgeryGrade === 'FORGED' ? 'btn-reject' : 'btn-approve'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{acieFinalScore.grade === 'DECLINED' ? 'Acknowledge Result' : 'Publish to Marketplace'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: Confirmation or Feedback */}
      {step === 7 && submittedLoan && (
        <div className="glass-panel rounded-2xl p-8 text-center space-y-5 animate-in zoom-in-95 border border-white/10">
          {submittedLoan.status === 'BLOCKED' || submittedLoan.status === 'DECLINED' ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Application {submittedLoan.status}</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {submittedLoan.status === 'BLOCKED'
                  ? 'Your bank statement was flagged for structural or forensic anomalies and routed to Risk Ops.'
                  : 'Your ACIE composite score fell below the 550 minimum prime threshold.'}
              </p>
              
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => navigate('/marketplace')}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all"
                >
                  Return to Marketplace
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-green">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Your Loan is Now Listed!</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Application <span className="font-mono text-emerald-400 font-bold">{submittedLoan.applicationId}</span> is now active on the fractional marketplace. Lenders will match in ₹25K–₹50K tranches.
              </p>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => navigate('/borrower')}
                  className="px-6 py-2.5 rounded-xl btn-approve text-xs"
                >
                  View Borrower Dashboard
                </button>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  View on Marketplace
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
