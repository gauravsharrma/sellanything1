import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { User, Role } from '../types';
import { db } from '../services/db';

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
        try {
            const storedUserId = localStorage.getItem('sellAnything_userId');
            if (storedUserId) {
                const loggedInUser = db.getUserById(JSON.parse(storedUserId));
                if (loggedInUser) {
                    setUser(loggedInUser);
                }
            }
        } catch(e) {
            console.error("Failed to parse user from storage", e);
            localStorage.removeItem('sellAnything_userId');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback((email: string) => {
        setLoading(true);
        const loggedInUser = db.loginUser(email);
        setUser(loggedInUser);
        localStorage.setItem('sellAnything_userId', JSON.stringify(loggedInUser.id));
        setLoading(false);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('sellAnything_userId');
    }, []);

    const setUserRoles = useCallback((roles: Role[]) => {
        if (user) {
            const updatedUser = { ...user, roles };
            db.updateUser(updatedUser);
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
