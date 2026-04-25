import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, TrendingUp, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Real-time Need Logic to Color Map
const SVG_COLOR_MAP: Record<string, string> = {
  '#FFADAD': 'critical',
  '#FFD6A5': 'high',
  '#FDFFB6': 'medium',
  '#CAFFBF': 'low',
  '#9BF6FF': 'minimal',
  '#A0C4FF': 'minimal',
  '#FFC6FF': 'high', // Pink used for specialized risk
  '#F5EFE6': 'unverified'
};

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  'critical':   { label: 'Critical Risk',   color: '#ef4444' },
  'high':       { label: 'High Risk',       color: '#fb923c' },
  'medium':     { label: 'Medium Risk',     color: '#facc15' },
  'low':        { label: 'Low Risk',        color: '#4ade80' },
  'minimal':    { label: 'Minimal Risk',    color: '#60a5fa' },
  'unverified': { label: 'Unverified',      color: '#94a3b8' }
};

const ODISHA_DISTRICTS = [
  'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 
  'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghapur', 'Jajpur', 
  'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Keonjhar', 'Khordha', 
  'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 
  'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'
];

interface NeedScoreRow {
  district: string;
  need_score: number;
  top_category: string;
  report_count: number;
}

const InteractiveRiskMap: React.FC = () => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [intelData, setIntelData] = useState<Record<string, NeedScoreRow>>({});
  const [hoveredData, setHoveredData] = useState<{ 
    idx: number; 
    district: string;
    originalColor: string; 
    risk: string;
    intel?: NeedScoreRow;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Map SVG
    fetch('/assets/maps.svg')
      .then(res => res.text())
      .then(text => {
        const svgMatch = text.match(/<svg[\s\S]*<\/svg>/);
        if (svgMatch) setSvgContent(svgMatch[0]);
      });

    // Load Need Intelligence
    const loadIntel = async () => {
      const { data } = await supabase.from('need_scores').select('*');
      if (data) {
        const intelMap: Record<string, NeedScoreRow> = {};
        data.forEach(d => intelMap[d.district] = d);
        setIntelData(intelMap);
      }
    };
    loadIntel();
    
    // Subscribe to realtime intel changes
    const sub = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'need_scores' }, loadIntel)
      .subscribe();
      
    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => {
    if (svgContent && containerRef.current) {
      const svgRoot = containerRef.current.querySelector('svg');
      if (svgRoot) {
        // Respect REAL SIZE (900x950) while ensuring responsive fit
        // Dynamic responsive sizing without hard pixel forcing
        svgRoot.style.width = '100%';
        svgRoot.style.height = 'auto';
        svgRoot.style.display = 'block';

        const paths = Array.from(svgRoot.querySelectorAll('path'));
        paths.forEach((path, idx) => {
          if (idx === 0) return; // Skip backgroundlandmass

          const districtName = ODISHA_DISTRICTS[(idx - 1) % ODISHA_DISTRICTS.length];
          const districtIntel = intelData[districtName];
          
          let overrideColor = '';
          let riskKey = 'unverified';
          const originalColor = (path.getAttribute('fill') || '').toUpperCase();
          
          if (districtIntel) {
             const score = districtIntel.need_score;
             if (score >= 80) { riskKey = 'critical'; overrideColor = '#ef4444'; }
             else if (score >= 60) { riskKey = 'high'; overrideColor = '#f97316'; }
             else if (score >= 40) { riskKey = 'medium'; overrideColor = '#eab308'; }
             else if (score >= 20) { riskKey = 'low'; overrideColor = '#22c55e'; }
             else { riskKey = 'minimal'; overrideColor = '#3b82f6'; }
             
             // Dynamic style update based on DB logic
             path.style.fill = overrideColor;
          } else {
             riskKey = SVG_COLOR_MAP[originalColor] || 'unverified';
          }

          path.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
          path.style.cursor = 'pointer';

          // Interactive listeners
          path.onmouseenter = () => {
            setHoveredData({ 
              idx, 
              district: districtName,
              originalColor: overrideColor || originalColor, 
              risk: riskKey,
              intel: districtIntel
            });
            path.style.filter = 'drop-shadow(0 0 8px rgba(0,0,0,0.2))';
            path.style.strokeWidth = '4';
            path.style.zIndex = '100';
          };

          path.onmouseleave = () => {
            setHoveredData(null);
            path.style.filter = 'none';
            path.style.strokeWidth = '2.5';
          };
        });
      }
    }
  }, [svgContent, intelData]);

  return (
    <div style={{ position: 'relative', width: '100%', background: '#F8FAFC', borderRadius: '40px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' }}>
      {/* Exact Map Rendering */}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          maxWidth: '650px', 
          margin: '0 auto',
          padding: '24px', 
          transition: 'all 0.5s ease',
          opacity: svgContent ? 1 : 0,
          display: 'flex',
          justifyContent: 'center',
          position: 'relative'
        }}
        dangerouslySetInnerHTML={svgContent ? { __html: svgContent } : undefined} 
      />

      {/* Info Logic Overlay */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
        <div className="glass-pill" style={{ cursor: 'help' }}>
          <ShieldAlert size={14} style={{ color: 'var(--coral)' }} />
          <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
            V7 Intelligence Logic Active
          </span>
        </div>
      </div>

      {/* Dynamic Intelligence Tooltip */}
      <AnimatePresence>
        {hoveredData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{ position: 'absolute', top: '10%', right: '40px', zIndex: 50, pointerEvents: 'none' }}
          >
            <div className="glass-pro shadow-2xl p-6 min-w-[300px] rounded-[32px] border border-white/20 backdrop-blur-3xl bg-white/10" style={{ color: 'white' }}>
              <div 
                className="absolute top-0 left-0 w-2 h-full rounded-full" 
                style={{ backgroundColor: hoveredData.originalColor }} 
              />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-black text-white leading-tight mb-1">
                    {hoveredData.district}
                  </h4>
                  <div className="flex items-center gap-2 opacity-60">
                    <TrendingUp size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                       Score: {hoveredData.intel?.need_score.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
                <div 
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg"
                  style={{ backgroundColor: hoveredData.originalColor }}
                >
                  {RISK_LABELS[hoveredData.risk]?.label}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={16} style={{ color: hoveredData.originalColor }} />
                    <span className="text-xs font-bold text-white/60 uppercase">Primary Need</span>
                  </div>
                  <span className="font-black text-white capitalize">
                    {hoveredData.intel?.top_category || 'Unknown'}
                  </span>
                </div>

                {hoveredData.intel && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-1 opacity-40">
                        <Users size={12} />
                        <span className="text-[10px] font-bold uppercase">Reports</span>
                      </div>
                      <div className="text-xl font-black text-white">{hoveredData.intel.report_count}</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-1 opacity-40">
                        <TrendingUp size={12} />
                        <span className="text-[10px] font-bold uppercase">Risk Score</span>
                      </div>
                      <div className="text-xl font-black text-white">{hoveredData.intel.need_score.toFixed(1)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Navigation Legend */}
      <div className="absolute bottom-10 left-10 flex flex-col gap-3 p-6 bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Indication Protocol</label>
        {Object.entries(SVG_COLOR_MAP).slice(0, 5).map(([hex, risk]) => (
          <div key={hex} className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-lg shadow-sm border border-slate-200" 
              style={{ backgroundColor: hex }} 
            />
            <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">
              {risk}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveRiskMap;
