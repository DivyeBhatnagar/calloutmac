"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from './api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
    phoneNumber?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = Cookies.get('token');
        const storedUser = Cookies.get('user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                Cookies.remove('token');
                Cookies.remove('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: User, jwtToken: string) => {
        Cookies.set('token', jwtToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });
        setToken(jwtToken);
        setUser(userData);
    };

    const logout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
