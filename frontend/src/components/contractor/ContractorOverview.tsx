import { useState, useEffect } from 'react';
import { Briefcase, DollarSign, TrendingUp, Award, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '../ui/button';

export default function ContractorOverview() {
  const [stats, setStats] = useState({
    activeBids: 0,
    ongoingProjects: 0,
    totalRevenue: 0,
    successRate: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeBids: prev.activeBids < 8 ? prev.activeBids + 1 : 8,
        ongoingProjects: prev.ongoingProjects < 5 ? prev.ongoingProjects + 1 : 5,
        totalRevenue: prev.totalRevenue < 187 ? prev.totalRevenue + 4 : 187,
        successRate: prev.successRate < 68 ? prev.successRate + 2 : 68,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Active Bids',
      value: stats.activeBids,
      trend: '+2 new',
      trendUp: true,
      icon: Briefcase,
      color: 'bg-blue-500',
    },
    {
      title: 'Ongoing Projects',
      value: stats.ongoingProjects,
      subtitle: '3 on track',
      icon: CheckCircle,
      color: 'bg-emerald-500',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue / 10}Cr`,
      trend: '+15%',
      trendUp: true,
      icon: DollarSign,
      color: 'bg-amber-500',
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      trend: '+8%',
      trendUp: true,
      icon: Award,
      color: 'bg-purple-500',
    },
  ];

  const revenueData = [
    { month: 'May', revenue: 12, target: 15 },
    { month: 'Jun', revenue: 14, target: 15 },
    { month: 'Jul', revenue: 16, target: 16 },
    { month: 'Aug', revenue: 15, target: 17 },
    { month: 'Sep', revenue: 18, target: 18 },
    { month: 'Oct', revenue: 19, target: 19 },
  ];

  const projectStatus = [
    {
      name: 'Highway Construction',
      progress: 65,
      status: 'On Track',
      deadline: '2026-01-15',
      payment: '₹8.5Cr pending',
    },
    {
      name: 'School Renovation',
      progress: 42,
      status: 'Delayed',
      deadline: '2025-12-20',
      payment: '₹2.3Cr pending',
    },
    {
      name: 'Water Pipeline',
      progress: 88,
      status: 'Ahead',
      deadline: '2025-11-30',
      payment: '₹1.2Cr pending',
    },
  ];

  const aiRecommendations = [
    {
      title: 'High-Match Tender Available',
      description: 'Metro Extension Project - 95% match with your expertise',
      action: 'View Tender',
      type: 'opportunity',
    },
    {
      title: 'Resource Optimization',
      description: 'Consider reallocating 2 workers from Project A to Project B',
      action: 'View Details',
      type: 'suggestion',
    },
    {
      title: 'Payment Due',
      description: 'Milestone payment for Highway Project ready for claim',
      action: 'Claim Payment',
      type: 'alert',
    },
  ];

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={
        status === 'On Track' ? 'bg-green-500' :
        status === 'Delayed' ? 'bg-red-500' :
        status === 'Ahead' ? 'bg-blue-500' :
        'bg-yellow-500'
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
              <div className="text-sm text-gray-600">
                {card.trend && (
                  <span className={card.trendUp ? 'text-green-600' : 'text-gray-600'}>
                    {card.trend}
                  </span>
                )}
                {card.subtitle && <span>{card.subtitle}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue vs target (₹ Crores)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Smart suggestions to optimize your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiRecommendations.map((rec, idx) => (
                <div key={idx} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        {rec.type === 'opportunity' && <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />}
                        {rec.type === 'suggestion' && <TrendingUp className="h-4 w-4 text-purple-500 mr-2" />}
                        {rec.type === 'alert' && <Clock className="h-4 w-4 text-amber-500 mr-2" />}
                        <span className="text-sm">{rec.title}</span>
                      </div>
                      <p className="text-xs text-gray-600 ml-6">{rec.description}</p>
                    </div>
                    <Button size="sm" variant="outline" className="ml-2">{rec.action}</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Active Projects Overview</CardTitle>
          <CardDescription>Real-time progress tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectStatus.map((project, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg">{project.name}</h4>
                    <p className="text-sm text-gray-600">Deadline: {project.deadline}</p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber-600">{project.payment}</span>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-2">On-Time Delivery Rate</div>
              <div className="text-2xl mb-1">92%</div>
              <Progress value={92} className="h-2" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Budget Adherence</div>
              <div className="text-2xl mb-1">88%</div>
              <Progress value={88} className="h-2" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Client Satisfaction</div>
              <div className="text-2xl mb-1">4.5/5</div>
              <div className="flex items-center">
                <span className="text-yellow-500 text-lg">★★★★</span>
                <span className="text-gray-300 text-lg">★</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
