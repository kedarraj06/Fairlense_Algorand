// frontend/src/components/UserAuth.jsx
// User authentication component for FairLens

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';

const UserAuth = ({ onAuthSuccess, onAuthCancel }) => {
  const { setUser, setToken } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    walletAddress: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Available roles
  const roles = [
    { value: 'viewer', label: 'Viewer', description: 'View-only access' },
    { value: 'contractor', label: 'Contractor', description: 'Submit proofs and view contracts' },
    { value: 'verifier', label: 'Verifier', description: 'Create attestations' },
    { value: 'government', label: 'Government', description: 'Create and manage contracts' },
    { value: 'admin', label: 'Admin', description: 'Full system access' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }

      if (!formData.role) {
        setError('Please select a role');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            role: formData.role,
            walletAddress: formData.walletAddress || undefined
          };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store user data and token
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('fairlens_token', data.token);
      localStorage.setItem('fairlens_user', JSON.stringify(data.user));

      toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
      
      if (onAuthSuccess) {
        onAuthSuccess(data.user);
      }

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fairlens_token');
    localStorage.removeItem('fairlens_user');
    toast.success('Logged out successfully');
  };

  return (
    <div className="user-auth">
      <div className="auth-container">
        <div className="auth-header">
          <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <p>
            {isLogin 
              ? 'Sign in to your FairLens account' 
              : 'Create a new FairLens account'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm your password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="walletAddress">Algorand Wallet Address (Optional)</label>
                <input
                  type="text"
                  id="walletAddress"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your Algorand wallet address"
                />
                <small>You can add this later in your profile</small>
              </div>
            </>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="loading">
                <span className="spinner"></span>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="auth-toggle"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  role: 'viewer',
                  walletAddress: ''
                });
              }}
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </div>

        {onAuthCancel && (
          <div className="auth-cancel">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onAuthCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAuth;
