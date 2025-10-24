import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, FileText, Briefcase, DollarSign, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GovernmentOverview() {
  const [stats, setStats] = useState({
    activeTenders: 0,
    ongoingProjects: 0,
    totalBudget: 0,
    aiVerifications: 0,
  });

  useEffect(() => {
    // Animate numbers
    const interval = setInterval(() => {
      setStats(prev => ({
        activeTenders: prev.activeTenders < 24 ? prev.activeTenders + 1 : 24,
        ongoingProjects: prev.ongoingProjects < 18 ? prev.ongoingProjects + 1 : 18,
        totalBudget: prev.totalBudget < 245 ? prev.totalBudget + 5 : 245,
        aiVerifications: prev.aiVerifications < 156 ? prev.aiVerifications + 3 : 156,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Active Tenders',
      value: stats.activeTenders,
      trend: '+12%',
      trendUp: true,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Ongoing Projects',
      value: stats.ongoingProjects,
      trend: '+5%',
      trendUp: true,
      icon: Briefcase,
      color: 'bg-emerald-500',
    },
    {
      title: 'Total Budget',
      value: `₹${stats.totalBudget}Cr`,
      trend: '-8%',
      trendUp: false,
      icon: DollarSign,
      color: 'bg-amber-500',
      subtitle: 'savings',
    },
    {
      title: 'AI Verifications',
      value: stats.aiVerifications,
      trend: '+23%',
      trendUp: true,
      icon: Shield,
      color: 'bg-purple-500',
    },
  ];

  const recentTenders = [
    {
      id: 'TND-2025-001',
      title: 'Highway Construction - NH47',
      budget: '₹45Cr',
      status: 'Active',
      bids: 12,
      deadline: '2025-11-15',
      blockchain: true,
    },
    {
      id: 'TND-2025-002',
      title: 'Bridge Construction - River Ganges',
      budget: '₹78Cr',
      status: 'Review',
      bids: 8,
      deadline: '2025-11-20',
      blockchain: true,
    },
    {
      id: 'TND-2025-003',
      title: 'Metro Station Development',
      budget: '₹125Cr',
      status: 'Active',
      bids: 15,
      deadline: '2025-11-25',
      blockchain: true,
    },
    {
      id: 'TND-2025-004',
      title: 'Water Treatment Plant',
      budget: '₹34Cr',
      status: 'Completed',
      bids: 9,
      deadline: '2025-10-30',
      blockchain: true,
    },
    {
      id: 'TND-2025-005',
      title: 'School Building Renovation',
      budget: '₹12Cr',
      status: 'Active',
      bids: 6,
      deadline: '2025-11-28',
      blockchain: true,
    },
  ];

  const riskData = [
    { name: 'Low Risk', value: 65, color: '#10b981' },
    { name: 'Medium Risk', value: 28, color: '#f59e0b' },
    { name: 'High Risk', value: 7, color: '#ef4444' },
  ];

  const budgetTrend = [
    { month: 'Jun', allocated: 180, utilized: 145 },
    { month: 'Jul', allocated: 200, utilized: 165 },
    { month: 'Aug', allocated: 220, utilized: 195 },
    { month: 'Sep', allocated: 235, utilized: 210 },
    { month: 'Oct', allocated: 245, utilized: 225 },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      Active: 'default',
      Review: 'secondary',
      Completed: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'default'} className={
        status === 'Active' ? 'bg-green-500' :
        status === 'Review' ? 'bg-yellow-500' :
        'bg-gray-500'
      }>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="border-l-4" style={{ borderLeftColor: card.color.replace('bg-', '#') }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">{card.title}</CardTitle>
              <div className={`${card.color} p-2 rounded-lg`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl mb-1">{card.value}</div>
              <div className="flex items-center text-sm">
                {card.trendUp ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={card.trendUp ? 'text-green-500' : 'text-red-500'}>
                  {card.trend}
                </span>
                <span className="text-gray-500 ml-1">{card.subtitle || 'from last month'}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Risk Analysis & Budget Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              AI Risk Analysis
            </CardTitle>
            <CardDescription>Real-time corruption and delay risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Corruption Risk</span>
                  <span className="text-sm text-green-600">Low (12%)</span>
                </div>
                <Progress value={12} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Delay Probability</span>
                  <span className="text-sm text-yellow-600">Medium (35%)</span>
                </div>
                <Progress value={35} className="h-2 [&>div]:bg-yellow-500" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Cost Overrun Risk</span>
                  <span className="text-sm text-green-600">Low (18%)</span>
                </div>
                <Progress value={18} className="h-2" />
              </div>

              {/* Risk Distribution Pie Chart */}
              <div className="mt-6">
                <h4 className="text-sm mb-3">Project Risk Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Utilization Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-emerald-500" />
              Budget Utilization Trend
            </CardTitle>
            <CardDescription>Monthly allocation vs utilization (in Crores)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={budgetTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="allocated" stroke="#3b82f6" strokeWidth={2} name="Allocated" />
                <Line type="monotone" dataKey="utilized" stroke="#10b981" strokeWidth={2} name="Utilized" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tenders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tenders</CardTitle>
          <CardDescription>Latest tender activities and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tender ID</TableHead>
                <TableHead>Project Title</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bids</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Blockchain</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTenders.map((tender) => (
                <TableRow key={tender.id}>
                  <TableCell className="font-mono text-sm">{tender.id}</TableCell>
                  <TableCell>{tender.title}</TableCell>
                  <TableCell>{tender.budget}</TableCell>
                  <TableCell>{getStatusBadge(tender.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tender.bids} bids</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{tender.deadline}</TableCell>
                  <TableCell>
                    {tender.blockchain && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
