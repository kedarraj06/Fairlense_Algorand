import { useState, useEffect } from 'react';
import { TrendingUp, MapPin, DollarSign, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';

export default function CitizenOverview() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => prev < 156 ? prev + 3 : 156);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: 'Projects in Your Area',
      value: '12',
      subtitle: '+3 new this month',
      icon: MapPin,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Budget Tracked',
      value: `₹${counter}Cr`,
      subtitle: 'Public spending',
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      title: 'Completed Projects',
      value: '28',
      subtitle: '85% on time',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Active Reports',
      value: '7',
      subtitle: 'Community issues',
      icon: FileText,
      color: 'bg-amber-500',
    },
  ];

  const recentProjects = [
    {
      name: 'Highway Construction - NH47',
      location: 'Mumbai-Pune',
      budget: '₹45Cr',
      progress: 65,
      status: 'On Track',
      contractor: 'ABC Constructions Ltd',
    },
    {
      name: 'School Renovation',
      location: 'Local District',
      budget: '₹12Cr',
      progress: 42,
      status: 'Delayed',
      contractor: 'XYZ Builders',
    },
    {
      name: 'Water Pipeline Network',
      location: 'City Center',
      budget: '₹28Cr',
      progress: 88,
      status: 'Ahead',
      contractor: 'Metro Builders Inc',
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
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none">
        <CardContent className="pt-6">
          <h2 className="text-3xl mb-2">Welcome to Public Transparency Portal</h2>
          <p className="text-purple-100 mb-4">
            Monitor public infrastructure projects, track spending, and report issues in your community.
            Every piece of data is verified on blockchain for complete transparency.
          </p>
          <div className="flex space-x-3">
            <Button variant="secondary">
              Explore Projects
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white/20">
              Report an Issue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-l-4" style={{ borderLeftColor: stat.color.replace('bg-', '#') }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">{stat.title}</CardTitle>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.subtitle}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects in Your Area</CardTitle>
          <CardDescription>Track infrastructure development near you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project, idx) => (
              <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg mb-1">{project.name}</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {project.location}
                    </div>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-600">Budget</div>
                    <div className="text-lg">{project.budget}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Contractor</div>
                    <div className="text-sm">{project.contractor}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  View Project Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transparency Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Blockchain Verified Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              All project data, budgets, and milestones are recorded on an immutable blockchain,
              ensuring complete transparency and preventing data manipulation.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Real-time project updates</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Immutable transaction records</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Public audit trail</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Community Reporting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Report issues related to project quality, delays, or corruption. All reports are 
              reviewed and tracked for resolution.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Anonymous reporting option</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Photo/video evidence upload</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Status tracking</span>
              </div>
            </div>
            <Button className="w-full mt-4 bg-amber-600">
              Report an Issue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
