import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/') return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '16px 0', 
        marginBottom: '24px',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-muted-light)',
        opacity: 0.8
      }}
    >
      <Link 
        to="/" 
        style={{ display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}
      >
        <Home size={14} />
        <span>Intelligence</span>
      </Link>

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

        return (
          <React.Fragment key={to}>
            <ChevronRight size={12} style={{ opacity: 0.5 }} />
            {last ? (
              <span style={{ color: 'var(--white)', fontWeight: 700 }}>{label}</span>
            ) : (
              <Link to={to} style={{ transition: 'color 0.2s' }}>
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
