import React, { useState, useEffect } from 'react';
import { logOut, auth } from '../firebase';
import { Loader2 } from 'lucide-react';

export default function LicenseRequired() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check URL for success/cancel
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setMessage("Payment successful! Your license is being activated. Please refresh the page in a few moments.");
    }
    if (query.get("canceled")) {
      setMessage("Payment was canceled. You can try again when you're ready.");
    }
  }, []);

  const handlePurchase = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email
        })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error creating checkout session: " + data.error);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to initiate checkout. Please ensure Stripe is configured.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-[#1a365d] p-6 text-center">
          <h1 className="text-2xl font-serif tracking-widest uppercase text-[#d4af37]">License Required</h1>
        </div>
        
        <div className="p-8 space-y-6 text-center">
          {message ? (
            <div className="p-4 bg-[#1a365d]/10 text-[#1a365d] rounded-xl text-sm font-medium border border-[#1a365d]/20">
              {message}
            </div>
          ) : (
            <>
              <p className="text-slate-600">
                Welcome, Brother. It appears you do not have an active license for the Plumbline Ritual Assistant.
              </p>
              <p className="text-slate-500 text-sm">
                Please purchase a monthly, annual or lifetime license to continue your labor.
              </p>
            </>
          )}
          
          <div className="pt-4 space-y-3">
            <button
              className="w-full flex items-center justify-center gap-2 bg-[#1a365d] text-[#d4af37] hover:bg-[#0f294a] font-medium py-3 px-4 rounded-xl transition-colors shadow-sm disabled:opacity-70"
              onClick={handlePurchase}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buy a License"}
            </button>
            <button
              onClick={logOut}
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-3 px-4 rounded-xl transition-colors shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
