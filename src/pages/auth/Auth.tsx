import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, Lock, ShieldAlert, Cpu, ArrowUpRight } from 'lucide-react';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate high-security authentication
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* Immersive Background */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '-10%', left: '-10%', width: '800px', height: '800px', background: 'var(--accent-blue-light)', filter: 'blur(120px)', borderRadius: '50%', opacity: 0.6 }} 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '900px', height: '900px', background: 'var(--accent-saffron-light)', filter: 'blur(140px)', borderRadius: '50%', opacity: 0.6 }} 
      />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px', padding: '0 20px' }}>
        
        {/* System Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{ 
              width: '80px', height: '80px', margin: '0 auto 24px', 
              background: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(37, 99, 235, 0.15)', border: '1px solid var(--border-subtle)'
            }}
          >
             <Cpu size={40} style={{ color: 'var(--accent-blue)' }} />
          </motion.div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-1px' }}>System Access</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 500 }}>Global Coordination Authority</p>
        </div>

        {/* Security Module */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
           className="glass-panel" style={{ padding: '40px' }}
        >
          <form onSubmit={handleLogin}>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>OPERATIVE ID</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sahayogi.org"
                  style={{ 
                    width: '100%', padding: '16px 16px 16px 48px', 
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: '12px',
                    color: 'var(--text-primary)', fontSize: '16px', fontWeight: 500, outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={e => { e.target.style.background = 'white'; e.target.style.borderColor = 'var(--accent-blue)'; e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.1)'; }}
                  onBlur={e => { e.target.style.background = 'var(--bg-secondary)'; e.target.style.borderColor = 'var(--border-medium)'; e.target.style.boxShadow = 'none'; }}
                />
                <ShieldAlert size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ marginBottom: '36px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>SECURITY CLEARANCE CODE</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ 
                    width: '100%', padding: '16px 16px 16px 48px', 
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: '12px',
                    color: 'var(--text-primary)', fontSize: '16px', fontWeight: 500, outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={e => { e.target.style.background = 'white'; e.target.style.borderColor = 'var(--accent-blue)'; e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.1)'; }}
                  onBlur={e => { e.target.style.background = 'var(--bg-secondary)'; e.target.style.borderColor = 'var(--border-medium)'; e.target.style.boxShadow = 'none'; }}
                />
                <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button 
              className="btn-premium btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'flex', alignItems: 'center' }}>
                  <Fingerprint size={24} />
                </motion.div>
              ) : (
                <>INITIATE HANDSHAKE <ArrowUpRight size={20} /></>
              )}
            </button>
            
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'monospace' }}>
            UNAUTHORIZED ACCESS IS STRICTLY MONITORED.<br/>ALL ACTIONS LOGGED VIA SHA-256 ENCRYPTION.
          </div>
        </motion.div>

      </div>
    </div>
  );
};
