import React, { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { Breadcrumbs } from './Breadcrumbs';
import { CommandPalette } from './CommandPalette';
import { OnboardingTour } from './OnboardingTour';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className={isHome ? '' : 'sidebar-layout'} style={{ 
      display: isHome ? 'flex' : undefined, 
      flexDirection: isHome ? 'column' : undefined, 
      minHeight: '100vh', 
      background: isHome ? 'var(--off-white)' : 'var(--navy-deep)',
      transition: 'background var(--transition-pro)'
    }}>
      <CommandPalette />
      {isHome ? <Navbar /> : <Sidebar />}
      
      <main className={isHome ? '' : 'main-content'} style={{ 
        flex: isHome ? 1 : undefined, 
        width: isHome ? '100%' : undefined, 
        padding: isHome ? '0' : undefined,
        color: isHome ? 'inherit' : 'var(--white)',
        position: 'relative',
        zIndex: 1
      }}>
        {!isHome && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '48px',
            padding: '16px 24px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)'
          }}>
            <Breadcrumbs />
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div className="pulse-primary" style={{ width: '6px', height: '6px' }} />
                 <span style={{ fontSize: '10px', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)' }}>
                    Terminal V7.4.9 <span style={{ color: 'var(--coral)' }}>●</span> Synced
                 </span>
              </div>
            </div>
          </div>
        )}
        <OnboardingTour />
        <div style={{ minHeight: '80vh' }}>
          {children}
        </div>
        {!isHome && (
          <div style={{ marginTop: '120px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '60px' }}>
            <Footer />
          </div>
        )}
      </main>
      {isHome && <Footer />}
    </div>
  );
};
