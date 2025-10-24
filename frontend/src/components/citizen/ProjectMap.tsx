import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Navigation, Filter, DollarSign, Calendar } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export default function ProjectMap() {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const projects = [
    {
      id: 1,
      name: 'Highway Construction - NH47',
      location: 'Mumbai-Pune',
      coordinates: { lat: 19.0, lng: 73.8 },
      budget: '₹45Cr',
      progress: 65,
      status: 'On Track',
      contractor: 'ABC Constructions Ltd',
      description: 'Construction of 4-lane highway',
    },
    {
      id: 2,
      name: 'School Renovation',
      location: 'Local District',
      coordinates: { lat: 18.9, lng: 73.9 },
      budget: '₹12Cr',
      progress: 42,
      status: 'Delayed',
      contractor: 'XYZ Builders',
      description: 'Complete renovation of public school',
    },
    {
      id: 3,
      name: 'Water Pipeline',
      location: 'City Center',
      coordinates: { lat: 19.1, lng: 73.7 },
      budget: '₹28Cr',
      progress: 88,
      status: 'Ahead',
      contractor: 'Metro Builders Inc',
      description: 'Installation of water pipeline network',
    },
    {
      id: 4,
      name: 'Bridge Construction',
      location: 'River Area',
      coordinates: { lat: 19.2, lng: 73.6 },
      budget: '₹62Cr',
      progress: 55,
      status: 'On Track',
      contractor: 'Bridge Corp',
      description: 'Modern suspension bridge construction',
    },
  ];

  const filteredProjects = projects.filter(p => 
    filterStatus === 'all' || p.status.toLowerCase().includes(filterStatus.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    if (status === 'On Track') return '#10b981';
    if (status === 'Delayed') return '#ef4444';
    if (status === 'Ahead') return '#3b82f6';
    return '#f59e0b';
  };

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input placeholder="Search by location or pincode..." className="pl-10" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on track">On Track</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="ahead">Ahead of Schedule</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Navigation className="h-4 w-4 mr-2" />
              My Location
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Display */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Interactive Project Map</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simulated Map */}
            <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-[500px] overflow-hidden">
              {/* Grid pattern to simulate map */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(#999 1px, transparent 1px), linear-gradient(90deg, #999 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}></div>
              
              {/* Project Markers */}
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                  style={{
                    left: `${(project.coordinates.lng - 73.5) * 200 + 50}%`,
                    top: `${(19.2 - project.coordinates.lat) * 200 + 20}%`,
                  }}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="relative">
                    <div 
                      className="w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                      style={{ backgroundColor: getStatusColor(project.status) }}
                    >
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    {selectedProject?.id === project.id && (
                      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl p-3 z-10 border-2 border-purple-500">
                        <h4 className="text-sm mb-1">{project.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{project.location}</p>
                        <div className="flex justify-between text-xs mb-2">
                          <span>Budget: {project.budget}</span>
                          <span>Progress: {project.progress}%</span>
                        </div>
                        <Badge className="mb-2" style={{ backgroundColor: getStatusColor(project.status) }}>
                          {project.status}
                        </Badge>
                        <Button size="sm" className="w-full mt-2">View Details</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <h4 className="text-sm mb-2">Status Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span>On Track</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                    <span>Delayed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                    <span>Ahead of Schedule</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project List */}
        <Card>
          <CardHeader>
            <CardTitle>Projects ({filteredProjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedProject?.id === project.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm pr-2">{project.name}</h4>
                    <Badge 
                      className="flex-shrink-0 text-xs"
                      style={{ backgroundColor: getStatusColor(project.status) }}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {project.location}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {project.budget}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ 
                          width: `${project.progress}%`,
                          backgroundColor: getStatusColor(project.status)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Project Details */}
      {selectedProject && (
        <Card className="border-2 border-purple-500">
          <CardHeader>
            <CardTitle>{selectedProject.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm text-gray-600 mb-1">Location</h4>
                <p>{selectedProject.location}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-600 mb-1">Budget</h4>
                <p>{selectedProject.budget}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-600 mb-1">Contractor</h4>
                <p className="text-sm">{selectedProject.contractor}</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm text-gray-600 mb-1">Description</h4>
              <p className="text-sm">{selectedProject.description}</p>
            </div>
            <div className="flex space-x-3 mt-4">
              <Button variant="outline" className="flex-1">View Full Details</Button>
              <Button className="flex-1 bg-purple-600">Track Progress</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
