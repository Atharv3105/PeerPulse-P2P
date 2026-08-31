import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ dark, onToggleTheme, size = 'normal' }) {
  if (!onToggleTheme) return null;

  return (
    <div
      className={`flex items-center p-0.5 rounded-full border text-xs font-semibold shrink-0 transition-all ${
        size === 'sm' ? 'scale-90' : ''
      }`}
      style={{
        backgroundColor: dark ? "#0E1217" : "#ECE4DC",
        borderColor: dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
      }}
      title="Toggle Light / Dark Mode"
    >
      <button
        type="button"
        onClick={() => {
          if (!dark) onToggleTheme();
        }}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
          dark
            ? "bg-[#182232] text-blue-400 font-bold shadow-sm"
            : "text-[#717882] hover:text-[#181B18]"
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </button>

      <button
        type="button"
        onClick={() => {
          if (dark) onToggleTheme();
        }}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
          !dark
            ? "bg-[#FDFBF7] text-amber-700 font-bold shadow-sm"
            : "text-[#717882] hover:text-[#FFFFFF]"
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Light</span>
      </button>
    </div>
  );
}
