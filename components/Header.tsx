import React from 'react';
import { ShoppingCart, LogIn, LogOut, User as UserIcon, Store, Repeat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import { Role } from '../types';

const Header: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { currentDashboard, setCurrentDashboard } = useDashboard();

    const handleSwitchDashboard = () => {
        if (currentDashboard === 'BUYER') {
            setCurrentDashboard('SELLER');
        } else {
            setCurrentDashboard('BUYER');
        }
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="text-primary-600 h-8 w-8" />
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">SellAnything.com</h1>
                </div>

                <div className="flex items-center gap-4">
                    {isAuthenticated && user && (
                        <>
                            {user.roles.length > 1 && currentDashboard && (
                                <button
                                    onClick={handleSwitchDashboard}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors duration-200 p-2 rounded-lg bg-gray-100 hover:bg-primary-100"
                                    title={`Switch to ${currentDashboard === 'BUYER' ? 'Seller' : 'Buyer'} View`}
                                >
                                    <Repeat size={16} />
                                    <span>Switch to {currentDashboard === 'BUYER' ? 'Seller' : 'Buyer'}</span>
                                </button>
                            )}
                            <div className="flex items-center gap-2">
                                <img src={user.profilePicUrl} alt={user.name} className="h-9 w-9 rounded-full object-cover border-2 border-primary-200" />
                                <span className="hidden sm:inline font-medium text-gray-700">{user.name}</span>
                            </div>
                            <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg">
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
