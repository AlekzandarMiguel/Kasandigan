import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('kasandigan_access_token');
      if (token) {
        try {
          const res = await api.get('/auth/me/');
          setUser(res.data);
          localStorage.setItem('kasandigan_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session restore failed', err);
          setUser(null);
          localStorage.removeItem('kasandigan_access_token');
          localStorage.removeItem('kasandigan_refresh_token');
          localStorage.removeItem('kasandigan_user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    const { access, refresh } = res.data;
    localStorage.setItem('kasandigan_access_token', access);
    localStorage.setItem('kasandigan_refresh_token', refresh);

    const userRes = await api.get('/auth/me/');
    setUser(userRes.data);
    localStorage.setItem('kasandigan_user', JSON.stringify(userRes.data));
    return userRes.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register/', userData);
    const { access, refresh, user: newUser } = res.data;
    localStorage.setItem('kasandigan_access_token', access);
    localStorage.setItem('kasandigan_refresh_token', refresh);
    setUser(newUser);
    localStorage.setItem('kasandigan_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('kasandigan_access_token');
    localStorage.removeItem('kasandigan_refresh_token');
    localStorage.removeItem('kasandigan_user');
    setUser(null);
  };

  const refreshUserProfile = async () => {
    try {
      const res = await api.get('/auth/me/');
      setUser(res.data);
      localStorage.setItem('kasandigan_user', JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  const isPlatformAdmin = user?.role === 'PLATFORM_ADMIN';
  const isBarangayAdmin = user?.role === 'BARANGAY_ADMIN';
  const isBarangayStaff = user?.role === 'BARANGAY_STAFF';
  const isResident = user?.role === 'RESIDENT';
  const isVerified = user?.verification_status === 'VERIFIED';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUserProfile,
        isPlatformAdmin,
        isBarangayAdmin,
        isBarangayStaff,
        isResident,
        isVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
