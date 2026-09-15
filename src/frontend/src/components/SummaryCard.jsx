import React from "react";

export function SummaryCard({ 
  label, 
  value, 
  supportingText, 
  icon: Icon, 
  accentColor = "var(--cyan)", 
  onClick, 
  ariaLabel, 
  children,
  clickable = false
}) {
  const handleKeyDown = (e) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className={`kpi-card ${clickable ? "clickable-card" : ""}`}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel || label}
    >
      <div>
        <div className="kpi-header">
          <span className="kpi-label">{label}</span>
          <div className="kpi-icon-wrap" style={{ background: `rgba(${accentColor}, 0.12)`, color: `rgb(${accentColor})` }}>
            {Icon && <Icon size={18} />}
          </div>
        </div>
        <div className="kpi-value">{value}</div>
      </div>
      {children}
      <div className="kpi-supporting">{supportingText}</div>
    </div>
  );
}
