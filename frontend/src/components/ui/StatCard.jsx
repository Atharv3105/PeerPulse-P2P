import React from "react";
import Card from "./Card";

export default function StatCard({
  label,
  value,
  delta,
  deltaPositive,
  icon,
  mono = false,
  accentValue = false,
  sublabel,
  className = "",
}) {
  return (
    <Card variant="base" padding="md" className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
            style={{
              backgroundColor: "var(--accent-soft)",
              color: "var(--accent)",
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div>
        <div
          className={`text-2xl font-black leading-tight ${mono ? "font-mono tabular-nums tracking-tight" : "font-display"}`}
          style={{
            color: accentValue ? "var(--accent)" : "var(--fg)",
          }}
        >
          {value}
        </div>
        {sublabel && (
          <p className="text-xs text-[var(--muted-fg)] mt-0.5">{sublabel}</p>
        )}
      </div>

      {delta && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-[var(--border)] text-xs">
          {deltaPositive !== undefined && (
            <span
              className="font-bold text-[11px]"
              style={{
                color: deltaPositive ? "var(--grade-a)" : "var(--grade-x)",
              }}
            >
              {deltaPositive ? "↑" : "↓"}
            </span>
          )}
          <span
            className="font-medium text-[11px]"
            style={{
              color:
                deltaPositive === true
                  ? "var(--grade-a)"
                  : deltaPositive === false
                  ? "var(--grade-x)"
                  : "var(--muted-fg)",
            }}
          >
            {delta}
          </span>
        </div>
      )}
    </Card>
  );
}
