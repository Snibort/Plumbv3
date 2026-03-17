import React from 'react';
import { Compass } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

export default function Login() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-[#1a365d] p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-xl border-2 border-[#d4af37]/30 shadow-inner overflow-hidden shrink-0 mb-4 bg-[#0f294a] flex items-center justify-center">
            <img 
              src="https://drive.google.com/thumbnail?id=1ztNE-LGHornYVjT9A64gW7on4Yu6mrFD&sz=w200-h200" 
              alt="Plumbline Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-compass"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>';
              }}
            />
          </div>
          <h1 className="text-3xl font-serif tracking-widest uppercase text-[#d4af37]" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Plumbline</h1>
          <p className="text-xs text-[#d4af37]/80 uppercase tracking-[0.2em] font-medium mt-2">Ritual Assistant</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-slate-800">Welcome, Brother</h2>
            <p className="text-slate-500 text-sm">Please sign in to access your ritual assistant and manage your license.</p>
          </div>
          
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-3 px-4 rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
