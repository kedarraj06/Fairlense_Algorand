import { useState } from 'react';
import { 
  LayoutDashboard, FileText, BarChart3, Shield, Bell, LogOut, 
  Plus, Search, Filter, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, Clock, DollarSign, Users, Menu, X
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { toast } from 'sonner';
import GovernmentOverview from './government/GovernmentOverview';
import TenderManagement from './government/TenderManagement';
import ProjectMonitoring from './government/ProjectMonitoring';
import AnalyticsReporting from './government/AnalyticsReporting';
import BlockchainVerification from './government/BlockchainVerification';

interface GovernmentDashboardProps {
  onLogout: () => void;
}

type Tab = 'overview' | 'tenders' | 'projects' | 'analytics' | 'blockchain';

export default function GovernmentDashboard({ onLogout }: GovernmentDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications] = useState(12);

  const menuItems = [
    { id: 'overview' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tenders' as Tab, label: 'Tender Management', icon: FileText },
    { id: 'projects' as Tab, label: 'Project Monitoring', icon: BarChart3 },
    { id: 'analytics' as Tab, label: 'Analytics & Reports', icon: TrendingUp },
    { id: 'blockchain' as Tab, label: 'Blockchain Verification', icon: Shield },
  ];

  const handleLogout = () => {
    toast.success('Logged out successfully');
    setTimeout(() => onLogout(), 500);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <GovernmentOverview />;
      case 'tenders':
        return <TenderManagement />;
      case 'projects':
        return <ProjectMonitoring />;
      case 'analytics':
        return <AnalyticsReporting />;
      case 'blockchain':
        return <BlockchainVerification />;
      default:
        return <GovernmentOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-950 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-2xl">FAIRLENS</h1>
                <p className="text-xs text-blue-300">Government Portal</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-blue-800"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Button
                  variant={activeTab === item.id ? 'secondary' : 'ghost'}
                  className={`w-full justify-start ${
                    activeTab === item.id 
                      ? 'bg-blue-700 text-white' 
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="h-5 w-5" />
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm">Admin User</p>
                <p className="text-xs text-blue-300">Government</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl text-gray-800">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-500">Manage and monitor infrastructure projects</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
