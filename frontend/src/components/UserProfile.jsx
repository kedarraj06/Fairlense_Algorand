// frontend/src/components/UserProfile.jsx
// User profile management component

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';

const UserProfile = ({ onClose }) => {
  const { user, setUser } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    walletAddress: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        role: user.role || '',
        walletAddress: user.walletAddress || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateWalletAddress = (address) => {
    if (!address) return true; // Optional field
    return /^[A-Z2-7]{58}$/.test(address);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.walletAddress && !validateWalletAddress(formData.walletAddress)) {
        throw new Error('Invalid Algorand wallet address format');
      }

      const token = localStorage.getItem('fairlens_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          walletAddress: formData.walletAddress
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      // Update user in context
      setUser(data.user);
      localStorage.setItem('fairlens_user', JSON.stringify(data.user));

      toast.success('Profile updated successfully!');

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (formData.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      const token = localStorage.getItem('fairlens_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      toast.success('Password changed successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fairlens_token');
    localStorage.removeItem('fairlens_user');
    toast.success('Logged out successfully');
    if (onClose) onClose();
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      government: 'Government',
      contractor: 'Contractor',
      verifier: 'Verifier',
      viewer: 'Viewer'
    };
    return roleNames[role] || role;
  };

  if (!user) {
    return (
      <div className="user-profile">
        <div className="profile-container">
          <h2>Not Logged In</h2>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-container">
        <div className="profile-header">
          <h2>User Profile</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          )}
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="profile-content">
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value={getRoleDisplayName(formData.role)}
                  disabled
                  className="disabled-input"
                />
                <small>Role is assigned by administrators</small>
              </div>

              <div className="form-group">
                <label htmlFor="walletAddress">Algorand Wallet Address</label>
                <input
                  type="text"
                  id="walletAddress"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your Algorand wallet address"
                />
                <small>Your wallet address for blockchain transactions</small>
              </div>

              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading">
                    <span className="spinner"></span>
                    Updating...
                  </span>
                ) : (
                  'Update Profile'
                )}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="profile-content">
            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your new password"
                />
                <small>Must be at least 8 characters long</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm your new password"
                />
              </div>

              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading">
                    <span className="spinner"></span>
                    Changing Password...
                  </span>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </div>
        )}

        <div className="profile-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
