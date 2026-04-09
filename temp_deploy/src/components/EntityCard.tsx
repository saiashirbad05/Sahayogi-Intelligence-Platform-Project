import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, HeartHandshake, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EntityCard: React.FC<{ entity: any }> = ({ entity }) => {
  const isNGO = entity.type === 'ngo';
  
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: 'var(--shadow-glow)' }}
      className="glass-panel" 
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', borderTop: isNGO ? '2px solid var(--accent-green)' : '2px solid var(--accent-saffron)' }}
    >
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: isNGO ? 'rgba(5, 150, 105, 0.1)' : 'rgba(234, 88, 12, 0.1)', color: isNGO ? 'var(--accent-green)' : 'var(--accent-saffron)', borderRadius: '4px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
               {entity.type}
            </div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{entity.name}</h3>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
             {isNGO ? <HeartHandshake size={24} /> : <Users size={24} />}
          </div>
       </div>

       <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: '24px' }}>
         {entity.mission}
       </p>

       <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                <MapPin size={14} /> {entity.location.state}
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-green)', fontWeight: 700 }}>
                <div className="dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} /> Verified
             </div>
          </div>
          <Link to={`/explore/${entity.id}`} className="btn-premium btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>
             View Details <ChevronRight size={14} />
          </Link>
       </div>
    </motion.div>
  );
};
