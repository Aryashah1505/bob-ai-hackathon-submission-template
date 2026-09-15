import React, { useState } from "react";
import { User, Mail, Lock, Building2, MapPin, Globe, Compass, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function SignupPage({ onNavigate, onSignupSuccess }) {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authorizedConsent, setAuthorizedConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Required fields validation
    if (
      !fullName.trim() ||
      !email.trim() ||
      !companyName.trim() ||
      !industry.trim() ||
      !location.trim() ||
      !region.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all required fields.");
      return;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // 3. Password length validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // 4. Password confirmation match
    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    // 5. Consent validation
    if (!authorizedConsent) {
      setError("Please confirm you are authorized to create this utility workspace.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        companyName: companyName.trim(),
        industry: industry.trim(),
        location: location.trim(),
        region: region.trim(),
        password,
      });

      if (onSignupSuccess) {
        onSignupSuccess(res);
      } else {
        onNavigate("onboarding");
      }
    } catch (err) {
      console.error("Signup error:", err);
      let msg = err.message || "Failed to create account. Please try again.";
      const lower = msg.toLowerCase();
      if (
        lower.includes("user already registered") ||
        lower.includes("already exists") ||
        lower.includes("duplicate key")
      ) {
        msg = "This email is already registered. Please sign in instead.";
      } else if (
        lower.includes("load failed") ||
        lower.includes("failed to fetch") ||
        lower.includes("networkerror") ||
        lower.includes("fetch failed")
      ) {
        msg = "Network connection to authentication server failed. Please verify your internet connection or Supabase configuration.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(ellipse at top, #111c2e 0%, #0b0f19 100%)",
      padding: "2.5rem 1rem",
    }}>
      <div className="glass-panel" style={{
        maxWidth: "560px",
        width: "100%",
        padding: "2.5rem 2.25rem",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.45)",
        border: "1px solid var(--border-default)",
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "rgba(34, 167, 240, 0.12)",
            border: "1px solid rgba(34, 167, 240, 0.3)",
            color: "var(--cyan)",
            marginBottom: "0.85rem"
          }}>
            <Building2 size={26} />
          </div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.02em" }}>
            Create Your Industry Workspace
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
            Register your electric utility or industrial company profile
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: "rgba(251, 113, 133, 0.12)",
            border: "1px solid rgba(251, 113, 133, 0.35)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "1.25rem",
            color: "var(--status-danger)",
            fontSize: "0.85rem"
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* User Full Name & Work Email */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Full Name *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{ paddingLeft: "2.2rem" }}
                />
                <User size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Work Email *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: "2.2rem" }}
                />
                <Mail size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              </div>
            </div>
          </div>

          {/* Company Name & Industry Sector */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Company Name *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter company / utility name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  style={{ paddingLeft: "2.2rem" }}
                />
                <Building2 size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Industry *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Electric Transmission & Distribution"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  style={{ paddingLeft: "2.2rem" }}
                />
                <Globe size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              </div>
            </div>
          </div>

          {/* Origin / Location & Operating Region */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Origin / Location *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Headquarters city / state"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  style={{ paddingLeft: "2.2rem" }}
                />
                <Compass size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Operating Region *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Regional grid zone"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                  style={{ paddingLeft: "2.2rem" }}
                />
                <MapPin size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Password (min 8 chars) *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: "2.2rem", paddingRight: "2.4rem" }}
                />
                <Lock size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.65rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 0
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Confirm Password *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ paddingLeft: "2.2rem", paddingRight: "2.4rem" }}
                />
                <Lock size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "0.65rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 0
                  }}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Authorization Consent Checkbox */}
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", marginTop: "0.25rem" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.8rem", color: "var(--text-secondary)", cursor: "pointer", lineHeight: 1.4 }}>
              <input
                type="checkbox"
                checked={authorizedConsent}
                onChange={(e) => setAuthorizedConsent(e.target.checked)}
                style={{ marginTop: "0.2rem" }}
              />
              <span>
                I confirm that I am authorized to create this company workspace and manage grid asset telemetry.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.85rem",
              marginTop: "0.5rem",
              fontSize: "0.925rem"
            }}
          >
            {loading ? (
              <span>Provisioning Workspace...</span>
            ) : (
              <>
                <span>Create Industry Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "1.75rem", textAlign: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
          <span style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Already have an account?{" "}
          </span>
          <button
            type="button"
            onClick={() => onNavigate("login")}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--cyan)",
              fontSize: "0.825rem",
              fontWeight: 700,
              cursor: "pointer",
              padding: 0
            }}
          >
            Sign in to your workspace
          </button>
        </div>
      </div>
    </div>
  );
}
