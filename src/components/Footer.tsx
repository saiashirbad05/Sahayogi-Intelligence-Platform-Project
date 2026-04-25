import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: 'var(--brand-navy)', padding: '80px 8% 40px', color: 'white' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1.5fr) 1fr 1fr 1.2fr', gap: '60px', marginBottom: '60px' }}>
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--coral)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>S</div>
            <h3 style={{ color: 'white', margin: 0, fontSize: '24px', letterSpacing: '1px' }}>SAHAYOGI</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px', maxWidth: '300px' }}>
            The world's first decentralized intelligence hub for social impact. Orchestrating 50,000+ verified organizations for global resilience.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
              <a key={i} href="#" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--coral)'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Platform Links */}
        <div>
          <h4 style={{ color: 'white', marginBottom: '24px', fontSize: '16px', fontWeight: 800 }}>PLATFORM</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, listStyle: 'none' }}>
            {['Explorer', 'Dashboard', 'Global Map', 'Intelligence'].map((item) => (
              <li key={item}><Link to="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>{item}</Link></li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{ color: 'white', marginBottom: '24px', fontSize: '16px', fontWeight: 800 }}>RESOURCES</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, listStyle: 'none' }}>
            {['Documentation', 'API Access', 'Case Studies', 'Brand Assets'].map((item) => (
              <li key={item}><Link to="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>{item}</Link></li>
            ))}
          </ul>
        </div>

        {/* Stay Connected */}
        <div>
          <h4 style={{ color: 'white', marginBottom: '24px', fontSize: '16px', fontWeight: 800 }}>STAY CONNECTED</h4>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Get the latest updates from the global network.</p>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" placeholder="Enter email" 
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px' }}
            />
            <button style={{ position: 'absolute', right: '6px', top: '6px', bottom: '6px', background: 'var(--coral)', border: 'none', borderRadius: '8px', padding: '0 10px', color: 'white', cursor: 'pointer' }}>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>© 2026 SAHAYOGI FOUNDATION</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="#" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="#" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </div>
        <div className="samarkan-title" style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)' }}>
          Vasudhaiva Kutumbakam
        </div>
      </div>
    </footer>
  );
};
