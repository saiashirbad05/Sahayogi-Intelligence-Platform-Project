import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldPlus, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in.');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 5%',
      position: 'relative',
      overflow: 'hidden',
      background: '#0a0a0a'
    }}>
      {/* VIBRANT BACKGROUND IMAGE */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundImage: 'url("/images/rural-health.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.6)',
        zIndex: 0,
        transform: 'scale(1.05)' 
      }} />

      {/* ADDITIONAL OVERLAY FOR BETTER CONTRAST */}
      <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(135deg, rgba(11, 13, 23, 0.8) 0%, rgba(232, 121, 58, 0.4) 100%)',
          zIndex: 0
      }} />

      <motion.div 
        initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="card-premium" 
        style={{ 
          maxWidth: '520px', width: '100%', padding: '64px 48px', textAlign: 'center', 
          position: 'relative', zIndex: 1,
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 40px 80px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
          borderRadius: '40px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '30px', background: 'rgba(255, 255, 255, 0.2)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 10px 30px rgba(232, 121, 58, 0.3)'
          }}>
            <ShieldPlus size={52} color="#ffffff" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
          </div>
        </div>
        <h1 style={{ fontSize: '46px', fontWeight: 900, marginBottom: '16px', color: '#ffffff', letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>Empower</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '48px', fontSize: '18px', lineHeight: 1.6, fontWeight: 500 }}>
          Sign in to the Sahayogi Risk Intelligence Platform to drive meaningful community change.
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#FFB4B4', padding: '16px', borderRadius: '16px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <button 
          className="btn" 
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{ 
            width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '20px', fontSize: '18px', 
            background: '#ffffff', color: 'var(--navy-deep)', fontWeight: 800, borderRadius: '20px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', border: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)'; }}
        >
          {loading ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={24} /> : (
            <svg viewBox="0 0 24 24" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
          )}
          Continue with Google
        </button>

        <p style={{ marginTop: '36px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
          By continuing, you agree to our <a href="#" style={{ color: '#ffffff', textDecoration: 'underline', textUnderlineOffset: '4px' }}>Terms of Service</a> and <a href="#" style={{ color: '#ffffff', textDecoration: 'underline', textUnderlineOffset: '4px' }}>Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
};
