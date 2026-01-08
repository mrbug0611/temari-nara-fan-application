import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);  // ← ADD THIS

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            setError(null);  // Clear previous errors
            const response = await axios.get('/user/me');
            setUser(response.data);
        } 
        catch (err) {
            console.error('Error fetching user:', err);
            setUser(null);
            setError(err.response?.data?.error || 'Failed to load user profile');  // ← SET ERROR
        }
        finally {
            setLoading(false);
        }
    }

    const login = async (email, password) => {
        try{
            setError(null);
            const response = await axios.post('/user/login', { email, password });
            setUser(response.data.user);
            return { success: true };
        }
        catch (error) {
            const errorMsg = error.response?.data?.error || 'Login failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    }

    const register = async (username, email, password) => {
        try {
            setError(null);
            const response = await axios.post('/user/register', { username, email, password });
            setUser(response.data.user);
            return { success: true };
        }
        catch (error) {
            const errorMsg = error.response?.data?.error || 'Registration failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    }

    const logout = async () => {
        try {
            setError(null);
            await axios.post('/user/logout');
            setUser(null);
        }
        catch (error) {
            setError('Logout failed, but clearing local session');
            setUser(null);
        }
    }

    const updateProfile = async (updates) => {
        try {
            setError(null);
            const response = await axios.put('/user/me', updates);
            setUser(response.data);
            return { success: true };
        }
        catch (error) {
            const errorMsg = error.response?.data?.error || 'Profile update failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    }

    const clearError = () => setError(null);  // ← ADD HELPER TO CLEAR ERROR

    const value = {
        user, 
        loading, 
        error,  // ← EXPORT ERROR
        clearError,  // ← EXPORT CLEAR FUNCTION
        login, 
        register, 
        logout, 
        updateProfile, 
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        isModerator: user?.isModerator || user?.isAdmin || false,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};