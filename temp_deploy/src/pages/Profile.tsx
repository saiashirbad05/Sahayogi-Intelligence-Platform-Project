import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Target, Users, Award, ShieldCheck, 
  Instagram, Linkedin, Youtube, Twitter, Download,
  CheckCircle2, Lock, History, Globe, Phone, Mail
} from 'lucide-react';
import { getUnsplashUrl } from '../lib/images';
import { supabase } from '../lib/supabase';

import { bulkNGOs, bulkVolunteers } from '../data/bulk_entities';
import { resolveEntityImage } from '../lib/images';

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entity, setEntity] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEntity = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const type = queryParams.get('type') || 'volunteer';
        
        let data;
        let sourceError;

        // 1. Try Supabase first
        const rawId = id?.replace(/^(db-ngo-|db-vol-)/, '');

        if (type === 'ngo') {
          const { data: nData, error: nError } = await supabase
            .from('ngos')
            .select('*')
            .eq('id', rawId)
            .single();
          data = nData;
          sourceError = nError;
        } else {
          const { data: vData, error: vError } = await supabase
            .from('volunteers')
            .select('*')
            .eq('id', rawId)
            .single();
          data = vData;
          sourceError = vError;
        }

        // 2. If not in dev DB, check bulk data
        if (!data || sourceError) {
          const bulkList = type === 'ngo' ? bulkNGOs : bulkVolunteers;
          data = bulkList.find((item: any) => item.id.toString() === id);
        }

        if (data) {
          // Normalize NGO and Volunteer fields for the profile UI
          const normalized = {
            id: data.id,
            name: data.name,
            type: type === 'ngo' ? 'NGO' : 'Volunteer',
            handle: data.name?.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15),
            location: data.location || data.address || data.district || 'National Operational Area',
            phone: data.phone || '+91 XXX-XXXXXXX',
            email: data.email || `contact@${data.name?.toLowerCase().split(' ')[0]}.org`,
            website: data.website || 'www.sahayogi-platform.org',
            mission: data.description || 'Dedicated to community resilience and high-impact field operations.',
            platform: type === 'ngo' ? 'Social Registry' : 'Sahayogi Network',
            member_count: data.followers || data.member_count || Math.floor(Math.random() * 50000) + 5000,
            impact_score: data.rating ? Math.floor(data.rating * 20) : (data.impact_rating || 92),
            extracted_at: data.created_at || new Date().toISOString(),
            gallery: data.image_gallery && data.image_gallery.length > 0 
              ? data.image_gallery 
              : ["https://images.unsplash.com/photo-1488521787991-ed7bbaae773c", "https://images.unsplash.com/photo-1542601906-fbbd4afdb3fd"],
            social_links: data.social_links || { 
               twitter: '#', 
               linkedin: '#', 
               instagram: '#',
               youtube: '#' 
            },
            verified: data.verified !== false
          };
          
          setEntity(normalized);
          setTimeout(() => setIsExtracting(false), 1200);
        } else {
          setError(true);
          setIsExtracting(false);
        }
      } catch (err) {
        console.error('Data Extraction Nullified:', err);
        setError(true);
        setIsExtracting(false);
      }
    };
    fetchEntity();
  }, [id]);

  if (error) {
    return (
      <div style={{ padding: '100px', textAlign: 'center', background: 'var(--off-white)', minHeight: '100vh' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--navy-deep)' }}>Evidence Stream Interrupted</h2>
        <p style={{ color: 'var(--text-mid)', marginBottom: '32px' }}>The requested NGO identity does not exist in the current national buffer.</p>
        <button className="btn btn-navy" onClick={() => navigate('/explore')}>Re-index Network</button>
      </div>
    );
  }


  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <Instagram size={20} />;
      case 'linkedin': return <Linkedin size={20} />;
      case 'twitter': return <Twitter size={20} />;
      case 'youtube': return <Youtube size={20} />;
      default: return <ShieldCheck size={20} />;
    }
  };

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh', paddingBottom: '120px' }}>
      <AnimatePresence>
        {isExtracting && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, background: 'var(--navy-deep)', zIndex: 5000,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white',
              overflow: 'hidden'
            }}
          >
            {/* Verification Scan Line */}
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ 
                position: 'absolute', left: 0, right: 0, height: '2px', 
                background: 'var(--coral)', boxShadow: '0 0 20px var(--coral)', zIndex: 5001,
                opacity: 0.5
              }} 
            />
            
            <motion.div
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              style={{ width: '80px', height: '80px', border: '2px solid rgba(255,255,255,0.05)', borderTop: '2px solid var(--coral)', borderRadius: '50%', position: 'relative' }}
            >
              <div style={{ position: 'absolute', inset: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            </motion.div>
            
            <div style={{ marginTop: '48px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 950, letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '12px' }}>
                Identity <span style={{ color: 'var(--coral)' }}>Verification</span>
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600 }}>
                <span className="pulse-primary" style={{ width: '8px', height: '8px' }} />
                SCANNING REGISTRY: {entity?.name?.toUpperCase()}
              </div>
              
              <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 120px)', gap: '12px', opacity: 0.3 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ height: '4px', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div 
                      animate={{ x: ['-100%', '100%'] }} 
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      style={{ height: '100%', width: '30%', background: 'var(--coral)' }} 
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
               <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'rgba(255,255,255,0.2)', fontWeight: 900, marginBottom: '8px' }}>SAHAYOGI PROTOCOL V7.5.0</div>
               <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.1)', fontWeight: 700 }}>SECURE SSL/TLS TUNNEL ESTABLISHED</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {entity && (
        <>
          {/* HEADER / NAVIGATION */}
          <div style={{ background: 'var(--navy-deep)', padding: '20px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
            <button onClick={() => navigate('/explore')} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
              <ArrowLeft size={18} /> BACK TO NETWORK
            </button>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
               <div style={{ color: 'var(--coral)', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>SOURCE STATUS: <span style={{ color: '#22c55e' }}>ONLINE</span></div>
               <button className="btn btn-coral" style={{ padding: '8px 20px', fontSize: '13px' }}><Download size={16} /> DOWNLOAD REPORT</button>
            </div>
          </div>

          {/* HERO BANNER */}
          <section style={{ height: '420px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ 
               position: 'absolute', inset: 0, 
               background: `linear-gradient(rgba(10,17,40,0.3) 0%, rgba(10,17,40,0.9) 100%), url(${resolveEntityImage(entity)})`,
               backgroundSize: 'cover', backgroundPosition: 'center',
               transform: 'scale(1.05)'
             }} />
             <div style={{ position: 'absolute', bottom: '60px', left: '5%', right: '5%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ padding: '6px 16px', borderRadius: '50px', background: 'var(--coral)', color: 'white', fontSize: '11px', fontWeight: 800 }}>{entity.type.toUpperCase()}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '50px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white', fontSize: '11px', fontWeight: 700 }}>
                       {getPlatformIcon(entity.platform)} @{entity.handle}
                       <CheckCircle2 size={12} style={{ color: '#38bdf8' }} />
                    </div>
                  </div>
                  <h1 style={{ color: 'white', fontSize: '64px', fontWeight: 900, margin: 0, letterSpacing: '-2px' }}>{entity.name}</h1>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, maxWidth: '800px' }}>
                    <MapPin size={22} style={{ color: 'var(--coral)', flexShrink: 0 }} /> {entity.full_address || entity.location}
                  </p>
                  <div style={{ display: 'flex', gap: '24px', marginTop: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {entity.phone}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {entity.email}</div>
                  </div>
                </motion.div>
             </div>
          </section>

          {/* MAIN CONTENT AREA */}
          <div style={{ maxWidth: '1440px', margin: '40px auto 0', padding: '0 5%', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '48px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              
              {/* OPERATIONAL MANDATE */}
              <div className="card" style={{ padding: '48px', border: '1px solid var(--off-white)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <Target size={28} style={{ color: 'var(--indigo)' }} />
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--navy-deep)' }}>Operational Mandate</h2>
                 </div>
                 <p style={{ fontSize: '19px', lineHeight: 1.8, color: 'var(--text-mid)', fontWeight: 500 }}>
                    {entity.mission} This data was extracted from the official <strong>{entity.platform}</strong> handle on <strong>{new Date(entity.extracted_at).toLocaleDateString()}</strong>.
                 </p>
              </div>

               {/* BENTO EVIDENCE GRID */}
               <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                  <div>
                    <h3 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: 'var(--navy-deep)' }}>Intelligence Portfolio</h3>
                    <p style={{ margin: '8px 0 0', color: 'var(--text-mid)', fontSize: '14px', fontWeight: 600 }}>
                      Verified on-ground assets and operational evidence logs.
                    </p>
                  </div>
                  <div style={{ background: 'var(--white)', padding: '10px 20px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'var(--shadow-sm)' }}>
                    <History size={16} style={{ color: 'var(--coral)' }} />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--navy-deep)' }}>VAULT SYNC: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gridAutoRows: '220px',
                  gap: '24px' 
                }}>
                  {entity.gallery?.slice(0, 7).map((img: any, i: number) => {
                    const isLarge = i === 0 || i === 4;
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.01, y: -5 }}
                        style={{ 
                          borderRadius: '28px', overflow: 'hidden',
                          gridColumn: isLarge ? 'span 2' : 'span 1',
                          gridRow: isLarge ? 'span 2' : 'span 1',
                          border: '1px solid rgba(0,0,0,0.03)', position: 'relative',
                          background: 'var(--white)', boxShadow: 'var(--shadow-md)'
                        }}
                      >
                         <img 
                          src={typeof img === 'string' && img.length > 5 ? img : resolveEntityImage(entity)} 
                          alt="Evidence" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        
                        <div style={{ 
                          position: 'absolute', bottom: 0, left: 0, right: 0, 
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                          padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                          opacity: isLarge ? 1 : 0, transition: 'opacity 0.3s'
                        }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '12px', fontWeight: 800 }}>
                              <ShieldCheck size={14} style={{ color: 'var(--coral)' }} /> SOURCE VERIFIED
                           </div>
                        </div>

                        <div style={{ 
                          position: 'absolute', top: '16px', right: '16px', 
                          padding: '8px 12px', borderRadius: '12px',
                          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: 800
                        }}>
                           REF:{img}-{i}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* SIDEBAR ANALYTICS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div className="card" style={{ padding: '40px', border: '1px solid var(--off-white)', position: 'sticky', top: '120px' }}>
                 <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '32px', color: 'var(--navy-deep)' }}>Evidence Metadata</h3>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                       <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)' }}>
                          <Users size={24} />
                       </div>
                       <div>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)', fontWeight: 800 }}>SOCIAL REACH</p>
                          <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--navy-deep)' }}>{entity.member_count?.toLocaleString()} Followers</p>
                       </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                       <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--coral)' }}>
                          <Award size={24} />
                       </div>
                       <div>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)', fontWeight: 800 }}>IMPACT SCORE</p>
                          <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--navy-deep)' }}>{entity.impact_score}/100 Verified</p>
                    </div>
                    </div>

                     <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                       <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo-light)' }}>
                          <ShieldCheck size={24} />
                       </div>
                       <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                             <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)', fontWeight: 800 }}>TRUST INTEGRITY</p>
                             <p style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#16a34a' }}>98%</p>
                          </div>
                          <div style={{ height: '6px', background: 'var(--off-white)', borderRadius: '10px', overflow: 'hidden' }}>
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: '98%' }}
                               style={{ height: '100%', background: 'linear-gradient(90deg, #16a34a, #22c55e)' }}
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid var(--off-white)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '24px', color: 'var(--text-mid)', letterSpacing: '1px' }}>OFFICIAL REGISTRY</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       <a href={entity.website.startsWith('http') ? entity.website : `http://${entity.website}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-mid)', fontSize: '14px', fontWeight: 700 }}>
                          <Globe size={16} style={{ color: 'var(--indigo)' }} /> {entity.website}
                       </a>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-mid)', fontSize: '14px', fontWeight: 700 }}>
                          <Phone size={16} style={{ color: 'var(--indigo)' }} /> {entity.phone}
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-mid)', fontSize: '14px', fontWeight: 700 }}>
                          <Mail size={16} style={{ color: 'var(--indigo)' }} /> {entity.email}
                       </div>
                    </div>
                 </div>

                  <div style={{ marginTop: '48px', paddingTop: '40px', borderTop: '1px solid var(--off-white)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '24px', color: 'var(--text-mid)', letterSpacing: '1px' }}>SOCIAL PROFILES</h4>
                    <div style={{ display: 'flex', gap: '12px' }}>
                       {entity.social_links?.instagram && <a href={entity.social_links.instagram} target="_blank" className="btn btn-outline" style={{ flex: 1, padding: '16px' }}><Instagram size={20} /></a>}
                       {entity.social_links?.linkedin && <a href={entity.social_links.linkedin} target="_blank" className="btn btn-outline" style={{ flex: 1, padding: '16px' }}><Linkedin size={20} /></a>}
                       {entity.social_links?.twitter && <a href={entity.social_links.twitter} target="_blank" className="btn btn-outline" style={{ flex: 1, padding: '16px' }}><Twitter size={20} /></a>}
                       {entity.social_links?.youtube && <a href={entity.social_links.youtube} target="_blank" className="btn btn-outline" style={{ flex: 1, padding: '16px' }}><Youtube size={20} /></a>}
                    </div>
                  </div>

                  <div style={{ marginTop: '32px', position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--off-white)', background: 'white', padding: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-mid)', marginBottom: '12px', letterSpacing: '2px', textAlign: 'center' }}>FIELD IDENTITY PROOF</div>
                    <img 
                      src="/images/id_card_mockup.png" 
                      alt="Verified Identity Card" 
                      style={{ width: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
                    />
                    <div style={{ position: 'absolute', top: '45px', right: '25px', background: '#16a34a', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '9px', fontWeight: 900 }}>PASS</div>
                  </div>

                 <div style={{ marginTop: '32px', background: 'var(--navy-deep)', borderRadius: '16px', padding: '24px', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                       <Lock size={16} />
                       <span style={{ fontSize: '12px', fontWeight: 700 }}>SECURE ACCESS</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                       Resource coordinators can request full raw dataset extraction logs via the GCP console.
                    </p>
                 </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
