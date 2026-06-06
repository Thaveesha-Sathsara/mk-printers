import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';
import { Gift, Sparkles, Send, ExternalLink, ArrowRight, Ban } from 'lucide-react';

export default function CustomerView() {
  const { linkId } = useParams();
  // Added 'cancelled' to view states
  const [viewState, setViewState] = useState('loading'); 
  const [message, setMessage] = useState('');
  
  const [boxes] = useState([0, 1, 2, 3, 4, 5]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [wonPrize, setWonPrize] = useState('');
  const [otherPrizes, setOtherPrizes] = useState([]);
  const [isRevealing, setIsRevealing] = useState(false);

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkLink = async () => {
      try {
        const response = await API.get(`/gift/${linkId}`);
        const { status, winnerDetails } = response.data;
        
        if (status === 'Active') setViewState('active');
        else if (status === 'Opened') {
          setWonPrize(winnerDetails.prizeWon);
          setViewState('opened');
        } else if (status === 'Claimed') setViewState('claimed');
        // THE FIX: Catch the cancelled status!
        else if (status === 'Cancelled') {
          setViewState('cancelled');
          setMessage('This mystery box offer has ended or was cancelled.');
        }
      } catch (error) {
        setViewState('invalid');
        setMessage(error.response?.data?.message || 'Invalid link.');
      }
    };
    checkLink();
  }, [linkId]);

  const handleOpenBox = async (index) => {
    if (isRevealing || viewState !== 'active') return;
    setIsRevealing(true);
    setSelectedBox(index);

    try {
      const response = await API.post(`/gift/${linkId}/open`);
      if (response.data.success) {
        setWonPrize(response.data.wonPrize);
        setOtherPrizes(response.data.otherprizes);
        setTimeout(() => setViewState('revealed'), 500); 
      }
    } catch (error) {
      alert('Error opening box. It may have expired.', error);
      setIsRevealing(false);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await API.post(`/gift/${linkId}/claim`, { name, whatsapp });
      if (response.data.success) setViewState('claimed');
    } catch (error) {
      alert('Error submitting claim.', error);
    } finally { setSubmitting(false); }
  };

  if (viewState === 'loading') return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Loading your surprise...</div>;
  if (viewState === 'invalid') return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold text-xl">{message}</div>;
  
  // THE FIX: The Cancelled Screen
  if (viewState === 'cancelled') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="bg-gray-200 p-6 rounded-full mb-6">
        <Ban className="h-12 w-12 text-gray-500" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Offer Ended</h2>
      <p className="text-gray-500 max-w-md">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between font-sans">
      
      <div className="flex-1 py-12 px-4 sm:px-6 flex flex-col items-center">
        
        <div className="mb-8 flex flex-col items-center">
          <img src="/logo.jpeg" alt="M.K. Printers" className="h-16 w-auto mb-3 object-contain drop-shadow-sm rounded-lg" onError={(e) => e.target.style.display = 'none'} />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">M.K. Printers Rewards</h1>
        </div>

        {(viewState === 'active' || viewState === 'revealed') && (
          <div className="w-full flex flex-col items-center">
            <div className="max-w-2xl text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Pick Your Gift</h2>
              <p className="text-gray-500 text-lg">Tap one box to reveal your exclusive reward.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-2xl" style={{ perspective: '1000px' }}>
              {boxes.map((boxIndex) => {
                const isSelected = selectedBox === boxIndex;
                const isMissed = isRevealing && !isSelected;
                
                return (
                  <div key={boxIndex} onClick={() => handleOpenBox(boxIndex)} className={`relative h-32 md:h-40 w-full cursor-pointer group ${isRevealing ? 'pointer-events-none' : ''}`}>
                    <div 
                      className="absolute inset-0 w-full h-full transition-all duration-700 ease-out shadow-md rounded-2xl"
                      style={{ 
                        transformStyle: 'preserve-3d', 
                        transform: isRevealing ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        boxShadow: isSelected ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : ''
                      }}
                    >
                      <div className="absolute inset-0 w-full h-full bg-blue-600 rounded-2xl flex items-center justify-center group-hover:-translate-y-1 transition-transform" style={{ backfaceVisibility: 'hidden' }}>
                        <span className="text-white text-5xl font-black opacity-80 animate-pulse">?</span>
                      </div>
                      <div className={`absolute inset-0 w-full h-full rounded-2xl flex flex-col items-center justify-center p-2 text-center text-white
                        ${isSelected ? 'bg-green-500 scale-105' : 'bg-gray-400 opacity-60 grayscale'}`} 
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        {isSelected ? (
                          <>
                            <Sparkles className="h-6 w-6 mb-1 opacity-90" />
                            <span className="font-bold text-lg leading-tight">{wonPrize}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs uppercase tracking-wider mb-1 opacity-80 text-gray-200">Missed</span>
                            <span className="font-semibold text-sm">{otherPrizes[boxIndex > selectedBox ? boxIndex - 1 : boxIndex]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {viewState === 'revealed' && (
              <button onClick={() => setViewState('opened')} className="mt-12 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 shadow-xl shadow-gray-900/20 transform animate-in slide-in-from-bottom-4 duration-500">
                Continue to Claim <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {viewState === 'opened' && (
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 font-bold tracking-wide rounded-full text-sm mb-4 uppercase">You Won!</span>
              <h2 className="text-3xl font-black text-gray-900">{wonPrize}</h2>
            </div>
            <form onSubmit={handleClaimSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Number</label>
                <input type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="+94 77 123 4567" />
              </div>
              <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-xl mt-4">
                {submitting ? 'Sending...' : <><Send className="h-5 w-5"/> Claim Reward</>}
              </button>
            </form>
          </div>
        )}

        {viewState === 'claimed' && (
          <div className="flex flex-col items-center justify-center text-center max-w-md transform animate-in zoom-in duration-500">
            <div className="bg-green-100 p-6 rounded-full mb-6">
              <Sparkles className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Gift Claimed!</h2>
            <p className="text-gray-500 text-lg">Thank you! Our team has received your details and will contact you on WhatsApp shortly to arrange your {wonPrize}.</p>
          </div>
        )}

      </div>

      <footer className="w-full py-8 text-center text-sm text-gray-500 bg-white/50 border-t border-gray-200">
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