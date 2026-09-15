import React, { useState } from "react";
import { Activity, Zap, Cpu, AlertCircle, CheckCircle2, Gauge, Clock, ShieldAlert, FileText } from "lucide-react";
import { api } from "../api/api";
import { RiskBadge } from "../components/RiskBadge";

export function Prediction({ onDataSaved }) {
  const [activeSubTab, setActiveSubTab] = useState("outage");

  // Outage Assessment Form State
  const [outageForm, setOutageForm] = useState({
    region: "Sector 4 — Northern Industrial Corridor",
    weather_condition: "Severe Thunderstorm",
    wind_speed_mph: 48,
    grid_load_factor: 1.1,
    previous_outage_frequency_monthly: 2.8,
    active_equipment_alerts: 2,
    total_customers_in_zone: 18500,
    save_to_database: true
  });
  const [outageResult, setOutageResult] = useState(null);
  const [loadingOutage, setLoadingOutage] = useState(false);

  // Equipment Diagnostic Form State
  const [eqForm, setEqForm] = useState({
    equipment_id: "TR-502",
    name: "Primary Step-Down Grid Transformer",
    equipment_type: "Transformer",
    location: "Sector 4 Yard",
    age_years: 22,
    temperature_c: 88,
    load_percentage: 95,
    voltage_deviation_pct: 4.5,
    previous_failures: 1,
    days_since_last_maintenance: 280,
    save_to_database: true
  });
  const [eqResult, setEqResult] = useState(null);
  const [loadingEq, setLoadingEq] = useState(false);

  const handlePredictOutage = async (e) => {
    e.preventDefault();
    setLoadingOutage(true);
    try {
      const data = await api.predictOutageRisk(outageForm);
      setOutageResult(data);
      if (outageForm.save_to_database && onDataSaved) onDataSaved();
    } catch (err) {
      alert("Outage assessment failed: " + err.message);
    } finally {
      setLoadingOutage(false);
    }
  };

  const handlePredictEquipment = async (e) => {
    e.preventDefault();
    setLoadingEq(true);
    try {
      const data = await api.predictEquipmentFailure(eqForm);
      setEqResult(data);
      if (eqForm.save_to_database && onDataSaved) onDataSaved();
    } catch (err) {
      alert("Equipment diagnostic failed: " + err.message);
    } finally {
      setLoadingEq(false);
    }
  };

  return (
    <div className="page-container">
      {/* Sub Navigation */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <button
          className={`btn-icon ${activeSubTab === "outage" ? "active" : ""}`}
          onClick={() => setActiveSubTab("outage")}
          style={{
            padding: "0.6rem 1.25rem",
            fontSize: "0.9rem",
            borderColor: activeSubTab === "outage" ? "var(--cyan)" : "var(--border)",
            background: activeSubTab === "outage" ? "rgba(56,189,248,0.1)" : "transparent",
            color: activeSubTab === "outage" ? "var(--cyan)" : "var(--text-secondary)"
          }}
        >
          <Zap size={16} />
          <span>Regional Outage & Fault Predictor</span>
        </button>
        <button
          className={`btn-icon ${activeSubTab === "equipment" ? "active" : ""}`}
          onClick={() => setActiveSubTab("equipment")}
          style={{
            padding: "0.6rem 1.25rem",
            fontSize: "0.9rem",
            borderColor: activeSubTab === "equipment" ? "var(--cyan)" : "var(--border)",
            background: activeSubTab === "equipment" ? "rgba(56,189,248,0.1)" : "transparent",
            color: activeSubTab === "equipment" ? "var(--cyan)" : "var(--text-secondary)"
          }}
        >
          <Cpu size={16} />
          <span>DGA & Asset Health Diagnostics</span>
        </button>
      </div>

      {/* OUTAGE PREDICTOR PANEL */}
      {activeSubTab === "outage" && (
        <div className="dashboard-grid-main">
          <div className="glass-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <Zap size={18} className="panel-title-icon" />
                <span>Regional Outage Risk Parameters</span>
              </h3>
              <span className="panel-subtitle">Trained ML Outage & Fault Classifier</span>
            </div>

            <form onSubmit={handlePredictOutage}>
              <div className="form-group">
                <label className="form-label">Regional Grid Sector</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Sector 4 Northern Corridor"
                  value={outageForm.region}
                  onChange={(e) => setOutageForm({ ...outageForm, region: e.target.value })}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Weather Condition</label>
                  <select
                    className="input-field"
                    value={outageForm.weather_condition}
                    onChange={(e) => setOutageForm({ ...outageForm, weather_condition: e.target.value })}
                  >
                    <option value="Clear">Clear / Stable</option>
                    <option value="Light Rain">Light Rain</option>
                    <option value="Heavy Rain">Heavy Rain</option>
                    <option value="Severe Thunderstorm">Severe Thunderstorm</option>
                    <option value="High Winds">High Winds</option>
                    <option value="Heatwave">Heatwave / High Temp</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Wind Speed</label>
                  <div className="input-suffix-wrapper">
                    <input
                      type="number"
                      className="input-field input-with-suffix"
                      placeholder="e.g. 45"
                      value={outageForm.wind_speed_mph}
                      onChange={(e) => setOutageForm({ ...outageForm, wind_speed_mph: Number(e.target.value) })}
                    />
                    <span className="input-suffix">mph</span>
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Grid Load Factor</label>
                  <div className="input-suffix-wrapper">
                    <input
                      type="number"
                      step="0.05"
                      className="input-field input-with-suffix"
                      placeholder="e.g. 1.10"
                      value={outageForm.grid_load_factor}
                      onChange={(e) => setOutageForm({ ...outageForm, grid_load_factor: Number(e.target.value) })}
                    />
                    <span className="input-suffix">ratio</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Active Equipment Alerts</label>
                  <div className="input-suffix-wrapper">
                    <input
                      type="number"
                      className="input-field input-with-suffix"
                      placeholder="e.g. 2"
                      value={outageForm.active_equipment_alerts}
                      onChange={(e) => setOutageForm({ ...outageForm, active_equipment_alerts: Number(e.target.value) })}
                    />
                    <span className="input-suffix">alerts</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loadingOutage}>
                <Zap size={16} />
                <span>{loadingOutage ? "Running Trained ML Models..." : "Run ML Outage Assessment"}</span>
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="glass-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <Activity size={18} className="panel-title-icon" />
                <span>Diagnostic Assessment Output</span>
              </h3>
              {outageResult?.is_ai_trained_model && (
                <span className="badge-ai" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>
                  ✓ ML Model Inference Active
                </span>
              )}
            </div>

            <div className={`prediction-result-panel ${outageResult ? "has-data" : ""}`}>
              {outageResult ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--cyan)" }}>
                      {outageResult.region}
                    </span>
                    <RiskBadge level={outageResult.risk_level} />
                  </div>
                  
                  {/* Primary Metrics Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", margin: "1rem 0" }}>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Outage Probability</span>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
                        {(outageResult.probability * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Estimated Impact</span>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
                        {outageResult.affected_customers_estimated.toLocaleString()}
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.3rem" }}>users</span>
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Predicted Fault Type (ML)</span>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--amber)", marginTop: "0.2rem" }}>
                        {outageResult.predicted_fault_type || "Line Breakage"}
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Est. Downtime (ML)</span>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--cyan)", marginTop: "0.2rem" }}>
                        {outageResult.predicted_downtime_hours || 2.5} hrs
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "0.75rem" }}>
                    <span style={{ color: "var(--amber)", fontWeight: 700, fontSize: "0.85rem" }}>Risk Attribution Factors:</span>
                    <ul style={{ paddingLeft: "1.2rem", marginTop: "0.35rem", fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                      {outageResult.explanations.map((exp, idx) => (
                        <li key={idx} style={{ marginBottom: "0.25rem" }}>
                          <strong style={{ color: "var(--text-primary)" }}>{exp.factor}:</strong> {exp.description} ({exp.impact})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: "1rem", padding: "0.85rem", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "var(--radius-sm)" }}>
                    <strong style={{ color: "var(--cyan)", fontSize: "0.85rem" }}>Operational Action:</strong>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", marginTop: "0.2rem" }}>
                      {outageResult.recommendations.primary_action}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">⚡</span>
                  <span className="empty-title">Assessment Output Ready</span>
                  <span className="empty-desc">Input meteorological and grid parameters and run the assessment to view explainable risk breakdowns and trained ML predictions.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EQUIPMENT DIAGNOSTIC PANEL */}
      {activeSubTab === "equipment" && (
        <div className="dashboard-grid-main">
          <div className="glass-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <Cpu size={18} className="panel-title-icon" />
                <span>Asset Telemetry Parameters</span>
              </h3>
              <span className="panel-subtitle">Trained DGA & Physicochemical ML Model</span>
            </div>

            <form onSubmit={handlePredictEquipment}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Asset Tag ID</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. TR-502"
                    value={eqForm.equipment_id}
                    onChange={(e) => setEqForm({ ...eqForm, equipment_id: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Equipment Type</label>
                  <select
                    className="input-field"
                    value={eqForm.equipment_type}
                    onChange={(e) => setEqForm({ ...eqForm, equipment_type: e.target.value })}
                  >
                    <option value="Transformer">Step-Down Transformer</option>
                    <option value="Circuit Breaker">HV Circuit Breaker</option>
                    <option value="Feeder Line">Distribution Feeder</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Asset Age</label>
                  <div className="input-suffix-wrapper">
                    <input
                      type="number"
                      className="input-field input-with-suffix"
                      placeholder="e.g. 20"
                      value={eqForm.age_years}
                      onChange={(e) => setEqForm({ ...eqForm, age_years: Number(e.target.value) })}
                    />
                    <span className="input-suffix">yrs</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Core Temp</label>
                  <div className="input-suffix-wrapper">
                    <input
                      type="number"
                      className="input-field input-with-suffix"
                      placeholder="e.g. 85"
                      value={eqForm.temperature_c}
                      onChange={(e) => setEqForm({ ...eqForm, temperature_c: Number(e.target.value) })}
                    />
                    <span className="input-suffix">°C</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Load Level</label>
                  <div className="input-suffix-wrapper">
                    <input
                      type="number"
                      className="input-field input-with-suffix"
                      placeholder="e.g. 95"
                      value={eqForm.load_percentage}
                      onChange={(e) => setEqForm({ ...eqForm, load_percentage: Number(e.target.value) })}
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Historical Trips</label>
                  <div className="input-suffix-wrapper">
                    <input
                      type="number"
                      className="input-field input-with-suffix"
                      placeholder="e.g. 1"
                      value={eqForm.previous_failures}
                      onChange={(e) => setEqForm({ ...eqForm, previous_failures: Number(e.target.value) })}
                    />
                    <span className="input-suffix">trips</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Last Inspection</label>
                  <div className="input-suffix-wrapper">
                    <input
                      type="number"
                      className="input-field input-with-suffix"
                      placeholder="e.g. 180"
                      value={eqForm.days_since_last_maintenance}
                      onChange={(e) => setEqForm({ ...eqForm, days_since_last_maintenance: Number(e.target.value) })}
                    />
                    <span className="input-suffix">days</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loadingEq}>
                <Cpu size={16} />
                <span>{loadingEq ? "Executing Trained DGA Model..." : "Run ML Asset Diagnostics"}</span>
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="glass-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <Activity size={18} className="panel-title-icon" />
                <span>Asset Health & Advisory Score</span>
              </h3>
              {eqResult?.is_ai_trained_model && (
                <span className="badge-ai" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>
                  ✓ DGA ML Ensemble Active
                </span>
              )}
            </div>

            <div className={`prediction-result-panel ${eqResult ? "has-data" : ""}`}>
              {eqResult ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--cyan)" }}>
                      [{eqResult.equipment_type}] Diagnostics
                    </span>
                    <RiskBadge level={eqResult.status} />
                  </div>

                  {/* Top Diagnostic Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", margin: "1rem 0" }}>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Failure Risk</span>
                      <div style={{ fontSize: "1.35rem", fontWeight: 800, color: (eqResult.failure_risk || 0) >= 70 ? "var(--red)" : "var(--amber)" }}>
                        {eqResult.failure_risk}%
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Health Score</span>
                      <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--green)" }}>
                        {eqResult.health_score}%
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Life Expectancy</span>
                      <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--cyan)" }}>
                        {eqResult.predicted_life_expectancy_years || "—"} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>yrs</span>
                      </div>
                    </div>
                  </div>

                  {/* DGA Dissolved Gas Breakdown if available */}
                  {eqResult.dga_profile && (
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "var(--radius-sm)", marginBottom: "0.75rem", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--cyan)", fontWeight: 700, textTransform: "uppercase" }}>DGA Physicochemical Profile (ML Feature Vector):</span>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.35rem", fontSize: "0.775rem" }}>
                        <div><span style={{ color: "var(--text-muted)" }}>H₂:</span> <strong style={{ color: "var(--text-primary)" }}>{eqResult.dga_profile.hydrogen_ppm} ppm</strong></div>
                        <div><span style={{ color: "var(--text-muted)" }}>CH₄:</span> <strong style={{ color: "var(--text-primary)" }}>{eqResult.dga_profile.methane_ppm} ppm</strong></div>
                        <div><span style={{ color: "var(--text-muted)" }}>CO:</span> <strong style={{ color: "var(--text-primary)" }}>{eqResult.dga_profile.co_ppm} ppm</strong></div>
                        <div><span style={{ color: "var(--text-muted)" }}>CO₂:</span> <strong style={{ color: "var(--text-primary)" }}>{eqResult.dga_profile.co2_ppm} ppm</strong></div>
                        <div><span style={{ color: "var(--text-muted)" }}>C₂H₄:</span> <strong style={{ color: "var(--text-primary)" }}>{eqResult.dga_profile.ethylene_ppm} ppm</strong></div>
                        <div><span style={{ color: "var(--text-muted)" }}>Dielectric:</span> <strong style={{ color: "var(--text-primary)" }}>{eqResult.dga_profile.dielectric_rigidity_kv} kV</strong></div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: "0.5rem" }}>
                    <span style={{ color: "var(--amber)", fontWeight: 700, fontSize: "0.85rem" }}>Degradation Factors:</span>
                    <ul style={{ paddingLeft: "1.2rem", marginTop: "0.35rem", fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                      {eqResult.explanations.map((exp, idx) => (
                        <li key={idx} style={{ marginBottom: "0.25rem" }}>
                          <strong style={{ color: "var(--text-primary)" }}>{exp.factor}:</strong> {exp.description} ({exp.impact})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: "1rem", padding: "0.85rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)" }}>
                    <strong style={{ color: "var(--amber)", fontSize: "0.85rem" }}>Maintenance Advisory:</strong>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", marginTop: "0.2rem" }}>
                      {eqResult.recommendations.primary_action}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">🔧</span>
                  <span className="empty-title">Asset Diagnostics Ready</span>
                  <span className="empty-desc">Input asset telemetry to calculate IEEE health index, failure probability, and maintenance directives.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
