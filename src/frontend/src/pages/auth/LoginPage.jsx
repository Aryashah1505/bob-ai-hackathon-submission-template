import React, { useState } from "react";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function LoginPage({ onNavigate, onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        onNavigate("dashboard");
      }
    } catch (err) {
      console.error("Login failure:", err);
      // Clean, professional user-facing error message
      let msg = err.message || "Invalid email or password.";
      const lower = msg.toLowerCase();
      if (
        lower.includes("invalid login credentials") ||
        lower.includes("invalid grant") ||
        lower.includes("invalid_credentials")
      ) {
        msg = "Invalid email or password. Please verify your credentials.";
      } else if (
        lower.includes("load failed") ||
        lower.includes("failed to fetch") ||
        lower.includes("networkerror") ||
        lower.includes("fetch failed")
      ) {
        msg = "Network connection to authentication server failed. Please verify your connection or Supabase settings.";
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
      padding: "2rem 1rem",
    }}>
      <div className="glass-panel" style={{
        maxWidth: "440px",
        width: "100%",
        padding: "2.5rem 2.25rem",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.45)",
        border: "1px solid var(--border-default)",
        position: "relative",
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "rgba(34, 167, 240, 0.12)",
            border: "1px solid rgba(34, 167, 240, 0.3)",
            color: "var(--cyan)",
            marginBottom: "1rem"
          }}>
            <svg viewBox="0 0 40 40" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6"/>
              <path d="M20 6L28 20L20 34L12 20L20 6Z" fill="url(#loginBrandGrad)" stroke="#38bdf8" strokeWidth="1.5"/>
              <path d="M21 11L14 22H21L19 29L26 18H19L21 11Z" fill="#ffffff"/>
              <defs>
                <linearGradient id="loginBrandGrad" x1="12" y1="6" x2="28" y2="34" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0284c7" stopOpacity="0.8"/>
                  <stop offset="1" stopColor="#38bdf8" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.02em" }}>
            Sign in to PRAVAHA
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
            Industrial Grid Outage Prediction & Equipment Risk Advisor
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
            marginBottom: "1.5rem",
            color: "var(--status-danger)",
            fontSize: "0.85rem"
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Work Email
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                className="input-field"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                style={{ paddingLeft: "2.4rem" }}
              />
              <Mail size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate("forgot-password")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--cyan)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ paddingLeft: "2.4rem", paddingRight: "2.5rem" }}
              />
              <Lock size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer"
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember this session</span>
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
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
          <span style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            New to PRAVAHA?{" "}
          </span>
          <button
            type="button"
            onClick={() => onNavigate("signup")}
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
            Create an industry account
          </button>
        </div>
      </div>
    </div>
  );
}
