import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardProvider, useDashboard } from './contexts/DashboardContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import Modal from './components/Modal';
import Button from './components/Button';
import { Role } from './types';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardProvider>
        <Main />
      </DashboardProvider>
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { currentDashboard, setCurrentDashboard } = useDashboard();

  const [showDashboardSelect, setShowDashboardSelect] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setShowDashboardSelect(true);
    }
  }, [isAuthenticated, user]);

  const handleDashboardSelection = (dashboard: 'BUYER' | 'SELLER') => {
    setCurrentDashboard(dashboard);
    setShowDashboardSelect(false);
  };

  const renderContent = useCallback(() => {
    if (loading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }
    
    if (!isAuthenticated) {
        return <LoginPage />;
    }


    if (showDashboardSelect) {
        return (
            <Modal title="Which dashboard would you like to enter?" isOpen={true} onClose={() => {}}>
                <div className="p-4 text-center">
                    <div className="flex justify-center gap-4">
                        {user?.roles.includes(Role.BUYER) && <Button onClick={() => handleDashboardSelection('BUYER')}>Buyer</Button>}
                        {user?.roles.includes(Role.SELLER) && <Button onClick={() => handleDashboardSelection('SELLER')}>Seller</Button>}
                    </div>
                </div>
            </Modal>
        );
    }
    
    if (!currentDashboard) {
      return <LandingPage onAction={(dash) => setCurrentDashboard(dash)} />;
    }

    return currentDashboard === 'BUYER' ? <BuyerDashboard /> : <SellerDashboard />;

  }, [loading, isAuthenticated, showDashboardSelect, currentDashboard, user, setCurrentDashboard]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
