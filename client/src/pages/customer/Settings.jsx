import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, LogOut, Bell, Shield, Smartphone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { Helmet } from 'react-helmet-async';

export default function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Form states pre-filled with existing user data
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [street, setStreet] = useState(user?.address?.street || '');
    const [city, setCity] = useState(user?.address?.city || '');
    const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');
    
    // UI states
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMsg('');

        try {
            // We will make this backend route in the next step!
            await API.put('/auth/update-profile', {
                name,
                phone,
                address: { street, city, postalCode }
            });
            
            setSuccessMsg('Profile updated successfully!');
            // Note: You might want to refresh the user context here depending on how your AuthContext is built
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            alert('Failed to update profile.', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-12 bg-gray-50 min-h-screen">
            <Helmet>
                <title>Settings | M.K. Printers</title>
            </Helmet>

            <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Profile
            </Link>

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Account Settings</h1>

            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl font-bold text-sm mb-6 animate-in fade-in">
                    {successMsg}
                </div>
            )}

            {/* Editable Profile Form */}
            <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h3 className="font-black text-gray-900 mb-4 text-lg">Personal Information</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                        {/* Email is read-only because it's tied to their login! */}
                        <input type="email" disabled value={user.email} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
                            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                        <h3 className="font-black text-gray-900 mb-4 text-lg">Delivery Address</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Street Address</label>
                                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
                                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Postal Code</label>
                                    <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-4 disabled:bg-blue-400">
                        <Save className="h-5 w-5" /> {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* "Nonsense" Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-blue-500" />
                        <div>
                            <p className="font-bold text-gray-900">Email Notifications</p>
                            <p className="text-xs text-gray-500">Receive order updates and promotions</p>
                        </div>
                    </div>
                    {/* Fake Toggle Switch */}
                    <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                </div>
                
                <div className="p-4 border-b border-gray-100 flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-gray-500" />
                        <div>
                            <p className="font-bold text-gray-900">SMS Updates</p>
                            <p className="text-xs text-gray-500">Currently handled via WhatsApp directly</p>
                        </div>
                    </div>
                    <div className="w-11 h-6 bg-gray-200 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                </div>

                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="font-bold text-gray-900">Privacy Policy</p>
                            <p className="text-xs text-gray-500">Manage your data preferences</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Log Out Button */}
            <button 
                onClick={handleLogout}
                className="w-full py-4 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-black rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm"
            >
                <LogOut className="h-5 w-5" /> Log Out
            </button>
        </div>
    );
}