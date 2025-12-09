import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// component tree is the relationship between components in a React application, showing how they are nested and interact with each other.
// context provides a way to pass data through the component tree without having to pass props (properties) down manually at every level.
const AuthContext = createContext();

export const useAuth = () => {
    // give access to the AuthContext values
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true; // include cookies in requests



export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // loading state to check if user data is being fetched
    const [loading, setLoading] = useState(true);

    // set token in axios headers
    useEffect(() => {
        if (token) {
            // set the Authorization header with the token
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // fetch user data
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);


    const fetchUser = async () => {
        try {
            // cookies are automatically included by axios
            const response = await axios.get('/user/me');
            setUser(response.data);
        } 
        catch (error) {
            console.error('Error fetching user:', error);
            setUser(null);}
        finally {
            setLoading(false);
        }

    }



    const login = async (email, password) => {
        try{
            const response = await axios.post('/user/login', { email, password });
            setUser(response.data.user);

            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    }

    const register = async (username, email, password) => {
        try {
            const response = await axios.post('/user/register', { username, email, password });
            setUser(response.data.user);

            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.response?.data?.error || 'Registration failed' };
        }
    }

    const logout = async () => {
        try {
            await axios.post('/user/logout');
            setUser(null);
        }
        catch (error) {
            setUser(null); // clear user even if logout request fails
        }

    }

    const updateProfile = async (updates) => {
        try {
            const response = await axios.put('/user/me', updates);
            setUser(response.data);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.response?.data?.error || 'Profile update failed' };
        }
    }

    const value = {
        user, 
        token, 
        loading, 
        login, 
        register, 
        logout, 
        updateProfile, 
        isAuthenticated: !!user, // double negation to convert user object to boolean
        isAdmin: user?.isAdmin || false, // check if user role is admin
        isModerator: user?.isModerator || user?.isAdmin || false, // check if user role is moderator
    }

    return (
        <AuthContext.Provider value={value}>
        {children}
        </AuthContext.Provider>
    );
 
}; 