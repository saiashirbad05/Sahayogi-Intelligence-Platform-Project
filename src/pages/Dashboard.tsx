import React, { useEffect, useState, useMemo } from 'react';
import { 
  Globe, Users, 
  Activity, Radio, Search,
  Download, Terminal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveRiskMap from '../components/InteractiveRiskMap';
import { UrgentAreaCards } from '../components/UrgentAreaCards';
import { AIBriefing } from '../components/AIBriefing';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../lib/supabase';

// ── Animation Presets (Emil-Inspired) ──────────────────────────────────────
const stiffSpring = { type: "spring", stiffness: 500, damping: 25 } as const;
const bouncySpring = { type: "spring", stiffness: 350, damping: 18 } as const;
// const slowSpring = { type: "spring", stiffness: 150, damping: 18 } as const;


const CustomBarChart = ({ data }: { data: any[] }) => {
  const maxVal = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '300px', paddingRight: '8px' }}>
      {data.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '100px', fontSize: '11px', fontWeight: 600, color: 'var(--text-mid)', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.name}
          </div>
          <div style={{ flex: 1, height: '8px', background: 'var(--off-white)', borderRadius: '10px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${(item.value / maxVal) * 100}%` }}
              transition={{ duration: 1, delay: i * 0.05 }}
              style={{ height: '100%', background: 'var(--navy-deep)', borderRadius: '10px' }}
            />
          </div>
          <div style={{ width: '40px', fontSize: '11px', fontWeight: 800, color: 'var(--navy-deep)' }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

const CustomPieChart = ({ data }: { data: any[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;
  
  const colors = ['#252B6B', '#E8793A', '#4F46E5', '#D4A820', '#10B981'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <svg width="160" height="160" viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)', borderRadius: '50%' }}>
        {data.map((item, i) => {
          const percent = (item.value / total) * 100;
          const strokeDasharray = `${percent} 100`;
          const strokeDashoffset = -cumulativePercent;
          cumulativePercent += percent;
          return (
            <circle
              key={i} r="16" cx="16" cy="16" fill="transparent"
              stroke={colors[i % colors.length]} strokeWidth="32"
              strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          );
        })}
        <circle r="10" cx="16" cy="16" fill="white" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[i % colors.length] }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-mid)' }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};








export const Dashboard: React.FC = () => {
  const [entities, setEntities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tickerEvents, setTickerEvents] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [healthStats, setHealthStats] = useState({ hospitals: 0, personnel: 0, highRisk: 0 });

  useEffect(() => {
    async function fetchHealth() {
      const { data } = await supabase.from('health_metrics').select('hospitals_available, doctors_available, nurses_available, risk_level');
      if (data) {
        let h = 0, p = 0, r = 0;
        data.forEach(d => {
          h += Number(d.hospitals_available) || 0;
          p += (Number(d.doctors_available) || 0) + (Number(d.nurses_available) || 0);
          if (d.risk_level === 'HIGH' || (Number(d.risk_level) > 800)) r++;
        });
        setHealthStats({ hospitals: h, personnel: p, highRisk: r });
      }
    }
    fetchHealth();
  }, []);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(26, 33, 81); // navy-deep
      doc.text("Sahayogi Intelligence Platform", 14, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(232, 105, 60); // coral
      doc.text("Community Need Assessment Report", 14, 28);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("Generated: " + new Date().toLocaleString(), 14, 36);

      const { data } = await supabase.from('need_scores').select('*').order('need_score', { ascending: false });
      
      if (data && data.length > 0) {
        const tableBody = data.map((d, i) => [
          i + 1,
          d.district,
          d.need_score.toFixed(1),
          d.top_category.toUpperCase(),
          d.report_count
        ]);
        
        autoTable(doc, {
          startY: 45,
          head: [['Rank', 'District', 'Need Score', 'Primary Need', 'Field Reports']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [26, 33, 81], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 }
        });
      } else {
        doc.text("No intelligence data available at the moment.", 14, 50);
      }
      
      doc.save(`Sahayogi_Intel_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: ngoData }, { data: volData }] = await Promise.all([
          supabase.from('ngos').select('*', { count: 'exact' }),
          supabase.from('volunteers').select('*', { count: 'exact' })
        ]);
        
        const combined = [
          ...(ngoData || []).map(n => ({ ...n, type: 'NGO' })),
          ...(volData || []).map(v => ({ ...v, type: 'Volunteer' }))
        ];
        
        setEntities(combined);
        
        const initialEvents = Array.from({ length: 5 }).map((_, i) => {
          const randomEntity = combined[Math.floor(Math.random() * combined.length)] || { name: 'System Core' };
          return {
            id: i,
            name: randomEntity.name,
            type: 'Identity Verified',
            time: 'Just now',
            status: 'SUCCESS',
            confidence: 99,
            icon: '✅',
            typeColor: '#10B981'
          };
        });
        setTickerEvents(initialEvents);
      } catch (err) {
        console.error('Error loading live intelligence:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const logPool = [
      "DB_SYNC: Entities updated (+3)",
      "INTEL_CORE: V7 Logic Re-calibrated",
      "RISK_MAP: Hotspot detected in Odisha",
      "BOT_READY: NLP Engine Active",
      "API_PING: Latency 24ms",
      "AUTH_GATE: Session Verified"
    ];
    const logInterval = setInterval(() => {
      const newLog = `[${new Date().toLocaleTimeString()}] ${logPool[Math.floor(Math.random() * logPool.length)]}`;
      setLogs(prev => [newLog, ...prev.slice(0, 5)]);
    }, 3000);
    return () => clearInterval(logInterval);
  }, []);

  useEffect(() => {
    if (entities.length === 0) return;
    const interval = setInterval(() => {
      const types = [
        { label: 'Emergency Response', color: 'var(--coral)', icon: '🚨' },
        { label: 'Network Sync', color: 'var(--indigo-mid)', icon: '🔄' },
        { label: 'Identity Verified', color: '#10B981', icon: '✅' },
        { label: 'Contextual Extraction', color: 'var(--gold)', icon: '🧠' }
      ];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const newEvent = {
        id: Date.now(),
        name: entities[Math.floor(Math.random() * entities.length)].name,
        type: type.label,
        typeColor: type.color,
        icon: type.icon,
        time: '1s ago',
        confidence: Math.floor(85 + Math.random() * 15),
        status: 'LIVE'
      };
      setTickerEvents(prev => [newEvent, ...prev.slice(0, 5)]);
    }, 2000);
    return () => clearInterval(interval);
  }, [entities]);

  const stats = useMemo(() => {
    if (entities.length === 0) return null;
    const specialtyCounts = entities.reduce((acc: any, curr) => {
      acc[curr.specialty] = (acc[curr.specialty] || 0) + 1;
      return acc;
    }, {});

    return {
      total: entities.length,
      verified: entities.filter(e => e.verified).length,
      ngos: entities.filter(e => e.type === 'NGO').length,
      volunteers: entities.filter(e => e.type === 'Volunteer').length,
      regionalHeatmap: entities.reduce((acc: any, curr) => {
        acc[curr.region] = (acc[curr.region] || 0) + 1;
        return acc;
      }, {}),
      nicheData: Object.entries(specialtyCounts).map(([name, value]) => ({ name, value: value as number }))
    };
  }, [entities]);

  const chartData = useMemo(() => {
    return (stats?.nicheData || []).filter(d => d.value > 50).sort((a, b) => b.value - a.value);
  }, [stats]);

  if (isLoading) {
    return (
      <div style={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off-white)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Activity size={48} color="var(--navy-mid)" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="bg-grid-dark"
      style={{ background: 'var(--off-white)', minHeight: '100vh', padding: '60px 8%' }}
    >
      <AIBriefing />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div className="pulse" style={{ width: '8px', height: '8px', background: 'var(--coral)', borderRadius: '50%', boxShadow: '0 0 10px var(--coral)' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--coral)', letterSpacing: '2px', textTransform: 'uppercase' }}>SAHAYOGI V7.5 SYNC ACTIVE</span>
          </div>
          <h1 className="gradient-text-dark" style={{ fontSize: '52px', fontWeight: 950, margin: 0, letterSpacing: '-2px', lineHeight: 1 }}>
            Impact Intelligence
          </h1>
          <p style={{ color: 'var(--text-mid)', fontWeight: 600, fontSize: '18px', marginTop: '8px' }}>Orchestrating {stats?.total?.toLocaleString() || '...'} verified social entities.</p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={stiffSpring}
          style={{ display: 'flex', gap: '16px' }}
        >
          <div className="glass-pro shadow-sm" style={{ padding: '16px 28px', borderRadius: '24px', textAlign: 'right', background: 'white' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Capacity</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--brand-navy)', lineHeight: 1 }}>{stats?.total?.toLocaleString() || '0'}</div>
          </div>
          <motion.button
            whileHover={{ transform: "translateY(-4px)" }}
            whileTap={{ scale: 0.97 }}
            onClick={exportPDF}
            disabled={exporting}
            className="btn btn-outline" 
            style={{ padding: '20px 24px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', opacity: exporting ? 0.7 : 1 }}
          >
            <Download size={18} strokeWidth={2.5} /> {exporting ? 'Generating...' : 'Export PDF'}
          </motion.button>
          <Link to="/explore" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ transform: "translateY(-4px)" }}
              whileTap={{ scale: 0.97 }}
              transition={stiffSpring}
              className="btn btn-brand-navy" 
              style={{ padding: '20px 36px', fontSize: '16px' }}
            >
              <Search size={18} strokeWidth={2.5} /> Explorer
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Main Grid with Dynamic Loading */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '32px' }} />)}
              </div>
              <div className="skeleton" style={{ height: '600px', borderRadius: '32px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div className="skeleton" style={{ height: '500px', borderRadius: '32px' }} />
              <div className="skeleton" style={{ height: '300px', borderRadius: '32px' }} />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stiffSpring}
            style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}
          >
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {[
                  { label: 'NGO Intensity', value: stats?.ngos, icon: <Globe size={22} />, color: 'var(--brand-blue)', trend: '+12.5%' },
                  { label: 'Verified Network', value: stats?.volunteers, icon: <Users size={22} />, color: 'var(--violet)', trend: '+5.2%' },
                  { label: 'Health Readiness', value: healthStats.hospitals.toLocaleString(), icon: <Activity size={22} />, color: 'var(--coral)', trend: 'STABLE' }
                ].map((s, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ ...bouncySpring, delay: i * 0.1 }}
                    className="card-premium" 
                    style={{ padding: '32px', borderLeft: `8px solid ${s.color}` }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <motion.div 
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        style={{ background: `${s.color}10`, padding: '12px', borderRadius: '14px', color: s.color }}
                      >
                        {s.icon}
                      </motion.div>
                      <div style={{ fontSize: '12px', fontWeight: 900, color: '#10B981', background: '#10B98115', padding: '4px 10px', borderRadius: '20px' }}>
                        {s.trend}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '38px', fontWeight: 950, color: 'var(--brand-navy)', letterSpacing: '-1.5px', marginBottom: '4px' }}>
                        {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.7 }}>
                        {s.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="card-premium"
                style={{ padding: '40px', minHeight: '520px', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--brand-navy)', letterSpacing: '-1px' }}>Regional Impact Matrix</h3>
                    <p style={{ margin: '8px 0 0', fontSize: '15px', color: 'var(--text-mid)', fontWeight: 500 }}>Multi-dimensional resource distribution map</p>
                  </div>
                  <div className="glass-pro shadow-sm" style={{ padding: '10px 20px', borderRadius: '50px', background: 'white', border: '1px solid var(--indigo-light)' }}>
                    <div className="pulse-primary" style={{ width: '8px', height: '8px', display: 'inline-block', marginRight: '8px' }} />
                    <span style={{ fontSize: '10px', fontWeight: 950, color: 'var(--brand-navy)' }}>NETWORK SYNCED</span>
                  </div>
                </div>
                <div style={{ flex: 1, background: 'var(--off-white)', borderRadius: '24px', overflow: 'hidden' }}>
                  <InteractiveRiskMap />
                </div>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                <div className="card-premium" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '24px', color: 'var(--brand-navy)' }}>Niche Distribution (Top 10)</h3>
                  <CustomBarChart data={chartData.slice(0, 10)} />
                </div>
                <div className="card-premium" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '24px', color: 'var(--brand-navy)' }}>Impact Composition</h3>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CustomPieChart data={chartData.slice(0, 5)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div className="glass-pro shadow-elite" style={{ background: 'var(--brand-navy)', padding: '32px', borderRadius: '32px', minHeight: '500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                  <Radio size={20} color="var(--coral)" className="pulse" />
                  <h4 style={{ color: 'white', margin: 0, fontSize: '12px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>Live System Telemetry</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <AnimatePresence mode="popLayout">
                    {tickerEvents.map((event) => (
                      <motion.div 
                        key={event.id} layout
                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                        style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', borderLeft: `4px solid ${event.typeColor || 'var(--gold)'}` }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: event.typeColor || 'var(--gold)' }}>{event.icon} {event.type.toUpperCase()}</span>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{event.time}</span>
                        </div>
                        <div style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>{event.name}</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="card-premium" style={{ padding: '0', overflow: 'hidden' }}>
                <UrgentAreaCards />
              </div>

              <Link to="/chat" style={{ textDecoration: 'none' }}>
                <motion.div 
                  whileHover={{ y: -8, boxShadow: 'var(--shadow-pro)' }}
                  style={{ background: 'linear-gradient(135deg, var(--coral) 0%, var(--gold) 100%)', padding: '32px', borderRadius: '32px', color: 'white' }}
                >
                  <h4 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Consult Sahayogi-Bot</h4>
                  <p style={{ margin: '8px 0 16px', fontSize: '14px', opacity: 0.9 }}>AI-powered resource optimization & registry analysis.</p>
                  <div style={{ width: 'fit-content', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '50px', fontSize: '12px', fontWeight: 900 }}>ACCESS INTELLIGENCE CORE &rarr;</div>
                </motion.div>
              </Link>

              {/* Technical Logs */}
              <div className="card-premium" style={{ background: '#05071E', borderColor: 'rgba(255,255,255,0.05)', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Terminal size={14} color="var(--coral)" />
                  <h4 style={{ fontSize: '11px', fontWeight: 900, color: 'white', letterSpacing: '1px', textTransform: 'uppercase' }}>Technical Logic Stream</h4>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#10B981', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {logs.map((log, idx) => (
                    <div key={idx} style={{ opacity: 1 - (idx * 0.15) }}>{log}</div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
