import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Database, MessageSquare, ClipboardCheck, Users, ShieldAlert, X } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const items = [
    { id: 'dash', label: 'Dashboard Intelligence', icon: LayoutDashboard, path: '/dashboard', shortcut: 'D' },
    { id: 'reg', label: 'Global Registry', icon: Database, path: '/explore', shortcut: 'G' },
    { id: 'chat', label: 'Sahayogi-Bot Terminal', icon: MessageSquare, path: '/chat', shortcut: 'C' },
    { id: 'survey', label: 'Risk Assessment', icon: ClipboardCheck, path: '/survey', shortcut: 'S' },
    { id: 'vol', label: 'Volunteer Network', icon: Users, path: '/volunteers', shortcut: 'V' },
    { id: 'team', label: 'Command Center Team', icon: ShieldAlert, path: '/team', shortcut: 'T' },
  ];

  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'rgba(5, 7, 30, 0.6)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed', top: '20%', left: '50%', translateX: '-50%',
              width: '90%', maxWidth: '600px', zIndex: 9999,
              background: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '8px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              color: 'white'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Search size={20} className="text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to intelligence hub..."
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  outline: 'none', color: 'white', fontSize: '18px',
                  fontWeight: 600
                }}
              />
              <div 
                onClick={() => setIsOpen(false)}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '8px' }}
              >
                <X size={14} />
              </div>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(232, 121, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <item.icon size={18} style={{ color: 'var(--coral)' }} />
                    </div>
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', opacity: 0.5 }}>
                    {item.shortcut}
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', opacity: 0.4, fontSize: '14px' }}>
                  No intelligence modules matched your query...
                </div>
              )}
            </div>
            
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', opacity: 0.5, display: 'flex', gap: '16px' }}>
              <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>⏎</kbd> to select</span>
              <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>esc</kbd> to close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
