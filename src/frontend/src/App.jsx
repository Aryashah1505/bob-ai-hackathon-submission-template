import React, { useEffect, useState, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./pages/Dashboard";
import { SetupWizard } from "./pages/SetupWizard";
import { Prediction } from "./pages/Prediction";
import { Assets } from "./pages/Assets";
import { Alerts } from "./pages/Alerts";
import { Maintenance } from "./pages/Maintenance";
import { CrewPlanning } from "./pages/CrewPlanning";
import { Reports } from "./pages/Reports";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { api } from "./api/api";

function AppContent() {
  const { user, profile, activeWorkspace, role, authLoading, logout, switchWorkspace, userWorkspaces, refreshUserData } = useAuth();
  const [currentRoute, setCurrentRoute] = useState("dashboard");
  const [companies, setCompanies] = useState([]);
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [activeCompany, setActiveCompany] = useState(null);

  // Centralized Company-Scoped State
  const [dashboardData, setDashboardData] = useState(null);
  const [companyAssets, setCompanyAssets] = useState([]);
  const [companyAlerts, setCompanyAlerts] = useState(null);
  const [companyMaintenance, setCompanyMaintenance] = useState(null);
  const [companyCrew, setCompanyCrew] = useState(null);

  const [loading, setLoading] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState("");
  const [lastUpdatedDate, setLastUpdatedDate] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState(null);

  /**
   * Reset all company-specific arrays, objects, selection, and cached data
   */
  const resetCompanyWorkspace = useCallback(() => {
    setDashboardData(null);
    setCompanyAssets([]);
    setCompanyAlerts(null);
    setCompanyMaintenance(null);
    setCompanyCrew(null);
    setSelectedAsset(null);
    setAccessDeniedMessage(null);
  }, []);

  /**
   * Load isolated data for a specific company ID
   */
  const loadCompanyData = useCallback(async (companyId) => {
    if (!companyId) return;
    setLoading(true);
    resetCompanyWorkspace();

    try {
      const [dash, assets, alerts, maint, crew] = await Promise.all([
        api.getCompanyDashboard(companyId).catch((err) => {
          if (err.message && (err.message.includes("403") || err.message.toLowerCase().includes("access"))) {
            setAccessDeniedMessage("You do not have access to this company workspace.");
          }
          return null;
        }),
        api.getCompanyAssets(companyId).catch(() => []),
        api.getCompanyAlerts(companyId).catch(() => null),
        api.getCompanyMaintenancePlan(companyId).catch(() => null),
        api.getCompanyCrewPlan(companyId).catch(() => null),
      ]);

      setDashboardData(dash);
      setCompanyAssets(Array.isArray(assets) ? assets : []);
      setCompanyAlerts(alerts);
      setCompanyMaintenance(maint);
      setCompanyCrew(crew);

      const now = new Date();
      setLastUpdatedDate(now);
      setLastUpdatedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error(`Failed to load company ${companyId} data:`, err);
    } finally {
      setLoading(false);
    }
  }, [resetCompanyWorkspace]);

  /**
   * Sync active company when user workspaces update
   */
  useEffect(() => {
    if (userWorkspaces.length > 0) {
      setCompanies(userWorkspaces);
      const active = activeWorkspace || userWorkspaces[0];
      setActiveCompanyId(active.id);
      setActiveCompany(active);
      loadCompanyData(active.id);
    } else {
      // Fetch open companies from backend if workspaces list is empty
      api.getCompanies().then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setCompanies(res);
          const savedCompanyId = localStorage.getItem("pravaha_active_company_id");
          let active = res.find((c) => String(c.id) === String(savedCompanyId)) || res[0];
          setActiveCompanyId(active.id);
          setActiveCompany(active);
          loadCompanyData(active.id);
        } else {
          setCompanies([]);
          setActiveCompanyId(null);
          setActiveCompany(null);
          resetCompanyWorkspace();
        }
      }).catch(() => {
        setCompanies([]);
        setActiveCompanyId(null);
        setActiveCompany(null);
        resetCompanyWorkspace();
      });
    }
  }, [user, userWorkspaces, activeWorkspace, loadCompanyData, resetCompanyWorkspace]);

  /**
   * Switch Active Company
   */
  const handleSelectCompany = async (company) => {
    if (!company || company.id === activeCompanyId) return;
    switchWorkspace(company);
    setActiveCompanyId(company.id);
    setActiveCompany(company);
    await loadCompanyData(company.id);
  };

  /**
   * Triggered when Onboarding Wizard finishes Submit and Save
   */
  const handleCompanyOnboarded = async (newCompany) => {
    setShowAddCompanyModal(false);
    setCurrentRoute("dashboard");
    resetCompanyWorkspace();
    await refreshUserData();
  };

  /**
   * Remove / Delete Industry Workspace
   */
  const handleDeleteCompany = async (companyToDelete) => {
    const target = companyToDelete || activeCompany;
    if (!target) return;

    if (role === "viewer") {
      alert("Permission notice: Admin or engineer privileges are required to remove an industry profile.");
      return;
    }

    setLoading(true);
    try {
      await api.deleteCompany(target.id);
      resetCompanyWorkspace();
      
      // Update local storage
      localStorage.removeItem("pravaha_active_company_id");
      
      // Refresh workspaces list
      await refreshUserData();

      // Fetch latest list of companies
      const remainingCompanies = await api.getCompanies().catch(() => []);
      if (Array.isArray(remainingCompanies) && remainingCompanies.length > 0) {
        setCompanies(remainingCompanies);
        const nextActive = remainingCompanies[0];
        setActiveCompanyId(nextActive.id);
        setActiveCompany(nextActive);
        await loadCompanyData(nextActive.id);
      } else {
        setCompanies([]);
        setActiveCompanyId(null);
        setActiveCompany(null);
      }
    } catch (err) {
      console.error("Failed to delete company:", err);
      alert("Failed to delete industry: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!activeCompanyId) return;
    if (role === "viewer") {
      alert("Permission notice: You need engineer or admin role to run risk analysis.");
      return;
    }
    setLoading(true);
    try {
      await api.analyzeCompany(activeCompanyId);
      await loadCompanyData(activeCompanyId);
    } catch (err) {
      console.error("Failed to run analysis:", err);
      alert("Failed to run risk analysis: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. Unauthenticated / Guest or Authenticated: Default directly to dashboard & main interface
  // Explicit route rendering for auth pages only if explicitly navigated to (e.g. testing)
  if (currentRoute === "login") {
    return (
      <LoginPage
        onNavigate={(route) => setCurrentRoute(route)}
        onLoginSuccess={() => setCurrentRoute("dashboard")}
      />
    );
  }
  if (currentRoute === "signup") {
    return (
      <SignupPage
        onNavigate={(route) => setCurrentRoute(route)}
        onSignupSuccess={() => setCurrentRoute("dashboard")}
      />
    );
  }
  if (currentRoute === "forgot-password") {
    return (
      <ForgotPasswordPage
        onNavigate={(route) => setCurrentRoute(route)}
      />
    );
  }

  // Onboarding route if explicitly opened or no companies exist and user opened onboarding
  if (currentRoute === "onboarding" || (companies.length === 0 && !showAddCompanyModal && currentRoute !== "dashboard")) {
    return (
      <div className="app-shell" style={{ justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
        <SetupWizard
          onSetupCompleted={handleCompanyOnboarded}
          user={user}
        />
      </div>
    );
  }

  const gridStatus = dashboardData?.grid_status || "Monitoring Active";

  const routeTitles = {
    dashboard: "Company Dashboard",
    prediction: "Risk Prediction Engine",
    assets: "Grid Asset Directory",
    alerts: "Active Alarms & Threats",
    maintenance: "Maintenance Work Orders",
    crew: "Crew Pre-Positioning Logistics",
    reports: "Executive Reliability Reports"
  };

  return (
    <div className="app-shell">
      {/* 🌟 1. Sticky Left Sidebar with Company Switcher & User Profile */}
      <Sidebar 
        currentRoute={currentRoute} 
        onNavigate={(route) => {
          setCurrentRoute(route);
          if (route !== "assets") setSelectedAsset(null);
        }}
        industries={companies}
        selectedIndustry={activeCompany}
        onSelectIndustry={handleSelectCompany}
        onOpenAddIndustry={() => {
          if (role !== "admin") {
            alert("Permission notice: You need admin permission to add new utility company workspaces.");
            return;
          }
          resetCompanyWorkspace();
          setShowAddCompanyModal(true);
        }}
        user={user}
        profile={profile}
        role={role}
        onLogout={logout}
      />

      {/* 🌟 2. Main Viewport */}
      <div className="main-viewport">
        <TopBar
          title={routeTitles[currentRoute] || "Operations"}
          systemStatus={gridStatus}
          onRefresh={() => activeCompanyId && loadCompanyData(activeCompanyId)}
          loading={loading}
          lastUpdatedDate={lastUpdatedDate}
          lastUpdatedTime={lastUpdatedTime}
        />

        {/* Modal: Add Company Onboarding Wizard */}
        {showAddCompanyModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}>
            <div style={{ width: "100%", maxWidth: "860px", maxHeight: "92vh", overflowY: "auto" }}>
              <SetupWizard
                onSetupCompleted={handleCompanyOnboarded}
                onCancel={() => setShowAddCompanyModal(false)}
                user={user}
              />
            </div>
          </div>
        )}

        {/* Access Denied Banner if user tries to open unassigned workspace */}
        {accessDeniedMessage && (
          <div className="page-container">
            <div className="glass-panel" style={{ padding: "2rem", border: "1px solid rgba(239, 68, 68, 0.4)", background: "rgba(239, 68, 68, 0.08)" }}>
              <h3 style={{ color: "var(--status-danger)", fontWeight: 700, fontSize: "1.1rem" }}>
                Workspace Access Denied
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                {accessDeniedMessage}
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Route Pages */}
        {!accessDeniedMessage && (
          <main style={{ flex: 1 }}>
            {currentRoute === "dashboard" && (
              <Dashboard
                companyDashboard={dashboardData}
                selectedCompany={activeCompany}
                loading={loading}
                onNavigate={(route) => setCurrentRoute(route)}
                onSelectAsset={(asset) => {
                  setSelectedAsset(asset);
                  setCurrentRoute("assets");
                }}
                onOpenAddCompany={() => {
                  if (role !== "admin") {
                    alert("Permission notice: Admin role is required to add utility profiles.");
                    return;
                  }
                  resetCompanyWorkspace();
                  setShowAddCompanyModal(true);
                }}
                onRemoveCompany={handleDeleteCompany}
                onRunAnalysis={handleRunAnalysis}
                userRole={role}
              />
            )}

            {currentRoute === "prediction" && (
              <Prediction onDataSaved={() => activeCompanyId && loadCompanyData(activeCompanyId)} />
            )}

            {currentRoute === "assets" && (
              <Assets
                equipmentList={companyAssets}
                selectedAsset={selectedAsset}
                onSelectAsset={(asset) => setSelectedAsset(asset)}
                onClearSelected={() => setSelectedAsset(null)}
                selectedCompany={activeCompany}
              />
            )}

            {currentRoute === "alerts" && (
              <Alerts
                alertsData={companyAlerts}
                onSelectAsset={(asset) => {
                  setSelectedAsset(asset);
                  setCurrentRoute("assets");
                }}
                onNavigate={(route) => setCurrentRoute(route)}
                selectedCompany={activeCompany}
              />
            )}

            {currentRoute === "maintenance" && (
              <Maintenance 
                maintenanceData={companyMaintenance} 
                selectedCompany={activeCompany} 
              />
            )}

            {currentRoute === "crew" && (
              <CrewPlanning 
                crewData={companyCrew} 
                selectedCompany={activeCompany} 
              />
            )}

            {currentRoute === "reports" && (
              <Reports />
            )}
          </main>
        )}
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

