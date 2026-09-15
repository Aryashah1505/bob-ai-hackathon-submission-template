import { supabase } from "./supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const headers = { "Content-Type": "application/json", ...options.headers };

    // Automatically append Bearer token if Supabase session exists
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      // ignore
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });
    if (!res.ok) {
      let errorMsg = res.statusText;
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.detail || JSON.stringify(errorJson);
      } catch (e) {
        const errorText = await res.text();
        if (errorText) errorMsg = errorText;
      }
      throw new Error(errorMsg);
    }
    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    console.error(`Request error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // System Health
  getHealth: () => request("/health"),

  // Authentication & Workspaces
  syncProfile: (payload) =>
    request("/auth/sync-profile", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getUserWorkspaces: () => request("/auth/workspaces"),
  createWorkspace: (payload) =>
    request("/auth/create-workspace", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Onboarding & Company Verification
  previewCompanyInfo: (payload) =>
    request("/company-lookup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  submitOnboarding: (payload) =>
    request("/companies/onboarding", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  saveFullSetup: (payload) =>
    request("/companies/onboarding", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Company Analysis Trigger
  analyzeCompany: (companyId) =>
    request(`/companies/${companyId}/analyze`, {
      method: "POST",
    }),

  // Company Scoped Queries
  getCompanies: () => request("/companies"),
  getCompany: (id) => request(`/companies/${id}`),
  deleteCompany: (id) =>
    request(`/companies/${id}`, {
      method: "DELETE",
    }),

  getCompanyDashboard: (companyId) => request(`/companies/${companyId}/dashboard`),
  getCompanyAssets: (companyId) => request(`/companies/${companyId}/assets`),
  getCompanyAlerts: (companyId) => request(`/companies/${companyId}/alerts`),
  getCompanyMaintenancePlan: (companyId) => request(`/companies/${companyId}/maintenance-plan`),
  getCompanyCrewPlan: (companyId) => request(`/companies/${companyId}/crew-plan`),

  // Aliases for compatibility
  getIndustries: () => request("/companies"),
  getIndustryDashboard: (id) => request(`/companies/${id}/dashboard`),
  deleteIndustry: (id) =>
    request(`/companies/${id}`, {
      method: "DELETE",
    }),

  // Notification Testing
  testNotification: (payload) =>
    request("/notifications/test", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getNotificationLogs: () => request("/notifications/logs"),

  // Interactive Prediction Tools
  predictEquipmentFailure: (payload) =>
    request("/api/predict/equipment-failure", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  predictOutageRisk: (payload) =>
    request("/api/predict/outage-risk", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getMaintenanceRecommendations: (payload) =>
    request("/api/recommendations/maintenance", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
