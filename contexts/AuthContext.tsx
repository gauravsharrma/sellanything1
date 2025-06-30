import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { User, Role } from '../types';
import {
    loginUser as loginUserService,
    getUserById,
    updateUser as updateUserService,
} from '../services/firestore';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string) => void;
    logout: () => void;
    setUserRoles: (roles: Role[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                // In a real app this would use Firebase Auth
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const login = useCallback(async (email: string) => {
        setLoading(true);
        const loggedInUser = await loginUserService(email);
        setUser(loggedInUser);
        setLoading(false);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    const setUserRoles = useCallback((roles: Role[]) => {
        if (user) {
            const updatedUser = { ...user, roles };
            updateUserService(updatedUser);
            setUser(updatedUser);
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, setUserRoles }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
