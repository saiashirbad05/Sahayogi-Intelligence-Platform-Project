import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { BarChart3, MessageSquare, UploadCloud, Users, LogOut, FileText, Search, Activity, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: <BarChart3 size={20} /> },
    { label: 'Impact Metrics', path: '/impact', icon: <Activity size={20} /> },
    { label: 'Global Explorer', path: '/explore', icon: <Search size={20} /> },
    { label: 'Upload Data', path: '/upload', icon: <UploadCloud size={20} /> },
    { label: 'Sahayogi-Bot', path: '/chat', icon: <MessageSquare size={20} /> },
    { label: 'Survey Form', path: '/survey', icon: <FileText size={20} /> },
    { label: 'Volunteer Hub', path: '/volunteers', icon: <Users size={20} /> },
    { label: 'Team', path: '/team', icon: <Users size={20} /> }
  ];

  const sidebarContent = (
    <>
      <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/">
          <Logo variant="navbar" />
        </Link>
        {/* Mobile close button inside drawer */}
        <button 
          className="mobile-nav-toggle"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-dark)' }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', marginBottom: '8px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Intelligence Hub</p>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link key={link.label} to={link.path} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px',
              color: isActive ? 'var(--white)' : 'var(--text-mid)',
              background: isActive ? 'var(--navy-deep)' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              fontFamily: 'Inter',
              boxShadow: isActive ? '0 10px 20px rgba(37, 43, 107, 0.2)' : 'none'
            }}>
              {/* @ts-ignore */}
              {React.cloneElement(link.icon as any, { color: isActive ? 'var(--coral)' : 'currentColor', size: 18 })}
              {link.label}
              {link.label === 'Dashboard' && <div className="pulse" style={{ marginLeft: 'auto', width: '8px', height: '8px' }} />}
            </Link>
          );
        })}
      </div>

      <div style={{ background: 'var(--off-white)', padding: '20px', borderRadius: '16px', margin: '24px 0', border: '1px solid #E2E8F0', flexShrink: 0 }}>
         <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--navy-mid)', marginBottom: '4px', textTransform: 'uppercase' }}>Network Status</div>
         <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--navy-deep)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10B981' }}>●</span> 50k+ ORGS SYNCED
         </div>
         <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
            <motion.div 
               initial={{ width: 0 }} 
               animate={{ width: '100%' }} 
               transition={{ duration: 2, ease: "easeOut" }}
               style={{ height: '100%', background: 'linear-gradient(90deg, var(--coral), var(--gold))' }} 
            />
         </div>
      </div>

      <div style={{ borderTop: '1px solid var(--off-white)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
        {session ? (
          <button onClick={() => supabase.auth.signOut()} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
            color: 'var(--text-mid)', background: 'transparent', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontFamily: 'Inter', width: '100%', textAlign: 'left', transition: 'all 0.2s'
          }}>
            <LogOut size={20} />
            Sign Out System
          </button>
        ) : (
          <Link to="/auth" className="btn btn-coral" style={{ width: '100%', display: 'flex', justifyContent: 'center', borderRadius: '12px' }}>
            Sign In
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Header (only visible on mobile via CSS) */}
      <div className="mobile-nav-toggle" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
        background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 90,
        alignItems: 'center', padding: '0 20px', justifyContent: 'space-between'
      }}>
        <div style={{ filter: 'brightness(0) invert(1)' }}>
          <Logo variant="navbar" />
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          style={{ background: 'transparent', border: 'none', color: 'white' }}
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99
            }}
            className="mobile-nav-toggle"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside 
        className={isMobileMenuOpen ? 'mobile-drawer-open' : ''}
        style={{
          width: '300px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: 'var(--white)',
          borderRight: '1px solid var(--off-white)',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 24px',
          zIndex: 100,
          transform: `translateX(${typeof window !== 'undefined' && window.innerWidth <= 768 && !isMobileMenuOpen ? '-100%' : '0'})`,
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Spacer for desktop layout (since sidebar is fixed) */}
      <div style={{ width: '300px', flexShrink: 0, display: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'none' : 'block' }} className="sidebar-spacer" />
    </>
  );
};
