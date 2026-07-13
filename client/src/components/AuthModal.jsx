import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Phone, CheckCircle, MapPin, Building, Hash, ChevronRight, ChevronLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
    const { login, register, googleLogin } = useAuth();
    
    // Core States
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    // Google Flow State
    const [isGoogleSignUp, setIsGoogleSignUp] = useState(false);
    const [googleId, setGoogleId] = useState('');

    // Form Data States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [agreed, setAgreed] = useState(false);

    if (!isOpen) return null;

    const handleNextStep = (e) => {
        e.preventDefault();
        setError('');
        if (step === 1 && !isGoogleSignUp && (!name || !email || !password)) {
            return setError("Please fill all fields.");
        }
        if (step === 2 && (!phone || !street || !city)) {
            return setError("Please fill your contact details.");
        }
        setStep(step + 1);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (!agreed) return setError("You must agree to the terms to continue.");
        
        setLoading(true);
        setError('');

        try {
            const address = { street, city, postalCode };
            // Note: If you have an AuthContext, make sure the register function accepts this full object!
            const data = await register({ name, email, password: isGoogleSignUp ? undefined : password, phone, address, googleId });
            
            setSuccessMsg('Account created! Preparing checkout...');
            setTimeout(() => {
                onLoginSuccess(data.user);
                setLoading(false);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await login(email, password);
            setSuccessMsg('Login successful! Preparing checkout...');
            setTimeout(() => {
                onLoginSuccess(data.user);
                setLoading(false);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            setError('');
            // You might need to adjust your auth context if it doesn't return the raw backend response
            const res = await googleLogin(credentialResponse.credential);
            
            // If the backend says it's a new user, jump to step 2!
            if (res.isNewUser) {
                setName(res.googleData.name);
                setEmail(res.googleData.email);
                setGoogleId(res.googleData.googleId);
                setIsGoogleSignUp(true);
                setIsLogin(false);
                setStep(2);
                setLoading(false);
            } else {
                // Existing user logged in perfectly
                setSuccessMsg('Google login successful!');
                setTimeout(() => {
                    onLoginSuccess(res.user);
                    setLoading(false);
                }, 1000);
            }
        } catch (err) {
            setError('Google verification failed.', err);
            setLoading(false);
        }
    };

    // Quick helper for the progress dots
    const ProgressDots = () => (
        <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((num) => (
                <div key={num} className={`h-2 rounded-full transition-all duration-300 ${step === num ? 'w-8 bg-blue-600' : step > num ? 'w-4 bg-blue-300' : 'w-2 bg-gray-200'}`} />
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative animate-in slide-in-from-bottom-8 duration-300 overflow-hidden">
                
                <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors z-10">
                    <X className="h-5 w-5" />
                </button>

                {/* HEADER */}
                <div className="mb-6">
                    {!isLogin && <ProgressDots />}
                    <h2 className="text-2xl font-black text-gray-900 mb-2">
                        {isLogin ? 'Welcome Back' : step === 1 ? 'Create an Account' : step === 2 ? 'Delivery Details' : 'Final Step'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {isLogin ? 'Log in to complete your order.' : 
                         step === 1 ? 'Join to save designs and checkout fast.' : 
                         step === 2 ? 'Where should we send your orders?' : 
                         'Please review our printing terms.'}
                    </p>
                </div>

                {/* alerts */}
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold mb-4 border border-red-100 animate-in fade-in">{error}</div>}
                {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-semibold mb-4 border border-green-200 flex items-center gap-2 animate-in fade-in"><CheckCircle className="h-5 w-5" /> {successMsg}</div>}

                {/* login form */}
                {isLogin && (
                    <div className="animate-in slide-in-from-left">
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all font-medium" />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all font-medium" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md mt-2">
                                {loading ? 'Processing...' : 'Log In'}
                            </button>
                        </form>
                    </div>
                )}

                {/* signup */}
                {!isLogin && (
                    <div className="relative overflow-hidden">
                        
                        {/* basic info */}
                        {step === 1 && (
                            <form onSubmit={handleNextStep} className="space-y-4 animate-in slide-in-from-right duration-300">
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                    <input type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all font-medium" />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                    <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all font-medium" />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                    <input type="password" required placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all font-medium" />
                                </div>
                                <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-2">
                                    Continue <ChevronRight className="h-5 w-5" />
                                </button>
                            </form>
                        )}

                        {/* address and phhone */}
                        {step === 2 && (
                            <form onSubmit={handleNextStep} className="space-y-4 animate-in slide-in-from-right duration-300">
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                    <input type="tel" required placeholder="WhatsApp Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium" />
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                    <input type="text" required placeholder="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Building className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                        <input type="text" required placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium" />
                                    </div>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                        <input type="text" placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium" />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={() => setStep(1)} className="px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all">
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button type="submit" className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                                        Continue <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 3: Agreement */}
                        {step === 3 && (
                            <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-sm text-gray-600 leading-relaxed max-h-40 overflow-y-auto">
                                    <p className="font-bold text-gray-900 mb-2">M.K. Printers Service Agreement</p>
                                    <p className="mb-2">1. We provide custom printing services. The quality of the final print heavily depends on the resolution of the artwork provided by the customer.</p>
                                    <p className="mb-2">2. Customers will receive a digital sample for approval before mass printing begins.</p>
                                    <p>3. Once a custom design is approved and moves to the "Printing" stage, the order cannot be cancelled or refunded.</p>
                                </div>
                                
                                <label className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                                    <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-gray-700">I have read and agree to the printing terms and conditions.</span>
                                </label>

                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={() => setStep(2)} className="px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all">
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md">
                                        {loading ? 'Creating Account...' : 'Complete Registration'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* GOOGLE & FOOTER */}
                {(!isGoogleSignUp || isLogin) && (
                    <>
                        <div className="mt-6 border-t border-gray-100 pt-6 flex flex-col items-center gap-4">
                            <div className="w-full">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google verification failed.')}
                                    theme="filled_blue" size="large" shape="pill" text="continue_with" width="100%"
                                />
                            </div>
                        </div>

                        <p className="text-center mt-6 text-sm text-gray-500">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button aria-label="Toggle between login and sign up" onClick={() => { setIsLogin(!isLogin); setStep(1); setIsGoogleSignUp(false); setError(''); }} className="text-blue-600 font-bold hover:underline">
                                {isLogin ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}