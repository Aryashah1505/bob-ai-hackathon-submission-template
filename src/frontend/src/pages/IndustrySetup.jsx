import React, { useState } from "react";
import { Building2, Globe2, Users, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../api/api";

export function IndustrySetup({ onIndustryCreated, isFirstSetup = false, onCancel }) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [customerCount, setCustomerCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanName = name.trim();
    const cleanRegion = region.trim();
    const countNum = parseInt(customerCount, 10);

    if (!cleanName) {
      setError("Please enter a valid industry / utility name.");
      return;
    }
    if (!cleanRegion) {
      setError("Please specify the operational region.");
      return;
    }
    if (isNaN(countNum) || countNum < 0) {
      setError("Customer count must be a non-negative number.");
      return;
    }

    setLoading(true);
    try {
      const savedIndustry = await api.createIndustry({
        name: cleanName,
        region: cleanRegion,
        customer_count: countNum,
      });

      setSuccess(true);
      setTimeout(() => {
        onIndustryCreated(savedIndustry);
      }, 700);
    } catch (err) {
      setError(err.message || "Failed to create industry record in Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: "680px", margin: "2rem auto" }}>
      <div className="glass-panel" style={{ padding: "2.25rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(56, 189, 248, 0.12)",
              color: "var(--cyan)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              border: "1px solid rgba(56, 189, 248, 0.3)",
            }}
          >
            <Building2 size={28} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {isFirstSetup ? "Set Up Your Grid Industry" : "Add New Industry / Utility Profile"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.35rem" }}>
            Create an industry profile to scope all substations, assets, and operational threat analytics.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#f87171",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-sm)",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#34d399",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-sm)",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            <CheckCircle2 size={18} />
            <span>Industry created successfully! Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span>Industry / Utility Name *</span>
            </label>
            <div className="input-suffix-wrapper">
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Apex Power Distribution Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                <span>Region *</span>
              </label>
              <div className="input-suffix-wrapper">
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Northern Sector Grid"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Customer Count *</span>
              </label>
              <div className="input-suffix-wrapper">
                <input
                  type="number"
                  className="input-field input-with-suffix"
                  placeholder="e.g. 85000"
                  value={customerCount}
                  onChange={(e) => setCustomerCount(e.target.value)}
                  min="0"
                  required
                  disabled={loading || success}
                />
                <span className="input-suffix">users</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            {!isFirstSetup && onCancel && (
              <button
                type="button"
                className="btn-icon"
                onClick={onCancel}
                style={{ flex: 1, padding: "0.75rem", justifyContent: "center" }}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2, padding: "0.75rem" }}
              disabled={loading || success}
            >
              <span>{loading ? "Saving to Supabase..." : "Save Industry & Launch Dashboard"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
