// AuthContext.jsx
// Authentication context for FairLens frontend

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import peraWalletService from '../services/peraWallet';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          apiService.setToken(token);
          // Verify token with backend
          const response = await apiService.healthCheck();
          if (response.status === 'healthy') {
            // Get user info from token (in a real app, you'd decode the JWT)
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            if (userInfo.id) {
              setUser(userInfo);
              setIsAuthenticated(true);
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        apiService.clearToken();
        localStorage.removeItem('user_info');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(email, password);
      
      if (response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('user_info', JSON.stringify(response.user));
        return { success: true, user: response.user };
      } else {
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
      if (response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('user_info', JSON.stringify(response.user));
        return { success: true, user: response.user };
      } else {
        return { success: false, error: 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.logout();
      await peraWalletService.disconnect();
      
      setUser(null);
      setIsAuthenticated(false);
      setWalletConnected(false);
      localStorage.removeItem('user_info');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Connect Pera wallet
  const connectWallet = async () => {
    try {
      const response = await peraWalletService.connect();
      
      if (response.success) {
        setWalletConnected(true);
        return { success: true, address: response.address };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      return { success: false, error: error.message };
    }
  };

  // Disconnect Pera wallet
  const disconnectWallet = async () => {
    try {
      const response = await peraWalletService.disconnect();
      
      if (response.success) {
        setWalletConnected(false);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      return { success: false, error: error.message };
    }
  };

  // Get wallet status
  const getWalletStatus = () => {
    return peraWalletService.getConnectionStatus();
  };

  // Check if user has required role
  const hasRole = (requiredRole) => {
    return user && user.role === requiredRole;
  };

  // Check if user has any of the required roles
  const hasAnyRole = (requiredRoles) => {
    return user && requiredRoles.includes(user.role);
  };

  const value = {
    // State
    user,
    isLoading,
    isAuthenticated,
    walletConnected,
    
    // Actions
    login,
    register,
    logout,
    connectWallet,
    disconnectWallet,
    getWalletStatus,
    hasRole,
    hasAnyRole,
    
    // Services
    apiService,
    peraWalletService
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};