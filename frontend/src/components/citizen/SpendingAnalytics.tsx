import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function SpendingAnalytics() {
  const budgetBySector = [
    { name: 'Highways', value: 450, percent: 35 },
    { name: 'Bridges', value: 320, percent: 25 },
    { name: 'Metro', value: 260, percent: 20 },
    { name: 'Water', value: 156, percent: 12 },
    { name: 'Buildings', value: 104, percent: 8 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  const monthlySpending = [
    { month: 'Jan', spent: 95, budget: 100 },
    { month: 'Feb', spent: 88, budget: 95 },
    { month: 'Mar', spent: 105, budget: 110 },
    { month: 'Apr', spent: 98, budget: 100 },
    { month: 'May', spent: 115, budget: 120 },
    { month: 'Jun', spent: 110, budget: 115 },
    { month: 'Jul', spent: 125, budget: 130 },
    { month: 'Aug', spent: 118, budget: 125 },
    { month: 'Sep', spent: 132, budget: 140 },
    { month: 'Oct', spent: 128, budget: 135 },
  ];

  const departmentWise = [
    { department: 'Public Works', allocated: 580, spent: 520, saved: 60 },
    { department: 'Transport', allocated: 420, spent: 395, saved: 25 },
    { department: 'Water Resources', allocated: 230, spent: 215, saved: 15 },
    { department: 'Urban Development', allocated: 360, spent: 340, saved: 20 },
  ];

  const yearComparison = [
    { year: '2023', budget: 980, spent: 910 },
    { year: '2024', budget: 1120, spent: 1035 },
    { year: '2025', budget: 1245, spent: 1135 },
  ];

  const projectCompletion = [
    { category: 'On Time', count: 28, percent: 65 },
    { category: 'Delayed', count: 10, percent: 23 },
    { category: 'Early', count: 5, percent: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl text-blue-600">₹1,290Cr</div>
            <p className="text-sm text-gray-600 mt-1">Total Budget 2025</p>
            <div className="flex items-center text-xs text-green-600 mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +11% from 2024
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl text-emerald-600">₹1,135Cr</div>
            <p className="text-sm text-gray-600 mt-1">Amount Spent</p>
            <div className="text-xs text-gray-600 mt-2">88% utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl text-amber-600">₹155Cr</div>
            <p className="text-sm text-gray-600 mt-1">Savings Achieved</p>
            <div className="flex items-center text-xs text-green-600 mt-2">
              <TrendingDown className="h-3 w-3 mr-1" />
              12% cost efficiency
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl text-purple-600">43</div>
            <p className="text-sm text-gray-600 mt-1">Active Projects</p>
            <div className="text-xs text-gray-600 mt-2">65% on schedule</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sector" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sector">By Sector</TabsTrigger>
          <TabsTrigger value="department">By Department</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="sector" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sector Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Distribution by Sector</CardTitle>
                <CardDescription>How public funds are allocated (₹ Crores)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={budgetBySector}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {budgetBySector.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {budgetBySector.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx] }} />
                        {item.name}
                      </div>
                      <span>₹{item.value}Cr ({item.percent}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spending Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Sector Analysis</CardTitle>
                <CardDescription>Budget allocation and utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetBySector.map((sector, idx) => (
                    <div key={idx} className="border rounded-lg p-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">{sector.name}</span>
                        <span className="text-sm">₹{sector.value}Cr</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${sector.percent}%`,
                            backgroundColor: COLORS[idx]
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {sector.percent}% of total budget
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="department">
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Budget Analysis</CardTitle>
              <CardDescription>Allocated vs Spent vs Saved (₹ Crores)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentWise}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="allocated" fill="#94a3b8" name="Allocated" />
                  <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
                  <Bar dataKey="saved" fill="#10b981" name="Saved" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-3">
                {departmentWise.map((dept, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm">{dept.department}</div>
                      <div className="text-xs text-gray-600">
                        Efficiency: {((dept.saved / dept.allocated) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">₹{dept.spent}Cr spent</div>
                      <div className="text-xs text-green-600">₹{dept.saved}Cr saved</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
              <CardDescription>Budget vs actual spending (₹ Crores)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="budget" stroke="#94a3b8" strokeWidth={2} name="Budget" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="spent" stroke="#3b82f6" strokeWidth={2} name="Spent" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Year-over-Year */}
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Comparison</CardTitle>
              <CardDescription>Budget trends over the years</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="budget" fill="#94a3b8" name="Budget (₹Cr)" />
                  <Bar dataKey="spent" fill="#3b82f6" name="Spent (₹Cr)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Completion Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Completion Status</CardTitle>
                <CardDescription>Timeline adherence statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={projectCompletion}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${percent}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                      On Time
                    </span>
                    <span>28 projects (65%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                      Delayed
                    </span>
                    <span>10 projects (23%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                      Early Completion
                    </span>
                    <span>5 projects (12%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Public infrastructure metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Budget Utilization Efficiency</span>
                    <span className="text-green-600">88%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Timeline Adherence</span>
                    <span className="text-green-600">77%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '77%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Cost Savings Rate</span>
                    <span className="text-emerald-600">12%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Public Satisfaction</span>
                    <span className="text-blue-600">4.2/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '84%' }} />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    All data is verified on blockchain and updated in real-time for complete transparency.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
