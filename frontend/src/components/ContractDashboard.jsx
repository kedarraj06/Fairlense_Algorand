// frontend/src/components/ContractDashboard.jsx
// Contract dashboard component for FairLens

import React, { useState, useEffect } from 'react';
import AlgorandService from '../services/AlgorandService';

const ContractDashboard = ({ appId, walletInfo }) => {
  const [contractState, setContractState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [milestones, setMilestones] = useState([]);

  // Load contract state
  const loadContractState = async () => {
    if (!appId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const state = await AlgorandService.getContractState(appId);
      setContractState(state);
      
      // Parse milestones from global state
      const parsedMilestones = parseMilestones(state.global_state);
      setMilestones(parsedMilestones);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Parse milestones from global state
  const parseMilestones = (globalState) => {
    const milestoneMap = {};
    
    Object.entries(globalState).forEach(([key, value]) => {
      if (key.startsWith('m') && key.includes('_')) {
        const parts = key.split('_');
        const index = parts[0].substring(1); // Remove 'm' prefix
        const field = parts[1];
        
        if (!milestoneMap[index]) {
          milestoneMap[index] = { index: parseInt(index) };
        }
        
        milestoneMap[index][field] = value;
      }
    });
    
    return Object.values(milestoneMap).sort((a, b) => a.index - b.index);
  };

  useEffect(() => {
    loadContractState();
  }, [appId]);

  if (!appId) {
    return (
      <div className="contract-dashboard">
        <h2>Contract Dashboard</h2>
        <p>Please enter a contract ID to view details.</p>
      </div>
    );
  }

  return (
    <div className="contract-dashboard">
      <div className="dashboard-header">
        <h2>Contract Dashboard</h2>
        <div className="contract-info">
          <p><strong>Contract ID:</strong> {appId}</p>
          <button onClick={loadContractState} disabled={loading} className="btn btn-secondary">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {contractState && (
        <div className="contract-state">
          <h3>Contract State</h3>
          <div className="state-grid">
            <div className="state-item">
              <label>Owner:</label>
              <span>{contractState.global_state?.owner || 'N/A'}</span>
            </div>
            <div className="state-item">
              <label>Contractor:</label>
              <span>{contractState.global_state?.contractor || 'N/A'}</span>
            </div>
            <div className="state-item">
              <label>Total Milestones:</label>
              <span>{contractState.global_state?.total_ms || 0}</span>
            </div>
            <div className="state-item">
              <label>Current Milestone:</label>
              <span>{contractState.global_state?.cur_ms || 0}</span>
            </div>
            <div className="state-item">
              <label>Escrow Balance:</label>
              <span>{contractState.global_state?.escrow || 0} μAlgos</span>
            </div>
          </div>
        </div>
      )}

      {milestones.length > 0 && (
        <div className="milestones-section">
          <h3>Milestones</h3>
          <div className="milestones-list">
            {milestones.map((milestone) => (
              <div key={milestone.index} className="milestone-card">
                <div className="milestone-header">
                  <h4>Milestone {milestone.index}</h4>
                  <span className={`status ${milestone.index < (contractState?.global_state?.cur_ms || 0) ? 'completed' : 'pending'}`}>
                    {milestone.index < (contractState?.global_state?.cur_ms || 0) ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <div className="milestone-details">
                  <p><strong>Amount:</strong> {milestone.amt || 0} μAlgos</p>
                  <p><strong>Due Date:</strong> {milestone.due ? new Date(milestone.due * 1000).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Hash:</strong> {milestone.hash || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {walletInfo && (
        <div className="wallet-info">
          <h3>Connected Wallet</h3>
          <p><strong>Address:</strong> {walletInfo.address}</p>
          <p><strong>Type:</strong> {walletInfo.walletType}</p>
        </div>
      )}
    </div>
  );
};

export default ContractDashboard;
