// frontend/src/App.jsx
// Main App component for FairLens with modern UI

import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import PeraWalletConnector from './components/PeraWalletConnector';
import ContractDashboard from './components/ContractDashboard';
import MilestoneManager from './components/MilestoneManager';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { AppProvider } from './context/AppContext';
import './App.css';

function App() {
  const [walletInfo, setWalletInfo] = useState(null);
  const [appId, setAppId] = useState('');
  const [userRole, setUserRole] = useState('viewer'); // owner, contractor, viewer
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedAppId = localStorage.getItem('fairlens_app_id');
    const savedUserRole = localStorage.getItem('fairlens_user_role');
    
    if (savedAppId) setAppId(savedAppId);
    if (savedUserRole) setUserRole(savedUserRole);
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (appId) localStorage.setItem('fairlens_app_id', appId);
  }, [appId]);

  useEffect(() => {
    if (userRole) localStorage.setItem('fairlens_user_role', userRole);
  }, [userRole]);

  const handleWalletConnected = (wallet) => {
    setWalletInfo(wallet);
    setError(null);
  };

  const handleWalletDisconnected = () => {
    setWalletInfo(null);
  };

  const handleError = (error) => {
    setError(error);
    console.error('App error:', error);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <AppProvider>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4caf50',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#f44336',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <header className="App-header">
            <div className="header-content">
              <h1>FairLens</h1>
              <p>Transparent Government Tenders on Algorand</p>
              <div className="header-badges">
                <span className="badge">Blockchain-Powered</span>
                <span className="badge">Milestone-Based</span>
                <span className="badge">Ed25519 Secured</span>
              </div>
            </div>
          </header>

          <main className="App-main">
            {error && (
              <div className="error-banner">
                <div className="error-content">
                  <span>⚠️ {error}</span>
                  <button onClick={clearError} className="error-close">×</button>
                </div>
              </div>
            )}

            {/* Wallet Connection */}
                    <section className="wallet-section">
                      <PeraWalletConnector 
                        onWalletConnected={handleWalletConnected}
                        onWalletDisconnected={handleWalletDisconnected}
                      />
                    </section>

            {/* Contract Configuration */}
            <section className="contract-config">
              <h2>Contract Configuration</h2>
              <div className="config-form">
                <div className="form-group">
                  <label>Contract ID:</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="Enter Algorand Application ID"
                    className="contract-id-input"
                  />
                  <small>Enter the deployed smart contract application ID</small>
                </div>
                <div className="form-group">
                  <label>Your Role:</label>
                  <select 
                    value={userRole} 
                    onChange={(e) => setUserRole(e.target.value)}
                    className="role-select"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="owner">Owner (Government)</option>
                    <option value="contractor">Contractor</option>
                    <option value="verifier">Verifier (AI/Inspector)</option>
                  </select>
                  <small>Select your role in the tender process</small>
                </div>
              </div>
            </section>

            {/* Contract Dashboard */}
            {appId && (
              <section className="dashboard-section">
                <ContractDashboard 
                  appId={parseInt(appId)} 
                  walletInfo={walletInfo}
                  onError={handleError}
                />
              </section>
            )}

            {/* Milestone Management */}
            {appId && walletInfo && (
              <section className="milestone-section">
                <MilestoneManager 
                  appId={parseInt(appId)}
                  walletInfo={walletInfo}
                  userRole={userRole}
                  onError={handleError}
                />
              </section>
            )}

            {/* Quick Start Guide */}
            <section className="instructions">
              <h2>Quick Start Guide</h2>
              <div className="instructions-grid">
                <div className="instruction-card">
                  <div className="instruction-icon">🔗</div>
                  <h3>1. Connect Wallet</h3>
                  <p>Install AlgoSigner browser extension and connect your Algorand TestNet wallet.</p>
                  <a href="https://algosigner.app/" target="_blank" rel="noopener noreferrer" className="instruction-link">
                    Get AlgoSigner →
                  </a>
                </div>
                <div className="instruction-card">
                  <div className="instruction-icon">⚙️</div>
                  <h3>2. Configure Contract</h3>
                  <p>Enter your contract ID and select your role (owner, contractor, or verifier).</p>
                </div>
                <div className="instruction-card">
                  <div className="instruction-icon">📋</div>
                  <h3>3. Manage Milestones</h3>
                  <p>Add milestones, submit proofs, create attestations, and release payments.</p>
                </div>
                <div className="instruction-card">
                  <div className="instruction-icon">📊</div>
                  <h3>4. Monitor Progress</h3>
                  <p>View contract state, milestone status, and transaction history in real-time.</p>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="features-section">
              <h2>Key Features</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <h3>🔒 Secure Smart Contracts</h3>
                  <p>Built with PyTeal and secured by Ed25519 signature verification</p>
                </div>
                <div className="feature-card">
                  <h3>💰 Automated Payments</h3>
                  <p>Inner transactions ensure automatic milestone payments upon verification</p>
                </div>
                <div className="feature-card">
                  <h3>🤖 AI Integration</h3>
                  <p>Off-chain AI verification with on-chain attestations</p>
                </div>
                <div className="feature-card">
                  <h3>📱 Modern Interface</h3>
                  <p>Intuitive React frontend with real-time updates</p>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="App-footer">
            <div className="footer-content">
              <div className="footer-section">
                <h4>FairLens</h4>
                <p>Transparent government tenders on Algorand blockchain</p>
              </div>
              <div className="footer-section">
                <h4>Resources</h4>
                <div className="footer-links">
                  <a href="https://developer.algorand.org" target="_blank" rel="noopener noreferrer">
                    Algorand Developer Portal
                  </a>
                  <a href="https://pyteal.readthedocs.io" target="_blank" rel="noopener noreferrer">
                    PyTeal Documentation
                  </a>
                  <a href="https://github.com/your-org/fairlens" target="_blank" rel="noopener noreferrer">
                    GitHub Repository
                  </a>
                </div>
              </div>
              <div className="footer-section">
                <h4>Technology</h4>
                <p>Built on Algorand • Powered by PyTeal • Secured by Ed25519</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 FairLens. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
