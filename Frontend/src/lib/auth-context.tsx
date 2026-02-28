"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from './api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'user' | 'admin'; // Support both cases
    phoneNumber?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    viewMode: 'USER' | 'ADMIN';
    login: (userData: User, token: string) => void;
    logout: () => void;
    toggleViewMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'USER' | 'ADMIN'>('USER');
    const router = useRouter();

    useEffect(() => {
        const storedToken = Cookies.get('token');
        const storedUser = Cookies.get('user');
        const storedViewMode = Cookies.get('viewMode');

        if (storedToken && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(userData);
                
                // Set view mode based on stored preference or user role
                if (storedViewMode && userData.role.toUpperCase() === 'ADMIN') {
                    setViewMode(storedViewMode as 'USER' | 'ADMIN');
                } else if (userData.role.toUpperCase() === 'ADMIN') {
                    setViewMode('ADMIN');
                } else {
                    setViewMode('USER');
                }
            } catch (e) {
                Cookies.remove('token');
                Cookies.remove('user');
                Cookies.remove('viewMode');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: User, jwtToken: string) => {
        Cookies.set('token', jwtToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });
        setToken(jwtToken);
        setUser(userData);
        
        // Set initial view mode based on role
        const initialMode = userData.role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
        setViewMode(initialMode);
        Cookies.set('viewMode', initialMode, { expires: 7 });
    };

    const logout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        Cookies.remove('viewMode');
        setToken(null);
        setUser(null);
        setViewMode('USER');
        router.push('/login');
    };

    const toggleViewMode = () => {
        if (!user?.role || (user.role.toUpperCase() !== 'ADMIN')) return; // Only admins can toggle
        
        const newMode = viewMode === 'ADMIN' ? 'USER' : 'ADMIN';
        setViewMode(newMode);
        Cookies.set('viewMode', newMode, { expires: 7 });
        
        // Redirect to appropriate dashboard
        if (newMode === 'ADMIN') {
            router.push('/dashboard/admin');
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, viewMode, login, logout, toggleViewMode }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
