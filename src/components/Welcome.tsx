import React from 'react';
import { MessageSquare, GraduationCap } from 'lucide-react';

interface WelcomeProps {
  onSelectTab: (tab: 'chat' | 'quiz') => void;
}

export default function Welcome({ onSelectTab }: WelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 py-12 text-center bg-slate-50">
      <div className="max-w-2xl w-full flex flex-col items-center">
        <div className="w-32 h-32 rounded-2xl border-4 border-[#1a365d] shadow-lg overflow-hidden mb-8 shrink-0">
          <img 
            src="https://drive.google.com/thumbnail?id=1ztNE-LGHornYVjT9A64gW7on4Yu6mrFD&sz=w400-h400" 
            alt="Plumbline Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-serif text-[#1a365d] mb-4 tracking-wide">
          Welcome, Brother
        </h1>
        
        <p className="text-lg text-slate-600 mb-12 max-w-lg">
          I am Plumbline, your Ritual Assistant. Choose your path of labor below.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg mb-16">
          <button
            onClick={() => onSelectTab('chat')}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-[#1a365d] hover:shadow-md transition-all group"
          >
            <div className="w-16 h-16 bg-[#1a365d]/10 rounded-full flex items-center justify-center group-hover:bg-[#1a365d] transition-colors">
              <MessageSquare className="w-8 h-8 text-[#1a365d] group-hover:text-[#d4af37] transition-colors" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium text-slate-800 mb-2">Ritual Assistant</h3>
              <p className="text-sm text-slate-500">Ask questions and practice memorization</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('quiz')}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-[#1a365d] hover:shadow-md transition-all group"
          >
            <div className="w-16 h-16 bg-[#1a365d]/10 rounded-full flex items-center justify-center group-hover:bg-[#1a365d] transition-colors">
              <GraduationCap className="w-8 h-8 text-[#1a365d] group-hover:text-[#d4af37] transition-colors" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium text-slate-800 mb-2">Examination</h3>
              <p className="text-sm text-slate-500">Test your knowledge of the ritual</p>
            </div>
          </button>
        </div>

        <div className="mt-auto pt-8 border-t border-slate-200 w-full">
          <p className="text-xs sm:text-sm text-slate-500 italic leading-relaxed max-w-2xl mx-auto">
            "By entering these portals, you bind yourself to the law of silence. Let it be known that the mysteries contained herein are for the faithful alone. Should you divulge these secrets to the uninitiated, you forfeit your standing within this circle and violate the Sacred Tie that binds us. Guard your tongue as you would your honor."
          </p>
        </div>
      </div>
    </div>
  );
}
