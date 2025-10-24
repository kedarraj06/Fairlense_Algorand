// frontend/src/components/blockchain\BlockchainTransaction.tsx
// Component for handling blockchain transactions with Pera Wallet

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { usePeraWallet } from '../../wallet/usePeraWallet';

const BlockchainTransaction = ({ contractAddress, appId }) => {
  const {
    accountAddress,
    isConnected,
    signTransaction,
    signTransactions,
    deployContract,
    addMilestone,
    submitMilestoneProof,
    verifyAndReleasePayment,
    fundEscrow
  } = usePeraWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [contractData, setContractData] = useState({
    ownerAddress: '',
    contractorAddress: '',
    verifierPubkey: '',
    projectTitle: ''
  });
  
  const [milestoneData, setMilestoneData] = useState({
    index: 0,
    amount: 0,
    dueTimestamp: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
    description: ''
  });
  
  const [proofData, setProofData] = useState({
    milestoneIndex: 0,
    proofHash: ''
  });
  
  const [verificationData, setVerificationData] = useState({
    milestoneIndex: 0,
    message: '',
    signature: ''
  });
  
  const [fundingData, setFundingData] = useState({
    amount: 0
  });

  const handleDeployContract = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your wallet first"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await deployContract(
        contractData.ownerAddress,
        contractData.contractorAddress,
        contractData.verifierPubkey,
        contractData.projectTitle
      );
      
      if (result.success) {
        toast.success("Contract Deployed", {
          description: "Smart contract deployed successfully"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Deployment Failed", {
        description: error.message || "Failed to deploy contract"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!isConnected || !appId) {
      toast.error("Missing Information", {
        description: "Please connect wallet and provide contract ID"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await addMilestone(
        appId,
        accountAddress,
        milestoneData.index,
        milestoneData.amount,
        milestoneData.dueTimestamp,
        milestoneData.description
      );
      
      if (result.success) {
        toast.success("Milestone Added", {
          description: "Milestone added to contract successfully"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Add Milestone Failed", {
        description: error.message || "Failed to add milestone"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!isConnected || !appId) {
      toast.error("Missing Information", {
        description: "Please connect wallet and provide contract ID"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await submitMilestoneProof(
        appId,
        accountAddress,
        proofData.milestoneIndex,
        proofData.proofHash
      );
      
      if (result.success) {
        toast.success("Proof Submitted", {
          description: "Milestone proof submitted successfully"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Proof Submission Failed", {
        description: error.message || "Failed to submit proof"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRelease = async (e) => {
    e.preventDefault();
    if (!isConnected || !appId) {
      toast.error("Missing Information", {
        description: "Please connect wallet and provide contract ID"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Convert message and signature to bytes
      const messageBytes = new TextEncoder().encode(verificationData.message);
      const signatureBytes = new Uint8Array(verificationData.signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      
      const result = await verifyAndReleasePayment(
        appId,
        accountAddress,
        verificationData.milestoneIndex,
        messageBytes,
        signatureBytes
      );
      
      if (result.success) {
        toast.success("Payment Released", {
          description: "Milestone verified and payment released"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Verification Failed", {
        description: error.message || "Failed to verify and release payment"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundEscrow = async (e) => {
    e.preventDefault();
    if (!isConnected || !appId) {
      toast.error("Missing Information", {
        description: "Please connect wallet and provide contract ID"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await fundEscrow(
        appId,
        accountAddress,
        fundingData.amount
      );
      
      if (result.success) {
        toast.success("Escrow Funded", {
          description: "Escrow account funded successfully"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Funding Failed", {
        description: error.message || "Failed to fund escrow"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Transactions</CardTitle>
          <CardDescription>
            Connect your wallet to perform blockchain transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please connect your Pera Wallet to interact with the blockchain.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blockchain Transactions</CardTitle>
        <CardDescription>
          Perform blockchain operations with your connected wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deploy Contract */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Deploy Contract</h3>
          <form onSubmit={handleDeployContract} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerAddress">Owner Address</Label>
                <Input
                  id="ownerAddress"
                  value={contractData.ownerAddress}
                  onChange={(e) => setContractData({...contractData, ownerAddress: e.target.value})}
                  placeholder="Algorand address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractorAddress">Contractor Address</Label>
                <Input
                  id="contractorAddress"
                  value={contractData.contractorAddress}
                  onChange={(e) => setContractData({...contractData, contractorAddress: e.target.value})}
                  placeholder="Algorand address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verifierPubkey">Verifier Public Key</Label>
                <Input
                  id="verifierPubkey"
                  value={contractData.verifierPubkey}
                  onChange={(e) => setContractData({...contractData, verifierPubkey: e.target.value})}
                  placeholder="Hex-encoded public key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input
                  id="projectTitle"
                  value={contractData.projectTitle}
                  onChange={(e) => setContractData({...contractData, projectTitle: e.target.value})}
                  placeholder="Project title"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Deploying...' : 'Deploy Contract'}
            </Button>
          </form>
        </div>

        {/* Add Milestone */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Add Milestone</h3>
          <form onSubmit={handleAddMilestone} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="milestoneIndex">Milestone Index</Label>
                <Input
                  id="milestoneIndex"
                  type="number"
                  value={milestoneData.index}
                  onChange={(e) => setMilestoneData({...milestoneData, index: parseInt(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestoneAmount">Amount (microAlgos)</Label>
                <Input
                  id="milestoneAmount"
                  type="number"
                  value={milestoneData.amount}
                  onChange={(e) => setMilestoneData({...milestoneData, amount: parseInt(e.target.value)})}
                  placeholder="1000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueTimestamp">Due Timestamp</Label>
                <Input
                  id="dueTimestamp"
                  type="number"
                  value={milestoneData.dueTimestamp}
                  onChange={(e) => setMilestoneData({...milestoneData, dueTimestamp: parseInt(e.target.value)})}
                  placeholder="Unix timestamp"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="milestoneDescription">Description</Label>
                <Textarea
                  id="milestoneDescription"
                  value={milestoneData.description}
                  onChange={(e) => setMilestoneData({...milestoneData, description: e.target.value})}
                  placeholder="Milestone description"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Milestone'}
            </Button>
          </form>
        </div>

        {/* Submit Proof */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Submit Milestone Proof</h3>
          <form onSubmit={handleSubmitProof} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proofIndex">Milestone Index</Label>
                <Input
                  id="proofIndex"
                  type="number"
                  value={proofData.milestoneIndex}
                  onChange={(e) => setProofData({...proofData, milestoneIndex: parseInt(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proofHash">Proof Hash</Label>
                <Input
                  id="proofHash"
                  value={proofData.proofHash}
                  onChange={(e) => setProofData({...proofData, proofHash: e.target.value})}
                  placeholder="IPFS hash or proof identifier"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Proof'}
            </Button>
          </form>
        </div>

        {/* Verify and Release */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Verify and Release Payment</h3>
          <form onSubmit={handleVerifyAndRelease} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="verifyIndex">Milestone Index</Label>
                <Input
                  id="verifyIndex"
                  type="number"
                  value={verificationData.milestoneIndex}
                  onChange={(e) => setVerificationData({...verificationData, milestoneIndex: parseInt(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  value={verificationData.message}
                  onChange={(e) => setVerificationData({...verificationData, message: e.target.value})}
                  placeholder="Attestation message"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="signature">Signature (Hex)</Label>
                <Input
                  id="signature"
                  value={verificationData.signature}
                  onChange={(e) => setVerificationData({...verificationData, signature: e.target.value})}
                  placeholder="Hex-encoded signature"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify and Release'}
            </Button>
          </form>
        </div>

        {/* Fund Escrow */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Fund Escrow</h3>
          <form onSubmit={handleFundEscrow} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="fundingAmount">Amount (microAlgos)</Label>
                <Input
                  id="fundingAmount"
                  type="number"
                  value={fundingData.amount}
                  onChange={(e) => setFundingData({...fundingData, amount: parseInt(e.target.value)})}
                  placeholder="1000000"
                />
              </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Funding...' : 'Fund Escrow'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockchainTransaction;