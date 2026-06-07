import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Phone } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
    const { login, register, googleLogin } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register({ name, email, password, phone });
            }
            onLoginSuccess(); // Close modal and proceed to WhatsApp
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 p-2 rounded-full">
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-black text-gray-900 mb-2">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
                <p className="text-gray-500 mb-6">{isLogin ? 'Log in to complete your order.' : 'Join to save designs and checkout fast.'}</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div className="relative">
                                <User className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                                <input type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                                <input type="tel" required placeholder="WhatsApp Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-blue-500 outline-none" />
                            </div>
                        </>
                    )}
                    
                    <div className="relative">
                        <Mail className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                        <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-blue-500 outline-none" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all">
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                {/* GOOGLE BUTTON PLACEHOLDER */}
                <div className="mt-6 border-t border-gray-100 pt-6">
                    <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                        try {
                            setLoading(true);
                            await googleLogin(credentialResponse.credential);
                            onLoginSuccess();
                        } catch (err) {
                            setError('Google login failed on our servers. Try again.', err);
                            setLoading(false);
                        }
                    }}
        onError={() => setError('Google verification failed.')}
        theme="filled_blue"
        size="large"
        shape="pill"
        text="continue_with"
    />
                </div>

                <p className="text-center mt-6 text-sm text-gray-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-bold hover:underline">
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </div>
    );
}