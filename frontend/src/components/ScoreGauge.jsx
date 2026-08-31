import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

export default function ScoreGauge({ score = 750, grade = 'A', confidence = 'High', fraudRiskFlag = 'None' }) {
  const minScore = 300;
  const maxScore = 900;
  const clampedScore = Math.min(Math.max(score, minScore), maxScore);
  const percentage = ((clampedScore - minScore) / (maxScore - minScore)) * 100;
  
  // Angle for SVG arc (180 degree semi-circle from 180 to 360)
  const strokeDashoffset = 440 - (440 * percentage) / 100;

  const getGradeColor = () => {
    switch (grade) {
      case 'A': return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', stroke: '#10B981', glowClass: 'glass-card-green', label: 'Prime' };
      case 'B': return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/40', stroke: '#3B82F6', glowClass: 'glass-card-blue', label: 'Standard' };
      case 'C': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/40', stroke: '#F59E0B', glowClass: 'glass-card-yellow', label: 'Subprime' };
      default: return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/40', stroke: '#EF4444', glowClass: 'glass-card-red', label: 'Declined' };
    }
  };

  const style = getGradeColor();

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${style.glowClass}`}>
      {/* Background radial glow */}
      <div 
        className="absolute w-52 h-52 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ backgroundColor: style.stroke }}
      />

      <div className="relative w-64 h-36 flex items-center justify-center">
        <svg className="w-64 h-64 -rotate-90 transform" viewBox="0 0 200 200">
          {/* Background Track with inset look */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="#0f172a"
            strokeWidth="14"
            strokeDasharray="220"
            strokeDashoffset="0"
          />
          {/* Animated Value Arc with vibrant stroke */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke={style.stroke}
            strokeWidth="14"
            strokeDasharray="220"
            strokeDashoffset={220 - (220 * percentage) / 100}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute top-14 flex flex-col items-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-white font-mono tabular-nums">
            {clampedScore}
          </span>
          <span className="text-xs text-slate-400 font-medium mt-0.5">ACIE Composite (300–900)</span>
        </div>
      </div>

      {/* Grade and Confidence Pills */}
      <div className="flex items-center gap-3 mt-4">
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${style.bg} ${style.border} ${style.text}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          Grade {grade} • {style.label}
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/90 text-slate-300 border border-slate-700/80 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {confidence} Confidence
        </div>

        {fraudRiskFlag !== 'None' && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
            fraudRiskFlag === 'Block' ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-sm shadow-rose-500/30' : 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm shadow-amber-500/30'
          }`}>
            <AlertTriangle className="w-3 h-3" />
            {fraudRiskFlag} Flag
          </div>
        )}
      </div>
    </div>
  );
}
