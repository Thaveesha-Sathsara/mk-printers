import { createContext, useState, useEffect, useContext } from 'react';
import API from '../utils/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('mk_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('mk_user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('mk_token');
            if (token) {
                try {
                    const res = await API.get('/auth/me');
                    if (res.data.success) {
                        setUser(res.data.user);
                    }
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                    try {
                        const decoded = jwtDecode(token);
                        setUser(decoded);
                    } catch (error) {
                        console.error("Failed to decode token", error);
                        logout();
                    }
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        if (res.data.success) {
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('mk_token', res.data.token);
            localStorage.setItem('mk_user', JSON.stringify(res.data.user));
        }
        return res.data;
    };

    const register = async (userData) => {
        const res = await API.post('/auth/register', userData);
        if (res.data.success) {
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('mk_token', res.data.token);
            localStorage.setItem('mk_user', JSON.stringify(res.data.user));
        }
        return res.data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('mk_token');
        localStorage.removeItem('mk_user');
    };

    const googleLogin = async (googleToken) => {
        const res = await API.post('/auth/google', { token: googleToken });
        if (res.data.success) {
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('mk_token', res.data.token);
            localStorage.setItem('mk_user', JSON.stringify(res.data.user));
        }
        return res.data;
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            setUser,
            login,
            register,
            logout,
            googleLogin
        }}>
            {children}
        </AuthContext.Provider>
    );
};