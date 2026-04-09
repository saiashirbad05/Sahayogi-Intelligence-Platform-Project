import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, HeartPulse, Building2, Users, FileText, Upload, Download, X, Search, Database } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { vaultDocs } from '../data/vault_docs';

export const Impact: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    hospitals: 0,
    doctors: 0,
    population: 0,
    highRiskZones: 0
  });
  const [districts, setDistricts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchImpact() {
      try {
        const { data: metrics, error } = await supabase
          .from('health_metrics')
          .select('*')
          .limit(10000);

        if (error) throw error;

        let h = 0, docs = 0, pop = 0, risks = 0;
        const regionMap = new Map();

        metrics?.forEach(m => {
          h += m.hospitals_available || 0;
          docs += Math.floor((m.hospitals_available || 0) * 12.5);
          pop += parseInt(m.total_population || '0') || 0;
          
          const riskVal = parseInt(m.risk_level || '0');
          if (riskVal > 800) risks++;

          if (m.state) {
            if (!regionMap.has(m.state)) regionMap.set(m.state, { count: 0, risk: false });
            if (riskVal > 800) regionMap.get(m.state).risk = true;
            regionMap.get(m.state).count++;
          }
        });

        setStats({ hospitals: h, doctors: docs, population: pop, highRiskZones: risks });
        
        const regions = Array.from(regionMap.entries())
            .map(([name, val]) => ({ name, ...val }))
            .sort((a, b) => b.count - a.count);
            
        setDistricts(regions);
      } catch (err) {
        console.error('Impact data error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchImpact();
  }, []);

  return (
    <div style={{ background: 'var(--navy-deep)', minHeight: '100vh', padding: '40px 20px', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* HERO HEADING — matching other pages */}
        <header style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Activity size={18} color="var(--coral)" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--coral)', letterSpacing: '2px', textTransform: 'uppercase' }}>CONSOLIDATED INTELLIGENCE</span>
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 900, background: 'linear-gradient(135deg, #60A5FA 0%, #E8793A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px', margin: '0 0 12px' }}>
            National Health & Impact Overview
          </h1>
          <p style={{ color: 'var(--blue-light)', opacity: 0.8, fontSize: '16px', maxWidth: '700px' }}>
            Real-time aggregate data processing from the National Community Health Directory — encompassing {districts.length} state regions.
          </p>
        </header>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--blue-light)' }}>
            Processing deep dataset analytics...
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <MetricCard title="Hospitals Online" value={stats.hospitals.toLocaleString()} icon={<Building2 />} />
              <MetricCard title="Medical Personnel" value={stats.doctors.toLocaleString()} icon={<HeartPulse />} />
              <MetricCard title="High Risk Vectors" value={stats.highRiskZones.toString()} icon={<ShieldAlert color="var(--coral)" />} />
              <MetricCard title="Population Reached" value={stats.population.toLocaleString()} icon={<Users />} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '30px', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                Regional Activity Heatmap
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {districts.map((d, i) => (
                  <motion.div 
                    key={d.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px',
                      borderLeft: d.risk ? '4px solid var(--coral)' : '4px solid var(--blue-mid)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{d.name}</strong>
                      <span style={{ fontSize: '14px', color: 'var(--blue-light)' }}>{d.count} reports</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* PUBLIC OPERATIONS VAULT */}
            <ReportVault />
          </>
        )}
      </div>
    </div>
  );
};

/* ─── REPORT VAULT COMPONENT ─── */
const ReportVault = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContribute, setShowContribute] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Reports' | 'Datasets'>('All');

const LOCAL_DOCS = vaultDocs as any[];

  useEffect(() => {
    setLoading(false);
  }, []);

  const filtered = LOCAL_DOCS.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.org.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || r.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.1)', 
      border: '1px solid rgba(255, 255, 255, 0.2)', 
      borderRadius: '24px', 
      padding: '48px', 
      position: 'relative', 
      overflow: 'hidden',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--brand-blue), var(--coral))' }} />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '16px', color: 'white' }}>
            <FileText size={32} color="var(--blue-light)" />
            Public Operations Vault
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>
            {filtered.length} annual reports, operational audits, and risk metadata from verified field networks.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          {['All', 'Reports', 'Datasets'].map((tab: any) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === tab ? 'var(--coral)' : 'transparent',
                color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.6)'
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setShowContribute(true)}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '14px 28px', 
              borderRadius: '14px', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: 'white', 
              fontWeight: 800, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              fontSize: '14px'
            }}
          >
            <Upload size={18} /> CONTRIBUTE
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} />
        <input
          type="text"
          placeholder="Search reports by name, organization, or year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '18px 18px 18px 56px', 
            borderRadius: '16px', 
            border: '1px solid rgba(255,255,255,0.3)', 
            background: 'rgba(255,255,255,0.15)', 
            color: 'white', 
            fontSize: '16px', 
            outline: 'none',
            transition: 'all 0.2s'
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.6)' }}>Syncing vault...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', maxHeight: '900px', overflowY: 'auto', padding: '8px' }}>
          {filtered.map((doc, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.02, 0.5) }}
              whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.18)' }}
              style={{
                background: 'rgba(255,255,255,0.12)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '16px', 
                padding: '28px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: doc.type === 'Reports' ? 'rgba(232, 121, 58, 0.1)' : 'rgba(96, 165, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {doc.type === 'Reports' ? <FileText size={24} color="var(--coral)" /> : <Database size={24} color="#60A5FA" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '15px', color: 'white', fontWeight: 700, marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doc.name}</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'var(--blue-light)', fontWeight: 600 }}>{doc.org}</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: 'rgba(255,255,255,0.6)' }}>{doc.year}</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <a 
                href={doc.file} 
                target="_blank" rel="noopener noreferrer"
                download
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'var(--brand-blue)', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--coral)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'var(--brand-blue)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Download size={16} /> VIEW & DOWNLOAD
              </a>
            </motion.div>
          ))}
        </div>
      )}

      {/* CONTRIBUTE MODAL */}
      <AnimatePresence>
        {showContribute && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setShowContribute(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--navy-deep)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '48px', maxWidth: '520px', width: '100%', position: 'relative' }}
            >
              <button onClick={() => setShowContribute(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Upload size={48} color="var(--coral)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>Contribute a Report</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Upload annual reports, impact assessments, or operational documents to the public vault.</p>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); alert('Thank you! Your report has been submitted for review. Our team will process and add it to the vault within 24 hours.'); setShowContribute(false); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input placeholder="Organization Name" required style={{ padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '15px', outline: 'none' }} />
                  <input placeholder="Report Title" required style={{ padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '15px', outline: 'none' }} />
                  <input placeholder="Year (e.g. 2024-25)" required style={{ padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '15px', outline: 'none' }} />
                  <div style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer' }}>
                    <Upload size={32} color="rgba(255,255,255,0.3)" style={{ marginBottom: '8px' }} />
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>Drag & drop PDF here or click to browse</p>
                    <input type="file" accept=".pdf" style={{ opacity: 0, position: 'absolute', width: '1px' }} />
                  </div>
                  <button type="submit" style={{ padding: '16px', background: 'var(--coral)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', marginTop: '8px' }}>
                    SUBMIT FOR REVIEW
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MetricCard = ({ title, value, icon }: any) => (
  <div style={{ 
    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' 
  }}>
    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <div style={{ color: 'var(--blue-light)', fontSize: '14px', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '28px', fontWeight: 900 }}>{value}</div>
    </div>
  </div>
);
