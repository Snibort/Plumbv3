import React, { useState, useRef, useEffect } from 'react';
import { Compass, Upload, Send, Loader2, FileText, X, LogOut, MessageSquare, GraduationCap, Home, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendMessage } from './services/gemini';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, logOut } from './firebase';
import Login from './components/Login';
import LicenseRequired from './components/LicenseRequired';
import Quiz from './components/Quiz';
import Welcome from './components/Welcome';

interface PdfFile {
  name: string;
  data: string; // base64
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  pdfs?: PdfFile[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'welcome' | 'chat' | 'quiz'>('welcome');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Welcome, Brother. I am Plumbline, your Ritual Assistant. You may ask me about any craft ritual, so we may begin our labor.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasLicense, setHasLicense] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setHasLicense(userSnap.data().hasActiveLicense === true);
          } else {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              role: 'user',
              hasActiveLicense: false,
              createdAt: new Date().toISOString()
            });
            setHasLicense(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setHasLicense(false);
        }
      } else {
        setHasLicense(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.filter(m => m.id !== 'welcome').map(m => ({
        role: m.role,
        text: m.text
      }));

      const responseText = await sendMessage(history, newUserMessage.text, []);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'I apologize, Brother, but I encountered an error while processing your request. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a365d]" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (hasLicense === false) {
    return <LicenseRequired />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-[#1a365d] text-[#d4af37] p-4 shadow-md flex items-center justify-between z-10">
        <button 
          onClick={() => setActiveTab('welcome')}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity text-left"
        >
          <div className="w-10 h-10 rounded-lg border border-[#d4af37]/30 shadow-inner overflow-hidden shrink-0">
            <img 
              src="https://drive.google.com/thumbnail?id=1ztNE-LGHornYVjT9A64gW7on4Yu6mrFD&sz=w200-h200" 
              alt="Plumbline Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-serif tracking-widest uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Plumbline</h1>
            <p className="text-[10px] text-[#d4af37]/80 uppercase tracking-[0.2em] font-medium mt-0.5">Ritual Assistant</p>
          </div>
        </button>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex bg-[#0f294a] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('welcome')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'welcome' ? 'bg-[#1a365d] text-[#d4af37] shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'chat' ? 'bg-[#1a365d] text-[#d4af37] shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'quiz' ? 'bg-[#1a365d] text-[#d4af37] shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              <GraduationCap className="w-4 h-4" />
              Quiz
            </button>
          </div>
          <div className="flex items-center gap-1">
            <a 
              href="mailto:tommyrobins2004@gmail.com?subject=Plumbline%20App%20Feedback"
              className="p-2 text-[#d4af37]/80 hover:text-[#d4af37] hover:bg-[#0f294a] rounded-lg transition-colors"
              title="Send Feedback"
            >
              <Mail className="w-5 h-5" />
            </a>
            <button 
              onClick={logOut}
              className="p-2 text-[#d4af37]/80 hover:text-[#d4af37] hover:bg-[#0f294a] rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="sm:hidden flex bg-[#0f294a] p-2 gap-2">
        <button
          onClick={() => setActiveTab('welcome')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'welcome' ? 'bg-[#1a365d] text-[#d4af37] shadow-sm' : 'text-slate-300 hover:text-white'}`}
        >
          <Home className="w-4 h-4" />
          <span className="hidden xs:inline">Home</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'chat' ? 'bg-[#1a365d] text-[#d4af37] shadow-sm' : 'text-slate-300 hover:text-white'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden xs:inline">Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'quiz' ? 'bg-[#1a365d] text-[#d4af37] shadow-sm' : 'text-slate-300 hover:text-white'}`}
        >
          <GraduationCap className="w-4 h-4" />
          <span className="hidden xs:inline">Quiz</span>
        </button>
      </div>

      {activeTab === 'welcome' ? (
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Welcome onSelectTab={setActiveTab} />
        </main>
      ) : activeTab === 'chat' ? (
        <>
          {/* Chat Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-[#1a365d] text-white rounded-tr-sm' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
              }`}>
                {msg.pdfs && msg.pdfs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {msg.pdfs.map((pdf, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1.5 rounded text-xs font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{pdf.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-slate-100 prose-pre:text-slate-800">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin text-[#1a365d]" />
                <span className="text-sm font-medium">Consulting the ritual...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a question or request memorization practice..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] resize-none max-h-32 min-h-[52px]"
                rows={1}
              />
            </div>
            
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-[#1a365d] text-[#d4af37] rounded-xl hover:bg-[#0f294a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-sm"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-slate-400">
              Remember, Brother: Do not upload or discuss sensitive materials outside of a secure environment.
            </p>
          </div>
        </div>
      </footer>
        </>
      ) : (
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Quiz />
        </main>
      )}
    </div>
  );
}
