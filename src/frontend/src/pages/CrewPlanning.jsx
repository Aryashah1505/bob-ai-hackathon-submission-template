import React from "react";
import { Users, MapPin, ShieldAlert, Radio } from "lucide-react";
import { RiskBadge } from "../components/RiskBadge";

export function CrewPlanning({ crewData, selectedCompany }) {
  const allocations = crewData?.allocations || [];
  const region = crewData?.region || selectedCompany?.region || "Regional Grid";

  return (
    <div className="page-container">
      {/* Overview Banner */}
      <div className="glass-panel" style={{ marginBottom: "1.5rem", padding: "1.15rem 1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Severe Storm Crew Pre-Positioning Logistics {selectedCompany ? `(${selectedCompany.name})` : ""}
        </h3>
        <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
          Optimized pre-staging locations calculated dynamically based on regional meteorological conditions and active substation failure risks for {selectedCompany?.name}.
        </p>
      </div>

      <div className="dashboard-grid-main">
        {/* Recommended Locations Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {allocations.length > 0 ? (
            allocations.map((alloc, idx) => (
              <div key={idx} className="glass-panel" style={{ borderLeft: "4px solid var(--violet)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <MapPin size={18} style={{ color: "var(--violet)" }} />
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {alloc.substation_name} ({alloc.location})
                    </h4>
                  </div>
                  <RiskBadge level={alloc.risk_level || "HIGH"} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "1rem 0" }}>
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Recommended Allocation</span>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--violet)" }}>
                      {alloc.allocated_crews || "1 Field Crew"}
                    </div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Readiness State</span>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--cyan)" }}>
                      {alloc.readiness_state || "Pre-Positioned"}
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--amber)", fontWeight: 700 }}>Pre-positioning Justification:</span>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                    {alloc.justification}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel empty-state" style={{ padding: "3rem 2rem" }}>
              <span className="empty-icon">✓</span>
              <span className="empty-title">Nominal Deployment</span>
              <span className="empty-desc">
                No crew pre-positioning recommendation is currently required for {selectedCompany?.name || "this company"}. Meteorological hazards and grid risks remain baseline.
              </span>
            </div>
          )}
        </div>

        {/* Readiness Checklist */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <Radio size={18} className="panel-title-icon" style={{ color: "var(--cyan)" }} />
              <span>Operational Logistics Checklist</span>
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.85rem" }}>
            <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)" }}>
              <strong style={{ color: "var(--text-primary)" }}>1. Emergency Generators</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "0.2rem" }}>Verify fuel levels and dispatch readiness for auxiliary mobile units in {region}.</p>
            </div>
            <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)" }}>
              <strong style={{ color: "var(--text-primary)" }}>2. SCADA Polling Frequency</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "0.2rem" }}>Set 5-second polling interval on high-load feeder lines.</p>
            </div>
            <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)" }}>
              <strong style={{ color: "var(--text-primary)" }}>3. Vegetation Clearing Patrol</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "0.2rem" }}>Corridors with high wind speed assigned for rapid tree branch clearance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
