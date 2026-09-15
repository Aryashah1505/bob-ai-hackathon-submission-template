import React from "react";
import { AlertTriangle, Bell, CloudLightning, ShieldAlert, Cpu, CheckCircle2 } from "lucide-react";
import { RiskBadge } from "../components/RiskBadge";

export function Alerts({ alertsData, onSelectAsset, onNavigate, selectedCompany }) {
  const threats = alertsData?.alerts || [];
  const criticalThreats = threats.filter((t) => (t.risk_score || 0) >= 70 || t.risk_level?.toUpperCase() === "CRITICAL" || t.risk_level?.toUpperCase() === "HIGH");
  const moderateThreats = threats.filter((t) => (t.risk_score || 0) >= 35 && (t.risk_score || 0) < 70);

  return (
    <div className="page-container">
      {/* Overview Header */}
      <div className="glass-panel" style={{ marginBottom: "1.5rem", padding: "1.15rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Active Grid Risk Alerts & Threat Intelligence {selectedCompany ? `(${selectedCompany.name})` : ""}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Real-time failure risk detections scoped strictly to {selectedCompany?.name || "active company"}.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span style={{ padding: "0.35rem 0.75rem", borderRadius: "var(--radius-sm)", background: criticalThreats.length > 0 ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", color: criticalThreats.length > 0 ? "#f87171" : "#34d399", fontSize: "0.8rem", fontWeight: 700 }}>
              {criticalThreats.length} Critical Alarms
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-main">
        {/* Critical Alarms */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <ShieldAlert size={18} className="panel-title-icon" style={{ color: "var(--red)" }} />
              <span>Critical Equipment Risk Alerts ({criticalThreats.length})</span>
            </h3>
            <span className="panel-subtitle">Immediate Inspection Required</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {criticalThreats.length > 0 ? (
              criticalThreats.map((t) => (
                <div 
                  key={t.id}
                  style={{
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    padding: "1rem",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    onSelectAsset({ id: t.asset_id, name: t.asset_name, substation_name: t.substation_name, failure_risk: t.risk_score, recommended_action: t.recommended_action, explanation: t.explanation });
                    onNavigate("assets");
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#fff" }}>
                      {t.asset_name} ({t.substation_name || "Substation"})
                    </span>
                    <RiskBadge level={t.risk_level} />
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
                    Threat: <strong>{t.threat_type}</strong> • Risk Score: <strong style={{ color: "var(--red)" }}>{t.risk_score}%</strong>
                  </p>
                  <div style={{ marginTop: "0.35rem", fontSize: "0.825rem", color: "var(--text-muted)" }}>
                    <strong>Reason:</strong> {t.explanation || "Elevated thermal or load telemetry"}
                  </div>
                  <div style={{ marginTop: "0.45rem", fontSize: "0.825rem", color: "var(--cyan)" }}>
                    🔧 <strong>Directive:</strong> {t.recommended_action}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">✓</span>
                <span className="empty-title">No Critical Alarms</span>
                <span className="empty-desc">All assets for {selectedCompany?.name} are operating below critical failure limits.</span>
              </div>
            )}
          </div>
        </div>

        {/* Moderate Alerts */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <AlertTriangle size={18} className="panel-title-icon" style={{ color: "var(--amber)" }} />
              <span>Elevated / Moderate Warnings ({moderateThreats.length})</span>
            </h3>
            <span className="panel-subtitle">Preventive Tracking</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {moderateThreats.length > 0 ? (
              moderateThreats.map((t) => (
                <div 
                  key={t.id}
                  style={{
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    padding: "1rem",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    onSelectAsset({ id: t.asset_id, name: t.asset_name, substation_name: t.substation_name, failure_risk: t.risk_score, recommended_action: t.recommended_action, explanation: t.explanation });
                    onNavigate("assets");
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#fff" }}>{t.asset_name}</span>
                    <RiskBadge level={t.risk_level} />
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
                    Threat: <strong>{t.threat_type}</strong> • Risk Score: <strong style={{ color: "var(--amber)" }}>{t.risk_score}%</strong>
                  </p>
                  <div style={{ marginTop: "0.35rem", fontSize: "0.825rem", color: "var(--text-muted)" }}>
                    <strong>Reason:</strong> {t.explanation || "Moderate telemetry variance"}
                  </div>
                  <div style={{ marginTop: "0.45rem", fontSize: "0.825rem", color: "var(--cyan)" }}>
                    💡 <strong>Action:</strong> {t.recommended_action}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">⛅</span>
                <span className="empty-title">No Moderate Warnings</span>
                <span className="empty-desc">No secondary asset warnings currently active for {selectedCompany?.name}.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
