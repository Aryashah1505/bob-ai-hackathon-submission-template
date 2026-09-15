import React from "react";
import { 
  LayoutDashboard, 
  Activity, 
  Cpu, 
  Bell, 
  Wrench, 
  Users, 
  FileText,
  Building2,
  PlusCircle,
  ChevronDown,
  LogOut
} from "lucide-react";

export function Sidebar({ 
  currentRoute, 
  onNavigate, 
  industries = [], 
  selectedIndustry, 
  onSelectIndustry, 
  onOpenAddIndustry,
  user,
  profile,
  role,
  onLogout
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, ready: true },
    { id: "prediction", label: "Prediction Engine", icon: Activity, ready: true },
    { id: "assets", label: "Grid Assets", icon: Cpu, ready: true },
    { id: "alerts", label: "Risk Alerts", icon: Bell, ready: true },
    { id: "maintenance", label: "Maintenance", icon: Wrench, ready: true },
    { id: "crew", label: "Crew Planning", icon: Users, ready: true },
    { id: "reports", label: "Reports", icon: FileText, ready: false },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Logo & Tagline */}
      <div className="brand-section">
        <svg className="brand-logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6"/>
          <path d="M20 6L28 20L20 34L12 20L20 6Z" fill="url(#brandGrad)" stroke="#38bdf8" strokeWidth="1.5"/>
          <path d="M21 11L14 22H21L19 29L26 18H19L21 11Z" fill="#ffffff"/>
          <defs>
            <linearGradient id="brandGrad" x1="12" y1="6" x2="28" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0284c7" stopOpacity="0.8"/>
              <stop offset="1" stopColor="#38bdf8" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
        </svg>
        <div>
          <h1 className="brand-title">PRAVAHA</h1>
          <p className="brand-tagline">Smarter Insights. Stronger Grids.</p>
        </div>
      </div>

      {/* Active Industry Selector Dropdown */}
      <div style={{ padding: "0.85rem 0.85rem 0.5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700 }}>
            Active Industry
          </span>
          <button
            onClick={onOpenAddIndustry}
            title="Add new industry profile"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--cyan)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.75rem",
              fontWeight: 700
            }}
          >
            <PlusCircle size={14} />
            <span>Add</span>
          </button>
        </div>

        {industries.length > 0 ? (
          <div style={{ position: "relative" }}>
            <select
              value={selectedIndustry?.id || ""}
              onChange={(e) => {
                const found = industries.find((i) => String(i.id) === e.target.value);
                if (found) onSelectIndustry(found);
              }}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                background: "#0a101d",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.825rem",
                fontWeight: 600,
                cursor: "pointer",
                outline: "none"
              }}
            >
              {industries.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name} ({ind.region})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ padding: "0.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--text-dim)" }}>
            No industry active
          </div>
        )}
      </div>

      {/* Navigation Group */}
      <nav className="nav-group" aria-label="Main Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {!item.ready && <span className="nav-badge-soon">Soon</span>}
            </button>
          );
        })}
      </nav>

      {/* Operator Status & Workspace Role */}
      <div style={{
        padding: "0.85rem 1rem",
        borderTop: "1px solid var(--border-subtle)",
        background: "rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {profile?.full_name || user?.email?.split("@")[0] || "Operations Engineer"}
            </div>
            <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {selectedIndustry?.name || "Grid Operations"}
            </div>
          </div>
          <span style={{
            padding: "0.2rem 0.5rem",
            borderRadius: "4px",
            fontSize: "0.675rem",
            fontWeight: 800,
            textTransform: "uppercase",
            background: role === "admin" ? "rgba(56, 189, 248, 0.15)" : role === "engineer" ? "rgba(245, 158, 11, 0.15)" : "rgba(148, 163, 184, 0.15)",
            color: role === "admin" ? "var(--cyan)" : role === "engineer" ? "var(--amber)" : "var(--text-secondary)",
            border: `1px solid ${role === "admin" ? "rgba(56, 189, 248, 0.3)" : role === "engineer" ? "rgba(245, 158, 11, 0.3)" : "rgba(148, 163, 184, 0.3)"}`
          }}>
            {role || "Admin"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <span>Control Console v1.4</span>
        <span style={{ color: "#38bdf8" }}>Live Operations</span>
      </div>
    </aside>
  );
}
