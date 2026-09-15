import React, { useState } from "react";
import { Cpu, Search, Filter, ArrowLeft, Wrench, ShieldAlert, Activity, Building2 } from "lucide-react";
import { RiskBadge } from "../components/RiskBadge";

export function Assets({ equipmentList = [], selectedAsset, onSelectAsset, onClearSelected, selectedCompany }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const filteredAssets = equipmentList.filter((eq) => {
    const matchSearch = 
      (eq.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (eq.equipment_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (eq.substation_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (eq.location || "").toLowerCase().includes(search.toLowerCase());
    
    const matchType = typeFilter === "ALL" || (eq.asset_type || eq.equipment_type || "").toLowerCase().includes(typeFilter.toLowerCase());
    
    let matchRisk = true;
    const r = eq.failure_risk || 0;
    if (riskFilter === "HIGH") matchRisk = r >= 70;
    else if (riskFilter === "MEDIUM") matchRisk = r >= 35 && r < 70;
    else if (riskFilter === "LOW") matchRisk = r < 35;

    return matchSearch && matchType && matchRisk;
  });

  // Single Asset Detail View
  if (selectedAsset) {
    const isHighRisk = (selectedAsset.failure_risk || 0) >= 70;
    const sensors = selectedAsset.sensor_readings || {
      temperature: 65.0,
      vibration: 1.2,
      partial_discharge: 10.0,
      oil_quality: 90.0,
      load_percentage: 70.0,
      source: "Simulated Live Data — demonstration only"
    };

    return (
      <div className="page-container">
        <button 
          className="btn-icon" 
          onClick={onClearSelected}
          style={{ marginBottom: "1.5rem" }}
        >
          <ArrowLeft size={16} />
          <span>Back to Grid Assets Directory</span>
        </button>

        <div className="dashboard-grid-main">
          {/* Asset Specs Card */}
          <div className="glass-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <Cpu size={18} className="panel-title-icon" />
                <span>[{selectedAsset.equipment_id || `EQ-${selectedAsset.id}`}] {selectedAsset.name}</span>
              </h3>
              <RiskBadge level={selectedAsset.risk_level || (isHighRisk ? "CRITICAL" : "LOW")} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", margin: "1rem 0" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Asset Type</span>
                <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{selectedAsset.asset_type || "Transformer"}</p>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Substation Node</span>
                <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{selectedAsset.substation_name} ({selectedAsset.location})</p>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Calculated Failure Risk</span>
                <p style={{ fontWeight: 700, fontSize: "1.25rem", color: isHighRisk ? "var(--red)" : (selectedAsset.failure_risk >= 35 ? "var(--amber)" : "var(--green)") }}>
                  {selectedAsset.failure_risk || 10}%
                </p>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Operating Health Index</span>
                <p style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--cyan)" }}>
                  {selectedAsset.health_score || 90}%
                </p>
              </div>
            </div>

            <div style={{ marginTop: "1rem", padding: "1rem", background: isHighRisk ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)", border: `1px solid ${isHighRisk ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)"}`, borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isHighRisk ? "var(--red)" : "var(--amber)", fontWeight: 700, fontSize: "0.85rem" }}>
                <Wrench size={16} />
                <span>Prescribed Advisory Action</span>
              </div>
              <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", marginTop: "0.35rem" }}>
                {selectedAsset.recommended_action || "Maintain continuous baseline supervisory monitoring."}
              </p>
              {selectedAsset.explanation && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
                  <strong>Driving factors:</strong> {selectedAsset.explanation}
                </p>
              )}
            </div>
          </div>

          {/* Telemetry Panel */}
          <div className="glass-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <Activity size={18} className="panel-title-icon" />
                <span>Latest Telemetry Readings</span>
              </h3>
              <span className="panel-subtitle" style={{ color: "var(--cyan)" }}>
                {sensors.source}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ padding: "0.85rem", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Core Temperature</span>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: sensors.temperature >= 85 ? "var(--red)" : "var(--text-primary)" }}>
                  {sensors.temperature}°C
                </div>
              </div>
              <div style={{ padding: "0.85rem", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Continuous Load</span>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: sensors.load_percentage >= 90 ? "var(--amber)" : "var(--text-primary)" }}>
                  {sensors.load_percentage}%
                </div>
              </div>
              <div style={{ padding: "0.85rem", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Vibration</span>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {sensors.vibration} mm/s
                </div>
              </div>
              <div style={{ padding: "0.85rem", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Oil Quality</span>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--green)" }}>
                  {sensors.oil_quality}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Search & Filter Header */}
      <div className="glass-panel" style={{ marginBottom: "1.5rem", padding: "1.15rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Grid Asset Directory {selectedCompany ? `(${selectedCompany.name})` : ""}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Showing {filteredAssets.length} of {equipmentList.length} monitored equipment assets.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <div className="search-bar" style={{ width: "240px" }}>
              <Search size={14} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search asset, substation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="input-field"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: "0.45rem 0.75rem", fontSize: "0.825rem", width: "auto" }}
            >
              <option value="ALL">All Types</option>
              <option value="Transformer">Transformers</option>
              <option value="Circuit Breaker">Breakers</option>
              <option value="Feeder">Feeders</option>
            </select>

            <select
              className="input-field"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              style={{ padding: "0.45rem 0.75rem", fontSize: "0.825rem", width: "auto" }}
            >
              <option value="ALL">All Risks</option>
              <option value="HIGH">High Risk (&ge;70%)</option>
              <option value="MEDIUM">Medium Risk (35-69%)</option>
              <option value="LOW">Low Risk (&lt;35%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="glass-panel">
        <div className="table-responsive">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Asset Name / Tag</th>
                <th>Substation Node</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Success / Reliability</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Prescribed Action</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const risk = asset.failure_risk || 0;
                  const health = asset.health_score !== undefined ? asset.health_score : Math.max(0, 100 - risk);
                  return (
                    <tr key={asset.id}>
                      <td className="asset-name-cell">
                        <strong>{asset.name}</strong>
                      </td>
                      <td>{asset.substation_name || "Primary Yard"}</td>
                      <td>{asset.asset_type || "Transformer"}</td>
                      <td>{asset.capacity || "—"}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: health >= 70 ? "var(--green)" : health >= 40 ? "var(--amber)" : "var(--red)" }}>
                          {health}%
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: risk >= 70 ? "var(--red)" : risk >= 35 ? "var(--amber)" : "var(--green)" }}>
                          {risk}%
                        </span>
                      </td>
                      <td><RiskBadge level={asset.risk_level || (risk >= 70 ? "CRITICAL" : risk >= 35 ? "MEDIUM" : "LOW")} /></td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)", maxWidth: "260px" }}>
                        {asset.recommended_action || "Routine observation"}
                      </td>
                      <td>
                        <button 
                          className="btn-icon"
                          onClick={() => onSelectAsset(asset)}
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "3rem" }}>
                    <div className="empty-state">
                      <span className="empty-icon">⚡</span>
                      <span className="empty-title">No Grid Assets Found</span>
                      <span className="empty-desc">
                        {equipmentList.length === 0 
                          ? "No grid assets have been added for this company yet." 
                          : "No assets match your search/filter query."}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
