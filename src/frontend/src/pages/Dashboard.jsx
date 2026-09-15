import React, { useState } from "react";
import { 
  AlertTriangle, 
  Cpu, 
  CloudLightning, 
  Activity, 
  ArrowUpRight, 
  ShieldAlert, 
  Wrench, 
  Users, 
  TrendingUp,
  XCircle,
  Filter,
  Building2,
  MapPin,
  Plus,
  Play,
  History,
  Clock,
  CheckCircle,
  AlertOctagon,
  Trash2
} from "lucide-react";
import { SummaryCard } from "../components/SummaryCard";
import { RiskBadge } from "../components/RiskBadge";

export function Dashboard({ 
  companyDashboard, 
  selectedCompany, 
  loading, 
  onNavigate, 
  onSelectAsset,
  onOpenAddCompany,
  onRemoveCompany,
  onRunAnalysis,
  userRole
}) {
  const [criticalOnlyFilter, setCriticalOnlyFilter] = useState(false);
  // State for alert acknowledgement workflow (persisted per session)
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // If no company exists in database
  if (!selectedCompany) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div className="glass-panel" style={{ maxWidth: "560px", margin: "0 auto", padding: "3rem 2rem" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(56,189,248,0.1)", color: "var(--cyan)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <Building2 size={32} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
            No Company Profile Selected
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0.75rem auto 1.75rem" }}>
            Please set up your electric utility or industrial grid profile to start tracking substations, equipment, and real-time failure risks.
          </p>
          <button className="btn-primary" onClick={onOpenAddCompany}>
            <Plus size={16} />
            <span>Add Company Onboarding</span>
          </button>
        </div>
      </div>
    );
  }

  // Loading skeleton placeholder
  if (loading && !companyDashboard) {
    return (
      <div className="page-container">
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <div className="status-dot pulse" style={{ background: "var(--cyan)", width: "16px", height: "16px", margin: "0 auto 1rem" }}></div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Loading {selectedCompany.name} Data...
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
            Fetching isolated assets, weather conditions, and risk evaluations from Supabase.
          </p>
        </div>
      </div>
    );
  }

  // Extract company-scoped metrics
  const substationsCount = companyDashboard?.substations_count || 0;
  const assetsCount = companyDashboard?.assets_count || 0;
  const transformersCount = companyDashboard?.transformers_count || 0;
  const otherCount = companyDashboard?.other_equipment_count || 0;
  const gridStatus = companyDashboard?.grid_status || "Monitoring Active";
  const threats = companyDashboard?.threats || [];
  const threatsSummary = companyDashboard?.threats_summary || { total_threats: 0, critical_count: 0, medium_count: 0, low_count: 0 };
  const substations = companyDashboard?.substations || [];
  const assets = companyDashboard?.assets || [];
  const weather = companyDashboard?.weather || { temperature: 28.0, wind_speed: 15.0, rainfall: 0.0, lightning_risk: 0.1 };
  
  // Historical incidents
  const incidents = companyDashboard?.incidents || [];
  const incidentsSummary = companyDashboard?.incidents_summary || {
    total_incidents: incidents.length,
    critical_count: incidents.filter(i => String(i.severity).toLowerCase() === "critical").length,
    high_count: incidents.filter(i => String(i.severity).toLowerCase() === "high").length,
    medium_count: incidents.filter(i => String(i.severity).toLowerCase() === "medium").length,
    low_count: incidents.filter(i => String(i.severity).toLowerCase() === "low").length,
    total_customers_affected: incidents.reduce((sum, i) => sum + (Number(i.affected_customers) || 0), 0),
    total_outage_hours: incidents.reduce((sum, i) => sum + (Number(i.outage_duration) || 0), 0)
  };

  const isCritical = gridStatus === "Critical Now" || threatsSummary.critical_count > 0;
  const isElevated = !isCritical && (gridStatus === "Elevated Risk" || threatsSummary.medium_count > 0);

  // Critical & High incidents for dedicated alert response
  const criticalAndHighIncidents = incidents.filter(
    (i) => String(i.severity).toLowerCase() === "critical" || String(i.severity).toLowerCase() === "high"
  );

  // Specific critical incident check
  const criticalIncident = incidents.find(i => 
    (i.asset_name?.includes("CB-MUN-HVDC-MAIN") || String(i.severity).toLowerCase() === "critical")
  );

  const handleAcknowledgeAlert = (alertKey) => {
    setAcknowledgedAlerts(prev => ({
      ...prev,
      [alertKey]: true
    }));
  };

  // Derive summary phrase
  const generateSummary = () => {
    if (assetsCount === 0) {
      return `No grid assets configured yet for ${selectedCompany.name}. Add substations and transformers to begin monitoring.`;
    }
    if (threatsSummary.critical_count > 0) {
      return `${threatsSummary.critical_count} asset${threatsSummary.critical_count > 1 ? "s" : ""} exhibiting elevated risk in ${selectedCompany.region}; inspection recommended.`;
    }
    if (threatsSummary.medium_count > 0) {
      return `${threatsSummary.medium_count} moderate risk alert${threatsSummary.medium_count > 1 ? "s" : ""} detected in ${selectedCompany.region}.`;
    }
    return `Grid operations for ${selectedCompany.name} are nominal across all ${substationsCount} substations and ${assetsCount} assets.`;
  };

  const displayedThreats = criticalOnlyFilter 
    ? threats.filter((t) => t.risk_level.toUpperCase() === "HIGH" || t.risk_level.toUpperCase() === "CRITICAL" || (t.risk_score || 0) >= 70)
    : threats;

  return (
    <div className="page-container">
      {/* 🌟 1. Company Operations Banner */}
      <section className={`hero-status-banner ${isCritical ? "is-critical" : ""}`}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Building2 size={16} style={{ color: "var(--cyan)" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--cyan)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {selectedCompany.name}
            </span>
            <span style={{ color: "var(--text-dim)" }}>•</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <MapPin size={13} />
              {selectedCompany.region}
            </span>
          </div>

          <h2 className="hero-title">Grid Operations Overview</h2>
          <p className="hero-subtitle" style={{ color: "#e2e8f0", fontWeight: 500 }}>
            {generateSummary()}
          </p>
        </div>

        <div className="hero-badge-container">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              className="hero-status-pill clickable-pill"
              onClick={() => isCritical && setCriticalOnlyFilter(!criticalOnlyFilter)}
              style={{
                background: isCritical ? "rgba(239, 68, 68, 0.25)" : isElevated ? "rgba(245, 158, 11, 0.25)" : "rgba(16, 185, 129, 0.2)",
                color: isCritical ? "#f87171" : isElevated ? "#fbbf24" : "#34d399",
                border: `1px solid ${isCritical ? "rgba(239, 68, 68, 0.55)" : isElevated ? "rgba(245, 158, 11, 0.5)" : "rgba(16, 185, 129, 0.4)"}`,
                cursor: isCritical ? "pointer" : "default"
              }}
            >
              <span className="status-dot pulse"></span>
              <span>{gridStatus.toUpperCase()}</span>
            </button>
            {onRemoveCompany && (
              <button
                onClick={() => {
                  if (userRole && userRole !== "admin") {
                    alert("Permission notice: Admin role required to remove industry profile.");
                    return;
                  }
                  setShowDeleteModal(true);
                }}
                title={`Remove ${selectedCompany.name} industry`}
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  color: "#f87171",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  transition: "all 0.2s ease"
                }}
              >
                <Trash2 size={13} />
                <span>Remove Industry</span>
              </button>
            )}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {(selectedCompany.customer_count || 0).toLocaleString()} Customers Served
          </span>
        </div>
      </section>

      {/* 🌟 2. Critical Incident Alert Response Panel */}
      {criticalIncident && (
        <div style={{
          background: "rgba(239, 68, 68, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                background: "rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                padding: "0.5rem",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <AlertOctagon size={24} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>
                    CRITICAL INCIDENT ALERT: {criticalIncident.asset_name}
                  </span>
                  <RiskBadge level="CRITICAL" />
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: acknowledgedAlerts[criticalIncident.id || "crit-main"] ? "rgba(56,189,248,0.15)" : "rgba(239,68,68,0.2)",
                    color: acknowledgedAlerts[criticalIncident.id || "crit-main"] ? "var(--cyan)" : "#f87171",
                    border: `1px solid ${acknowledgedAlerts[criticalIncident.id || "crit-main"] ? "rgba(56,189,248,0.4)" : "rgba(239,68,68,0.4)"}`
                  }}>
                    {acknowledgedAlerts[criticalIncident.id || "crit-main"] ? "Status: Acknowledged" : "Status: Active Alarm"}
                  </span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                  <strong>Substation:</strong> {criticalIncident.substation_name || "Mundra High-Voltage DC Station"} • <strong>Failure Type:</strong> {criticalIncident.failure_type || criticalIncident.incident_type}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {!acknowledgedAlerts[criticalIncident.id || "crit-main"] ? (
                <button
                  className="btn-primary"
                  onClick={() => handleAcknowledgeAlert(criticalIncident.id || "crit-main")}
                  style={{ background: "#ef4444", borderColor: "#dc2626", fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}
                >
                  <CheckCircle size={14} />
                  <span>Acknowledge Incident Alert</span>
                </button>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--cyan)", fontSize: "0.8rem", fontWeight: 600 }}>
                  <CheckCircle size={14} />
                  <span>Acknowledged by Operator (Demo Workflow)</span>
                </span>
              )}
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem",
            background: "rgba(0, 0, 0, 0.25)",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Asset Tag</span>
              <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.875rem" }}>{criticalIncident.asset_name}</p>
            </div>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Substation Node</span>
              <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.875rem" }}>{criticalIncident.substation_name || "Mundra High-Voltage DC Station"}</p>
            </div>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Outage Duration</span>
              <p style={{ fontWeight: 700, color: "var(--status-orange)", fontSize: "0.875rem" }}>{criticalIncident.outage_duration} hours</p>
            </div>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Customers Affected</span>
              <p style={{ fontWeight: 700, color: "var(--status-critical)", fontSize: "0.875rem" }}>{(criticalIncident.affected_customers || 0).toLocaleString()} customers</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Active Indicator */}
      {criticalOnlyFilter && (
        <div style={{
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          color: "#f87171",
          padding: "0.6rem 1.25rem",
          borderRadius: "var(--radius-sm)",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.85rem",
          fontWeight: 600
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Filter size={15} />
            <span>Showing critical threats only ({displayedThreats.length} items)</span>
          </div>
          <button 
            onClick={() => setCriticalOnlyFilter(false)}
            style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 700 }}
          >
            <XCircle size={14} />
            <span>Clear filter</span>
          </button>
        </div>
      )}

      {/* 🌟 3. Four Live Operations Summary Cards */}
      <div className="kpi-grid">
        <SummaryCard
          label="Total Substations"
          value={substationsCount}
          supportingText={`${selectedCompany.region} territory`}
          icon={Building2}
          accentColor="56, 189, 248"
        />

        <SummaryCard
          label="Monitored Assets"
          value={assetsCount}
          supportingText={`${transformersCount} Transformers • ${otherCount} Other`}
          icon={Cpu}
          accentColor="129, 140, 248"
          clickable={true}
          onClick={() => onNavigate("assets")}
        />

        <SummaryCard
          label="High-Risk Assets"
          value={
            <span style={{ color: threatsSummary.critical_count > 0 ? "var(--red)" : "var(--green)" }}>
              {threatsSummary.critical_count}
            </span>
          }
          supportingText={`${threatsSummary.medium_count} Moderate Warnings`}
          icon={ShieldAlert}
          accentColor={threatsSummary.critical_count > 0 ? "239, 68, 68" : "16, 185, 129"}
          clickable={true}
          onClick={() => onNavigate("alerts")}
        />

        <SummaryCard
          label="Regional Weather"
          value={`${weather.temperature}°C`}
          supportingText={`Wind: ${weather.wind_speed} mph • Rain: ${weather.rainfall} mm`}
          icon={CloudLightning}
          accentColor="245, 158, 11"
        />
      </div>

      {/* 🌟 4. Historical Incident Summary KPI Bar */}
      <div style={{ marginTop: "1.75rem", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <History size={18} style={{ color: "var(--cyan)" }} />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Historical Incidents & Outage Intelligence ({incidentsSummary.total_incidents} Records)
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
          <div className="glass-panel" style={{ padding: "1rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Incidents</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>
              {incidentsSummary.total_incidents}
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>Historical Failures</span>
          </div>

          <div className="glass-panel" style={{ padding: "1rem", textAlign: "center", borderLeft: "3px solid #ef4444" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Critical (Red)</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ef4444", marginTop: "0.25rem" }}>
              {incidentsSummary.critical_count}
            </div>
            <span style={{ fontSize: "0.7rem", color: "#f87171" }}>Major Trip / Rupture</span>
          </div>

          <div className="glass-panel" style={{ padding: "1rem", textAlign: "center", borderLeft: "3px solid var(--status-orange)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>High Severity (Orange)</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--status-orange)", marginTop: "0.25rem" }}>
              {incidentsSummary.high_count}
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--status-orange)" }}>Forced Outage</span>
          </div>

          <div className="glass-panel" style={{ padding: "1rem", textAlign: "center", borderLeft: "3px solid var(--status-warning)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Medium (Yellow)</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--status-warning)", marginTop: "0.25rem" }}>
              {incidentsSummary.medium_count}
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--status-warning)" }}>Component Degraded</span>
          </div>

          <div className="glass-panel" style={{ padding: "1rem", textAlign: "center", borderLeft: "3px solid var(--status-neutral)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Low (Neutral/Blue)</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--status-neutral)", marginTop: "0.25rem" }}>
              {incidentsSummary.low_count}
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--status-neutral)" }}>Minor / Leakage</span>
          </div>

          <div className="glass-panel" style={{ padding: "1rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Impacted Customers</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--cyan)", marginTop: "0.25rem" }}>
              {(incidentsSummary.total_customers_affected || 0).toLocaleString()}
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>Across all events</span>
          </div>

          <div className="glass-panel" style={{ padding: "1rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Outage Time</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--violet)", marginTop: "0.25rem" }}>
              {incidentsSummary.total_outage_hours}h
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>Cumulative Duration</span>
          </div>
        </div>
      </div>

      {/* 🌟 5. Substations & Threats Breakdown */}
      <div className="dashboard-grid-main">
        {/* Left: Substations in this Company */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <Building2 size={18} className="panel-title-icon" />
              <span>Substations Network</span>
            </h3>
            <span className="panel-subtitle">{substations.length} registered nodes</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {substations.length > 0 ? (
              substations.map((sub) => (
                <div key={sub.id} style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.9rem" }}>
                    <span>{sub.name}</span>
                    <span style={{ color: "var(--cyan)", fontSize: "0.8rem" }}>{sub.assets_count} Assets</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Location: {sub.location}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📍</span>
                <span className="empty-title">No Substations Registered</span>
                <span className="empty-desc">No substations have been added for {selectedCompany.name}.</span>
                <button className="btn-primary" onClick={onOpenAddCompany} style={{ marginTop: "1rem" }}>
                  <Plus size={14} />
                  <span>Add Grid Assets</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Threats & Failure Risks */}
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">
                <ShieldAlert size={18} className="panel-title-icon" style={{ color: "var(--red)" }} />
                <span>Live Grid Risk Alerts & Threat Intelligence</span>
              </h3>
              <span className="panel-subtitle">Real-time equipment risk scoped to {selectedCompany.name} ({selectedCompany.region})</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {onRunAnalysis && (
                <button className="btn-icon" onClick={onRunAnalysis} title="Run fresh risk analysis">
                  <Play size={12} />
                  <span>Run Analysis</span>
                </button>
              )}
              <button className="btn-icon" onClick={() => onNavigate("alerts")}>
                <span>All Alerts</span>
                <ArrowUpRight size={12} />
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Asset / Substation</th>
                  <th>Industry</th>
                  <th>Threat Assessment</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Advisory Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedThreats.length > 0 ? (
                  displayedThreats.slice(0, 5).map((t, idx) => (
                    <tr key={t.id || idx}>
                      <td className="asset-name-cell">
                        <div style={{ fontWeight: 700 }}>{t.asset_name || "Asset"}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.substation_name || "Primary Yard"}</div>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--cyan)", fontWeight: 600 }}>
                        {selectedCompany.name}
                      </td>
                      <td>{t.threat_type}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: (t.risk_score || 0) >= 70 ? "var(--red)" : (t.risk_score || 0) >= 35 ? "var(--amber)" : "var(--green)" }}>
                          {t.risk_score}%
                        </span>
                      </td>
                      <td><RiskBadge level={t.risk_level} /></td>
                      <td style={{ fontSize: "0.8rem", color: "var(--cyan)" }}>
                        {t.recommended_action || "Routine observation"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                      <div className="empty-state">
                        <span className="empty-title">No Active Risk Alerts</span>
                        <span className="empty-desc">All assets for {selectedCompany.name} are operating within nominal limits.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 🌟 6. Historical Incidents Master Table */}
      <div className="glass-panel" style={{ marginTop: "1.75rem" }}>
        <div className="panel-header">
          <h3 className="panel-title">
            <History size={18} className="panel-title-icon" style={{ color: "var(--cyan)" }} />
            <span>Historical Outage & Equipment Failure Records ({incidents.length})</span>
          </h3>
          <span className="panel-subtitle">Logged failure incidents by asset and substation node</span>
        </div>

        <div className="table-responsive">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Substation Node</th>
                <th>Failure / Trip Type</th>
                <th>Severity Level</th>
                <th>Outage Duration</th>
                <th>Affected Customers</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length > 0 ? (
                incidents.map((inc) => {
                  const sev = String(inc.severity || "Medium").toUpperCase();
                  const isCrit = sev === "CRITICAL";
                  const isHigh = sev === "HIGH";
                  return (
                    <tr key={inc.id} style={{ background: isCrit ? "rgba(239, 68, 68, 0.05)" : isHigh ? "rgba(251, 146, 60, 0.03)" : "transparent" }}>
                      <td className="asset-name-cell">
                        <strong>{inc.asset_name}</strong>
                      </td>
                      <td>{inc.substation_name || "Primary Yard"}</td>
                      <td style={{ fontWeight: isCrit || isHigh ? 600 : 400, color: isCrit ? "#f87171" : "var(--text-primary)" }}>
                        {inc.failure_type || inc.incident_type}
                      </td>
                      <td>
                        <RiskBadge level={inc.severity} />
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: inc.outage_duration > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                          {inc.outage_duration} hrs
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: inc.affected_customers >= 10000 ? "#f87171" : "var(--text-primary)" }}>
                          {(inc.affected_customers || 0).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: "0.75rem",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          background: acknowledgedAlerts[inc.id] || (isCrit && acknowledgedAlerts["crit-main"]) ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)",
                          color: acknowledgedAlerts[inc.id] || (isCrit && acknowledgedAlerts["crit-main"]) ? "var(--cyan)" : "var(--text-muted)",
                          border: `1px solid ${acknowledgedAlerts[inc.id] || (isCrit && acknowledgedAlerts["crit-main"]) ? "rgba(56,189,248,0.3)" : "var(--border)"}`
                        }}>
                          {acknowledgedAlerts[inc.id] || (isCrit && acknowledgedAlerts["crit-main"]) ? "Acknowledged" : (inc.status || "Logged")}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    <div className="empty-state">
                      <span className="empty-icon">✓</span>
                      <span className="empty-title">No Historical Incidents Logged</span>
                      <span className="empty-desc">No previous failure or trip records found for this company grid.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌟 7. Industry Operational Systems: Maintenance Work-Orders & Storm Crew Planning */}
      <div className="dashboard-grid-main" style={{ marginTop: "1.75rem" }}>
        {/* Preventive Maintenance Operations */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <Wrench size={18} className="panel-title-icon" style={{ color: "var(--amber)" }} />
              <span>Prioritized Maintenance Work-Orders</span>
            </h3>
            <button className="btn-icon" onClick={() => onNavigate("maintenance")}>
              <span>Full Schedule</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div style={{ padding: "0.5rem 0.75rem 0.75rem", borderBottom: "1px solid var(--border)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building2 size={14} style={{ color: "var(--cyan)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Prescribed work-orders for <strong>{selectedCompany.name}</strong> ({selectedCompany.region})
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {assets.length > 0 ? (
              assets.slice(0, 3).map((a) => {
                const isCrit = (a.failure_risk || 0) >= 70;
                return (
                  <div 
                    key={a.id} 
                    style={{ 
                      background: isCrit ? "rgba(239, 68, 68, 0.06)" : "rgba(255,255,255,0.02)", 
                      padding: "0.85rem 1rem", 
                      borderRadius: "var(--radius-sm)", 
                      border: `1px solid ${isCrit ? "rgba(239,68,68,0.3)" : "var(--border)"}` 
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#fff" }}>
                        [{a.equipment_id || `EQ-${a.id}`}] {a.name}
                      </span>
                      <RiskBadge level={isCrit ? "CRITICAL" : (a.failure_risk || 0) >= 35 ? "MEDIUM" : "LOW"} />
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      Substation: {a.substation_name || a.location} • Company: <span style={{ color: "var(--cyan)" }}>{selectedCompany.name}</span>
                    </div>
                    <div style={{ marginTop: "0.35rem", fontSize: "0.8rem", color: isCrit ? "#f87171" : "var(--text-secondary)" }}>
                      🔧 <strong>Action:</strong> {a.recommended_action || "Routine oil testing & thermal check"}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ padding: "2rem 1rem" }}>
                <span className="empty-icon">✓</span>
                <span className="empty-title">All Systems Nominal</span>
                <span className="empty-desc">No active maintenance work-orders scheduled for {selectedCompany.name}.</span>
              </div>
            )}
          </div>
        </div>

        {/* Severe Storm Crew Pre-Positioning Logistics */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <Users size={18} className="panel-title-icon" style={{ color: "var(--violet)" }} />
              <span>Severe Storm Crew Pre-Positioning</span>
            </h3>
            <button className="btn-icon" onClick={() => onNavigate("crew")}>
              <span>Crew Center</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div style={{ padding: "0.5rem 0.75rem 0.75rem", borderBottom: "1px solid var(--border)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={14} style={{ color: "var(--violet)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Meteorological dispatch staged for <strong>{selectedCompany.name}</strong> • Territory: <strong>{selectedCompany.region}</strong>
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {substations.length > 0 ? (
              substations.slice(0, 3).map((sub, idx) => (
                <div 
                  key={sub.id || idx}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    padding: "0.85rem 1rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    borderLeft: "3px solid var(--violet)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <MapPin size={14} style={{ color: "var(--violet)" }} />
                      <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                        {sub.name}
                      </span>
                    </div>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(139, 92, 246, 0.15)",
                      color: "var(--violet)",
                      border: "1px solid rgba(139, 92, 246, 0.3)"
                    }}>
                      1 Field Crew Staged
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem", fontSize: "0.775rem", color: "var(--text-muted)" }}>
                    <span>Industry: <strong style={{ color: "var(--cyan)" }}>{selectedCompany.name}</strong></span>
                    <span>Location: {sub.location}</span>
                  </div>
                  <div style={{ marginTop: "0.35rem", fontSize: "0.775rem", color: "var(--text-secondary)" }}>
                    <strong>Status:</strong> Standby readiness for {selectedCompany.region} regional feeder lines ({sub.assets_count || 0} monitored assets).
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: "2rem 1rem" }}>
                <span className="empty-icon">✓</span>
                <span className="empty-title">Nominal Deployment</span>
                <span className="empty-desc">No emergency crew staging active for {selectedCompany.name}. Weather conditions nominal.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🛑 Delete Industry Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.82)",
          backdropFilter: "blur(6px)",
          zIndex: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div className="glass-panel" style={{
            maxWidth: "500px",
            width: "100%",
            padding: "2rem",
            border: "1px solid rgba(239, 68, 68, 0.45)",
            background: "#0c1322",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{
                background: "rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                padding: "0.6rem",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Trash2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff" }}>
                  Remove Industry Profile
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Permanent workspace deletion
                </span>
              </div>
            </div>

            <div style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "var(--radius-sm)",
              padding: "1rem",
              marginBottom: "1.25rem",
              fontSize: "0.875rem",
              color: "#e2e8f0"
            }}>
              <p>
                Are you sure you want to delete <strong>{selectedCompany.name}</strong> ({selectedCompany.region})?
              </p>
              <ul style={{ marginTop: "0.6rem", paddingLeft: "1.2rem", fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <li><strong>{substationsCount}</strong> linked substation nodes</li>
                <li><strong>{assetsCount}</strong> monitored transformers & assets</li>
                <li><strong>{threats.length}</strong> real-time risk alerts & threat records</li>
                <li><strong>{incidents.length}</strong> historical failure & outage logs</li>
              </ul>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                className="btn-icon"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                style={{ padding: "0.6rem 1.2rem", fontSize: "0.875rem" }}
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await onRemoveCompany(selectedCompany);
                    setShowDeleteModal(false);
                  } catch (err) {
                    alert("Failed to remove company profile: " + (err.message || err));
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}
              >
                {isDeleting ? "Deleting..." : "Confirm & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
