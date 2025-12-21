"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, mockApi } from '@/lib/mock-api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string) => Promise<void>;
    register: (email: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentUser = await mockApi.getCurrentUser();
                setUser(currentUser);
            } catch (err) {
                console.error("Failed to fetch user", err);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (email: string) => {
        setLoading(true);
        try {
            const user = await mockApi.login(email);
            setUser(user);
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, name?: string) => {
        setLoading(true);
        try {
            const user = await mockApi.register(email, name);
            setUser(user);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await mockApi.logout();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
