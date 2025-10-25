import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import SmartContractViewer from '../blockchain/SmartContractViewer';

export default function Payments() {
  const [contractViewerOpen, setContractViewerOpen] = useState(false);
  const payments = [
    {
      id: 'PAY-001',
      project: 'Highway Construction - NH47',
      milestone: 'Foundation',
      amount: '₹9Cr',
      status: 'Paid',
      date: '2025-09-15',
      hash: '0x7f9fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
    },
    {
      id: 'PAY-002',
      project: 'School Renovation',
      milestone: 'Demolition',
      amount: '₹2.4Cr',
      status: 'Paid',
      date: '2025-10-10',
      hash: '0x8a1bfde2d1e68b8bg77bc5fbe8d3d3fc8c22b02496',
    },
    {
      id: 'PAY-003',
      project: 'Highway Construction - NH47',
      milestone: 'Structure',
      amount: '₹8.5Cr',
      status: 'Pending',
      date: '2025-10-25',
      hash: null,
    },
    {
      id: 'PAY-004',
      project: 'School Renovation',
      milestone: 'Construction',
      amount: '₹3.2Cr',
      status: 'Processing',
      date: '2025-10-22',
      hash: '0x9b2cgef3e2f79c9ch88cd6gcf9e4e4gd9d33c13507',
    },
  ];

  const cashFlowData = [
    { month: 'May', received: 0, projected: 5 },
    { month: 'Jun', received: 3, projected: 6 },
    { month: 'Jul', received: 5, projected: 7 },
    { month: 'Aug', received: 7, projected: 8 },
    { month: 'Sep', received: 9, projected: 10 },
    { month: 'Oct', received: 11, projected: 12 },
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'Paid') {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    }
    if (status === 'Processing') {
      return (
        <Badge className="bg-blue-500">
          <Clock className="h-3 w-3 mr-1" />
          Processing
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500">
        <AlertCircle className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Downloading invoice for ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl text-green-600">₹11.4Cr</div>
            <p className="text-sm text-gray-600 mt-1">Total Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl text-blue-600">₹8.5Cr</div>
            <p className="text-sm text-gray-600 mt-1">Pending Payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl text-amber-600">₹3.2Cr</div>
            <p className="text-sm text-gray-600 mt-1">In Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl">2-3</div>
            <p className="text-sm text-gray-600 mt-1">Days Avg. Processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Analysis</CardTitle>
          <CardDescription>Monthly received vs projected payments (₹ Crores)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="received" stroke="#10b981" strokeWidth={2} name="Received" />
              <Line type="monotone" dataKey="projected" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Projected" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All milestone payments with blockchain verification</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Milestone</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                  <TableCell>{payment.project}</TableCell>
                  <TableCell>{payment.milestone}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-sm">{payment.date}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {payment.status === 'Paid' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(payment.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-blue-600">
                            Verify
                          </Button>
                        </>
                      )}
                      {payment.status === 'Pending' && (
                        <Button size="sm" variant="outline" disabled>
                          Awaiting Approval
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Blockchain Verification */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <CheckCircle className="h-12 w-12 text-emerald-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg mb-2">Automated Smart Contract Payments</h3>
              <p className="text-sm text-gray-700 mb-3">
                All payments are processed through smart contracts on the blockchain. Once milestone conditions are met 
                and verified, payments are automatically released within 48 hours. Every transaction is immutable and 
                transparent.
              </p>
              <div className="text-sm">
                <p>✓ Automatic payment release on milestone completion</p>
                <p>✓ No manual intervention required</p>
                <p>✓ Complete transparency and audit trail</p>
              </div>
              <Button 
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setContractViewerOpen(true)}
              >
                View Smart Contract Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Contract Viewer */}
      <SmartContractViewer 
        isOpen={contractViewerOpen}
        onClose={() => setContractViewerOpen(false)}
        contractData={{ name: 'Highway Construction Payment Contract' }}
      />
    </div>
  );
}
