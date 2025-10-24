import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { CheckCircle, Clock, AlertTriangle, Copy, ExternalLink, FileText, DollarSign, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SmartContractViewerProps {
  isOpen: boolean;
  onClose: () => void;
  contractData: any;
}

export default function SmartContractViewer({ isOpen, onClose, contractData }: SmartContractViewerProps) {
  if (!contractData) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const contract = {
    address: 'ALGO7F9FADE1C0D57A7AF66AB4EAD7C2C2EB7B11A91385',
    blockchain: 'Algorand Mainnet',
    type: 'Construction Milestone Payment',
    status: 'Active',
    creationDate: '2025-01-15 10:30:00',
    projectName: 'Highway Construction - NH47',
    totalValue: '₹45Cr',
    released: '₹29Cr',
    remaining: '₹16Cr',
    performanceScore: 92,
    
    milestones: [
      {
        name: 'Foundation Work',
        percentage: 20,
        amount: '₹9Cr',
        status: 'Completed',
        completionDate: '2025-09-15',
        verificationHash: '0x7f9fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
        conditions: [
          { name: 'Work Completion', met: true },
          { name: 'Quality Inspection', met: true },
          { name: 'Documentation', met: true },
          { name: 'Timeline Compliance', met: true },
        ],
      },
      {
        name: 'Structure Phase',
        percentage: 40,
        amount: '₹18Cr',
        status: 'In Progress',
        completionDate: null,
        verificationHash: null,
        conditions: [
          { name: 'Work Completion', met: true },
          { name: 'Quality Inspection', met: true },
          { name: 'Documentation', met: false },
          { name: 'Timeline Compliance', met: true },
        ],
      },
      {
        name: 'Finishing Work',
        percentage: 30,
        amount: '₹13.5Cr',
        status: 'Pending',
        completionDate: null,
        verificationHash: null,
        conditions: [
          { name: 'Work Completion', met: false },
          { name: 'Quality Inspection', met: false },
          { name: 'Documentation', met: false },
          { name: 'Timeline Compliance', met: false },
        ],
      },
      {
        name: 'Final Inspection & Handover',
        percentage: 10,
        amount: '₹4.5Cr',
        status: 'Pending',
        completionDate: null,
        verificationHash: null,
        conditions: [
          { name: 'Work Completion', met: false },
          { name: 'Quality Inspection', met: false },
          { name: 'Documentation', met: false },
          { name: 'Timeline Compliance', met: false },
        ],
      },
    ],

    transactions: [
      {
        timestamp: '2025-09-15 14:30:00',
        hash: '0x7f9fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
        type: 'Payment Release',
        amount: '₹9Cr',
        status: 'Confirmed',
        block: 1234567,
      },
      {
        timestamp: '2025-09-10 10:15:00',
        hash: '0x8a1bfde2d1e68b8bg77bc5fbe8d3d3fc8c22b02496',
        type: 'Milestone Verification',
        amount: '-',
        status: 'Confirmed',
        block: 1234550,
      },
      {
        timestamp: '2025-01-15 10:30:00',
        hash: '0x9b2cgef3e2f79c9ch88cd6gcf9e4e4gd9d33c13507',
        type: 'Contract Deployment',
        amount: '-',
        status: 'Confirmed',
        block: 1200000,
      },
    ],

    terms: {
      scope: 'Construction of 4-lane highway connecting Mumbai to Pune with total length of 150km',
      duration: '24 months from contract commencement',
      penaltyRate: '0.5% per day for delays beyond grace period',
      qualityStandards: 'IRC Standards for highway construction',
      gracePeriod: '15 days per milestone',
      disputeResolution: 'Arbitration by designated authority',
    },

    verifications: [
      {
        date: '2025-09-10',
        type: 'Government Inspection',
        inspector: 'John Doe (PWD)',
        result: 'Passed',
        score: 92,
        comments: 'Foundation work completed as per specifications',
      },
      {
        date: '2025-08-25',
        type: 'Quality Audit',
        inspector: 'Jane Smith (Quality Cell)',
        result: 'Passed',
        score: 88,
        comments: 'Material quality meets standards',
      },
    ],

    disputes: [],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{contract.projectName}</DialogTitle>
              <DialogDescription>Smart Contract Details - {contract.type}</DialogDescription>
            </div>
            <Badge className="bg-green-500">
              <Shield className="h-3 w-3 mr-1" />
              {contract.status}
            </Badge>
          </div>
        </DialogHeader>

        {/* Contract Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contract Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Contract Address</p>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{contract.address.slice(0, 20)}...</code>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(contract.address)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blockchain</p>
                <p className="mt-1">{contract.blockchain}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Creation Date</p>
                <p className="mt-1">{contract.creationDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Performance Score</p>
                <div className="flex items-center mt-1">
                  <span className="text-lg mr-2">{contract.performanceScore}/100</span>
                  <Progress value={contract.performanceScore} className="flex-1 h-2" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl text-blue-600">{contract.totalValue}</div>
                <p className="text-sm text-gray-600 mt-1">Total Contract Value</p>
              </div>
              <div className="text-center">
                <div className="text-2xl text-green-600">{contract.released}</div>
                <p className="text-sm text-gray-600 mt-1">Amount Released</p>
                <p className="text-xs text-gray-500">{((parseFloat(contract.released.replace('₹', '').replace('Cr', '')) / parseFloat(contract.totalValue.replace('₹', '').replace('Cr', ''))) * 100).toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <div className="text-2xl text-amber-600">{contract.remaining}</div>
                <p className="text-sm text-gray-600 mt-1">Remaining Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="milestones">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4">
            {/* Timeline Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Milestone Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contract.milestones.map((milestone: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="flex items-start space-x-4">
                        {/* Status Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {milestone.status === 'Completed' && (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          )}
                          {milestone.status === 'In Progress' && (
                            <Clock className="h-6 w-6 text-blue-500" />
                          )}
                          {milestone.status === 'Pending' && (
                            <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4>{milestone.name}</h4>
                              <p className="text-sm text-gray-600">
                                {milestone.percentage}% • {milestone.amount}
                              </p>
                            </div>
                            <Badge className={
                              milestone.status === 'Completed' ? 'bg-green-500' :
                              milestone.status === 'In Progress' ? 'bg-blue-500' :
                              'bg-gray-400'
                            }>
                              {milestone.status}
                            </Badge>
                          </div>

                          {/* Conditions */}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {milestone.conditions.map((condition: any, cidx: number) => (
                              <div key={cidx} className="flex items-center text-sm">
                                {condition.met ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                ) : (
                                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                )}
                                <span className={condition.met ? '' : 'text-gray-500'}>{condition.name}</span>
                              </div>
                            ))}
                          </div>

                          {milestone.completionDate && (
                            <div className="mt-2 text-sm text-gray-600">
                              Completed: {milestone.completionDate}
                            </div>
                          )}

                          {milestone.verificationHash && (
                            <div className="mt-2 bg-gray-50 rounded p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Blockchain Hash:</span>
                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(milestone.verificationHash)}>
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <code className="text-xs">{milestone.verificationHash}</code>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Connector Line */}
                      {idx < contract.milestones.length - 1 && (
                        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Block</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hash</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contract.transactions.map((tx: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">{tx.timestamp}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tx.type}</Badge>
                        </TableCell>
                        <TableCell>{tx.amount}</TableCell>
                        <TableCell className="text-sm">#{tx.block}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs">{tx.hash.slice(0, 10)}...</code>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(tx.hash)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms Tab */}
          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contract Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(contract.terms).map(([key, value]) => (
                  <div key={key}>
                    <h4 className="text-sm mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Verification & Audit History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contract.verifications.map((verification: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4>{verification.type}</h4>
                        <p className="text-sm text-gray-600">{verification.inspector}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500 mb-1">{verification.result}</Badge>
                        <div className="text-sm">Score: {verification.score}/100</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{verification.comments}</p>
                    <div className="text-xs text-gray-500 mt-2">{verification.date}</div>
                  </div>
                ))}

                {contract.disputes.length === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-900">No disputes or issues reported</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-900 mb-1">
                This smart contract is deployed on the {contract.blockchain} and all transactions 
                are cryptographically verified and immutable.
              </p>
              <p className="text-blue-700 text-xs">
                All stakeholders can independently verify any transaction using the blockchain hash.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
