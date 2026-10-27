import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shareplate_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('shareplate_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('shareplate_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('shareplate_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, signing out:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('shareplate_token', receivedToken);
      localStorage.setItem('shareplate_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('shareplate_token', receivedToken);
      localStorage.setItem('shareplate_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('shareplate_token');
    localStorage.removeItem('shareplate_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('shareplate_user', JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const isDonor = user?.role === 'donor';
  const isRecipient = user?.role === 'recipient';
  const isAdmin = user?.role === 'admin';
  const isVerifiedRecipient = isRecipient && user?.organization?.verificationStatus === 'approved';
  const isPendingRecipient = isRecipient && user?.organization?.verificationStatus === 'pending';
  const isRejectedRecipient = isRecipient && user?.organization?.verificationStatus === 'rejected';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isDonor,
        isRecipient,
        isAdmin,
        isVerifiedRecipient,
        isPendingRecipient,
        isRejectedRecipient,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
