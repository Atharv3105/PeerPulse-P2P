import React from "react";

export default function ProgressBar({
  value = 0,
  funded,
  target,
  showLabel = true,
  height = "h-2.5",
  className = "",
}) {
  const clamped = Math.min(Math.max(value, 0), 100);

  const getBarColor = () => {
    if (clamped >= 100) return "var(--grade-a)";
    if (clamped >= 50) return "var(--accent)";
    return "var(--grade-b)";
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {showLabel && (funded || target) && (
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-semibold" style={{ color: "var(--fg)" }}>
            {funded} <span className="text-[var(--muted-fg)] font-sans">funded</span>
          </span>
          <span className="text-[var(--muted-fg)]">
            target <span className="font-semibold" style={{ color: "var(--fg)" }}>{target}</span>
          </span>
        </div>
      )}

      <div
        className={`w-full ${height} rounded-full overflow-hidden`}
        style={{ backgroundColor: "var(--muted-bg)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            backgroundColor: getBarColor(),
          }}
        />
      </div>
    </div>
  );
}
