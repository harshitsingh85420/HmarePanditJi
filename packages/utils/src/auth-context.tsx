'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
    id: string;
    phone: string;
    role: 'CUSTOMER' | 'PANDIT' | 'ADMIN';
    name: string | null;
    isVerified: boolean;
    profileCompleted: boolean;
}

export interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async (authToken: string) => {
        try {
            // Replace with your actual API endpoint base URL if needed.
            // Assuming /api is mapped in Next.js rewrites or absolute URL
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to validate token');
            }

            const data = await response.json();
            if (data.success && data.data && data.data.user) {
                setUser(data.data.user);
                setToken(authToken);
            } else {
                throw new Error('Invalid user data');
            }
        } catch (error) {
            console.error('Auth validation error:', error);
            localStorage.removeItem('hpj_token');
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('hpj_token');
        if (storedToken) {
            fetchUser(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const login = (newToken: string, newUser: AuthUser) => {
        localStorage.setItem('hpj_token', newToken);
        document.cookie = `hpj_token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('hpj_token');
        document.cookie = 'hpj_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setToken(null);
        setUser(null);
        window.location.href = '/';
    };

    const refreshUser = async () => {
        if (token) {
            setLoading(true);
            await fetchUser(token);
        }
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export function useRequireAuth(requiredRole?: 'CUSTOMER' | 'PANDIT' | 'ADMIN') {
    const { user, loading, isAuthenticated } = useAuth();
    const [isAccessDenied, setIsAccessDenied] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                const loginBase = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
                const redirectParam = requiredRole ? `&redirect=${requiredRole.toLowerCase()}` : '';
                window.location.href = `${loginBase}/login?next=${encodeURIComponent(window.location.pathname)}${redirectParam}`;
            } else if (requiredRole && user.role !== requiredRole) {
                setIsAccessDenied(true);
                // Also redirect if needed, but we keep isAccessDenied for backward compatibility with AuthGuard
                // window.location.href = '/unauthorized';
            }
        }
    }, [user, loading, requiredRole]);

    return { user, loading, isAuthenticated, isAccessDenied };
}


export const AuthGuard = ({ children, role }: { children: ReactNode, role?: 'CUSTOMER' | 'PANDIT' | 'ADMIN' }) => {
    const { loading, isAccessDenied, isAuthenticated } = useRequireAuth(role);

    if (loading || !isAuthenticated) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 z-50">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Checking authentication...</p>
            </div>
        );
    }

    if (isAccessDenied) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 z-50 p-6 text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-6 max-w-md">You do not have the required permissions to access this page. Please log in with the appropriate account.</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return <>{children}</>;
};
