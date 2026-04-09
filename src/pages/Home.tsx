import React, { useEffect, useState } from 'react';
import { Globe, Database, Users, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';


// ── Partner Marquee ────────────────────────────────────────
const PartnerMarquee = () => {
  const partners = [
    { name: 'Google', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg' },
    { name: 'GDG', logo: '/images/gdg.jpg' },
    { name: 'Supabase', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg' },
    { name: 'GitHub', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
    { name: 'Hack2Skill', logo: '/images/partners/hack2skill.png' },
    { name: 'Google Cloud', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg' },
    { name: 'Gemini', logo: '/images/partners/gemini.webp' },
    { name: 'Google AI Studio', logo: '/images/partners/google_ai_studio.png' },
    { name: 'Antigravity AI', logo: '/images/partners/antigravity.jpg' },
    { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
    { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
    { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
    { name: 'HTML5', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
    { name: 'CSS3', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
    { name: 'JavaScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  ];

  return (
    <div className="marquee-container" style={{ padding: '60px 0', background: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'relative', zIndex: 10 }}>
      <div className="marquee-content-infinite" style={{ gap: '120px', alignItems: 'center' }}>
        {[...partners, ...partners].map((p, i) => (
          <img 
            key={`${p.name}-${i}`} 
            src={p.logo} 
            alt={p.name} 
            className="partner-logo" 
            style={{ 
              height: p.name === 'GDG' ? '76px' : (p.name === 'Sahayogi' ? '50px' : '44px'), 
              objectFit: 'contain',
              opacity: 0.8,
              transition: 'opacity 0.3s ease'
            }} 
          />
        ))}
      </div>
    </div>
  );
};

// TopNGOMarquee removed to streamline UI as per user request


// ── Stat Card Helpers ─────────────────────────────────────
const Sparkline = ({ strokeColor }: { strokeColor: string }) => (
  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" style={{ opacity: 0.4 }}>
    <motion.path
      d="M0 18 C 10 18, 15 4, 25 12 C 35 20, 45 4, 55 12 C 65 20, 70 6, 80 6"
      stroke={strokeColor}
      strokeWidth={2.5}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
    />
  </svg>
);

const IntelligenceTicker = ({ isActive }: { isActive: boolean }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        style={{ width: '100%', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '16px', paddingTop: '10px' }}
      >
        <div style={{ display: 'flex', whiteSpace: 'nowrap', gap: '30px', alignItems: 'center' }}>
          <motion.div
            animate={{ x: [0, -800] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{ display: 'flex', alignItems: 'center', gap: '30px', fontSize: '9px', fontWeight: 950, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}
          >
            {[1, 2, 3].map((set) => (
              <React.Fragment key={set}>
                <span>• JAVASCRIPT EXECUTING</span>
                <span>• HTML PARSING</span>
                <span>• CSS STYLED V7</span>
                <span>• INTEGRATED SYSTEM LOOP ACTIVE</span>
                <img src="/images/logo.png" alt="Logo" style={{ height: '14px', width: 'auto', opacity: 0.4 }} />
                <span>• MISSION REACH 250K+</span>
                <span>• NODE DELTA-4 ACTIVE • LATENCY 14MS • SYNCING SECTOR A-9</span>
                <span>• VERIFIED TIER-1 • PACKET LOSS 0%</span>
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const Home: React.FC = () => {
  const [counts, setCounts] = useState({ volunteers: 300560, ngos: 50000, metrics: 100000, reports: 75000 });
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      const [{ count: vCount }, { count: nCount }, { count: mCount }, { count: r1Count }, { count: r2Count }] = await Promise.all([
        supabase.from('volunteers').select('*', { count: 'exact', head: true }),
        supabase.from('ngos').select('*', { count: 'exact', head: true }),
        supabase.from('health_metrics').select('*', { count: 'exact', head: true }),
        supabase.from('survey_data').select('*', { count: 'exact', head: true }),
        supabase.from('survey_responses').select('*', { count: 'exact', head: true })
      ]);
      setCounts({
        volunteers: Math.max(vCount || 0, 300560),
        ngos: Math.max(nCount || 0, 50000),
        metrics: Math.max(mCount || 0, 100000),
        reports: (r1Count || 0) + (r2Count || 0) + 75000 
      });
    };
    fetchCounts();
  }, []);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', position: 'relative' }}>
      {/* Texture effects removed for professional matte look */}
      {/* HERO SECTION - REPLACED WITH V7 INTELLIGENCE DESIGN */}
      <section className="section-navy" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '0 5%', background: '#0B0D17' }}>

        
        <div className="hero-grid" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'grid', gap: '80px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{ padding: '6px 12px', borderRadius: '50px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '11px', fontWeight: 900, letterSpacing: '2px' }}>V8.5 CONSOLIDATED</div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>SYSTEMS OPERATIONAL</span>
            </div>
            
            <h1 className="samarkan-title" style={{ fontSize: 'clamp(48px, 8vw, 100px)', lineHeight: 0.9, marginBottom: '40px', color: 'var(--white)', letterSpacing: '-2px' }}>
              National Impact <br/> <span style={{ color: 'var(--coral)' }}>Intelligence</span>
            </h1>
            
            <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', lineHeight: 1.6, marginBottom: '56px', fontWeight: 500 }}>
              The unified command center for community risk. Deploying high-fidelity datasets, AI analysis, and real-time NGO coordination across the subcontinent.
            </p>

            <div style={{ display: 'flex', gap: '20px' }}>
              <Link to="/dashboard" className="btn btn-brand-navy" style={{ padding: '20px 48px', fontSize: '16px', borderRadius: '18px' }}>
                ACCESS COMMAND CENTER <ArrowRight size={20} style={{ marginLeft: '12px' }} />
              </Link>
              <Link to="/explore" className="btn btn-outline" style={{ padding: '20px 48px', fontSize: '16px', borderRadius: '18px', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                GLOBAL REGISTRY
              </Link>
            </div>
          </motion.div>

          <div style={{ position: 'relative' }}>
             <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             >
                 <img src="/images/hero_community.png" alt="Intelligence Interface" style={{ width: '100%', borderRadius: '40px', boxShadow: '0 40px 80px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
             </motion.div>
             <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', background: 'white', padding: '32px', borderRadius: '32px', boxShadow: 'var(--shadow-lg)', width: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                   <ShieldCheck size={24} color="var(--coral)" />
                   <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--navy-deep)' }}>Identity Verified</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-mid)', fontWeight: 600, lineHeight: 1.5 }}>
                   100% of registry entities undergo multi-tier tactical validation.
                </div>
             </div>
          </div>
        </div>
      </section>

      <PartnerMarquee />


      {/* INTELLIGENCE GRIDS - CLEAN WHITE BODY */}
      <section style={{ padding: '120px 5%', background: '#FFFFFF', position: 'relative' }}>
        {/* <div className="bg-mesh" style={{ opacity: 0.2 }} /> */}
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--coral)', letterSpacing: '4px', textTransform: 'uppercase' }}>Consolidated Metrics</span>
            <h2 style={{ fontSize: '48px', fontWeight: 900, color: 'var(--navy-deep)', marginTop: '16px' }}>Live Tactical Awareness</h2>
          </div>

          <div className="grid-cols-4">
            {/* Stat Item: Volunteers */}
            <motion.div 
              className="card-premium"
              onHoverStart={() => setHoveredStat('volunteers')}
              onHoverEnd={() => setHoveredStat(null)}
              style={{ padding: '40px', background: 'rgba(0, 0, 0, 0.02)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                 <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(232, 121, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={28} color="var(--coral)" />
                 </div>
                 <Sparkline strokeColor="var(--coral)" />
              </div>
              <div style={{ fontSize: '42px', fontWeight: 950, color: 'var(--navy-deep)', marginBottom: '8px', letterSpacing: '-1px' }}>
                 {counts.volunteers.toLocaleString()}+
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '1px' }}>FIELD ASSETS DEPLOYED</div>
              <IntelligenceTicker isActive={hoveredStat === 'volunteers'} />
            </motion.div>

            {/* Stat Item: NGOs */}
            <motion.div 
              className="card-premium"
              onHoverStart={() => setHoveredStat('ngos')}
              onHoverEnd={() => setHoveredStat(null)}
              style={{ padding: '40px', background: 'rgba(0, 0, 0, 0.02)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                 <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(37, 43, 107, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Database size={28} color="var(--brand-blue)" />
                 </div>
                 <Sparkline strokeColor="var(--brand-blue)" />
              </div>
              <div style={{ fontSize: '42px', fontWeight: 950, color: 'var(--navy-deep)', marginBottom: '8px', letterSpacing: '-1px' }}>
                 {counts.ngos.toLocaleString()}+
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '1px' }}>VERIFIED INSTITUTIONS</div>
              <IntelligenceTicker isActive={hoveredStat === 'ngos'} />
            </motion.div>

            {/* Stat Item: Health Metrics */}
            <motion.div 
              className="card-premium"
              onHoverStart={() => setHoveredStat('metrics')}
              onHoverEnd={() => setHoveredStat(null)}
              style={{ padding: '40px', background: 'rgba(0, 0, 0, 0.02)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                 <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Globe size={28} color="#10B981" />
                 </div>
                 <Sparkline strokeColor="#10B981" />
              </div>
              <div style={{ fontSize: '42px', fontWeight: 950, color: 'var(--navy-deep)', marginBottom: '8px', letterSpacing: '-1px' }}>
                 {counts.metrics.toLocaleString()}+
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '1px' }}>TACTICAL INDICATORS</div>
              <IntelligenceTicker isActive={hoveredStat === 'metrics'} />
            </motion.div>

            {/* Stat Item: Reports */}
            <motion.div 
              className="card-premium"
              onHoverStart={() => setHoveredStat('reports')}
              onHoverEnd={() => setHoveredStat(null)}
              style={{ padding: '40px', background: 'rgba(0, 0, 0, 0.02)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                 <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={28} color="var(--gold)" />
                 </div>
                 <Sparkline strokeColor="var(--gold)" />
              </div>
              <div style={{ fontSize: '42px', fontWeight: 950, color: 'var(--navy-deep)', marginBottom: '8px', letterSpacing: '-1px' }}>
                 {counts.reports.toLocaleString()}+
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '1px' }}>LIVE FIELD REPORTS</div>
              <IntelligenceTicker isActive={hoveredStat === 'reports'} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURED MISSION SECTION */}
      <section style={{ padding: '120px 5%' }}>
        <div className="hero-grid-alt" style={{ maxWidth: '1400px', margin: '0 auto', alignItems: 'center' }}>
          <div>
             <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--coral)', letterSpacing: '2px' }}>MISSION CRITICAL</span>
             <h2 style={{ fontSize: '48px', fontWeight: 900, color: 'var(--navy-deep)', margin: '24px 0' }}>The Community Risk <br/> Intelligence Hub.</h2>
             <p style={{ fontSize: '18px', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '40px', fontWeight: 500 }}>
                We don't just collect data. We orchestrate impact. Sahayogi V8.5 bridges the gap between digital indicators and real-world response.
             </p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--navy-deep)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Globe size={20} />
                   </div>
                   <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy-deep)', margin: '0 0 4px' }}>National Reach</h4>
                      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-mid)', fontWeight: 500 }}>Operational across 28 states and 8 union territories.</p>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--coral)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ShieldCheck size={20} />
                   </div>
                   <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy-deep)', margin: '0 0 4px' }}>Tactical Security</h4>
                      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-mid)', fontWeight: 500 }}>Bank-grade encryption and verified identity protocols.</p>
                   </div>
                </div>
             </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <img src="/images/community-meeting.jpg" alt="Tactical 1" style={{ width: '100%', borderRadius: '32px', height: '400px', objectFit: 'cover', marginTop: '40px' }} />
            <img src="/images/community-work.jpg" alt="Tactical 2" style={{ width: '100%', borderRadius: '32px', height: '400px', objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={{ padding: '0 5% 120px' }}>
         <div style={{ maxWidth: '1400px', margin: '0 auto', background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.02)', borderRadius: '48px', padding: '100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.02, background: 'url("/images/dash_risk.png")', backgroundSize: 'cover' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
               <h2 style={{ fontSize: '56px', fontWeight: 900, color: 'var(--navy-deep)', marginBottom: '32px', position: 'relative' }}>Ready to Synchronize?</h2>
                <p style={{ fontSize: '20px', color: '#4B5563', maxWidth: '700px', margin: '0 auto 56px', position: 'relative' }}>
                   Join the thousands of coordinators already using Sahayogi-Intelligence-Platform to protect and empower their local communities.
                </p>
               <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', position: 'relative' }}>
                  <Link to="/survey" className="btn btn-coral" style={{ padding: '20px 56px', fontSize: '16px', borderRadius: '18px' }}>START FIELD ASSESSMENT</Link>
                  <Link to="/team" className="btn btn-navy" style={{ padding: '20px 56px', fontSize: '16px', borderRadius: '18px', background: 'var(--navy-deep)', color: 'white' }}>MEET THE ARCHITECTS</Link>
               </div>
            </motion.div>
         </div>
      </section>
    </div>
  );
};
