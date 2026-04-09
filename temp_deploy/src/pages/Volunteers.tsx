import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MapPin, ShieldCheck, Search, Filter, 
  Phone, Star, Activity, Plus, CheckCircle2,
  XCircle, Award, Briefcase, Zap, Languages,
  Waves, Mountain, Sun, HeartHandshake, Mail, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bulkVolunteers } from '../data/bulk_entities';

const REGION_LANGUAGE_MAP: Record<string, { lang: string, icon: React.FC<any>, color: string }> = {
  'Andhra Pradesh': { lang: 'Telugu', icon: Waves, color: '#0ea5e9' },
  'Telangana': { lang: 'Telugu', icon: Waves, color: '#0ea5e9' },
  'Maharashtra': { lang: 'Marathi', icon: Star, color: '#eab308' },
  'Gujarat': { lang: 'Gujarati', icon: Award, color: '#f97316' },
  'Tamil Nadu': { lang: 'Tamil', icon: Sun, color: '#f59e0b' },
  'Kerala': { lang: 'Malayalam', icon: Waves, color: '#10b981' },
  'Karnataka': { lang: 'Kannada', icon: Mountain, color: '#8b5cf6' },
  'Punjab': { lang: 'Punjabi', icon: Zap, color: '#eab308' },
  'West Bengal': { lang: 'Bengali', icon: HeartHandshake, color: '#ec4899' },
  'Odisha': { lang: 'Odia', icon: MapPin, color: '#f43f5e' },
  'default': { lang: 'Hindi / Regional', icon: Languages, color: '#64748b' }
};

const INDIA_STATES_UTS = [
  'All Locations', 'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

interface Volunteer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  district: string;
  full_address?: string;
  skills: string[];
  available_today: boolean;
  reliability_score: number;
}

export const Volunteers: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('All Locations');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    const fetchVolunteers = async () => {
      setLoading(true);
      const [{ data: vData }, { data: nData }] = await Promise.all([
        supabase.from('volunteers').select('*'),
        supabase.from('ngos').select('*')
      ]);

      let combined: Volunteer[] = [];
      if (vData) combined = [...combined, ...vData];

      if (nData) {
        const mappedNGOs = nData.map(n => ({
          id: n.id,
          name: (n.name && n.name.length > 50 ? n.name.substring(0, 50) + '...' : n.name) + ' [NGO]',
          phone: n.link || 'Web Link',
          email: 'Institutional Contact',
          district: n.location || 'All Locations',
          full_address: n.clean_description || n.description,
          skills: n.skills || ['Logistics', 'Fundraising', 'Coordination'],
          available_today: true,
          reliability_score: 95
        }));
        combined = [...combined, ...mappedNGOs];
      }

      // Merge bulk volunteers
      bulkVolunteers.forEach(bv => {
        if (!combined.some(v => v.name.toLowerCase() === bv.name.toLowerCase())) {
          combined.push({
            id: `bulk-${bv.id}`,
            name: bv.name,
            phone: bv.phone,
            email: bv.email,
            district: bv.region,
            full_address: bv.location,
            skills: bv.skills,
            available_today: true,
            reliability_score: bv.rating * 20 // Convert 5 scale to 100 scale
          });
        }
      });

      const sorted = combined.sort((a, b) => {
        const aComplete = (a.phone && a.email && a.full_address) ? 1 : 0;
        const bComplete = (b.phone && b.email && b.full_address) ? 1 : 0;
        if (aComplete !== bComplete) return bComplete - aComplete;
        return b.reliability_score - a.reliability_score;
      });
      setVolunteers(sorted);
      setLoading(false);
    };

    fetchVolunteers();
  }, []);

  const filtered = volunteers.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.phone.includes(search);
    const matchDistrict = district === 'All Locations' || v.district === district;
    const matchAvailability = !availableOnly || v.available_today;
    return matchSearch && matchDistrict && matchAvailability;
  });

  const availableCount = volunteers.filter(v => v.available_today).length;
  const highReliabilityCount = volunteers.filter(v => v.reliability_score > 80).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', padding: '120px 5% 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
         <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
               <Users size={18} color="var(--navy-mid)" />
               <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--navy-mid)', letterSpacing: '2px' }}>FORCE REGISTRY</span>
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: 900, margin: 0, color: 'transparent', background: 'linear-gradient(135deg, var(--navy-deep) 0%, var(--brand-blue) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>Volunteer Management</h1>
         </div>
         <button 
           onClick={() => navigate('/volunteers/register')}
           className="btn btn-coral" 
           style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
         >
           <Plus size={18} /> REGISTER FIELD AGENT
         </button>
      </div>

      {/* STAT STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="card-premium" style={{ padding: '24px', background: 'white', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '4px solid var(--brand-blue)' }}>
           <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(37, 43, 107, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Users size={24} color="var(--navy-deep)" />
           </div>
           <div>
             <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--navy-deep)' }}>250,560+</div>
             <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '1px' }}>GLOBAL READY FORCE</div>
           </div>
        </div>
        
        <div className="card-premium" style={{ padding: '24px', background: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
           <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(37, 43, 107, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <ShieldCheck size={24} color="var(--navy-mid)" />
           </div>
           <div>
             <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--navy-deep)' }}>{volunteers.length}</div>
             <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '1px' }}>REGISTRY ENROLLED</div>
           </div>
        </div>

        <div className="card-premium" style={{ padding: '24px', background: 'white', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '4px solid #22c55e' }}>
           <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Activity size={24} color="#16a34a" />
           </div>
           <div>
             <div style={{ fontSize: '28px', fontWeight: 900, color: '#16a34a' }}>{availableCount}</div>
             <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '1px' }}>AVAILABLE TODAY</div>
           </div>
        </div>

        <div className="card-premium" style={{ padding: '24px', background: 'white', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '4px solid var(--gold)' }}>
           <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Award size={24} color="var(--gold-dark)" />
           </div>
           <div>
             <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--gold-dark)' }}>{highReliabilityCount}</div>
             <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '1px' }}>ELITE RELIABILITY (&gt;80)</div>
           </div>
        </div>
        
        <div className="card-premium" style={{ padding: '24px', background: 'var(--navy-deep)', display: 'flex', alignItems: 'center', gap: '20px' }}>
           <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Zap size={24} color="var(--coral)" />
           </div>
           <div>
             <div style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '4px', lineHeight: 1.2 }}>Operational<br/>Readiness</div>
             <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{(volunteers.length > 0 ? (availableCount / volunteers.length) * 100 : 0).toFixed(0)}% Active Force</div>
           </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="card-premium" style={{ padding: '20px', background: 'white', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="var(--text-mid)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC', fontWeight: 600 }}
          />
        </div>
        
        <div style={{ width: '240px', position: 'relative' }}>
          <MapPin size={18} color="var(--text-mid)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <select 
            value={district} onChange={e => setDistrict(e.target.value)}
            style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC', fontWeight: 600, appearance: 'none' }}
          >
            {INDIA_STATES_UTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <button 
          onClick={() => setAvailableOnly(!availableOnly)}
          style={{ 
            padding: '14px 20px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
            background: availableOnly ? 'var(--navy-deep)' : '#F8FAFC',
            color: availableOnly ? 'white' : 'var(--text-mid)',
            display: 'flex', alignItems: 'center', gap: '8px', border: availableOnly ? '2px solid var(--navy-deep)' : '2px solid rgba(0,0,0,0.05)'
          }}
        >
          <Filter size={18} /> {availableOnly ? 'AVAILABLE ONLY' : 'ALL STATUSES'}
        </button>
      </div>

      {/* VOLUNTEER GRID */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card-premium" style={{ height: '220px', background: 'white', animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-premium" style={{ padding: '80px', textAlign: 'center', background: 'white' }}>
          <ShieldCheck size={48} color="var(--navy-mid)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '20px', color: 'var(--navy-deep)', marginBottom: '8px' }}>No Force Members Found</h3>
          <p style={{ color: 'var(--text-mid)' }}>Try adjusting your filters or recruit new volunteers.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          <AnimatePresence>
            {filtered.map((v, i) => {
              const langInfo = REGION_LANGUAGE_MAP[v.district] || REGION_LANGUAGE_MAP['default'];
              const LangIcon = langInfo.icon;
              const isComplete = v.phone && v.email && v.full_address;

              return (
              <motion.div 
                key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                className="card-premium" style={{ background: 'white', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: isComplete ? '2px solid var(--gold)' : 'none' }}
              >
                {/* Header Strip */}
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--navy-deep)', margin: 0 }}>{v.name}</h3>
                      {isComplete && (
                        <div style={{ padding: '2px 6px', background: 'var(--gold)', color: 'white', borderRadius: '4px', fontSize: '9px', fontWeight: 900, letterSpacing: '1px' }}>
                          VERIFIED
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-mid)', fontWeight: 600, marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {v.phone || 'No Phone'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {v.email || 'No Email'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    {v.available_today ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#dcfce7', color: '#16a34a', borderRadius: '50px', fontSize: '10px', fontWeight: 800 }}>
                        <CheckCircle2 size={12} /> ON DUTY
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#f1f5f9', color: '#64748b', borderRadius: '50px', fontSize: '10px', fontWeight: 800 }}>
                        <XCircle size={12} /> RESTING
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: `${langInfo.color}15`, color: langInfo.color, borderRadius: '6px', fontSize: '10px', fontWeight: 800 }}>
                      <LangIcon size={12} /> {langInfo.lang}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--navy-mid)', fontSize: '13px', fontWeight: 700 }}>
                      <MapPin size={16} /> District: {v.district}
                    </div>
                    {v.reliability_score >= 80 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold-dark)', fontSize: '11px', fontWeight: 800 }}>
                        <ShieldCheck size={14} /> ELITE
                      </div>
                    )}
                  </div>

                  {v.full_address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: 'var(--text-mid)', fontWeight: 500, marginBottom: '16px', lineHeight: 1.4 }}>
                      <Home size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> 
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.full_address}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                     <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-mid)' }}>RELIABILITY</div>
                     <div style={{ flex: 1, height: '6px', background: '#F8FAFC', borderRadius: '10px', overflow: 'hidden' }}>
                       <div style={{ 
                         height: '100%', 
                         width: `${v.reliability_score}%`, 
                         background: v.reliability_score >= 80 ? 'var(--gold)' : v.reliability_score >= 50 ? 'var(--navy-mid)' : 'var(--coral)',
                         borderRadius: '10px'
                       }} />
                     </div>
                     <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--navy-deep)' }}>{v.reliability_score}</div>
                  </div>

                  <div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px' }}>
                       <Briefcase size={12} /> VERIFIED SKILLS
                     </div>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {v.skills && v.skills.map(s => (
                          <span key={s} style={{ padding: '4px 10px', background: 'rgba(37, 43, 107, 0.05)', color: 'var(--navy-mid)', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                            {s}
                          </span>
                        ))}
                     </div>
                  </div>
                </div>
              </motion.div>
            )})}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
