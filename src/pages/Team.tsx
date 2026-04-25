import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, ShieldCheck } from 'lucide-react';

export const Team: React.FC = () => {
  const members = [
    {
      name: "Sai Ashirbad Behera",
      role: "Tech Lead, Frontend & Backend",
      image: "/images/team/sai.png",
      color: "var(--coral)",
      badgeColor: "#87CEEB", // Sky Blue
      badgeText: "black",
      highlights: [
        "Architecting the core systems that keep everything running smoothly.",
        "Integrating AI agents to make the platform incredibly smart.",
        "Managing cloud infrastructure to ensure high availability everywhere.",
        "Designing databases that safely scale with massive community needs.",
        "Building secure pathways to protect sensitive user and NGO data.",
        "Optimizing our API performance for lightning-fast responses."
      ]
    },
    {
      name: "Saswati Rajanandini",
      role: "Design Lead & Frontend",
      image: "/images/team/saswati.png",
      color: "var(--gold)",
      badgeColor: "#C3B1E1", // Slightly darker lavender
      badgeText: "black",
      highlights: [
        "Crafting intuitive and beautiful user interfaces that feel natural.",
        "Ensuring every single component is pixel-perfect and accessible.",
        "Designing smooth micro-animations that surprise and delight users.",
        "Mapping out seamless user journeys to minimize any friction.",
        "Translating complex intelligence into clear, visual dashboards.",
        "Bringing genuine empathy to every digital experience we design."
      ]
    },
    {
      name: "Arpit Sharma",
      role: "Data Analyst & Business",
      image: "/images/team/arpit.jpg",
      color: "var(--navy-deep)",
      badgeColor: "var(--coral)", // Theme Orange
      badgeText: "black",
      highlights: [
        "Translating raw field survey data into actionable human stories.",
        "Forging strong, lasting partnerships with on-the-ground NGOs.",
        "Building intelligent metric dashboards that actually make sense.",
        "Checking and ensuring every piece of data is perfectly validated.",
        "Bridging the gap between field operations and strategic reporting.",
        "Identifying critical trends to help improve platform focus."
      ]
    }
  ];

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh', padding: '120px 5% 80px' }}>
      
      {/* MODERN HERO SECTION */}
      <section style={{ textAlign: 'center', marginBottom: '100px' }}>
         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
               <ShieldCheck size={18} color="var(--coral)" />
               <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--coral)', letterSpacing: '4px' }}>MISSION LEADERSHIP</span>
            </div>
            <h1 className="samarkan-title" style={{ fontSize: 'clamp(36px, 6vw, 68px)', marginBottom: '24px', color: 'var(--navy-deep)' }}>
              Vasudhaiva Kutumbakam
            </h1>
            <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '18px', color: 'var(--text-mid)', fontWeight: 500, lineHeight: 1.6 }}>
               Meet the architects of the Sahayogi-Intelligence-Platform. We bridge the gap between high-level intelligence and grassroots execution.
            </p>
         </motion.div>
      </section>

      {/* ULTRA-MODERN MEMBER GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '48px', maxWidth: '1300px', margin: '0 auto' }}>
         {members.map((m, idx) => (
           <motion.div 
             key={idx} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.15, duration: 0.8 }}
             whileHover={{ y: -12 }}
             className="card-premium" 
             style={{ 
               padding: '48px 32px', textAlign: 'center', background: 'white', position: 'relative',
               overflow: 'hidden', border: '1px solid rgba(0,0,0,0.02)'
             }}
           >
              {/* Background Accent Gradient */}
              <div style={{ 
                position: 'absolute', top: '-10%', right: '-10%', width: '160px', height: '160px', 
                background: m.color, opacity: 0.05, filter: 'blur(50px)', borderRadius: '50%' 
              }} />

              <div style={{ marginBottom: '40px', position: 'relative', display: 'inline-block' }}>
                 <div style={{ position: 'absolute', inset: -15, border: '1px dashed' + (m.color + '44'), borderRadius: '50%', animation: 'spin 12s linear infinite' }} />
                 <div style={{ 
                   width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '5px solid white', 
                   boxShadow: 'var(--shadow-lg)', position: 'relative', zIndex: 2, background: 'var(--off-white)' 
                 }}>
                    <img 
                      src={m.image} alt={m.name} 
                      style={{ 
                        width: '100%', height: '100%', 
                        objectFit: 'cover', 
                        objectPosition: 'top center', // PRIORITIZE THE HEAD
                        transition: 'transform 0.5s ease'
                      }} 
                    />
                 </div>
                 <div style={{ position: 'absolute', bottom: 5, right: 5, zIndex: 3, background: 'var(--navy-deep)', padding: '8px', borderRadius: '50%', color: 'var(--gold)', boxShadow: 'var(--shadow-sm)' }}>
                    <Award size={18} />
                 </div>
              </div>

              <h3 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '8px' }}>{m.name}</h3>
              <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: '50px', background: m.badgeColor, color: m.badgeText, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '36px' }}>
                 {m.role}
              </div>

              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--off-white)', padding: '28px', borderRadius: '24px' }}>
                 {m.highlights.map((h, i) => (
                   <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-mid)', lineHeight: 1.4 }}>{h}</span>
                   </div>
                 ))}
              </div>
           </motion.div>
         ))}
      </div>

      {/* VISION STATEMENT */}
      <section style={{ marginTop: '120px', textAlign: 'center' }}>
         <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 40px', background: 'var(--navy-deep)', borderRadius: '48px', position: 'relative', overflow: 'hidden' }}>
               <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.08, backgroundImage: 'url("/images/community-work.jpg")', backgroundSize: 'cover' }} />
               <Zap size={48} color="var(--gold)" style={{ marginBottom: '32px', position: 'relative' }} />
               <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white', lineHeight: 1.4, margin: '0 0 24px', position: 'relative' }}>
                 "In the community. <br/> By the community. <br/> For the community."
               </h2>
               <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', fontWeight: 500, margin: 0, position: 'relative' }}>
                 Engaging grassroots intelligence to empower national change.
               </p>
            </div>
         </motion.div>
      </section>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
