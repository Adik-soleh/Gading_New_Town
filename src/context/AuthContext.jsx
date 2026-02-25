import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check session on mount
    useEffect(() => {
        checkSession();
    }, []);

    async function checkSession() {
        try {
            const session = await auth.getSession();
            if (session?.user) {
                setUser(session.user);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        const result = await auth.login(email, password);
        if (result?.user) {
            setUser(result.user);
        }
        return result;
    }

    async function loginNik(nik) {
        const result = await auth.loginNik(nik);
        if (result?.token) {
            localStorage.setItem('auth_token', result.token);
        }
        if (result?.user) {
            setUser(result.user);
        }
        return result;
    }

    async function logout() {
        // Clear custom NIK token
        localStorage.removeItem('auth_token');
        await auth.logout();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, loginNik, logout, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
