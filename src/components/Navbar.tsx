import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Menu, X } from 'lucide-react';


export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { label: 'Platform', path: '/dashboard' },
    { label: 'Explorer', path: '/explore' },
    { label: 'Intelligence', path: '/impact' },
    { label: 'Volunteers', path: '/volunteers' },
    { label: 'Team', path: '/team' }
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={{
          position: 'fixed',
          top: isScrolled ? (typeof window !== 'undefined' && window.innerWidth <= 768 ? '0' : '12px') : '0', 
          left: isScrolled ? (typeof window !== 'undefined' && window.innerWidth <= 768 ? '0' : '24px') : '0', 
          right: isScrolled ? (typeof window !== 'undefined' && window.innerWidth <= 768 ? '0' : '24px') : '0',
          height: '72px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          padding: typeof window !== 'undefined' && window.innerWidth <= 768 ? '0 20px' : '0 40px',
          justifyContent: 'space-between',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          background: isScrolled ? 'rgba(15, 23, 42, 0.8)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderRadius: isScrolled && (typeof window !== 'undefined' && window.innerWidth > 768) ? '24px' : '0',
          border: isScrolled ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
          boxShadow: isScrolled ? 'var(--shadow-elite)' : 'none'
        }}
      >
        <Link to="/" style={{ zIndex: 101, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo variant="navbar" />
        </Link>
        
        {/* Desktop Links */}
        <div style={{ display: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'none' : 'flex', gap: '32px', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link key={link.label} to={link.path} style={{ 
              fontSize: '13px', fontWeight: 700,
              color: 'var(--white)',
              opacity: location.pathname === link.path ? 1 : 0.6,
              transition: 'opacity 0.2s',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div style={{ display: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'none' : 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/explore" className="btn btn-coral" style={{ padding: '10px 24px', fontSize: '12px' }}>EXPLORE MISSION</Link>
          {session ? (
             <button onClick={() => supabase.auth.signOut()} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', padding: '10px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, color: 'white' }}>OUT</button>
          ) : (
             <Link to="/auth" style={{ color: 'white', fontSize: '12px', fontWeight: 800, opacity: 0.6 }}>SIGN IN</Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          style={{ display: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'flex' : 'none', background: 'transparent', border: 'none', color: 'white', zIndex: 101 }}
        >
          <Menu size={28} />
        </button>

      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', inset: 0, background: 'var(--navy-deep)', zIndex: 2000,
              display: 'flex', flexDirection: 'column', padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <Logo variant="navbar" />
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white' }}>
                <X size={32} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '20px', fontWeight: 800, flex: 1 }}>
              {navLinks.map((link) => (
                <Link key={link.label} to={link.path} style={{ color: 'white' }}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto' }}>
              <Link to="/explore" className="btn btn-coral" style={{ width: '100%', justifyContent: 'center' }}>EXPLORE MISSION</Link>
              {session ? (
                 <button onClick={() => supabase.auth.signOut()} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Sign Out</button>
              ) : (
                 <Link to="/auth" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
