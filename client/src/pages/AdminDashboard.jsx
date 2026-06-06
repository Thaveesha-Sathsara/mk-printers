import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { Gift, Calendar, Copy, CheckCircle, LogOut, AlertCircle, ExternalLink, Ban, AlertTriangle, MoreVertical, Edit, Save } from 'lucide-react';

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`p-6 border-b border-gray-100 ${className}`}>{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals & Menus
  const [copyModal, setCopyModal] = useState({ show: false, link: '' });
  const [cancelModal, setCancelModal] = useState({ show: false, linkId: null });
  const [editModal, setEditModal] = useState({ show: false, linkId: null, prizes: [], validDays: 7 });
  const [activeDropdown, setActiveDropdown] = useState(null); 

  const [prizes, setPrizes] = useState(['Mug', 'Shirt', 'Retry', 'Voucher', 'Photo Frame', 'Shirt']);
  const [validDays, setValidDays] = useState(7);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  }, [navigate]);

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await API.get('/gift/all');
      if (response.data.success) setCampaigns(response.data.campaigns);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    } finally { setLoading(false); }
  }, [handleLogout]);

  useEffect(() => { 
    fetchCampaigns(); 
    const interval = setInterval(() => { fetchCampaigns(); }, 5000);
    return () => clearInterval(interval); 
  }, [fetchCampaigns]);

  // Form Handlers
  const handlePrizeChange = (index, value) => {
    const newPrizes = [...prizes];
    newPrizes[index] = value;
    setPrizes(newPrizes);
  };

  const handleGenerate = async (e) => {
    e.preventDefault(); setError('');
    try {
      await API.post('/gift/generate', { prizePool: prizes, validForDays: validDays });
      fetchCampaigns();
    } catch (err) { setError('Failed to generate link.', err); }
  };

  // THE FIX: Wait for the database to confirm before updating the screen
  const confirmCancel = async () => {
    const targetLinkId = cancelModal.linkId;
    setCancelModal({ show: false, linkId: null });
    
    try {
      // 1. Tell the backend to cancel the link and WAIT for it to finish
      await API.post(`/gift/cancel/${targetLinkId}`);
      
      // 2. ONLY update the screen after the backend says "Success!"
      setCampaigns(prev => prev.map(camp => 
        camp.linkId === targetLinkId ? { ...camp, status: 'Cancelled' } : camp
      ));
      
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel link. Make sure your backend restarted!');
    }
  };

  // Edit Handlers
  const openEditModal = (camp) => {
    const currentPrizes = [...camp.prizePool];
    while (currentPrizes.length < 6) currentPrizes.push('Retry');
    const editablePrizes = currentPrizes.slice(0, 6);

    setEditModal({ show: true, linkId: camp.linkId, prizes: editablePrizes, validDays: 7 });
    setActiveDropdown(null);
  };

  const handleEditPrizeChange = (index, value) => {
    const updated = [...editModal.prizes];
    updated[index] = value;
    setEditModal({ ...editModal, prizes: updated });
  };

  const confirmEdit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/gift/edit/${editModal.linkId}`, { 
        prizePool: editModal.prizes, 
        validForDays: editModal.validDays 
      });
      setEditModal({ show: false, linkId: null, prizes: [], validDays: 7 });
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to edit link.');
    }
  };

const triggerCopyModal = (linkId) => {
    const url = `${window.location.origin}/gift/${linkId}`;
    
    // Check if the modern clipboard API is available (HTTPS / Localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopyModal({ show: true, link: url });
          setActiveDropdown(null);
        })
        .catch((err) => {
          console.error("Failed to copy using navigator: ", err);
        });
    } else {
      // FALLBACK: Heavy-duty copy method for raw HTTP IP addresses
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        
        // Avoid scrolling to bottom of the page when appending
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopyModal({ show: true, link: url });
          setActiveDropdown(null);
        } else {
          alert("Could not copy link automatically. Here it is: " + url);
        }
      } catch (err) {
        console.error("Fallback copy failed: ", err);
        // Absolute last resort safety net
        alert("Copy link manually: " + url);
      }
    }
  };

  return (
    <div className="min-h-full p-4 md:p-8 font-sans text-gray-900 flex flex-col relative">
      
      {activeDropdown && (
        <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)}></div>
      )}

      {/* COPY MODAL */}
      {copyModal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center transform animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Link Copied!</h3>
            <p className="text-sm text-gray-500 mb-6 break-all bg-gray-50 p-3 rounded-lg border">{copyModal.link}</p>
            <button onClick={() => setCopyModal({ show: false, link: '' })} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
              Awesome, thanks!
            </button>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center transform animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Link?</h3>
            <p className="text-sm text-gray-500 mb-6">Customers will no longer be able to open this link or claim a prize. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelModal({ show: false, linkId: null })} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors">Back</button>
              <button onClick={confirmCancel} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full transform animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2"><Edit className="h-5 w-5 text-blue-600" /> Edit Campaign</h3>
            <p className="text-sm text-gray-500 mb-6">Update the prizes or extend the expiration date.</p>
            
            <form onSubmit={confirmEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {editModal.prizes.map((prize, index) => (
                  <input key={index} type="text" required value={prize} onChange={(e) => handleEditPrizeChange(index, e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder={`Item ${index + 1}`} />
                ))}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Extend Validity (Days from today)</label>
                <input type="number" min="1" value={editModal.validDays} onChange={(e) => setEditModal({...editModal, validDays: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setEditModal({ show: false, linkId: null, prizes: [], validDays: 7 })} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl transition-colors"><Save className="h-4 w-4"/> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BRANDED HEADER */}
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <img src="/logo.jpeg" alt="M.K. Printers" className="h-14 w-auto rounded-lg shadow-sm" onError={(e) => e.target.style.display = 'none'} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Campaign Manager</h1>
            <p className="text-gray-500 text-sm mt-1">Generate and track mystery box rewards.</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1">
        
        {/* GENERATOR */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader><CardTitle><Gift className="h-5 w-5 text-blue-600" /> Create Mystery Link</CardTitle></CardHeader>
            <CardContent>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {error}</div>}
              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Box Contents (6 Items)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {prizes.map((prize, index) => (
                      <input key={index} type="text" required value={prize} onChange={(e) => handlePrizeChange(index, e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder={`Item ${index + 1}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Calendar className="h-4 w-4"/> Valid For (Days)</label>
                  <input type="number" min="1" value={validDays} onChange={(e) => setValidDays(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm shadow-blue-600/20 transition-all">Generate Link</button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* DATA TABLE */}
        <div className="xl:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Active & Claimed Campaigns</CardTitle>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
                Live Updates
              </div>
            </CardHeader>
            <div className="overflow-x-auto flex-1 pb-24"> 
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50/80 border-y border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-semibold">Timeline</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Winner Info</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading && campaigns.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-400 animate-pulse">Loading campaigns...</td></tr>
                  ) : campaigns.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-500">No links generated yet.</td></tr>
                  ) : (
                    campaigns.map(camp => (
                      <tr key={camp._id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="text-gray-900 font-semibold text-xs mb-0.5">Created: {new Date(camp.createdAt).toLocaleDateString()}</div>
                          <div className="text-red-500 text-xs">Expires: {new Date(camp.expiresAt).toLocaleDateString()}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${camp.status === 'Active' ? 'bg-green-100 text-green-700' : camp.status === 'Claimed' ? 'bg-purple-100 text-purple-700' : camp.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{camp.status}</span>
                        </td>
                        <td className="p-4">
                          {camp.status === 'Claimed' ? (
                            <div>
                              <p className="font-bold text-gray-900">{camp.winnerDetails.prizeWon}</p>
                              <p className="text-gray-500 text-xs">{camp.winnerDetails.name} • {camp.winnerDetails.whatsapp}</p>
                            </div>
                          ) : camp.status === 'Opened' ? (
                            <span className="text-amber-600 text-xs font-medium">Filling form...</span>
                          ) : <span className="text-gray-400">-</span>}
                        </td>
                        
                        {/* ACTIONS COLUMN: Copy Outside, Edit/Cancel Inside 3-Dots */}
                        <td className="p-4 text-right flex items-center justify-end gap-2 relative">
                          <button onClick={() => triggerCopyModal(camp.linkId)} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors" title="Copy Link">
                            <Copy className="h-4 w-4" /> Copy
                          </button>
                          
                          {camp.status === 'Active' && (
                            <>
                              <button 
                                onClick={() => setActiveDropdown(activeDropdown === camp.linkId ? null : camp.linkId)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none relative z-40"
                              >
                                <MoreVertical className="h-5 w-5" />
                              </button>
                              
                              {activeDropdown === camp.linkId && (
                                <div className="absolute right-4 top-12 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                                  <button onClick={() => openEditModal(camp)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                    <Edit className="h-4 w-4 text-gray-500" /> Edit Items
                                  </button>
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button onClick={() => { setCancelModal({ show: true, linkId: camp.linkId }); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                                    <Ban className="h-4 w-4" /> Cancel Link
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-500">
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