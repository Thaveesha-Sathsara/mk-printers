import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { ExternalLink, LifeBuoy, Mail, Lock } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  
  const [view, setView] = useState('login'); 
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const response = await API.post('/auth/login', { username, password });
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', response.data.username);
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally { setLoading(false); }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const response = await API.post('/auth/request-otp', { email });
      if (response.data.success) {
        setMessage('An OTP has been dispatched to your email.');
        setView('reset');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const response = await API.post('/auth/reset-password', { email, otp, newPassword });
      if (response.data.success) {
        setMessage('Password updated successfully! Please log in.');
        setView('login'); setOtp(''); setNewPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-4 font-sans">
      
      {/* BRANDING HEADER */}
      <div className="mb-8 text-center flex flex-col items-center">
        <img src="/logo.jpeg" alt="M.K. Printers Logo" className="h-20 w-auto mb-4 object-contain drop-shadow-md rounded-xl" onError={(e) => e.target.style.display = 'none'} />
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">M.K. Printers</h1>
        <p className="text-gray-500 font-medium tracking-wide">Rewards Management Portal</p>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg text-center">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm font-medium rounded-lg text-center">{message}</div>}

        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Admin Login</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="Enter username" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 disabled:opacity-70">
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
            <p onClick={() => setView('forgot')} className="text-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer mt-4 font-medium transition-colors">Forgot Password?</p>
          </form>
        )}

        {view === 'forgot' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Reset Password</h2>
            <p className="text-center text-sm text-gray-500 mb-6">Enter your registered admin email to receive a 6-digit OTP code.</p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all">
              {loading ? 'Sending...' : 'Send Recovery OTP'}
            </button>
            <p onClick={() => setView('login')} className="text-center text-sm text-gray-500 hover:text-gray-800 cursor-pointer mt-4 font-medium">&larr; Back to Login</p>
          </form>
        )}

        {view === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Enter Verification Code</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">6-Digit OTP</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="123456" maxLength="6" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-bold text-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all">
              {loading ? 'Resetting...' : 'Verify & Change Password'}
            </button>
          </form>
        )}
      </div>

      {/* FOOTER */}
      <footer className="mt-12 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-4 mb-4">
          <a href="https://tsvithana.vercel.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm transition-all text-xs font-semibold">
            <LifeBuoy className="h-4 w-4" /> Technical Help
          </a>
        </div>
        <p>&copy; 2026 M.K. Printers. All rights reserved.</p>
        <p className="mt-1 flex items-center justify-center gap-1">
          Developed with <span className="text-red-500 animate-pulse">❤️</span> by 
          <a href="https://tsvithana.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
            Thaveesha Vithana <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </footer>
    </div>
  );
}