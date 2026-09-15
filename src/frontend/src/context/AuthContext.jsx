import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../api/supabaseClient";
import { api } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userWorkspaces, setUserWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [role, setRole] = useState("admin");
  const [authLoading, setAuthLoading] = useState(true);

  // Load user profile & company memberships
  const loadUserData = useCallback(async (currentSession) => {
    const authUser = currentSession?.user || null;
    setUser(authUser);
    setSession(currentSession || null);

    try {
      let fullName = "Operations Engineer";
      if (authUser) {
        fullName = authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Operator";
        await api.syncProfile({
          user_id: authUser.id,
          full_name: fullName,
          phone_number: authUser.phone || null,
        }).catch((e) => console.warn("Profile sync notice:", e));

        setProfile({
          id: authUser.id,
          email: authUser.email,
          full_name: fullName,
        });
      } else {
        setProfile({
          id: "guest-operator",
          email: "operator@pravaha.internal",
          full_name: "Operations Engineer",
        });
      }

      // Fetch user or system workspaces
      const workspaces = await api.getUserWorkspaces().catch(() => []);
      const validWorkspaces = Array.isArray(workspaces) ? workspaces : [];
      setUserWorkspaces(validWorkspaces);

      if (validWorkspaces.length > 0) {
        // Select saved active company ID or first available
        const savedCompanyId = localStorage.getItem("pravaha_active_company_id");
        let active = validWorkspaces.find((w) => String(w.id) === String(savedCompanyId));
        if (!active) {
          active = validWorkspaces[0];
        }
        setActiveWorkspace(active);
        setRole(active.role || "admin");
        localStorage.setItem("pravaha_active_company_id", String(active.id));
      } else {
        setActiveWorkspace(null);
        setRole("admin");
      }
    } catch (err) {
      console.error("Failed to load user workspace data:", err);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Initialize Supabase Auth state listener
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        loadUserData(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        loadUserData(session);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [loadUserData]);

  // Sign in with Email and Password
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    await loadUserData(data.session);
    return data;
  };

  // Sign up with Email, Password, Profile, and Company
  const signup = async ({ fullName, email, password, companyName, industry, location, region }) => {
    // 1. Supabase Auth Signup
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          company_name: companyName.trim(),
          industry: industry ? industry.trim() : "",
          location: location ? location.trim() : "",
          region: region.trim(),
        },
      },
    });
    if (error) throw error;

    const createdUser = data.user;
    if (!createdUser) {
      throw new Error("Signup failed. Please check your network and try again.");
    }

    // 2. Profile Sync
    await api.syncProfile({
      user_id: createdUser.id,
      full_name: fullName.trim(),
      company_name: companyName.trim(),
      region: region.trim(),
      industry: industry ? industry.trim() : "",
    }).catch(() => {});

    // 3. Create initial workspace in database
    if (companyName && region) {
      try {
        const wsRes = await api.createWorkspace({
          name: companyName.trim(),
          region: region.trim(),
          customer_count: 0,
        });
        return { user: createdUser, workspace: wsRes };
      } catch (wsErr) {
        console.warn("Workspace auto-create fallback:", wsErr);
      }
    }

    return { user: createdUser };
  };

  // Send password reset email
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return true;
  };

  // Switch Active Workspace
  const switchWorkspace = (workspace) => {
    if (!workspace) return;
    setActiveWorkspace(workspace);
    setRole(workspace.role || "admin");
    localStorage.setItem("pravaha_active_company_id", String(workspace.id));
  };

  // Sign out
  const logout = async () => {
    localStorage.removeItem("pravaha_active_company_id");
    localStorage.removeItem("pravaha_onboarding_draft_v2");
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserWorkspaces([]);
    setActiveWorkspace(null);
    setRole("admin");
  };

  const value = {
    user,
    session,
    profile,
    userWorkspaces,
    activeWorkspace,
    role,
    authLoading,
    login,
    signup,
    logout,
    resetPassword,
    switchWorkspace,
    refreshUserData: () => loadUserData(session),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
