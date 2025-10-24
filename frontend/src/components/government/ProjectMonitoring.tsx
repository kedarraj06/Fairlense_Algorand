import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';

export default function ProjectMonitoring() {
  const projects = [
    {
      id: 'PRJ-001',
      name: 'Highway Construction - NH47',
      contractor: 'ABC Constructions Ltd',
      progress: 65,
      status: 'On Track',
      budget: '₹45Cr',
      spent: '₹29Cr',
      startDate: '2025-01-15',
      endDate: '2026-01-15',
      milestones: [
        { name: 'Foundation', progress: 100, status: 'Completed' },
        { name: 'Structure', progress: 75, status: 'In Progress' },
        { name: 'Finishing', progress: 20, status: 'In Progress' },
        { name: 'Testing', progress: 0, status: 'Pending' },
      ],
    },
    {
      id: 'PRJ-002',
      name: 'Bridge Construction',
      contractor: 'XYZ Infrastructure',
      progress: 42,
      status: 'Delayed',
      budget: '₹78Cr',
      spent: '₹38Cr',
      startDate: '2024-11-01',
      endDate: '2026-05-01',
      milestones: [
        { name: 'Foundation', progress: 100, status: 'Completed' },
        { name: 'Structure', progress: 45, status: 'In Progress' },
        { name: 'Finishing', progress: 0, status: 'Pending' },
        { name: 'Testing', progress: 0, status: 'Pending' },
      ],
    },
    {
      id: 'PRJ-003',
      name: 'Metro Station Development',
      contractor: 'Metro Builders Inc',
      progress: 88,
      status: 'Ahead of Schedule',
      budget: '₹125Cr',
      spent: '₹108Cr',
      startDate: '2024-06-01',
      endDate: '2025-12-01',
      milestones: [
        { name: 'Foundation', progress: 100, status: 'Completed' },
        { name: 'Structure', progress: 100, status: 'Completed' },
        { name: 'Finishing', progress: 85, status: 'In Progress' },
        { name: 'Testing', progress: 40, status: 'In Progress' },
      ],
    },
  ];

  const timelineData = [
    { month: 'Jun', planned: 10, actual: 12 },
    { month: 'Jul', planned: 25, actual: 28 },
    { month: 'Aug', planned: 40, actual: 42 },
    { month: 'Sep', planned: 55, actual: 58 },
    { month: 'Oct', planned: 70, actual: 65 },
    { month: 'Nov', planned: 85, actual: 0 },
  ];

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={
        status === 'On Track' ? 'bg-green-500' :
        status === 'Delayed' ? 'bg-red-500' :
        status === 'Ahead of Schedule' ? 'bg-blue-500' :
        'bg-yellow-500'
      }>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Completed') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'In Progress') return <Clock className="h-4 w-4 text-blue-500" />;
    return <AlertTriangle className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription>{project.contractor}</CardDescription>
                </div>
                {getStatusBadge(project.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Budget Utilization</span>
                  <span>{project.spent} / {project.budget}</span>
                </div>
                <Progress 
                  value={(parseFloat(project.spent.replace('₹', '').replace('Cr', '')) / parseFloat(project.budget.replace('₹', '').replace('Cr', ''))) * 100} 
                  className="h-2" 
                />
              </div>
              <div className="text-xs text-gray-600">
                <div>Start: {project.startDate}</div>
                <div>End: {project.endDate}</div>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Project View */}
      <Card>
        <CardHeader>
          <CardTitle>Project: Highway Construction - NH47</CardTitle>
          <CardDescription>Detailed monitoring and milestone tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline & Gantt</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="quality">Quality Assurance</TabsTrigger>
              <TabsTrigger value="photos">Progress Photos</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-6">
              <div>
                <h4 className="mb-4">Progress Timeline (Planned vs Actual)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="planned" fill="#94a3b8" name="Planned Progress %" />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual Progress %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Gantt-style Milestone View */}
              <div>
                <h4 className="mb-4">Milestone Timeline</h4>
                <div className="space-y-3">
                  {projects[0].milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center space-x-4">
                      <div className="w-32 text-sm">{milestone.name}</div>
                      <div className="flex-1">
                        <Progress value={milestone.progress} className="h-6" />
                      </div>
                      <div className="w-24 text-sm text-right">{milestone.progress}%</div>
                      <div className="w-32 flex items-center">
                        {getStatusIcon(milestone.status)}
                        <span className="ml-2 text-sm">{milestone.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="space-y-4">
              {projects[0].milestones.map((milestone, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{milestone.name}</CardTitle>
                      <Badge variant={milestone.status === 'Completed' ? 'default' : 'secondary'}>
                        {milestone.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Completion</span>
                          <span>{milestone.progress}%</span>
                        </div>
                        <Progress value={milestone.progress} />
                      </div>
                      <div className="text-sm text-gray-600">
                        Last Updated: {new Date().toLocaleDateString()}
                      </div>
                      {milestone.status === 'Completed' && (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verified on Blockchain
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="quality">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Material Quality Score</span>
                        <span className="text-green-600">92/100</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Workmanship Rating</span>
                        <span className="text-green-600">88/100</span>
                      </div>
                      <Progress value={88} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Safety Compliance</span>
                        <span className="text-green-600">95/100</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Inspections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { date: '2025-10-20', inspector: 'John Doe', status: 'Passed', score: 92 },
                        { date: '2025-10-15', inspector: 'Jane Smith', status: 'Passed', score: 88 },
                        { date: '2025-10-10', inspector: 'Mike Johnson', status: 'Passed', score: 90 },
                      ].map((inspection, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm">{inspection.date}</div>
                            <div className="text-xs text-gray-600">Inspector: {inspection.inspector}</div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-500">{inspection.status}</Badge>
                            <div className="text-xs text-gray-600 mt-1">Score: {inspection.score}/100</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="photos">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                  <div key={idx} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 cursor-pointer transition-colors">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Photos are geotagged and timestamped for verification</p>
                <p className="text-xs mt-1">Last upload: 2 hours ago</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
