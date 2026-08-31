import React, { useState, useEffect, useRef } from 'react';
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

  return (
    <div ref={containerRef} className="relative">
      {/* Popover Control Panel (Appears upwards when clicked) */}
      {isOpen && (
        <div className="absolute bottom-14 left-0 sm:-left-6 w-80 sm:w-96 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-[var(--gold)]/40 bg-[var(--card-bg)]/98 backdrop-blur-xl shadow-2xl p-4 text-xs space-y-3.5 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--gold)]/10 text-[var(--gold-dark)] flex items-center justify-center border border-[var(--gold)]/20">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-xs text-[var(--fg)] flex items-center gap-1.5">
                  <span>Portfolio Time Machine</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                    LIVE
                  </span>
                </div>
                <div className="text-[10px] text-[var(--muted-fg)]">
                  Simulate real-world date progression & DPD
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[var(--muted-bg)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Date Ribbon */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-[var(--muted-fg)]">
              <Calendar className="w-3.5 h-3.5 text-[var(--gold-dark)]" />
              <span>Simulated Date:</span>
            </div>
            <div className="font-bold text-[var(--fg)]">
              {status.simulatedDate} <span className="text-[var(--gold-dark)]">(Day +{status.daysOffset})</span>
            </div>
          </div>

          {/* Action Fast-Forward Tiles */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-fg)] font-semibold">
              Fast-Forward Controls
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* +30 Days (Primary) */}
              <button
                type="button"
                onClick={() => handleFastForward(30)}
                disabled={loading}
                className="p-2.5 rounded-xl border border-[var(--gold)]/50 bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 text-left transition-all cursor-pointer disabled:opacity-50 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--gold)]/20 text-[var(--gold-dark)]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--gold-dark)] text-xs">
                      +30 Days (Monthly NACH Cycle)
                    </div>
                    <div className="text-[10px] text-[var(--muted-fg)]">
                      Executes monthly sweeps, accrues 18% penal, triggers Stage 2/3
                    </div>
                  </div>
                </div>
                <FastForward className="w-4 h-4 text-[var(--gold-dark)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* +7 Days */}
                <button
                  type="button"
                  onClick={() => handleFastForward(7)}
                  disabled={loading}
                  className="p-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--gold)]/60 text-left transition-all cursor-pointer disabled:opacity-50"
                >
                  <div className="font-bold text-xs text-[var(--fg)] flex items-center gap-1">
                    <FastForward className="w-3 h-3 text-amber-500" />
                    <span>+7 Days</span>
                  </div>
                  <div className="text-[10px] text-[var(--muted-fg)]">
                    Grace window & initial bounces
                  </div>
                </button>

                {/* +90 Days */}
                <button
                  type="button"
                  onClick={() => handleFastForward(90)}
                  disabled={loading}
                  className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-left transition-all cursor-pointer disabled:opacity-50"
                >
                  <div className="font-bold text-xs text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>+90 Days</span>
                  </div>
                  <div className="text-[10px] text-[var(--muted-fg)]">
                    Stage 4 NPA & CIBIL report
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Feedback Toast Inside Panel */}
          {lastAction && (
            <div className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{lastAction.text}</span>
            </div>
          )}

          {/* Reset Baseline Seed Button */}
          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Reset to Day 0 (Baseline Seed)</span>
            </button>
            <span className="text-[10px] text-[var(--muted-fg)] font-mono">180 MSMEs</span>
          </div>
        </div>
      )}

      {/* Floating Launcher Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 flex items-center gap-2 px-3.5 rounded-full shadow-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md shrink-0"
        style={{
          backgroundColor: dark ? "#14181F" : "#FFFFFF",
          borderColor: isOpen ? "var(--gold)" : dark ? "rgba(212, 175, 55, 0.5)" : "rgba(0, 0, 0, 0.15)",
          color: "var(--gold-dark)",
        }}
        title="Open Portfolio Time Machine"
      >
        <div className="relative flex items-center justify-center">
          <Clock className="w-4 h-4 text-[var(--gold-dark)]" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <span className="font-mono font-bold text-xs text-[var(--fg)]">
          Day +{status.daysOffset}
        </span>
        <span className="text-[10px] text-[var(--muted-fg)] hidden sm:inline font-mono">
          ({status.simulatedDate})
        </span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-fg)]" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-[var(--muted-fg)]" />
        )}
      </button>
    </div>
  );
}
