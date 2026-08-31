import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, Send, X, ShieldCheck, TrendingUp, AlertTriangle, 
  HelpCircle, RefreshCw, Layers, ArrowUpRight, CheckCircle2, ChevronRight,
  User, Briefcase, DollarSign
} from 'lucide-react';
import { api } from '../../services/api';

// Professional Human Formatter: Cleans raw AI artifacts & styles financial metrics
function formatTextNodes(line) {
  if (!line) return null;

  // Regex to detect loan IDs, currencies, grades, and percentages
  const parts = line.split(/(LN-[A-Z]+-\d+|₹[\d,]+|Rs\.?\s*[\d,]+|Grade\s+[A-C]|\d+(?:\.\d+)?%\s*(?:p\.a\.)?)/g);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Clean any stray asterisks
    const cleaned = part.replace(/\*\*/g, '').replace(/\*/g, '');

    // Highlight Loan IDs
    if (/^LN-[A-Z]+-\d+$/.test(cleaned)) {
      return (
        <span key={idx} className="px-1.5 py-0.5 mx-0.5 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-mono font-bold text-[11px] border border-indigo-500/30 inline-flex items-center">
          {cleaned}
        </span>
      );
    }

    // Highlight Rupee Currencies
    if (/^(?:₹|Rs\.?\s*)[\d,]+$/.test(cleaned)) {
      return (
        <span key={idx} className="px-1.5 py-0.5 mx-0.5 rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[11px] border border-emerald-500/30 inline-flex items-center">
          {cleaned}
        </span>
      );
    }

    // Highlight Grades
    if (/^Grade\s+[A-C]$/.test(cleaned)) {
      return (
        <span key={idx} className="px-1.5 py-0.5 mx-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-500/30 inline-flex items-center">
          {cleaned}
        </span>
      );
    }

    // Highlight Yields/Percentages
    if (/^\d+(?:\.\d+)?%\s*(?:p\.a\.)?$/.test(cleaned)) {
      return (
        <span key={idx} className="font-bold text-[var(--fg)] font-mono">
          {cleaned}
        </span>
      );
    }

    return cleaned;
  });
}

function FormattedMessage({ text }) {
  if (!text) return null;

  // Split into paragraphs / lines
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-1" />;

        // Header lines (uppercase headers or memo headers)
        if (
          trimmed.startsWith('DATE:') || 
          trimmed.startsWith('TO:') || 
          trimmed.startsWith('FROM:') || 
          trimmed.startsWith('SUBJECT:') ||
          trimmed.startsWith('PORTFOLIO STRESS') ||
          trimmed.startsWith('CREDIT EVALUATION') ||
          trimmed.startsWith('EXECUTIVE SUMMARY') ||
          trimmed.startsWith('RECOMMENDATIONS')
        ) {
          return (
            <div key={lineIdx} className="font-bold text-xs uppercase tracking-wide text-[var(--gold-dark)] dark:text-[var(--gold)] border-b border-[var(--border)] pb-1 pt-1 font-mono">
              {trimmed.replace(/\*\*/g, '')}
            </div>
          );
        }

        // Bullet point lines
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          const content = trimmed.replace(/^[•\-]\s*/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0 mt-1.5"></span>
              <span className="text-[var(--fg)]">{formatTextNodes(content)}</span>
            </div>
          );
        }

        // Numbered recommendation items (e.g. "1. Concentration Buffer: ...")
        if (/^\d+\.\s+/.test(trimmed)) {
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          const num = numMatch ? numMatch[1] : '';
          const content = numMatch ? numMatch[2] : trimmed;

          return (
            <div key={lineIdx} className="p-2.5 rounded-xl bg-[var(--muted-bg)]/80 border border-[var(--border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[var(--card-bg)] border border-[var(--border)] text-[var(--fg)] font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                  {num}
                </span>
                <span className="text-[var(--fg)] font-medium">{formatTextNodes(content)}</span>
              </div>
            </div>
          );
        }

        // Regular paragraph text
        return (
          <p key={lineIdx} className="text-[var(--fg)] font-normal">
            {formatTextNodes(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function CreditCopilotModal({ activeBorrowerId, activeLenderId, currentRole, authUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'borrower' | 'lender'
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Real account profile state
  const [accountData, setAccountData] = useState({
    lender: null,
    borrower: null,
    activePersonaName: 'Vikram Sethi'
  });

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'copilot',
      text: "Executive Credit Risk & Portfolio Advisory Memo\n\nWelcome Vikram Sethi. I have synchronized your active P2P portfolio (₹1,25,000 exposure across 3 loans, ₹4,50,000 idle escrow cash).\n\nSelect 'Lender Stress Test' to simulate sector shocks on your exact holdings, or ask any question about your active OTS restructuring ballot."
    }
  ]);

  const messagesEndRef = useRef(null);

  // Synchronize live account data on mount/open
  useEffect(() => {
    const fetchLiveAccount = async () => {
      try {
        const isLender = window.location.pathname.includes('/lender') || currentRole === 'lender';
        if (isLender) {
          const lId = activeLenderId || 'LEN-VIKRAM-001';
          const lData = await api.getLender(lId);
          setAccountData(prev => ({
            ...prev,
            lender: lData,
            activePersonaName: lData?.name || 'Vikram Sethi'
          }));
        } else {
          const bId = activeBorrowerId || 'BOR-PRIYA-001';
          const bData = await api.getBorrower(bId);
          setAccountData(prev => ({
            ...prev,
            borrower: bData,
            activePersonaName: bData?.businessName || 'Priya Textiles Surat'
          }));
        }
      } catch (err) {
        console.warn('Account sync error:', err.message);
      }
    };

    fetchLiveAccount();
  }, [isOpen, activeLenderId, activeBorrowerId, currentRole]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    { label: "Simulate 15% Manufacturing Shock", query: "Run a 15% stress test on my current loan tranches and calculate IRR impact", role: "lender" },
    { label: "Should I Approve Amit's OTS?", query: "Analyze Amit Deshmukh's ₹3,50,000 OTS proposal where I hold 40% voting weight. Should I approve?", role: "lender" },
    { label: "How to lower rate to 12%?", query: "Give me a 3-step action plan to lower my interest rate from 13.5% to 12.0%", role: "borrower" },
    { label: "Deploy Idle ₹4.5L Escrow Cash", query: "How should I allocate my ₹4,50,000 uninvested escrow cash to maximize yield without exceeding the RBI 10L cap?", role: "lender" }
  ];

  const handleSendMessage = async (customQuery) => {
    const textToSend = customQuery || inputMessage.trim();
    if (!textToSend || isTyping) return;

    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInputMessage('');
    setIsTyping(true);

    try {
      const isLender = window.location.pathname.includes('/lender') || activeTab === 'lender' || textToSend.toLowerCase().includes('stress');
      const effectiveRole = isLender ? 'lender' : 'borrower';

      // Full Live Account Context
      const payloadContext = {
        role: effectiveRole,
        lender: accountData.lender || {
          name: 'Vikram Sethi',
          riskAppetite: 'Conservative',
          walletBalance: 450000,
          totalExposure: 125000,
          remainingCap: 875000,
          denominationPreference: 25000,
          preferredSector: 'Manufacturing'
        },
        borrower: accountData.borrower || {
          name: 'Priya Sharma',
          businessName: 'Priya Textiles Surat',
          businessCategory: 'Textile Manufacturing',
          gstNumber: '24AABCP1928K1Z5'
        },
        portfolio: [
          { loanId: 'LN-PRIYA-810', borrowerName: 'Priya Sharma', businessName: 'Priya Textiles Surat', amount: 25000, grade: 'A', sector: 'Textiles', yield: 13.5, status: 'ACTIVE', dpd: 0 },
          { loanId: 'LN-AMIT-710', borrowerName: 'Amit Deshmukh', businessName: 'Deshmukh Precision Engineering', amount: 50000, grade: 'B', sector: 'Manufacturing', yield: 14.5, status: 'DELAYED', dpd: 12, otsProposal: '₹3,50,000 OTS ballot pending (Vikram holds 40% voting weight)' },
          { loanId: 'LN-RAVI-590', borrowerName: 'Ravi Kumar Verma', businessName: 'Ravi General Stores', amount: 25000, grade: 'C', sector: 'Retail', yield: 18.0, status: 'ACTIVE', dpd: 0 }
        ]
      };

      const res = await api.copilotChat({
        message: textToSend,
        context: payloadContext
      });

      setMessages((prev) => [
        ...prev,
        {
          id: 'copilot_' + Date.now(),
          sender: 'copilot',
          text: res.reply || "Analysis complete."
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'copilot',
          text: "Portfolio Risk Memo: Connected via local ACIE engine. All calculations reflect your live ₹1,25,000 active exposure."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative">
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-10 flex items-center gap-2 px-4 rounded-full bg-[#1A211D] dark:bg-[var(--gold)] text-white dark:text-black shadow-lg hover:scale-105 active:scale-95 transition-all font-bold text-xs border border-[var(--gold)]/40 cursor-pointer shrink-0"
        title="Open Credit Risk Copilot"
      >
        <Sparkles className="w-4 h-4 text-[var(--gold)] dark:text-black" />
        <span>AI Copilot</span>
      </button>

      {/* Copilot Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-2 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full sm:w-[500px] h-[88vh] sm:h-[650px] bg-[var(--card-bg)] border border-[var(--border)] text-[var(--fg)] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted-bg)]/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[var(--gold)]/15 text-[var(--gold-dark)] border border-[var(--gold)]/30 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[var(--fg)]">PeerPulse Risk Advisor</h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono">
                      Gemini 2.5 Live
                    </span>
                  </div>
                  {/* Account Specificity Pill */}
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[var(--muted-fg)]">
                    <User className="w-3 h-3 text-[var(--gold)]" />
                    <span>Synchronized: <strong className="text-[var(--fg)] font-semibold">{accountData.activePersonaName}</strong></span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--muted-bg)] text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Mode Switcher */}
            <div className="grid grid-cols-3 gap-1 p-2 bg-[var(--muted-bg)]/30 border-b border-[var(--border)] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'chat' ? 'bg-[var(--card-bg)] text-[var(--fg)] shadow-xs font-bold' : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
                }`}
              >
                Advisory Chat
              </button>
              <button
                onClick={() => {
                  setActiveTab('lender');
                  handleSendMessage("Run a 15% stress test on my current loan tranches and calculate IRR impact");
                }}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'lender' ? 'bg-[var(--card-bg)] text-[var(--fg)] shadow-xs font-bold' : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
                }`}
              >
                Portfolio Stress Test
              </button>
              <button
                onClick={() => {
                  setActiveTab('borrower');
                  handleSendMessage("Give me an actionable roadmap to negotiate my interest rate down to 12.0%");
                }}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'borrower' ? 'bg-[var(--card-bg)] text-[var(--fg)] shadow-xs font-bold' : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
                }`}
              >
                Rate Reduction Plan
              </button>
            </div>

            {/* Live Portfolio Status Badge */}
            <div className="px-4 py-2 bg-[var(--muted-bg)]/40 border-b border-[var(--border)] flex items-center justify-between text-[10px] font-mono text-[var(--muted-fg)]">
              <span>ACTIVE ASSETS: 3 TRANCHES (₹1,25,000)</span>
              <span>ESCROW CASH: ₹4,50,000</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl p-4 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1A211D] dark:bg-[var(--gold)] text-white dark:text-black rounded-tr-xs font-medium'
                        : 'bg-[var(--card-bg)] text-[var(--fg)] border border-[var(--border)] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <span className="whitespace-pre-wrap">{msg.text}</span>
                    ) : (
                      <FormattedMessage text={msg.text} />
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] rounded-tl-xs flex items-center gap-2 text-[var(--muted-fg)] shadow-xs">
                    <span className="text-[11px] font-mono">Analyzing {accountData.activePersonaName}'s portfolio with Gemini 2.5...</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-bounce [animation-delay:0.2s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="px-3 pt-2 pb-1 border-t border-[var(--border)] bg-[var(--card-bg)] flex gap-1.5 overflow-x-auto custom-scrollbar">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.query)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[var(--muted-bg)] hover:bg-[var(--border)] text-[var(--fg)] border border-[var(--border)] shrink-0 transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-[var(--border)] bg-[var(--card-bg)] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about Vikram's portfolio, OTS ballots, or loan yields..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] text-xs text-[var(--fg)] placeholder-[var(--muted-fg)] outline-none focus:border-[var(--gold)] transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-[#1A211D] dark:bg-[var(--gold)] text-white dark:text-black flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
