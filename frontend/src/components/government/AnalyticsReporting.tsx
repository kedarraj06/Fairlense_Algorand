import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';

export default function AnalyticsReporting() {
  const budgetAllocation = [
    { name: 'Highways', value: 35, amount: 450 },
    { name: 'Bridges', value: 25, amount: 320 },
    { name: 'Metro', value: 20, amount: 260 },
    { name: 'Water', value: 12, amount: 156 },
    { name: 'Buildings', value: 8, amount: 104 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  const spendingTrend = [
    { month: 'Jan', budget: 180, spent: 165, saved: 15 },
    { month: 'Feb', budget: 190, spent: 175, saved: 15 },
    { month: 'Mar', budget: 200, spent: 188, saved: 12 },
    { month: 'Apr', budget: 210, spent: 198, saved: 12 },
    { month: 'May', budget: 220, spent: 205, saved: 15 },
    { month: 'Jun', budget: 230, spent: 218, saved: 12 },
    { month: 'Jul', budget: 240, spent: 225, saved: 15 },
    { month: 'Aug', budget: 250, spent: 235, saved: 15 },
    { month: 'Sep', budget: 260, spent: 248, saved: 12 },
    { month: 'Oct', budget: 270, spent: 258, saved: 12 },
  ];

  const performanceMetrics = [
    { metric: 'On Time Delivery', value: 78 },
    { metric: 'Budget Adherence', value: 85 },
    { metric: 'Quality Score', value: 88 },
    { metric: 'Safety Compliance', value: 92 },
    { metric: 'Transparency Index', value: 95 },
  ];

  const contractorPerformance = [
    { name: 'ABC Constructions', rating: 4.5, projects: 12, onTime: 92, budget: 88 },
    { name: 'XYZ Infrastructure', rating: 4.2, projects: 8, onTime: 85, budget: 82 },
    { name: 'Metro Builders', rating: 4.8, projects: 15, onTime: 95, budget: 93 },
    { name: 'Bridge Corp', rating: 3.9, projects: 6, onTime: 78, budget: 75 },
    { name: 'Highway Experts', rating: 4.6, projects: 10, onTime: 90, budget: 89 },
  ];

  const departmentWise = [
    { department: 'Public Works', projects: 45, budget: 580, completion: 78 },
    { department: 'Transport', projects: 32, budget: 420, completion: 82 },
    { department: 'Water Resources', projects: 18, budget: 230, completion: 85 },
    { department: 'Urban Development', projects: 28, budget: 360, completion: 75 },
  ];

  const handleExport = (format: string) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl">Analytics Dashboard</h3>
          <p className="text-sm text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="2025">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl text-blue-600">₹1,245Cr</div>
            <p className="text-sm text-gray-600 mt-1">Total Budget Allocated</p>
            <div className="flex items-center text-xs text-green-600 mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% from last year
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl text-emerald-600">₹1,135Cr</div>
            <p className="text-sm text-gray-600 mt-1">Total Spent</p>
            <div className="text-xs text-gray-600 mt-2">
              91.2% utilization
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl text-amber-600">₹110Cr</div>
            <p className="text-sm text-gray-600 mt-1">Total Savings</p>
            <div className="text-xs text-gray-600 mt-2">
              8.8% cost efficiency
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl text-purple-600">85%</div>
            <p className="text-sm text-gray-600 mt-1">Projects On Time</p>
            <div className="text-xs text-gray-600 mt-2">
              123 of 145 projects
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="budget" className="space-y-6">
        <TabsList>
          <TabsTrigger value="budget">Budget Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="contractors">Contractor Analysis</TabsTrigger>
          <TabsTrigger value="departments">Department-wise</TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Allocation Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation by Sector</CardTitle>
                <CardDescription>Distribution across infrastructure categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={budgetAllocation}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {budgetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {budgetAllocation.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx] }} />
                        {item.name}
                      </div>
                      <span>₹{item.amount}Cr ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spending Trend Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Trend</CardTitle>
                <CardDescription>Budget vs Actual spending (₹ Crores)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={spendingTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="budget" stroke="#94a3b8" strokeWidth={2} name="Budget" />
                    <Line type="monotone" dataKey="spent" stroke="#3b82f6" strokeWidth={2} name="Spent" />
                    <Line type="monotone" dataKey="saved" stroke="#10b981" strokeWidth={2} name="Saved" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Spending Details */}
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { year: '2023', budget: 980, spent: 910, saved: 70 },
                  { year: '2024', budget: 1120, spent: 1035, saved: 85 },
                  { year: '2025', budget: 1245, spent: 1135, saved: 110 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="budget" fill="#94a3b8" name="Budget (₹Cr)" />
                  <Bar dataKey="spent" fill="#3b82f6" name="Spent (₹Cr)" />
                  <Bar dataKey="saved" fill="#10b981" name="Saved (₹Cr)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance Metrics</CardTitle>
                <CardDescription>Multi-dimensional performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={performanceMetrics}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics.map((metric, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{metric.metric}</span>
                      <span className={metric.value >= 85 ? 'text-green-600' : metric.value >= 70 ? 'text-yellow-600' : 'text-red-600'}>
                        {metric.value}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${metric.value >= 85 ? 'bg-green-500' : metric.value >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contractors">
          <Card>
            <CardHeader>
              <CardTitle>Contractor Performance Analysis</CardTitle>
              <CardDescription>Top contractors ranked by performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractorPerformance.map((contractor, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg">{contractor.name}</h4>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500 text-sm">★</span>
                          <span className="text-sm ml-1">{contractor.rating}/5.0</span>
                          <span className="text-sm text-gray-500 ml-2">• {contractor.projects} projects</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Overall Score</div>
                        <div className="text-2xl text-blue-600">{Math.round((contractor.onTime + contractor.budget) / 2)}%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">On-Time Delivery</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${contractor.onTime}%` }} />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{contractor.onTime}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Budget Adherence</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${contractor.budget}%` }} />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{contractor.budget}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Analysis</CardTitle>
              <CardDescription>Project distribution and performance by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentWise}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="budget" fill="#3b82f6" name="Budget (₹Cr)" />
                  <Bar yAxisId="right" dataKey="completion" fill="#10b981" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-3">
                {departmentWise.map((dept, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm">{dept.department}</div>
                      <div className="text-xs text-gray-600">{dept.projects} projects</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">₹{dept.budget}Cr</div>
                      <div className="text-xs text-green-600">{dept.completion}% complete</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
