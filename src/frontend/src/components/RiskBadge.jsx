import React from "react";

export function RiskBadge({ level }) {
  const norm = String(level || "LOW").toLowerCase().trim();
  
  let badgeClass = "low";
  let label = "LOW";

  if (norm.includes("crit")) {
    badgeClass = "critical";
    label = "CRITICAL";
  } else if (norm.includes("high")) {
    badgeClass = "high";
    label = "HIGH";
  } else if (norm.includes("med") || norm.includes("warn")) {
    badgeClass = "medium";
    label = "MEDIUM";
  } else {
    badgeClass = "low";
    label = "LOW";
  }

  return (
    <span className={`risk-badge ${badgeClass}`}>
      <span>●</span>
      <span>{label}</span>
    </span>
  );
}
