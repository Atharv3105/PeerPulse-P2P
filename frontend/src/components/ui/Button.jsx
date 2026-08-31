import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  style = {},
  onClick,
  type = "button",
  icon,
  ...props
}) {
  const sizeMap = {
    sm: "px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5",
    md: "px-4 py-2.5 text-sm font-semibold rounded-xl gap-2",
    lg: "px-6 py-3.5 text-base font-bold rounded-2xl gap-2.5",
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "var(--accent)",
          color: "#ffffff",
          boxShadow: "0 4px 14px 0 var(--accent-ring)",
        };
      case "secondary":
        return {
          backgroundColor: "var(--accent-soft)",
          color: "var(--accent)",
          border: "1px solid var(--accent-ring)",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: "var(--fg)",
          border: "1px solid var(--border)",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: "var(--muted-fg)",
        };
      case "approve":
        return {
          backgroundColor: "var(--grade-a)",
          color: "#ffffff",
          boxShadow: "0 4px 14px 0 rgba(5, 150, 105, 0.3)",
        };
      case "danger":
      case "reject":
        return {
          backgroundColor: "var(--grade-x)",
          color: "#ffffff",
          boxShadow: "0 4px 14px 0 rgba(220, 38, 38, 0.3)",
        };
      default:
        return {};
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${sizeMap[size]} ${className}`}
      style={{
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
