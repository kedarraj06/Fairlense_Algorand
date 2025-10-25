import { useState } from 'react';
import LandingPage from './components/LandingPage';
import GovernmentDashboard from './components/GovernmentDashboard';
import ContractorDashboard from './components/ContractorDashboard';
import CitizenDashboard from './components/CitizenDashboard';
import { Toaster } from './components/ui/sonner';

type UserRole = 'landing' | 'government' | 'contractor' | 'citizen';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('landing');

  const renderView = () => {
    switch (currentRole) {
      case 'government':
        return <GovernmentDashboard onLogout={() => setCurrentRole('landing')} />;
      case 'contractor':
        return <ContractorDashboard onLogout={() => setCurrentRole('landing')} />;
      case 'citizen':
        return <CitizenDashboard onBack={() => setCurrentRole('landing')} />;
      default:
        return <LandingPage onRoleSelect={setCurrentRole} />;
    }
  };

  return (
    <>
      {renderView()}
      <Toaster />
    </>
  );
}
