import React, { useState, useEffect } from 'react';
import { Radio, Play, Pause, TrendingUp, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export default function MarketplaceTicker({ onTrancheFunded }) {
  const [activities, setActivities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLivePulsing, setIsLivePulsing] = useState(true);

  const fetchActivities = async () => {
    const feed = await api.getActivityFeed();
    if (feed && feed.length > 0) {
      setActivities(feed);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Cycle through feed items every 3.5 seconds
  useEffect(() => {
    if (activities.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [activities]);

  // Periodic Micro-Investment Auto-Pulse
  useEffect(() => {
    if (!isLivePulsing) return;

    const pulseInterval = setInterval(async () => {
      try {
        const res = await api.pulseInvestment();
        if (res) {
          fetchActivities();
          if (onTrancheFunded) onTrancheFunded(res);
        }
      } catch (err) {
        // silent fail on pulse simulation
      }
    }, 6000); // every 6 seconds

    return () => clearInterval(pulseInterval);
  }, [isLivePulsing]);

  const currentItem = activities[currentIndex] || {
    badge: 'LIVE',
    text: 'Connecting to PeerPulse Fractional Tranche Matchmaker Engine...'
  };

  return (
    <div className="rounded-2xl border border-[var(--gold)]/30 bg-[var(--card-bg)] shadow-sm px-3 sm:px-4 py-2 text-xs flex items-center justify-between gap-3 overflow-hidden">
      {/* Left Beacon */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2 w-2">
          {isLivePulsing && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isLivePulsing ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
        </span>
        <span className="font-mono font-bold text-[11px] text-[var(--gold-dark)] uppercase tracking-wider hidden sm:inline">
          Live Tranche Feed
        </span>
      </div>

      {/* Center Scrolling / Fading Item */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--gold)]/10 text-[var(--gold-dark)] border border-[var(--gold)]/20 shrink-0">
          {currentItem.badge || 'TRANCHE'}
        </span>
        <p className="truncate text-xs text-[var(--fg)] font-medium transition-all duration-300">
          {currentItem.text}
        </p>
      </div>

      {/* Right Controls: Pulse Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setIsLivePulsing(!isLivePulsing)}
          className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
            isLivePulsing
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-[var(--muted-bg)] border-[var(--border)] text-[var(--muted-fg)] hover:text-[var(--fg)]'
          }`}
          title={isLivePulsing ? "Pause simulated live investments" : "Resume simulated live investments"}
        >
          {isLivePulsing ? (
            <>
              <Pause className="w-3 h-3" />
              <span className="hidden sm:inline">Live Pulse: ON</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              <span className="hidden sm:inline">Live Pulse: PAUSED</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
