// frontend/src/components/MilestoneManager.jsx
// Milestone management component for FairLens

import React, { useState } from 'react';
import AlgorandService from '../services/AlgorandService';

const MilestoneManager = ({ appId, walletInfo, userRole }) => {
  const [milestoneData, setMilestoneData] = useState({
    index: 0,
    amount: '',
    dueDate: '',
    description: '',
    ipfsHash: ''
  });
  const [proofData, setProofData] = useState({
    milestoneIndex: 0,
    proofHash: ''
  });
  const [attestationData, setAttestationData] = useState({
    milestoneIndex: 0,
    status: 'PASS',
    milestoneHash: '',
    proofHash: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Add milestone (owner only)
  const handleAddMilestone = async (e) => {
    e.preventDefault();
    
    if (!walletInfo || userRole !== 'owner') {
      setError('Only contract owner can add milestones');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const dueTimestamp = Math.floor(new Date(milestoneData.dueDate).getTime() / 1000);
      
      const result = await AlgorandService.addMilestone(
        appId,
        walletInfo.address,
        milestoneData.index,
        parseInt(milestoneData.amount),
        dueTimestamp,
        milestoneData.ipfsHash || milestoneData.description
      );

      setSuccess(`Milestone ${milestoneData.index} added successfully! Transaction: ${result.txId}`);
      setMilestoneData({ index: 0, amount: '', dueDate: '', description: '', ipfsHash: '' });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit proof (contractor only)
  const handleSubmitProof = async (e) => {
    e.preventDefault();
    
    if (!walletInfo || userRole !== 'contractor') {
      setError('Only contractor can submit proofs');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await AlgorandService.submitProof(
        appId,
        walletInfo.address,
        proofData.milestoneIndex,
        proofData.proofHash
      );

      setSuccess(`Proof for milestone ${proofData.milestoneIndex} submitted successfully! Transaction: ${result.txId}`);
      setProofData({ milestoneIndex: 0, proofHash: '' });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create attestation (verifier)
  const handleCreateAttestation = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const attestation = await AlgorandService.createAttestation({
        app_id: appId,
        milestone_index: attestationData.milestoneIndex,
        status: attestationData.status,
        milestone_hash: attestationData.milestoneHash,
        proof_hash: attestationData.proofHash
      });

      setSuccess(`Attestation created successfully! Message: ${attestation.message}`);
      
      // Auto-trigger verify and release if user has wallet
      if (walletInfo) {
        try {
          const messageBytes = new TextEncoder().encode(attestation.message);
          const signatureBytes = new Uint8Array(Buffer.from(attestation.signature, 'hex'));
          
          const result = await AlgorandService.verifyAndRelease(
            appId,
            walletInfo.address,
            attestationData.milestoneIndex,
            messageBytes,
            signatureBytes
          );

          setSuccess(prev => prev + ` Payment released! Transaction: ${result.txId}`);
        } catch (releaseErr) {
          setError(prev => prev + ` Attestation created but payment release failed: ${releaseErr.message}`);
        }
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fund escrow (owner only)
  const handleFundEscrow = async () => {
    if (!walletInfo || userRole !== 'owner') {
      setError('Only contract owner can fund escrow');
      return;
    }

    const amount = prompt('Enter amount to fund escrow (in microAlgos):');
    if (!amount || isNaN(amount)) {
      setError('Invalid amount');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await AlgorandService.fundEscrow(
        appId,
        walletInfo.address,
        parseInt(amount)
      );

      setSuccess(`Escrow funded successfully! Transaction: ${result.txId}`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="milestone-manager">
      <h2>Milestone Management</h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}

      {/* Add Milestone Form (Owner) */}
      {userRole === 'owner' && (
        <div className="form-section">
          <h3>Add Milestone</h3>
          <form onSubmit={handleAddMilestone}>
            <div className="form-group">
              <label>Milestone Index:</label>
              <input
                type="number"
                value={milestoneData.index}
                onChange={(e) => setMilestoneData({...milestoneData, index: parseInt(e.target.value)})}
                required
              />
            </div>
            <div className="form-group">
              <label>Amount (microAlgos):</label>
              <input
                type="number"
                value={milestoneData.amount}
                onChange={(e) => setMilestoneData({...milestoneData, amount: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Due Date:</label>
              <input
                type="datetime-local"
                value={milestoneData.dueDate}
                onChange={(e) => setMilestoneData({...milestoneData, dueDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Description/IPFS Hash:</label>
              <textarea
                value={milestoneData.description}
                onChange={(e) => setMilestoneData({...milestoneData, description: e.target.value})}
                placeholder="Enter description or IPFS hash"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Adding...' : 'Add Milestone'}
            </button>
          </form>
          
          <div className="form-section">
            <h3>Fund Escrow</h3>
            <button onClick={handleFundEscrow} disabled={loading} className="btn btn-secondary">
              {loading ? 'Processing...' : 'Fund Escrow'}
            </button>
          </div>
        </div>
      )}

      {/* Submit Proof Form (Contractor) */}
      {userRole === 'contractor' && (
        <div className="form-section">
          <h3>Submit Proof</h3>
          <form onSubmit={handleSubmitProof}>
            <div className="form-group">
              <label>Milestone Index:</label>
              <input
                type="number"
                value={proofData.milestoneIndex}
                onChange={(e) => setProofData({...proofData, milestoneIndex: parseInt(e.target.value)})}
                required
              />
            </div>
            <div className="form-group">
              <label>Proof Hash:</label>
              <input
                type="text"
                value={proofData.proofHash}
                onChange={(e) => setProofData({...proofData, proofHash: e.target.value})}
                placeholder="Enter proof hash or IPFS hash"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Submitting...' : 'Submit Proof'}
            </button>
          </form>
        </div>
      )}

      {/* Create Attestation Form (Verifier) */}
      <div className="form-section">
        <h3>Create Attestation</h3>
        <form onSubmit={handleCreateAttestation}>
          <div className="form-group">
            <label>Milestone Index:</label>
            <input
              type="number"
              value={attestationData.milestoneIndex}
              onChange={(e) => setAttestationData({...attestationData, milestoneIndex: parseInt(e.target.value)})}
              required
            />
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select
              value={attestationData.status}
              onChange={(e) => setAttestationData({...attestationData, status: e.target.value})}
            >
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
          <div className="form-group">
            <label>Milestone Hash:</label>
            <input
              type="text"
              value={attestationData.milestoneHash}
              onChange={(e) => setAttestationData({...attestationData, milestoneHash: e.target.value})}
              placeholder="Enter milestone hash"
              required
            />
          </div>
          <div className="form-group">
            <label>Proof Hash:</label>
            <input
              type="text"
              value={attestationData.proofHash}
              onChange={(e) => setAttestationData({...attestationData, proofHash: e.target.value})}
              placeholder="Enter proof hash"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating...' : 'Create Attestation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MilestoneManager;
