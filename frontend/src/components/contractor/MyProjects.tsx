import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Upload, CheckCircle, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function MyProjects() {
  const projects = [
    {
      id: 'PRJ-001',
      name: 'Highway Construction - NH47',
      location: 'Mumbai-Pune',
      status: 'In Progress',
      progress: 65,
      budget: '₹45Cr',
      spent: '₹29Cr',
      startDate: '2025-01-15',
      endDate: '2026-01-15',
      milestones: [
        { name: 'Foundation', progress: 100, status: 'Completed', payment: '₹9Cr', claimed: true },
        { name: 'Structure', progress: 75, status: 'In Progress', payment: '₹18Cr', claimed: false },
        { name: 'Finishing', progress: 20, status: 'In Progress', payment: '₹13.5Cr', claimed: false },
        { name: 'Testing', progress: 0, status: 'Pending', payment: '₹4.5Cr', claimed: false },
      ],
    },
    {
      id: 'PRJ-002',
      name: 'School Renovation',
      location: 'Bangalore',
      status: 'In Progress',
      progress: 42,
      budget: '₹12Cr',
      spent: '₹5Cr',
      startDate: '2025-05-01',
      endDate: '2025-12-20',
      milestones: [
        { name: 'Demolition', progress: 100, status: 'Completed', payment: '₹2.4Cr', claimed: true },
        { name: 'Construction', progress: 40, status: 'In Progress', payment: '₹6Cr', claimed: false },
        { name: 'Finishing', progress: 0, status: 'Pending', payment: '₹3.6Cr', claimed: false },
      ],
    },
  ];

  const handleUploadProgress = () => {
    toast.success('Progress photos uploaded successfully', {
      description: 'Photos have been geotagged and timestamped',
    });
  };

  const handleClaimPayment = (amount: string) => {
    toast.success('Payment claim initiated', {
      description: `${amount} will be processed via smart contract`,
    });
  };

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.location} • {project.id}
                </CardDescription>
              </div>
              <Badge className="bg-blue-500">{project.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="upload">Upload Progress</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Overall Progress</div>
                    <div className="text-2xl mb-1">{project.progress}%</div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Budget Utilization</div>
                    <div className="text-sm">{project.spent} / {project.budget}</div>
                    <Progress value={(parseFloat(project.spent.replace('₹', '').replace('Cr', '')) / parseFloat(project.budget.replace('₹', '').replace('Cr', ''))) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Timeline</div>
                    <div className="text-xs">{project.startDate} to {project.endDate}</div>
                    <div className="text-sm text-gray-600 mt-1">8 months remaining</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="milestones" className="space-y-3">
                {project.milestones.map((milestone, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4>{milestone.name}</h4>
                            {milestone.status === 'Completed' && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {milestone.status === 'In Progress' && (
                              <Clock className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">Payment: {milestone.payment}</p>
                        </div>
                        <Badge variant={milestone.status === 'Completed' ? 'default' : 'secondary'}>
                          {milestone.status}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Completion</span>
                          <span>{milestone.progress}%</span>
                        </div>
                        <Progress value={milestone.progress} />
                      </div>
                      {milestone.progress === 100 && !milestone.claimed && (
                        <Button 
                          className="w-full bg-emerald-600" 
                          onClick={() => handleClaimPayment(milestone.payment)}
                        >
                          Claim Payment ({milestone.payment})
                        </Button>
                      )}
                      {milestone.claimed && (
                        <div className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Payment claimed and verified on blockchain
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="upload">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h4 className="mb-2">Upload Progress Photos</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Photos will be automatically geotagged and timestamped for verification
                    </p>
                    <Button onClick={handleUploadProgress}>
                      Select Photos
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>✓ All uploads are recorded on blockchain</p>
                    <p>✓ Location and timestamp verified</p>
                    <p>✓ Accessible to government inspectors</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
