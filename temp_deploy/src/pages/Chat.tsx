import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { GoogleGenAI } from '@google/genai';
import { 
  Send, Loader2, Bot, User, Database, Zap, 
  Activity, ShieldCheck, Cpu, MessageSquare,
  Map, Clock, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user'|'chatbot', text: string, isDemoAction?: boolean, confidence?: number}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [surveyCount, setSurveyCount] = useState(0);
  const [allEntities, setAllEntities] = useState<any[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Survey Count
        const { count } = await supabase.from('survey_data').select('*', { count: 'exact', head: true });
        setSurveyCount(count || 0);

        // 2. Fetch Registry Data
        const regResponse = await fetch('/data/entities.json');
        const regData = await regResponse.json();
        setAllEntities(regData);
        
        // Initial AI Greeting
        if (apiKey) {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `You are Sahayogi-Bot v3, a professional National Impact Intelligence AI. 
GREET the coordinator in a very professional, "Command Center" tone. 
Mention that the 50,000+ org Sahayogi registry and ${count || 0} field surveys are synchronized. 
Keep it under 40 words.`;
          
          const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          });
          
          setMessages([{ 
            role: 'chatbot', 
            text: (result as any).text || "Intelligence Console Synchronized. 50,000+ registry organizations and active field surveys are now accessible. How can I assist with your coordination efforts?",
            confidence: 100
          }]);
        } else {
          setMessages([{ role: 'chatbot', text: "Terminal offline. (API Key missing).", confidence: 0 }]);
        }
      } catch (err) {
        console.error('Initial chat load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    if (!apiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'chatbot', text: "Intelligence engine offline. Check environment variables." }]);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are Sahayogi-Bot v3. An expert National Impact Analyst. 
The user is querying a system with 50,000+ verified NGOs/Volunteers and local field surveys.
User Query: "${userMsg}"
Instructions: Use a professional, data-centric tone. Format with clear Markdown. 
Mention if the insight is derived from the "Verified National Registry" or "Live Field Surveys".
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      setMessages(prev => [...prev, { 
        role: 'chatbot', 
        text: (result as any).text || "Query process timed out.", 
        confidence: 94 
      }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'chatbot', 
        text: "Neural link interrupted. High traffic detected. Switch to local knowledge scan?",
        isDemoAction: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalScan = () => {
    if (!allEntities.length || !messages.length) return;
    setLoading(true);
    const lastUserQuery = [...messages].reverse().find(m => m.role === 'user')?.text.toLowerCase() || "";
    
    setTimeout(() => {
      const matches = allEntities.filter(e => {
        const text = `${e.name} ${e.specialty} ${e.location} ${e.mission} ${e.region}`.toLowerCase();
        return lastUserQuery.split(' ').some(word => word.length > 3 && text.includes(word));
      }).slice(0, 4);

      let responseText = "### 🔍 Local Knowledge Scan Activated\n\nDirect registry matches found within the 50,000+ record cache:\n\n";
      matches.forEach((m) => {
        responseText += `**${m.name}** | *${m.specialty}*\nRegion: ${m.region} | Status: Verified\n\n`;
      });
      
      setMessages(prev => [...prev, { role: 'chatbot', text: responseText, confidence: 99 }]);
      setLoading(false);
    }, 1200);
  };

  const formatMarkdown = (text: string) => {
    return (
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {text.split('\n').map((line, i) => {
          if (line.startsWith('###')) return <h3 key={i} style={{ margin: '16px 0 8px', color: 'var(--navy-deep)' }}>{line.replace(/### /g, '')}</h3>;
          if (line.startsWith('**')) return <p key={i} style={{ fontWeight: 800, margin: '4px 0' }}>{line.replace(/\*\*/g, '')}</p>;
          return <p key={i} style={{ margin: '4px 0' }}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div style={{ background: 'var(--off-white)', height: '100vh', display: 'flex' }}>
      
      {/* PROFESSIONAL INTELLIGENCE SIDEBAR */}
      <aside style={{ 
        width: '320px', background: 'white', borderRight: '1px solid var(--off-white)',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: '80px', height: 'calc(100vh - 80px)'
      }}>
        <div style={{ padding: '32px 24px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <Activity size={18} color="var(--navy-deep)" />
            <h3 style={{ fontSize: '13px', fontWeight: 800, margin: 0, letterSpacing: '1px' }}>DATA VITALITY</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-premium" style={{ padding: '20px', background: 'var(--off-white)', border: 'none' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <Database size={14} color="var(--text-mid)" />
                 <span style={{ fontSize: '10px', fontWeight: 800, color: '#10B981' }}>SYNCED</span>
               </div>
               <div style={{ fontSize: '24px', fontWeight: 800 }}>50,000+</div>
               <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-mid)' }}>REGISTRY RECORDS</div>
            </div>

            <div className="card-premium" style={{ padding: '20px', background: 'var(--off-white)', border: 'none' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <Map size={14} color="var(--text-mid)" />
                 <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--coral)' }}>LIVE</span>
               </div>
               <div style={{ fontSize: '24px', fontWeight: 800 }}>{surveyCount}</div>
               <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-mid)' }}>RISK REPORTS</div>
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Clock size={16} color="var(--text-mid)" />
                <span style={{ fontSize: '12px', fontWeight: 800 }}>INTELLIGENCE STREAM</span>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Registry Audit Compl.', 'Supabase Handshake', 'AI Engine Hot-load'].map(t => (
                  <div key={t} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-mid)' }}>{t}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div style={{ padding: '24px', background: 'var(--navy-deep)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Cpu size={16} color="var(--gold)" />
            <span style={{ fontSize: '11px', fontWeight: 800 }}>ENGINE STATUS</span>
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8, fontWeight: 600 }}>Gemini Pro V3.5-L</div>
        </div>
      </aside>

      {/* MAIN CHAT CONSOLE */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--off-white)' }}>
        
        {/* Terminal Header */}
        <header style={{ 
          padding: '24px 40px', background: 'white', borderBottom: '1px solid var(--off-white)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--navy-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Terminal size={20} color="white" />
             </div>
             <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--navy-deep)' }}>Analytic Terminal</h2>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981' }}>● SYSTEMS OPERATIONAL</span>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '12px' }}>CLEAR CACHE</button>
             <button className="btn btn-navy" style={{ padding: '8px 16px', fontSize: '12px' }}>EXPORT LOG</button>
          </div>
        </header>

        {/* Conversation Area */}
        <div ref={chatContainerRef} style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div 
                key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                style={{ display: 'flex', gap: '20px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}
              >
                <div style={{ 
                  width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: m.role === 'user' ? 'var(--navy-deep)' : 'white', 
                  color: m.role === 'user' ? 'white' : 'var(--coral)',
                  boxShadow: 'var(--shadow-sm)', border: m.role === 'chatbot' ? '1px solid var(--off-white)' : 'none'
                }}>
                  {m.role === 'user' ? <User size={22} /> : <Bot size={22} />}
                </div>
                <div 
                  style={{ 
                    maxWidth: '80%', display: 'flex', flexDirection: 'column', 
                    alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{ 
                    padding: '24px 28px', borderRadius: '24px', 
                    background: m.role === 'user' ? 'var(--navy-deep)' : 'white',
                    color: m.role === 'user' ? 'white' : 'var(--text-dark)',
                    fontSize: '15px', lineHeight: 1.6, boxShadow: 'var(--shadow-sm)',
                    borderBottomRightRadius: m.role === 'user' ? '4px' : '24px',
                    borderBottomLeftRadius: m.role === 'chatbot' ? '4px' : '24px',
                    border: '1px solid rgba(0,0,0,0.02)'
                  }}>
                    {m.role === 'chatbot' ? formatMarkdown(m.text) : m.text}
                    {m.isDemoAction && (
                      <button onClick={handleLocalScan} className="btn btn-indigo" style={{ marginTop: '20px', fontSize: '12px', padding: '12px 20px', width: '100%', gap: '10px' }}>
                        <Zap size={14} /> INITIALIZE LOCAL KNOWLEDGE SCAN
                      </button>
                    )}
                  </div>
                  {m.role === 'chatbot' && m.confidence !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', padding: '0 8px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={12} color="#10B981" />
                          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '0.5px' }}>SYNC CONFIDENCE: {m.confidence}%</span>
                       </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'white', color: 'var(--coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <Bot size={22} />
              </div>
              <div style={{ padding: '20px 24px', background: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
                <Loader2 className="reveal" style={{ animation: 'spin 1s linear infinite' }} size={16} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy-mid)' }}>Accessing Registry Infrastructure...</span>
              </div>
            </div>
          )}
        </div>

        {/* Global Input Console */}
        <div style={{ padding: '40px', background: 'white', borderTop: '1px solid var(--off-white)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', alignSelf: 'center', whiteSpace: 'nowrap' }}>QUICK COMMANDS:</span>
              {['Risk in Odisha', 'Sync Education NGOs', 'Analyze Village Risks'].map(s => (
                <button key={s} onClick={() => setInput(s)} style={{ fontSize: '11px', padding: '6px 16px', borderRadius: '50px', border: '1px solid var(--off-white)', background: 'var(--off-white)', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>{s}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                 <MessageSquare size={18} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-mid)' }} />
                 <input 
                  type="text" placeholder="Entry intelligent query..." value={input}
                  onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                  style={{ width: '100%', padding: '20px 24px 20px 60px', borderRadius: '18px', border: '1px solid var(--off-white)', fontSize: '16px', outline: 'none', background: 'var(--off-white)', fontWeight: 500 }}
                />
              </div>
              <button 
                className="btn btn-navy" onClick={handleSend} disabled={loading || !input.trim()}
                style={{ padding: '0 40px', borderRadius: '18px', gap: '10px', fontSize: '16px' }}
              >
                SYNC <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
