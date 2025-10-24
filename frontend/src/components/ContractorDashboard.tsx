import { useState } from 'react';
import { 
  LayoutDashboard, Search, Briefcase, DollarSign, TrendingUp, Bell, LogOut, 
  Menu, X, Users
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import ContractorOverview from './contractor/ContractorOverview';
import TenderDiscovery from './contractor/TenderDiscovery';
import MyProjects from './contractor/MyProjects';
import Payments from './contractor/Payments';

interface ContractorDashboardProps {
  onLogout: () => void;
}

type Tab = 'overview' | 'tenders' | 'projects' | 'payments';

export default function ContractorDashboard({ onLogout }: ContractorDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications] = useState(8);

  const menuItems = [
    { id: 'overview' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tenders' as Tab, label: 'Discover Tenders', icon: Search },
    { id: 'projects' as Tab, label: 'My Projects', icon: Briefcase },
    { id: 'payments' as Tab, label: 'Payments', icon: DollarSign },
  ];

  const handleLogout = () => {
    toast.success('Logged out successfully');
    setTimeout(() => onLogout(), 500);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ContractorOverview />;
      case 'tenders':
        return <TenderDiscovery />;
      case 'projects':
        return <MyProjects />;
      case 'payments':
        return <Payments />;
      default:
        return <ContractorOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-emerald-900 to-emerald-950 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-emerald-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-2xl">FAIRLENS</h1>
                <p className="text-xs text-emerald-300">Contractor Portal</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-emerald-800"
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
                      ? 'bg-emerald-700 text-white' 
                      : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
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
        <div className="p-4 border-t border-emerald-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm">ABC Constructions</p>
                <p className="text-xs text-emerald-300">Contractor</p>
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
              <p className="text-sm text-gray-500">Manage your bids and projects</p>
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
