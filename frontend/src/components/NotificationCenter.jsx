import React, { useState } from 'react';
import { 
  Bell, MessageSquare, Mail, Smartphone, X, 
  CheckCheck, Clock, ShieldAlert, AlertTriangle, Coins, Landmark 
} from 'lucide-react';

export default function NotificationCenter({ dark }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState('ALL'); // ALL, SMS, WHATSAPP, EMAIL

  // Mock Multi-Channel Notification Stream
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      channel: 'WHATSAPP',
      recipient: 'Priya Sharma (+91 98765 43210)',
      type: 'DISBURSEMENT',
      title: 'PeerPulse Escrow Disbursement Confirmed',
      message: 'Namaste Priya! Your working capital loan of ₹5,00,000 has been 100% funded across 10 verified fractional lenders. Amount credited to HDFC A/c ••••9283 via IDFC Escrow Trustee.',
      timestamp: '2 mins ago',
      rbiCode: 'RBI/FPC/2023-09'
    },
    {
      id: 'notif-2',
      channel: 'SMS',
      recipient: 'Amit Deshmukh (+91 98230 11920)',
      type: 'EWS_ALERT',
      title: 'Business Health Check Notice',
      message: 'Dear Amit, PeerPulse telemetry noticed a 30% drop in recent weekly UPI turnover. Proactive tenure restructuring is available in your borrower dashboard without CIBIL impact.',
      timestamp: '15 mins ago',
      rbiCode: 'RBI/EWS/HEALTH-CHECK'
    },
    {
      id: 'notif-3',
      channel: 'EMAIL',
      recipient: 'Vikram Sethi (vikram@investor.com)',
      type: 'OTS_VOTE',
      title: 'Action Required: OTS Settlement Ballot for Loan LN-AMIT-710',
      message: 'Borrower Deshmukh Precision Engineering has proposed a 70% One-Time Settlement (OTS) recovery. 7-Day voting window open. Click to record your tranche vote.',
      timestamp: '1 hour ago',
      rbiCode: 'RBI/OTS/60PCT-MANDATE'
    },
    {
      id: 'notif-4',
      channel: 'SMS',
      recipient: 'Priya Sharma (+91 98765 43210)',
      type: 'NACH_SCHEDULE',
      title: 'e-NACH Mandate Registration Successful',
      message: 'UMRN NPCI-NACH-MND-892182 registered on HDFC Bank. First EMI of ₹44,580 scheduled for 5th of next month.',
      timestamp: '2 hours ago',
      rbiCode: 'NPCI/eMND/CONFIRM'
    }
  ]);

  const filtered = notifications.filter(n => activeChannel === 'ALL' || n.channel === activeChannel);

  return (
    <div className="relative">
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-10 w-10 rounded-full shadow-lg border flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        style={{
          backgroundColor: dark ? "#14181F" : "#FFFFFF",
          borderColor: dark ? "rgba(212, 175, 55, 0.4)" : "rgba(0, 0, 0, 0.15)",
          color: "#D4AF37",
        }}
        title="Multi-Channel Notification Gateway (Live Simulator)"
      >
        <div className="relative flex items-center justify-center">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center font-mono animate-pulse">
            {notifications.length}
          </span>
        </div>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div 
            className="w-full max-w-md h-full bg-[var(--card-bg)] border-l border-[var(--border)] shadow-2xl flex flex-col overflow-hidden text-[var(--fg)] animate-slideLeft"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted-bg)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  📡
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[var(--fg)]">
                    Notification Gateway
                  </h3>
                  <p className="text-[10px] text-[var(--muted-fg)]">Multi-Channel Dispatches (Twilio / SendGrid Simulator)</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--card-bg)] text-[var(--muted-fg)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Channel Filters */}
            <div className="p-3 border-b border-[var(--border)] flex items-center gap-1.5 overflow-x-auto text-xs">
              {[
                { id: 'ALL', label: 'All Channels' },
                { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
                { id: 'SMS', label: 'SMS', icon: Smartphone },
                { id: 'EMAIL', label: 'Email', icon: Mail }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChannel(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    activeChannel === tab.id
                      ? 'bg-[#1A211D] text-white dark:bg-[var(--gold)] dark:text-black border-transparent shadow-sm'
                      : 'bg-[var(--muted-bg)] text-[var(--muted-fg)] border-[var(--border)] hover:text-[var(--fg)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
              {filtered.map(notif => (
                <div 
                  key={notif.id}
                  className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--muted-bg)] space-y-2 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase font-mono ${
                      notif.channel === 'WHATSAPP' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                      notif.channel === 'SMS' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' :
                      'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                    }`}>
                      {notif.channel}
                    </span>
                    <span className="text-[10px] text-[var(--muted-fg)] font-mono">{notif.timestamp}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold font-serif text-[var(--fg)] leading-tight">{notif.title}</h4>
                    <p className="text-[11px] text-[var(--muted-fg)] mt-1 leading-relaxed">{notif.message}</p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--muted-fg)] font-mono">
                    <span className="truncate max-w-[180px]">To: {notif.recipient}</span>
                    <span className="text-emerald-500 flex items-center gap-1 font-bold">
                      <CheckCheck className="w-3.5 h-3.5" />
                      Delivered
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Notice */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--muted-bg)] text-center text-[10px] text-[var(--muted-fg)]">
              Strictly adheres to RBI Fair Practices Code (FPC) Multi-Channel Messaging Standards.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
