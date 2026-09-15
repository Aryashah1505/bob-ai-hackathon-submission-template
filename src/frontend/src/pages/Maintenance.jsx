import React, { useState } from "react";
import { Wrench, Calendar, CheckCircle2, Clock } from "lucide-react";
import { RiskBadge } from "../components/RiskBadge";

export function Maintenance({ maintenanceData, selectedCompany }) {
  const [filter, setFilter] = useState("ALL");
  const tasks = maintenanceData?.tasks || [];

  const filteredTasks = tasks.filter((t) => {
    if (filter === "CRITICAL") return t.priority === "CRITICAL" || (t.failure_risk || 0) >= 70;
    if (filter === "MEDIUM") return t.priority === "MEDIUM" || (t.failure_risk || 0) < 70;
    return true;
  });

  return (
    <div className="page-container">
      {/* Priority Filter Header */}
      <div className="glass-panel" style={{ marginBottom: "1.5rem", padding: "1.15rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Prioritized Preventive Maintenance Plan {selectedCompany ? `(${selectedCompany.name})` : ""}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Prescribed work-orders derived from current {selectedCompany?.name || "company"} grid risk evaluations.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className={`btn-icon ${filter === "ALL" ? "active" : ""}`}
              onClick={() => setFilter("ALL")}
              style={{ borderColor: filter === "ALL" ? "var(--cyan)" : "var(--border)" }}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              className={`btn-icon ${filter === "CRITICAL" ? "active" : ""}`}
              onClick={() => setFilter("CRITICAL")}
              style={{ borderColor: filter === "CRITICAL" ? "var(--red)" : "var(--border)" }}
            >
              Critical Tasks ({tasks.filter((t) => t.priority === "CRITICAL").length})
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="glass-panel">
        <div className="table-responsive">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Substation / Location</th>
                <th>Priority Level</th>
                <th>Prescribed Engineering Action</th>
                <th>Recommended Window</th>
                <th>Action Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((t) => {
                  const isCrit = t.priority === "CRITICAL" || (t.failure_risk || 0) >= 70;
                  return (
                    <tr key={t.asset_id || t.equipment_id}>
                      <td className="asset-name-cell">[{t.equipment_id || `EQ-${t.asset_id}`}] {t.name}</td>
                      <td>{t.substation_name || t.location}</td>
                      <td><RiskBadge level={isCrit ? "CRITICAL" : "MEDIUM"} /></td>
                      <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {t.recommended_action}
                      </td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: isCrit ? "var(--red)" : "var(--amber)", fontWeight: 600 }}>
                          <Clock size={14} />
                          {t.recommended_window || (isCrit ? "Immediate (Next 24h)" : "Next 7-14 Days")}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--cyan)", fontSize: "0.8rem", fontWeight: 600 }}>
                          <CheckCircle2 size={14} />
                          {t.status || "Dispatched / Queue"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem" }}>
                    <div className="empty-state">
                      <span className="empty-title">No Prioritized Maintenance Required</span>
                      <span className="empty-desc">
                        No maintenance actions have been generated yet for {selectedCompany?.name || "this company"}. All equipment is running within acceptable tolerances.
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
