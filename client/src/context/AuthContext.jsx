import { createContext, useState, useEffect, useContext } from 'react';
import API from '../utils/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('mk_token' || null));

    useEffect(() => {
        const savedUser = localStorage.getItem('mk_user');
        if (savedUSer) setUser(JSON.parse(savedUser));
    }, []);

    useEffect(() => {
        if (token) {
            API.defaults.headerscommon['Authorization'] = `Bearer ${token}`;
        } else {
            delete API.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        if (res.data.success) {
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('mk-token', res.data.token);
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

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};