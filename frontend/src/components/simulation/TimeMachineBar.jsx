import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  FastForward, RotateCcw, Calendar, Zap, AlertTriangle, 
  CheckCircle2, ChevronUp, ChevronDown, Sparkles, Clock, X 
} from 'lucide-react';
import { api } from '../../services/api';
import NotificationService from '../../services/notificationService';

export default function TimeMachineBar({ dark, onTimelineChange }) {
  const [status, setStatus] = useState({ daysOffset: 0, simulatedDate: '2026-03-01' });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const containerRef = useRef(null);

  const fetchStatus = async () => {
    const s = await api.getSimulationStatus();
    setStatus(s);
  };

  useEffect(() => {
    fetchStatus();

    // Close when clicking outside
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFastForward = async (days) => {
    setLoading(true);
    try {
      const res = await api.fastForwardTime(days);
      setStatus({ daysOffset: res.totalDaysOffset, simulatedDate: res.simulatedDate });
      setLastAction({
        type: 'FAST_FORWARD',
        text: `+${days}d: ${res.transitionedDelayed} Delayed, ₹${res.totalPenalAccrued.toLocaleString('en-IN')} Penal Accrued`,
        timestamp: new Date()
      });

      // Dispatch global window event so any active page (Marketplace, Admin, Lender) auto-refreshes
      window.dispatchEvent(new CustomEvent('peerpulse-timeline-advanced', { detail: res }));
      if (onTimelineChange) onTimelineChange(res);

      // Trigger Native OS Desktop Notification
      NotificationService.notifyTimelineAdvance({
        days,
        simulatedDate: res.simulatedDate,
        daysOffset: res.totalDaysOffset
      });

      setTimeout(() => setLastAction(null), 6000);
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset platform timeline back to Day 0 (baseline seed state)?')) return;
    setLoading(true);
    try {
      const res = await api.resetTimeline();
      setStatus({ daysOffset: 0, simulatedDate: res.simulatedDate });
      setLastAction({
        type: 'RESET',
        text: 'Timeline reset to Day 0 • Baseline dataset restored',
        timestamp: new Date()
      });
      window.dispatchEvent(new CustomEvent('peerpulse-timeline-advanced', { detail: { reset: true } }));
      if (onTimelineChange) onTimelineChange({ reset: true });
      setTimeout(() => {
        setLastAction(null);
        window.location.reload();
      }, 1500);
    } catch (err) {
      alert('Reset error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = isOpen ? (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--gold)]/40 bg-[var(--card-bg)] text-[var(--fg)] shadow-2xl p-6 text-xs space-y-4 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--gold)]/10 text-[var(--gold-dark)] flex items-center justify-center border border-[var(--gold)]/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-[var(--fg)] flex items-center gap-1.5">
                <span>Portfolio Time Machine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-bold">
                  LIVE
                </span>
              </div>
              <div className="text-[11px] text-[var(--muted-fg)]">
                Simulate real-world date progression, NACH sweeps & DPD
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[var(--muted-bg)] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Date Ribbon */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--border)] font-mono text-xs">
          <div className="flex items-center gap-2 text-[var(--muted-fg)]">
            <Calendar className="w-4 h-4 text-[var(--gold-dark)]" />
            <span>Simulated Date:</span>
          </div>
          <div className="font-bold text-[var(--fg)] text-sm">
            {status.simulatedDate} <span className="text-[var(--gold-dark)]">(Day +{status.daysOffset})</span>
          </div>
        </div>

        {/* Action Fast-Forward Tiles */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-fg)] font-bold">
            Advance Timeline
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* +30 Days (Primary) */}
            <button
              type="button"
              onClick={() => handleFastForward(30)}
              disabled={loading}
              className="p-3 rounded-2xl border border-[var(--gold)]/50 bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 text-left transition-all cursor-pointer disabled:opacity-50 flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[var(--gold)]/20 text-[var(--gold-dark)]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[var(--gold-dark)] text-xs">
                    +30 Days (Monthly NACH Cycle)
                  </div>
                  <div className="text-[10px] text-[var(--muted-fg)]">
                    Executes monthly sweeps, accrues 18% penal, advances loan stages
                  </div>
                </div>
              </div>
              <FastForward className="w-4 h-4 text-[var(--gold-dark)] shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* +7 Days */}
              <button
                type="button"
                onClick={() => handleFastForward(7)}
                disabled={loading}
                className="p-2.5 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--gold)]/60 text-left transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="font-bold text-xs text-[var(--fg)] flex items-center gap-1.5">
                  <FastForward className="w-3.5 h-3.5 text-amber-500" />
                  <span>+7 Days</span>
                </div>
                <div className="text-[10px] text-[var(--muted-fg)] mt-0.5">
                  Grace window & initial bounces
                </div>
              </button>

              {/* +90 Days */}
              <button
                type="button"
                onClick={() => handleFastForward(90)}
                disabled={loading}
                className="p-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-left transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>+90 Days</span>
                </div>
                <div className="text-[10px] text-[var(--muted-fg)] mt-0.5">
                  Stage 4 NPA & recovery triggers
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Toast Inside Panel */}
        {lastAction && (
          <div className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-3.5 py-2.5 rounded-2xl border border-emerald-500/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{lastAction.text}</span>
          </div>
        )}

        {/* Reset Baseline Seed Button */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset to Day 0</span>
          </button>
          <span className="text-[10px] text-[var(--muted-fg)] font-mono">180 MSMEs • 322 Loans</span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="relative">
      {typeof document !== 'undefined' && createPortal(modalContent, document.body)}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-9 flex items-center gap-2 px-3 rounded-xl border border-[var(--border)] bg-[var(--muted-bg)]/50 hover:border-[var(--gold)] active:scale-95 cursor-pointer shrink-0 font-mono text-xs font-bold text-[var(--fg)] transition-all"
        title="Open Portfolio Time Machine"
      >
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        <span>Day +{status.daysOffset}</span>
        <span className="text-[10px] text-[var(--muted-fg)] hidden md:inline font-normal">
          ({status.simulatedDate})
        </span>
      </button>
    </div>
  );
}
