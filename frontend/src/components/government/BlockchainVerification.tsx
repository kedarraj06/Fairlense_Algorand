import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Shield, CheckCircle, Lock, Clock, Hash, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import SmartContractViewer from '../blockchain/SmartContractViewer';

export default function BlockchainVerification() {
  const [contractViewerOpen, setContractViewerOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const transactions = [
    {
      id: '0x7f9fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
      type: 'Tender Creation',
      tender: 'TND-2025-001',
      timestamp: '2025-10-22 14:30:15',
      status: 'Verified',
      block: 1234567,
    },
    {
      id: '0x8a1bfde2d1e68b8bg77bc5fbe8d3d3fc8c22b02496',
      type: 'Bid Submission',
      tender: 'TND-2025-001',
      timestamp: '2025-10-22 15:45:22',
      status: 'Verified',
      block: 1234568,
    },
    {
      id: '0x9b2cgef3e2f79c9ch88cd6gcf9e4e4gd9d33c13507',
      type: 'Milestone Completion',
      tender: 'PRJ-001',
      timestamp: '2025-10-22 16:20:33',
      status: 'Verified',
      block: 1234569,
    },
    {
      id: '0xa3ddhfg4f3g8ad0di99de7hde0f5f5he0e44d24618',
      type: 'Payment Release',
      tender: 'PRJ-001',
      timestamp: '2025-10-22 17:10:45',
      status: 'Verified',
      block: 1234570,
    },
  ];

  const smartContracts = [
    {
      id: 'SC-001',
      name: 'Highway Construction Payment',
      project: 'Highway Construction - NH47',
      status: 'Active',
      conditions: [
        { condition: 'Foundation Complete', met: true },
        { condition: 'Quality Inspection Passed', met: true },
        { condition: 'Timeline Within Tolerance', met: true },
        { condition: 'Documentation Submitted', met: false },
      ],
      nextPayment: '₹8.5Cr',
      address: '0xabcd...ef12',
    },
    {
      id: 'SC-002',
      name: 'Bridge Construction Payment',
      project: 'Bridge Construction - River Ganges',
      status: 'Active',
      conditions: [
        { condition: 'Structure Phase Complete', met: true },
        { condition: 'Material Certification', met: true },
        { condition: 'Safety Audit Passed', met: false },
        { condition: 'Progress Photos Uploaded', met: true },
      ],
      nextPayment: '₹12.3Cr',
      address: '0x1234...5678',
    },
  ];

  const auditLogs = [
    {
      date: '2025-10-22 18:30',
      action: 'Tender Published',
      user: 'Admin (Gov)',
      hash: '0x7f9fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
      verified: true,
    },
    {
      date: '2025-10-22 17:15',
      action: 'Milestone Verified',
      user: 'Inspector',
      hash: '0x8a1bfde2d1e68b8bg77bc5fbe8d3d3fc8c22b02496',
      verified: true,
    },
    {
      date: '2025-10-22 16:45',
      action: 'Document Updated',
      user: 'Contractor',
      hash: '0x9b2cgef3e2f79c9ch88cd6gcf9e4e4gd9d33c13507',
      verified: true,
    },
    {
      date: '2025-10-22 15:30',
      action: 'Budget Allocated',
      user: 'Finance Dept',
      hash: '0xa3ddhfg4f3g8ad0di99de7hde0f5f5he0e44d24618',
      verified: true,
    },
  ];

  const handleVerifyHash = (hash: string) => {
    toast.success('Hash verified on blockchain!', {
      description: `Transaction ${hash.substring(0, 10)}... confirmed`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl">3,456</div>
                <p className="text-sm text-gray-600 mt-1">Total Transactions</p>
              </div>
              <Shield className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl text-green-600">100%</div>
                <p className="text-sm text-gray-600 mt-1">Verification Rate</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl">18</div>
                <p className="text-sm text-gray-600 mt-1">Active Contracts</p>
              </div>
              <FileText className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl">256</div>
                <p className="text-sm text-gray-600 mt-1">Blocks Added</p>
              </div>
              <Lock className="h-12 w-12 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Blockchain Transactions</CardTitle>
              <CardDescription>All transactions are cryptographically verified and immutable</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-500">{tx.type}</Badge>
                          <span className="text-sm text-gray-600">{tx.tender}</span>
                        </div>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {tx.timestamp}
                        </div>
                      </div>
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {tx.status}
                      </Badge>
                    </div>
                    <div className="bg-gray-50 rounded p-3 font-mono text-xs break-all">
                      <div className="flex items-center mb-2">
                        <Hash className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Transaction Hash:</span>
                      </div>
                      <div className="text-blue-600">{tx.id}</div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-gray-600">Block: #{tx.block}</span>
                      <Button size="sm" variant="outline" onClick={() => handleVerifyHash(tx.id)}>
                        Verify on Blockchain
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <div className="space-y-6">
            {smartContracts.map((contract, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{contract.name}</CardTitle>
                      <CardDescription>{contract.project}</CardDescription>
                    </div>
                    <Badge className="bg-green-500">{contract.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm mb-3">Payment Release Conditions</h4>
                    <div className="space-y-2">
                      {contract.conditions.map((cond, cidx) => (
                        <div key={cidx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{cond.condition}</span>
                          {cond.met ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Met
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <div className="text-sm text-gray-600">Next Payment Amount</div>
                      <div className="text-2xl text-blue-600 mt-1">{contract.nextPayment}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Contract Address</div>
                      <div className="font-mono text-sm text-gray-800 mt-1">{contract.address}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedContract(contract);
                        setContractViewerOpen(true);
                      }}
                    >
                      View Contract Details
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600"
                      disabled={!contract.conditions.every(c => c.met)}
                      onClick={() => toast.success('Payment processing initiated')}
                    >
                      {contract.conditions.every(c => c.met) ? 'Release Payment' : 'Conditions Not Met'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Immutable Audit Trail</CardTitle>
              <CardDescription>Complete history of all system actions with blockchain verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm">{log.action}</span>
                          {log.verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          {log.date} • {log.user}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleVerifyHash(log.hash)}>
                        Verify
                      </Button>
                    </div>
                    <div className="mt-2 font-mono text-xs text-gray-600 break-all">
                      Hash: {log.hash}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Blockchain Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <Shield className="h-12 w-12 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg mb-2">Blockchain Security & Transparency</h3>
              <p className="text-sm text-gray-700 mb-3">
                Every action on FAIRLENS is recorded on an immutable blockchain ledger, ensuring complete transparency 
                and preventing tampering. All stakeholders can independently verify any transaction using the blockchain hash.
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-600">Network</div>
                  <div>Ethereum</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Latest Block</div>
                  <div>#1234570</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Gas Price</div>
                  <div>25 Gwei</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Contract Viewer */}
      <SmartContractViewer 
        isOpen={contractViewerOpen}
        onClose={() => setContractViewerOpen(false)}
        contractData={selectedContract}
      />
    </div>
  );
}
