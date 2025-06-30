import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Role } from '../types';

type DashboardType = 'BUYER' | 'SELLER';

interface DashboardContextType {
    currentDashboard: DashboardType | null;
    setCurrentDashboard: (dashboard: DashboardType | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentDashboard, setCurrentDashboard] = useState<DashboardType | null>(null);

    return (
        <DashboardContext.Provider value={{ currentDashboard, setCurrentDashboard }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = (): DashboardContextType => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
