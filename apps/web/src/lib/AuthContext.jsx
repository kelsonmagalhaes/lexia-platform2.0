import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, saveUser, logout as doLogout, getProfile, saveProfile, registerAccount, loginWithPassword } from './auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const u = getUser();
    const p = getProfile();
    setUser(u);
    setProfile(p);
    setIsLoadingAuth(false);
  }, []);

  const login = (email, name) => {
    const u = { id: Date.now().toString(), email, name, created_at: new Date().toISOString() };
    const p = getProfile() || { current_period: 1, xp: 0, level: 1, institution: '' };
    saveUser(u);
    saveProfile(p);
    setUser(u);
    setProfile(p);
  };

  const loginAccount = async (email, password) => {
    const result = await loginWithPassword(email, password);
    if (result.error) return result;
    const { account } = result;
    const u = { id: account.id, email: account.email, name: account.name, created_at: account.created_at };
    const p = getProfile() || {
      current_period: account.period || 1,
      xp: 0,
      level: 1,
      institution: account.institution || '',
      phone: account.phone || '',
    };
    saveUser(u);
    saveProfile(p);
    setUser(u);
    setProfile(p);
    return {};
  };

  const register = async (data) => {
    const result = await registerAccount(data);
    if (result.error) return result;
    const { account } = result;
    const u = { id: account.id, email: account.email, name: account.name, created_at: account.created_at };
    const p = {
      current_period: account.period || 1,
      xp: 0,
      level: 1,
      institution: account.institution || '',
      phone: account.phone || '',
    };
    saveUser(u);
    saveProfile(p);
    setUser(u);
    setProfile(p);
    return {};
  };

  const updateProfile = (updates) => {
    const p = { ...(profile || {}), ...updates };
    saveProfile(p);
    setProfile(p);
  };

  const logout = () => {
    doLogout();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, isLoadingAuth,
      isLoadingPublicSettings: false,
      isAuthenticated: !!user,
      authError: null,
      login, loginAccount, register, logout, updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
