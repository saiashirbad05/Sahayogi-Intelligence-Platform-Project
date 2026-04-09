import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

export const AIBriefing: React.FC = () => {
  const [briefing, setBriefing] = useState<string>("Analyzing real-time intelligence feeds...");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const briefings = [
      "Critical: Resource gap detected in Northern Odisha. 12NGOs alerted.",
      "Intelligence: Sync rate across Maharashtra plateaued at 82%. Investigating latency.",
      "Success: 412 entries matched with verified field volunteers in Bihar.",
      "Warning: Signal drift detected in high-risk zones. Re-calibrating sync protocol."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % briefings.length;
      setBriefing(briefings[i]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-pro mb-8 p-4 px-6 rounded-[24px] border border-coral/20 flex items-center justify-between gap-4"
          style={{ background: 'rgba(232, 121, 58, 0.05)' }}
        >
          <div className="flex items-center gap-4">
            <div style={{ padding: '8px', background: 'var(--coral)', borderRadius: '12px', boxShadow: '0 0 15px rgba(232, 121, 58, 0.3)' }}>
              <Sparkles size={16} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--coral)', marginBottom: '2px' }}>
                Daily Intelligence Briefing
              </p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brand-navy)' }}>{briefing}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: 'none', padding: '6px 12px', 
              borderRadius: '12px', color: 'white', fontSize: '10px', 
              fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' 
            }}
          >
            DISMISS <Zap size={10} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
