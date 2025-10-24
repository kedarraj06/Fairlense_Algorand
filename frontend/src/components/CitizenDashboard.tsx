import { useState } from 'react';
import { Map, BarChart3, MessageSquare, BookOpen, ArrowLeft, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import CitizenOverview from './citizen/CitizenOverview';
import ProjectMap from './citizen/ProjectMap';
import SpendingAnalytics from './citizen/SpendingAnalytics';
import ReportIssue from './citizen/ReportIssue';

interface CitizenDashboardProps {
  onBack: () => void;
}

export default function CitizenDashboard({ onBack }: CitizenDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-white hover:bg-purple-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl">FAIRLENS Public Portal</h1>
                <p className="text-sm text-purple-200">Transparency in Public Infrastructure</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-10 pr-4 py-2 rounded-lg bg-purple-800 text-white placeholder-purple-300 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center">
              <Map className="h-4 w-4 mr-2" />
              Project Map
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Spending Analytics
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Report Issue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <CitizenOverview />
          </TabsContent>

          <TabsContent value="map">
            <ProjectMap />
          </TabsContent>

          <TabsContent value="analytics">
            <SpendingAnalytics />
          </TabsContent>

          <TabsContent value="report">
            <ReportIssue />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-6 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm opacity-80">
            Public Transparency Portal • All data verified on blockchain
          </p>
          <p className="text-xs opacity-60 mt-1">
            Empowering citizens with information and accountability
          </p>
        </div>
      </div>
    </div>
  );
}
