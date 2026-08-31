import React from "react";

export function GradeBadge({ grade, size = "md" }) {
  const g = (grade || "A").toUpperCase();
  const config = {
    A: {
      label: "Grade A",
      sublabel: "Prime · 750–900",
      color: "var(--grade-a)",
      bg: "var(--grade-a-soft)",
      border: "rgba(5, 150, 105, 0.35)",
    },
    B: {
      label: "Grade B",
      sublabel: "Standard · 650–749",
      color: "var(--grade-b)",
      bg: "var(--grade-b-soft)",
      border: "rgba(37, 99, 235, 0.35)",
    },
    C: {
      label: "Grade C",
      sublabel: "Subprime · 550–649",
      color: "var(--grade-c)",
      bg: "var(--grade-c-soft)",
      border: "rgba(217, 119, 6, 0.35)",
    },
    DECLINED: {
      label: "Declined",
      sublabel: "< 550 · High Risk",
      color: "var(--grade-x)",
      bg: "var(--grade-x-soft)",
      border: "rgba(220, 38, 38, 0.35)",
    },
  };

  const item = config[g] || config.A;

  if (size === "sm") {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono tracking-tight"
        style={{
          color: item.color,
          backgroundColor: item.bg,
          border: `1px solid ${item.border}`,
        }}
      >
        {item.label}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold"
      style={{
        color: item.color,
        backgroundColor: item.bg,
        border: `1px solid ${item.border}`,
      }}
    >
      <span className="font-bold font-mono">{item.label}</span>
      <span className="opacity-70 text-[11px] font-sans">({item.sublabel})</span>
    </span>
  );
}

export function StatusBadge({ status, size = "md" }) {
  const s = (status || "ACTIVE").toUpperCase();
  const config = {
    ACTIVE: {
      label: "Active",
      color: "var(--s-active)",
      bg: "var(--s-active-soft)",
      pulse: true,
    },
    LISTED: {
      label: "Listed",
      color: "var(--accent)",
      bg: "var(--accent-soft)",
      pulse: true,
    },
    FUNDED: {
      label: "Funded",
      color: "var(--grade-a)",
      bg: "var(--grade-a-soft)",
      pulse: false,
    },
    SCORING: {
      label: "Scoring",
      color: "var(--grade-b)",
      bg: "var(--grade-b-soft)",
      pulse: true,
    },
    DELAYED: {
      label: "Delayed (1–30 DPD)",
      color: "var(--s-delayed)",
      bg: "var(--s-delayed-soft)",
      pulse: true,
    },
    AT_RISK: {
      label: "At Risk (31–89 DPD)",
      color: "var(--s-risk)",
      bg: "var(--s-risk-soft)",
      pulse: true,
    },
    NPA: {
      label: "NPA (90+ DPD)",
      color: "var(--s-npa)",
      bg: "var(--s-npa-soft)",
      pulse: false,
    },
    SETTLED: {
      label: "Settled (OTS)",
      color: "var(--s-settled)",
      bg: "var(--s-settled-soft)",
      pulse: false,
    },
    CLOSED: {
      label: "Closed (Repaid)",
      color: "var(--s-active)",
      bg: "var(--s-active-soft)",
      pulse: false,
    },
    BLOCKED: {
      label: "Blocked",
      color: "var(--s-blocked)",
      bg: "var(--s-blocked-soft)",
      pulse: false,
    },
    MONITOR: {
      label: "Monitoring",
      color: "var(--s-monitor)",
      bg: "var(--s-monitor-soft)",
      pulse: true,
    },
  };

  const item = config[s] || {
    label: s,
    color: "var(--muted-fg)",
    bg: "var(--muted-bg)",
    pulse: false,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{
        color: item.color,
        backgroundColor: item.bg,
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.pulse ? "animate-pulse" : ""}`}
        style={{ backgroundColor: item.color }}
      />
      <span>{item.label}</span>
    </span>
  );
}

export function FraudCautionBadge({ label = "Caution: Signal Delta" }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{
        color: "var(--grade-c)",
        backgroundColor: "var(--grade-c-soft)",
        border: "1px solid rgba(217, 119, 6, 0.35)",
      }}
    >
      <span>⚠</span>
      <span>{label}</span>
    </span>
  );
}
