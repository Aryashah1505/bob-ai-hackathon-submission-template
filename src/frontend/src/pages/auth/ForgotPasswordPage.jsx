import React, { useState } from "react";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function ForgotPasswordPage({ onNavigate }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
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
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      console.error("Password reset error:", err);
      // For privacy/security: always present generic positive message to prevent user enumeration
      setSubmitted(true);
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
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
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
            <KeyRound size={28} />
          </div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.02em" }}>
            Reset Your Password
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
            Enter your work email and we'll send you instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div>
            <div style={{
              background: "rgba(52, 211, 153, 0.12)",
              border: "1px solid rgba(52, 211, 153, 0.35)",
              borderRadius: "var(--radius-sm)",
              padding: "1.25rem",
              marginBottom: "1.5rem",
              textAlign: "center"
            }}>
              <CheckCircle2 size={32} style={{ color: "var(--status-success)", margin: "0 auto 0.75rem" }} />
              <p style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 600 }}>
                Reset Link Dispatched
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.35rem", lineHeight: 1.4 }}>
                If an account exists for <strong>{email}</strong>, a password reset link has been sent to your inbox.
              </p>
            </div>

            <button
              type="button"
              className="btn-icon"
              onClick={() => onNavigate("login")}
              style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
            >
              <ArrowLeft size={16} />
              <span>Return to Sign In</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {error && (
              <div style={{
                background: "rgba(251, 113, 133, 0.12)",
                border: "1px solid rgba(251, 113, 133, 0.35)",
                borderRadius: "var(--radius-sm)",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: "var(--status-danger)",
                fontSize: "0.85rem"
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

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
                  required
                  style={{ paddingLeft: "2.4rem" }}
                />
                <Mail size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "0.85rem",
                fontSize: "0.925rem"
              }}
            >
              {loading ? (
                <span>Sending Instructions...</span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-icon"
              onClick={() => onNavigate("login")}
              style={{ width: "100%", justifyContent: "center", border: "none", color: "var(--text-muted)", fontSize: "0.825rem", padding: "0.5rem" }}
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
