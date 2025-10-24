import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Edit, Trash2, Eye, CheckCircle, Wallet, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner@2.0.3';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import apiService from '../../services/api';
import peraWalletService from '../../services/peraWallet';

export default function TenderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [tenders, setTenders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  // Form data for creating tender
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    budget: '',
    deadline: '',
    requirements: '',
    milestones: []
  });

  // Load tenders from backend
  useEffect(() => {
    loadTenders();
    checkWalletConnection();
  }, []);

  const loadTenders = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTenders();
      setTenders(response.tenders || []);
    } catch (error) {
      console.error('Error loading tenders:', error);
      toast.error('Failed to load tenders');
    } finally {
      setIsLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    const status = peraWalletService.getConnectionStatus();
    setWalletConnected(status.isConnected);
    setWalletAddress(status.address || '');
  };

  const connectWallet = async () => {
    try {
      const result = await peraWalletService.connect();
      if (result.success) {
        setWalletConnected(true);
        setWalletAddress(result.address);
        toast.success('Wallet connected successfully!');
      } else {
        toast.error('Failed to connect wallet: ' + result.error);
      }
    } catch (error) {
      toast.error('Wallet connection failed: ' + error.message);
    }
  };

  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || tender.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleCreateTender = async () => {
    if (formStep < 4) {
      setFormStep(formStep + 1);
    } else {
      try {
        // Check if wallet is connected
        if (!walletConnected) {
          toast.error('Please connect your Pera wallet first!');
          return;
        }

        // Create tender in backend
        const tenderData = {
          title: formData.title,
          description: formData.description,
          budget: parseFloat(formData.budget) * 10000000, // Convert to actual amount
          deadline: formData.deadline,
          requirements: formData.requirements.split(',').map(req => req.trim()),
          milestones: formData.milestones,
          location: {
            address: formData.location,
            city: formData.location,
            state: 'State',
            country: 'India'
          }
        };

        const tenderResponse = await apiService.createTender(tenderData);
        
        if (tenderResponse.tender) {
          // Deploy smart contract
          const contractData = {
            tenderId: tenderResponse.tender.id,
            contractorWallet: '', // Will be set when contractor is selected
            verifierWallet: walletAddress // Use government wallet as verifier for now
          };

          const contractResponse = await apiService.deployContract(contractData);
          
          if (contractResponse.contractAddress) {
            toast.success(`Tender created and smart contract deployed! Contract: ${contractResponse.contractAddress}`);
            
            // Reload tenders
            await loadTenders();
            
            // Close dialog and reset form
            setIsCreateDialogOpen(false);
            setFormStep(1);
            setFormData({
              title: '',
              description: '',
              location: '',
              category: '',
              budget: '',
              deadline: '',
              requirements: '',
              milestones: []
            });
          } else {
            toast.error('Tender created but smart contract deployment failed');
          }
        } else {
          toast.error('Failed to create tender');
        }
      } catch (error) {
        console.error('Error creating tender:', error);
        toast.error('Failed to create tender: ' + error.message);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={
        status === 'Active' ? 'bg-green-500' :
        status === 'Review' ? 'bg-yellow-500' :
        status === 'Completed' ? 'bg-gray-500' :
        'bg-blue-500'
      }>
        {status}
      </Badge>
    );
  };

  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Project Title</Label>
              <Input 
                placeholder="e.g., Highway Construction - NH47" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <Label>Project Description</Label>
              <Textarea 
                placeholder="Detailed description of the project..." 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input 
                  placeholder="e.g., Mumbai-Pune" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="highway">Highway</SelectItem>
                    <SelectItem value="bridge">Bridge</SelectItem>
                    <SelectItem value="metro">Metro</SelectItem>
                    <SelectItem value="water">Water Infrastructure</SelectItem>
                    <SelectItem value="building">Building</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Technical Specifications</Label>
              <Textarea placeholder="Enter technical requirements..." rows={6} />
            </div>
            <div>
              <Label>Quality Standards</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="is456">IS 456 - Plain and Reinforced Concrete</SelectItem>
                  <SelectItem value="is800">IS 800 - Steel Structures</SelectItem>
                  <SelectItem value="irc">IRC Standards - Road Construction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estimated Budget (₹ Crores)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 45" 
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                />
                <p className="text-sm text-green-600 mt-1">✓ AI suggests: ₹42-48Cr based on similar projects</p>
              </div>
              <div>
                <Label>Project Duration (Months)</Label>
                <Input type="number" placeholder="e.g., 24" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bid Submission Deadline</Label>
                <Input 
                  type="date" 
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
              <div>
                <Label>Project Start Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <Label>Milestone Plan</Label>
              <div className="space-y-2 mt-2">
                <Input placeholder="Milestone 1: Foundation - 20%" />
                <Input placeholder="Milestone 2: Structure - 40%" />
                <Input placeholder="Milestone 3: Finishing - 30%" />
                <Input placeholder="Milestone 4: Testing - 10%" />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Upload Documents</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DWG files (max 50MB)</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Zap className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm">
                    <strong>Smart Contract Deployment:</strong> This tender will be deployed as a smart contract 
                    on Algorand blockchain for transparent and automated milestone payments.
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Contract Address: Will be generated after deployment
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Wallet: {walletConnected ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search tenders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex space-x-3">
          {/* Wallet Connection Status */}
          {walletConnected ? (
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <Wallet className="h-4 w-4" />
              <span>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </div>
          ) : (
            <Button variant="outline" onClick={connectWallet} className="text-blue-600">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          )}
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" disabled={!walletConnected}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Tender
                {!walletConnected && <span className="ml-2 text-xs">(Connect Wallet)</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Tender</DialogTitle>
                <DialogDescription>
                  Step {formStep} of 4: {
                    formStep === 1 ? 'Basic Information' :
                    formStep === 2 ? 'Technical Specifications' :
                    formStep === 3 ? 'Budget & Timeline' :
                    'Documents & Confirmation'
                  }
                </DialogDescription>
              </DialogHeader>
              
              {/* Progress Indicator */}
              <div className="mb-6">
                <Progress value={formStep * 25} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Basic Info</span>
                  <span>Specifications</span>
                  <span>Budget</span>
                  <span>Documents</span>
                </div>
              </div>

              {renderFormStep()}

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => formStep > 1 ? setFormStep(formStep - 1) : setIsCreateDialogOpen(false)}
                >
                  {formStep === 1 ? 'Cancel' : 'Previous'}
                </Button>
                <Button onClick={handleCreateTender} className="bg-blue-600">
                  {formStep === 4 ? 'Create Tender' : 'Next'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tender Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl">24</div>
            <p className="text-sm text-gray-600">Total Tenders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-green-600">16</div>
            <p className="text-sm text-gray-600">Active Tenders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-yellow-600">5</div>
            <p className="text-sm text-gray-600">Under Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-gray-600">3</div>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tenders</CardTitle>
          <CardDescription>Manage and monitor all tender activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tender ID</TableHead>
                <TableHead>Project Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bids</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Loading tenders...
                  </TableCell>
                </TableRow>
              ) : filteredTenders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No tenders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenders.map((tender) => (
                  <TableRow key={tender.id || tender._id}>
                    <TableCell className="font-mono text-sm">{tender.id || tender._id}</TableCell>
                    <TableCell>{tender.title}</TableCell>
                    <TableCell>{tender.location?.address || tender.location || 'N/A'}</TableCell>
                    <TableCell>₹{(tender.budget / 10000000).toFixed(1)}Cr</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tender.category || 'General'}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(tender.status)}</TableCell>
                    <TableCell>{tender.bids || 0} bids</TableCell>
                    <TableCell className="text-sm">{new Date(tender.deadline).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => toast.info(`Viewing ${tender.id || tender._id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toast.info(`Editing ${tender.id || tender._id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {tender.contractAddress && (
                          <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => toast.info(`Contract: ${tender.contractAddress}`)}>
                            <Zap className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => toast.error('Tender archived')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Upload({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  );
}
