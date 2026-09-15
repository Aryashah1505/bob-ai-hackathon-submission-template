import React, { useState, useEffect } from "react";
import { RefreshCw, ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";

export function TopBar({ title, systemStatus, onRefresh, loading, lastUpdatedDate, lastUpdatedTime }) {
  const [relativeTime, setRelativeTime] = useState("just now");

  useEffect(() => {
    function computeRelative() {
      if (!lastUpdatedDate) {
        setRelativeTime(null);
        return;
      }
      const diffSeconds = Math.floor((new Date() - new Date(lastUpdatedDate)) / 1000);
      if (diffSeconds < 45) {
        setRelativeTime("just now");
      } else if (diffSeconds < 120) {
        setRelativeTime("1 minute ago");
      } else if (diffSeconds < 3600) {
        setRelativeTime(`${Math.floor(diffSeconds / 60)} minutes ago`);
      } else if (diffSeconds < 7200) {
        setRelativeTime("1 hour ago");
      } else {
        setRelativeTime(`${Math.floor(diffSeconds / 3600)} hours ago`);
      }
    }

    computeRelative();
    const interval = setInterval(computeRelative, 30000);
    return () => clearInterval(interval);
  }, [lastUpdatedDate]);

  const getStatusBadge = () => {
    if (systemStatus === "Critical Now") {
      return (
        <div className="system-status-indicator critical" role="status" aria-label="System status: Critical">
          <AlertOctagon size={14} />
          <span className="status-dot pulse"></span>
          <span>Critical</span>
        </div>
      );
    }
    if (systemStatus === "Elevated Risk") {
      return (
        <div className="system-status-indicator warning" role="status" aria-label="System status: Elevated Risk">
          <AlertTriangle size={14} />
          <span className="status-dot pulse"></span>
          <span>Elevated Risk</span>
        </div>
      );
    }
    return (
      <div className="system-status-indicator" role="status" aria-label="System status: Monitoring">
        <ShieldCheck size={14} />
        <span className="status-dot"></span>
        <span>Monitoring</span>
      </div>
    );
  };

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <div className="page-title-badge">
          <span>Grid Operations</span>
          <span style={{ color: "var(--text-dim)" }}>/</span>
          <span style={{ color: "var(--cyan)" }}>{title}</span>
        </div>
      </div>

      <div className="top-bar-right">
        {getStatusBadge()}

        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          {lastUpdatedTime ? (
            <span>
              Updated {lastUpdatedTime} {relativeTime ? `(${relativeTime})` : ""}
            </span>
          ) : (
            <span>Last update unavailable</span>
          )}
        </div>

        <button 
          className="btn-icon" 
          onClick={onRefresh} 
          disabled={loading}
          aria-label="Refresh grid operational data"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>{loading ? "Syncing..." : "Sync"}</span>
        </button>
      </div>
    </header>
  );
}
