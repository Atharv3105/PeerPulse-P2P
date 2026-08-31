import React from "react";

export default function Card({
  children,
  variant = "base",
  padding = "md",
  className = "",
  style = {},
  onClick,
  ...props
}) {
  const paddingMap = {
    none: "p-0",
    sm: "p-3",
    md: "p-5",
    lg: "p-7",
  };

  const variantStyles = {
    base: {
      backgroundColor: "var(--card-bg)",
      color: "var(--card-fg)",
      borderColor: "var(--border)",
      boxShadow: "var(--shadow-card)",
    },
    glass: {
      backgroundColor: "var(--glass-bg)",
      color: "var(--card-fg)",
      borderColor: "var(--glass-border)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      boxShadow: "var(--shadow-elevated)",
    },
    flat: {
      backgroundColor: "var(--muted-bg)",
      color: "var(--card-fg)",
      borderColor: "var(--border)",
    },
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border transition-all duration-200 ${paddingMap[padding]} ${className}`}
      style={{
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
