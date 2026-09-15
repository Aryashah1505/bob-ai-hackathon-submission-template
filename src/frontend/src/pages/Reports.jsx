import React from "react";
import { FileText, Download, ShieldCheck, Database } from "lucide-react";

export function Reports() {
  return (
    <div className="page-container">
      <div className="glass-panel" style={{ maxWidth: "800px", margin: "2rem auto", textAlign: "center", padding: "3rem 2rem" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(56,189,248,0.1)", color: "var(--cyan)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <FileText size={28} />
        </div>
        
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
          Executive Grid Reliability Reporting & Exports
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0.5rem auto 1.5rem", maxWidth: "480px" }}>
          Automated generation of IEEE 1366 SAIDI/SAIFI reliability indexes, executive PDF audit packs, and CSV telemetry exports.
        </p>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 1rem", borderRadius: "999px", background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.3)", color: "var(--violet)", fontSize: "0.85rem", fontWeight: 700 }}>
          <span>Module in Development (Phase 2 Roadmap)</span>
        </div>

        <div style={{ marginTop: "2.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", textAlign: "left" }}>
          <div style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)" }}>
            <strong style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>Direct Supabase Data Access</strong>
            <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginTop: "0.2rem" }}>All outage risk and asset calculations are stored directly in your Supabase database.</p>
          </div>
          <div style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)" }}>
            <strong style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>FastAPI OpenDocs Spec</strong>
            <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginTop: "0.2rem" }}>REST endpoints support direct JSON export via standard HTTP client tools.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
