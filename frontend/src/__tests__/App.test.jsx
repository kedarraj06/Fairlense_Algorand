// frontend/src/__tests__/App.test.jsx
// Frontend unit tests for App component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock the context provider
jest.mock('../context/AppContext', () => ({
  AppProvider: ({ children }) => children,
}));

// Mock the components
jest.mock('../components/WalletConnector', () => {
  return function MockWalletConnector({ onWalletConnected, onWalletDisconnected }) {
    return (
      <div data-testid="wallet-connector">
        <button 
          onClick={() => onWalletConnected({ address: 'test-address', walletType: 'algosigner' })}
          data-testid="connect-wallet"
        >
          Connect Wallet
        </button>
        <button 
          onClick={onWalletDisconnected}
          data-testid="disconnect-wallet"
        >
          Disconnect
        </button>
      </div>
    );
  };
});

jest.mock('../components/ContractDashboard', () => {
  return function MockContractDashboard({ appId, walletInfo }) {
    return (
      <div data-testid="contract-dashboard">
        <p>Contract ID: {appId}</p>
        {walletInfo && <p>Wallet: {walletInfo.address}</p>}
      </div>
    );
  };
});

jest.mock('../components/MilestoneManager', () => {
  return function MockMilestoneManager({ appId, walletInfo, userRole }) {
    return (
      <div data-testid="milestone-manager">
        <p>App ID: {appId}</p>
        <p>Role: {userRole}</p>
        {walletInfo && <p>Wallet: {walletInfo.address}</p>}
      </div>
    );
  };
});

jest.mock('../components/LoadingSpinner', () => {
  return function MockLoadingSpinner({ text }) {
    return <div data-testid="loading-spinner">{text}</div>;
  };
});

jest.mock('../components/ErrorBoundary', () => {
  return function MockErrorBoundary({ children, onError }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('FairLens')).toBeInTheDocument();
    expect(screen.getByText('Transparent Government Tenders on Algorand')).toBeInTheDocument();
  });

  it('displays wallet connector', () => {
    render(<App />);
    expect(screen.getByTestId('wallet-connector')).toBeInTheDocument();
  });

  it('displays contract configuration form', () => {
    render(<App />);
    expect(screen.getByText('Contract Configuration')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Algorand Application ID')).toBeInTheDocument();
    expect(screen.getByDisplayValue('viewer')).toBeInTheDocument();
  });

  it('allows user to enter contract ID', () => {
    render(<App />);
    const contractIdInput = screen.getByPlaceholderText('Enter Algorand Application ID');
    
    fireEvent.change(contractIdInput, { target: { value: '12345' } });
    expect(contractIdInput.value).toBe('12345');
  });

  it('allows user to select role', () => {
    render(<App />);
    const roleSelect = screen.getByDisplayValue('viewer');
    
    fireEvent.change(roleSelect, { target: { value: 'owner' } });
    expect(roleSelect.value).toBe('owner');
  });

  it('shows contract dashboard when contract ID is provided', () => {
    render(<App />);
    const contractIdInput = screen.getByPlaceholderText('Enter Algorand Application ID');
    
    fireEvent.change(contractIdInput, { target: { value: '12345' } });
    
    expect(screen.getByTestId('contract-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Contract ID: 12345')).toBeInTheDocument();
  });

  it('shows milestone manager when wallet is connected and contract ID is provided', async () => {
    render(<App />);
    
    // Enter contract ID
    const contractIdInput = screen.getByPlaceholderText('Enter Algorand Application ID');
    fireEvent.change(contractIdInput, { target: { value: '12345' } });
    
    // Connect wallet
    const connectButton = screen.getByTestId('connect-wallet');
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('milestone-manager')).toBeInTheDocument();
    });
  });

  it('saves contract ID to localStorage', () => {
    render(<App />);
    const contractIdInput = screen.getByPlaceholderText('Enter Algorand Application ID');
    
    fireEvent.change(contractIdInput, { target: { value: '12345' } });
    
    expect(localStorage.getItem('fairlens_app_id')).toBe('12345');
  });

  it('saves user role to localStorage', () => {
    render(<App />);
    const roleSelect = screen.getByDisplayValue('viewer');
    
    fireEvent.change(roleSelect, { target: { value: 'contractor' } });
    
    expect(localStorage.getItem('fairlens_user_role')).toBe('contractor');
  });

  it('loads saved state from localStorage', () => {
    // Set up localStorage before rendering
    localStorage.setItem('fairlens_app_id', '67890');
    localStorage.setItem('fairlens_user_role', 'owner');
    
    render(<App />);
    
    expect(screen.getByDisplayValue('67890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('owner')).toBeInTheDocument();
  });

  it('displays quick start guide', () => {
    render(<App />);
    expect(screen.getByText('Quick Start Guide')).toBeInTheDocument();
    expect(screen.getByText('1. Connect Wallet')).toBeInTheDocument();
    expect(screen.getByText('2. Configure Contract')).toBeInTheDocument();
    expect(screen.getByText('3. Manage Milestones')).toBeInTheDocument();
    expect(screen.getByText('4. Monitor Progress')).toBeInTheDocument();
  });

  it('displays key features section', () => {
    render(<App />);
    expect(screen.getByText('Key Features')).toBeInTheDocument();
    expect(screen.getByText('🔒 Secure Smart Contracts')).toBeInTheDocument();
    expect(screen.getByText('💰 Automated Payments')).toBeInTheDocument();
    expect(screen.getByText('🤖 AI Integration')).toBeInTheDocument();
    expect(screen.getByText('📱 Modern Interface')).toBeInTheDocument();
  });

  it('displays footer with links', () => {
    render(<App />);
    expect(screen.getByText('FairLens')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Built on Algorand • Powered by PyTeal • Secured by Ed25519')).toBeInTheDocument();
  });

  it('handles wallet connection', async () => {
    render(<App />);
    
    const connectButton = screen.getByTestId('connect-wallet');
    fireEvent.click(connectButton);
    
    // The wallet connection should trigger the callback
    // This is tested through the milestone manager appearing
    await waitFor(() => {
      // Since we need both contract ID and wallet, let's set contract ID first
      const contractIdInput = screen.getByPlaceholderText('Enter Algorand Application ID');
      fireEvent.change(contractIdInput, { target: { value: '12345' } });
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('milestone-manager')).toBeInTheDocument();
    });
  });

  it('handles wallet disconnection', async () => {
    render(<App />);
    
    // First connect wallet
    const connectButton = screen.getByTestId('connect-wallet');
    fireEvent.click(connectButton);
    
    // Set contract ID
    const contractIdInput = screen.getByPlaceholderText('Enter Algorand Application ID');
    fireEvent.change(contractIdInput, { target: { value: '12345' } });
    
    await waitFor(() => {
      expect(screen.getByTestId('milestone-manager')).toBeInTheDocument();
    });
    
    // Then disconnect
    const disconnectButton = screen.getByTestId('disconnect-wallet');
    fireEvent.click(disconnectButton);
    
    // Milestone manager should no longer be visible
    await waitFor(() => {
      expect(screen.queryByTestId('milestone-manager')).not.toBeInTheDocument();
    });
  });

  it('displays error boundary', () => {
    render(<App />);
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('displays toaster for notifications', () => {
    render(<App />);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});
