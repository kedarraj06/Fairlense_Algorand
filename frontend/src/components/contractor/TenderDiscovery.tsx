import { useState } from 'react';
import { Search, MapPin, DollarSign, Calendar, TrendingUp, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Slider } from '../ui/slider';

export default function TenderDiscovery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetRange, setBudgetRange] = useState([0, 200]);
  const [selectedTender, setSelectedTender] = useState<any>(null);

  const tenders = [
    {
      id: 'TND-2025-001',
      title: 'Highway Construction - NH47',
      location: 'Mumbai-Pune',
      budget: '₹45Cr',
      budgetValue: 45,
      deadline: '2025-11-15',
      category: 'Highway',
      aiMatch: 95,
      description: 'Construction of 4-lane highway connecting Mumbai to Pune',
      requirements: ['ISO 9001 Certification', '10+ years experience', 'Heavy machinery'],
      estimatedDuration: '24 months',
    },
    {
      id: 'TND-2025-006',
      title: 'Metro Extension Project',
      location: 'Delhi NCR',
      budget: '₹156Cr',
      budgetValue: 156,
      deadline: '2025-11-28',
      category: 'Metro',
      aiMatch: 92,
      description: 'Extension of metro line from Noida to Greater Noida',
      requirements: ['Metro construction experience', 'Advanced tunneling equipment'],
      estimatedDuration: '36 months',
    },
    {
      id: 'TND-2025-007',
      title: 'Water Pipeline Network',
      location: 'Bangalore',
      budget: '₹28Cr',
      budgetValue: 28,
      deadline: '2025-12-05',
      category: 'Water',
      aiMatch: 88,
      description: 'Installation of water pipeline network across 50km',
      requirements: ['Pipeline experience', 'Environmental clearance'],
      estimatedDuration: '18 months',
    },
    {
      id: 'TND-2025-008',
      title: 'Bridge Construction',
      location: 'Kerala',
      budget: '₹62Cr',
      budgetValue: 62,
      deadline: '2025-11-30',
      category: 'Bridge',
      aiMatch: 85,
      description: 'Construction of modern suspension bridge over river',
      requirements: ['Bridge construction expertise', 'Marine foundation experience'],
      estimatedDuration: '30 months',
    },
  ];

  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBudget = tender.budgetValue >= budgetRange[0] && tender.budgetValue <= budgetRange[1];
    return matchesSearch && matchesBudget;
  }).sort((a, b) => b.aiMatch - a.aiMatch);

  const handleSubmitBid = () => {
    toast.success('Bid submitted successfully!', {
      description: 'Your bid has been recorded on the blockchain',
    });
    setSelectedTender(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search tenders by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="highway">Highway</SelectItem>
                  <SelectItem value="bridge">Bridge</SelectItem>
                  <SelectItem value="metro">Metro</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm mb-2 block">Budget Range: ₹{budgetRange[0]}Cr - ₹{budgetRange[1]}Cr</Label>
              <Slider
                value={budgetRange}
                onValueChange={setBudgetRange}
                max={200}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <TrendingUp className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="mb-1">AI-Powered Tender Recommendations</h4>
            <p className="text-sm text-gray-700">
              Tenders are ranked by AI based on your expertise, past performance, and success probability.
              Higher match percentages indicate better fit for your company profile.
            </p>
          </div>
        </div>
      </div>

      {/* Tender Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTenders.map((tender) => (
          <Card key={tender.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-emerald-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-xl">{tender.title}</CardTitle>
                    <Badge className="bg-purple-500">
                      {tender.aiMatch}% AI Match
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">{tender.id} • {tender.category}</CardDescription>
                </div>
                <Dialog open={selectedTender?.id === tender.id} onOpenChange={(open) => !open && setSelectedTender(null)}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setSelectedTender(tender)}>
                      Submit Bid
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submit Bid - {tender.title}</DialogTitle>
                      <DialogDescription>
                        Fill in the details to submit your bid for this tender
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Bid Amount (₹ Crores)</Label>
                        <Input type="number" placeholder="e.g., 42.5" />
                        <p className="text-xs text-gray-600 mt-1">
                          AI Suggestion: ₹{(parseFloat(tender.budget.replace('₹', '').replace('Cr', '')) * 0.95).toFixed(1)}Cr - ₹{(parseFloat(tender.budget.replace('₹', '').replace('Cr', '')) * 0.98).toFixed(1)}Cr for competitive edge
                        </p>
                      </div>
                      <div>
                        <Label>Proposed Timeline (months)</Label>
                        <Input type="number" placeholder={tender.estimatedDuration} />
                      </div>
                      <div>
                        <Label>Technical Proposal</Label>
                        <Textarea placeholder="Describe your approach and methodology..." rows={4} />
                      </div>
                      <div>
                        <Label>Upload Documents</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-600">Click to upload certifications and documents</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                        <p>✓ Your bid will be digitally signed and recorded on blockchain</p>
                      </div>
                      <div className="flex space-x-3">
                        <Button variant="outline" className="flex-1" onClick={() => setSelectedTender(null)}>
                          Cancel
                        </Button>
                        <Button className="flex-1 bg-emerald-600" onClick={handleSubmitBid}>
                          Submit Bid
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-700">{tender.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-600">Location</div>
                      <div className="text-sm">{tender.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-600">Budget</div>
                      <div className="text-sm">{tender.budget}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-600">Deadline</div>
                      <div className="text-sm">{tender.deadline}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-600">Duration</div>
                      <div className="text-sm">{tender.estimatedDuration}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm mb-2">Requirements:</div>
                  <div className="flex flex-wrap gap-2">
                    {tender.requirements.map((req, idx) => (
                      <Badge key={idx} variant="outline">{req}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTenders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No tenders match your search criteria</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(''); setBudgetRange([0, 200]); }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
