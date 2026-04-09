import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { matchVolunteersToTask } from '../lib/volunteerEngine';
import { sendSMS } from '../lib/sms';
import { ShieldCheck, BrainCircuit, Users, Send, CheckCircle, ArrowLeft, Loader2, UserCheck, MapPin, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

const INDIA_STATES_UTS = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const TaskManage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  
  // Tabs: 'create' | 'manage' | 'matches'
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'matches'>('manage');
  
  // State for the matching interface
  const [reviewingTask, setReviewingTask] = useState<any>(null);
  const [suggestedMatches, setSuggestedMatches] = useState<any[]>([]);
  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({
    title: '', description: '', village: '', block: '', district: INDIA_STATES_UTS[0],
    category: 'food', skills_required: 'General Relief', urgency: 2, volunteers_needed: 3
  });

  // Pre-fill from URL params
  useEffect(() => {
    const d = searchParams.get('district');
    const c = searchParams.get('category');
    if (d || c) {
      setForm(prev => ({
        ...prev,
        district: d && INDIA_STATES_UTS.includes(d) ? d : prev.district,
        category: c || prev.category
      }));
      setActiveTab('create');
    }
  }, [searchParams]);

  const loadTasks = async () => {
    const { data } = await supabase.from('tasks').select('*, task_matches(*, volunteers(*))').order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  useEffect(() => {
    if (activeTab === 'manage') loadTasks();
  }, [activeTab]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('tasks').insert({
        ...form,
        task_date: new Date().toISOString().split('T')[0],
        status: 'open',
        created_by_ngo: 'HQ'
      });
      setForm({ title: '', description: '', village: '', block: '', district: INDIA_STATES_UTS[0], category: 'food', skills_required: 'General Relief', urgency: 2, volunteers_needed: 3 });
      setActiveTab('manage');
    } finally {
      setLoading(false);
    }
  };

  const handleComputeMatches = async (task: any) => {
    setLoading(true);
    try {
      // 1. Ask Gemini to match
      const success = await matchVolunteersToTask(task.id);
      if (!success) {
         alert('Gemini could not find suitable matches or no volunteers available in district.');
         return;
      }

      // 2. Fetch the newly computed matches from DB
      const { data: matches } = await supabase
        .from('task_matches')
        .select(`
          id, volunteer_phone, match_score, gemini_reason, status,
          volunteers ( name, district, skills, available_today, reliability_score )
        `)
        .eq('task_id', task.id)
        .order('match_score', { ascending: false });

      if (matches) {
         setReviewingTask(task);
         setSuggestedMatches(matches);
         setActiveTab('matches');
         setSelectedMatchIds(new Set(matches.map(m => m.id))); // Auto-select all by default
      }
    } catch (err: any) {
      alert('Matching computation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchSMS = async () => {
    if (selectedMatchIds.size === 0) return;
    setLoading(true);
    
    let successCount = 0;
    let failCount = 0;

    try {
      for (const matchId of Array.from(selectedMatchIds)) {
        const match = suggestedMatches.find(m => m.id === matchId);
        if (!match) continue;

        const token = crypto.randomUUID();
        
        // Insert Confirmation Token
        await supabase.from('confirmation_tokens').insert({
          task_id: reviewingTask.id,
          volunteer_phone: match.volunteer_phone,
          token: token,
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        });

        const confirmUrl = `${import.meta.env.VITE_BASE_URL || window.location.origin}/volunteers/status?token=${token}`;
        const msg = `SAHAYOGI ALERT: Urgent relief task in your district. You've been selected. Please click to accept: ${confirmUrl}`;
        
        try {
          await sendSMS(match.volunteer_phone, msg);
          
          await supabase.from('task_matches')
            .update({ status: 'notified' })
            .eq('id', match.id);
            
          successCount++;
        } catch (smsErr) {
          console.error(`SMS failed for ${match.volunteer_phone}:`, smsErr);
          failCount++;
        }
      }

      if (failCount > 0) {
        alert(`Dispatched to ${successCount} volunteers. But ${failCount} SMS deliveries failed.`);
      } else {
        alert('All selected volunteers have been notified successfully via Fast2SMS.');
      }
      
      setReviewingTask(null);
      setSuggestedMatches([]);
      setActiveTab('manage');
    } catch (err: any) {
      alert('A critical error occurred during dispatch.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMatchSelection = (id: string) => {
    const newReqs = new Set(selectedMatchIds);
    if (newReqs.has(id)) newReqs.delete(id);
    else newReqs.add(id);
    setSelectedMatchIds(newReqs);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', padding: '120px 5% 60px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        {activeTab !== 'matches' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', color: 'var(--navy-deep)', letterSpacing: '-1px' }}>Mission Control</h1>
              <p style={{ color: 'var(--text-mid)', fontSize: '16px', margin: 0 }}>Coordinate urgent tasks and let Sahayogi Gemini handle matching logic.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '6px', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <button onClick={() => setActiveTab('manage')} className={`btn ${activeTab === 'manage' ? 'btn-navy' : ''}`} style={{ padding: '10px 24px', background: activeTab !== 'manage' ? 'transparent' : '', color: activeTab !== 'manage' ? 'var(--navy-mid)' : '' }}>Active Missions</button>
              <button onClick={() => setActiveTab('create')} className={`btn ${activeTab === 'create' ? 'btn-navy' : ''}`} style={{ padding: '10px 24px', background: activeTab !== 'create' ? 'transparent' : '', color: activeTab !== 'create' ? 'var(--navy-mid)' : '' }}>+ Draft Task</button>
            </div>
          </div>
        )}

        {/* CREATE TASK TAB */}
        {activeTab === 'create' && (
           <form onSubmit={handleCreate} className="card-premium" style={{ padding: '40px' }}>
             <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', color: 'var(--navy-deep)' }}>Draft New Intervention</h3>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Mission Title</label>
                  <input required name="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="form-input" placeholder="e.g. Relief Camp Setup at Pipili" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC' }} />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 block">State / Union Territory Focus</label>
                  <select name="district" value={form.district} onChange={e => setForm({...form, district: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC', fontWeight: 600, appearance: 'none' }}>
                    {INDIA_STATES_UTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Urgency Level (1-3)</label>
                  <select name="urgency" value={form.urgency} onChange={e => setForm({...form, urgency: parseInt(e.target.value)})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC', fontWeight: 600 }}>
                    <option value={1}>1 - Routine Follow-up</option>
                    <option value={2}>2 - Standard Relief</option>
                    <option value={3}>3 - Critical / Life-saving</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Skills Required</label>
                  <input required name="skills_required" value={form.skills_required} onChange={e => setForm({...form, skills_required: e.target.value})} className="form-input" placeholder="e.g. Logistics, Medical" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC' }} />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Volunteers Needed</label>
                  <input required type="number" min="1" max="50" name="volunteers_needed" value={form.volunteers_needed} onChange={e => setForm({...form, volunteers_needed: parseInt(e.target.value)})} className="form-input" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Mission Briefing</label>
                  <textarea required name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC' }} />
                </div>
             </div>
             <button type="submit" disabled={loading} className="btn btn-navy" style={{ width: '100%', padding: '18px' }}>
                {loading ? 'Booting Mission...' : 'Create Mission Draft'}
             </button>
           </form>
        )}

        {/* MANAGE TAB */}
        {activeTab === 'manage' && (
           <div style={{ display: 'grid', gap: '20px' }}>
             {tasks.map(task => {
               const matches = task.task_matches || [];
               const hasMatches = matches.length > 0;
               const pending = matches.filter((m:any) => m.status === 'pending' || m.status === 'notified').length;
               const confirmed = matches.filter((m:any) => m.status === 'confirmed').length;

               return (
                 <div key={task.id} className="card-premium" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: task.urgency === 3 ? '4px solid #ef4444' : task.status === 'completed' ? '4px solid #10b981' : '4px solid var(--navy-deep)' }}>
                   <div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                       <span style={{ fontSize: '10px', fontWeight: 900, background: task.status === 'open' ? '#f59e0b20' : '#10b98120', color: task.status === 'open' ? '#f59e0b' : '#10b981', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>{task.status}</span>
                       <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-mid)' }}>{task.district}</span>
                     </div>
                     <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 8px', color: 'var(--navy-deep)' }}>{task.title}</h3>
                     <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-mid)', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> {task.skills_required}</span>
                        {hasMatches && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: confirmed >= task.volunteers_needed ? '#16a34a' : 'var(--navy-mid)' }}>
                            <Users size={14} /> {confirmed} / {task.volunteers_needed} Confirmed
                          </span>
                        )}
                     </div>
                   </div>

                   <div style={{ textAlign: 'right' }}>
                      {!hasMatches ? (
                        <button 
                          onClick={() => handleComputeMatches(task)}
                          disabled={loading}
                          className="btn" 
                          style={{ background: 'var(--coral)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', boxShadow: '0 4px 12px rgba(232, 105, 60, 0.2)' }}
                        >
                         {loading ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />} Compute Matches
                        </button>
                      ) : task.status === 'open' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                           <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--coral)', display: 'flex', alignItems: 'center', gap: '4px' }}><Send size={12} /> {pending} ALERTS PENDING</span>
                           <span style={{ fontSize: '10px', color: 'var(--text-mid)' }}>Awaiting confirmations.</span>
                           {pending > 0 && confirmed < task.volunteers_needed && (
                             <button style={{ background: 'none', border: 'none', color: 'var(--navy-mid)', fontSize: '10px', fontWeight: 800, textDecoration: 'underline', marginTop: '4px', cursor: 'pointer' }}>Fetch Backups</button>
                           )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={16} /> Closed</span>
                      )}
                   </div>
                 </div>
               );
             })}
             {tasks.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-mid)' }}>No active missions logged.</p>}
           </div>
        )}

        {/* HUMAN-IN-THE-LOOP MATCHING INTERFACE */}
        {activeTab === 'matches' && reviewingTask && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium" style={{ background: 'white', overflow: 'hidden' }}>
              <div style={{ padding: '32px', background: 'var(--navy-deep)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <button onClick={() => setActiveTab('manage')} style={{ background: 'none', border: 'none', color: 'white', opacity: 0.7, display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', marginBottom: '16px', fontSize: '12px', fontWeight: 800 }}>
                     <ArrowLeft size={16} /> BACK TO MISSIONS
                   </button>
                   <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 8px' }}>Intelligence Matches Ready</h2>
                   <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>Gemini recommends the following field agents for <strong>{reviewingTask.title}</strong>.</p>
                 </div>
                 <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px' }}>
                   <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '1px', opacity: 0.7 }}>REQUIRED AGENTS</div>
                   <div style={{ fontSize: '28px', fontWeight: 900 }}>{reviewingTask.volunteers_needed}</div>
                 </div>
              </div>

              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {suggestedMatches.map((m) => {
                  const vol = m.volunteers;
                  const isSelected = selectedMatchIds.has(m.id);
                  return (
                    <div 
                      key={m.id} 
                      onClick={() => toggleMatchSelection(m.id)}
                      style={{ 
                        border: isSelected ? '2px solid var(--coral)' : '2px solid rgba(0,0,0,0.05)',
                        background: isSelected ? 'rgba(232, 105, 60, 0.02)' : '#F8FAFC',
                        borderRadius: '16px', padding: '20px', cursor: 'pointer',
                        transition: 'all 0.2s', display: 'flex', gap: '20px', alignItems: 'center'
                      }}
                    >
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: isSelected ? 'none' : '2px solid #cbd5e1', background: isSelected ? 'var(--coral)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {isSelected && <CheckCircle size={16} color="white" />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: 'var(--navy-deep)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {vol.name} 
                            {vol.reliability_score >= 80 && <ShieldCheck size={14} color="var(--gold-dark)" />}
                          </h4>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: m.match_score >= 90 ? '#16a34a' : 'var(--navy-mid)' }}>
                            {m.match_score}% Match
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '16px' }}>
                          <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><MapPin size={12} /> {vol.district}</span>
                          {vol.skills && vol.skills.map((s:string) => <span key={s} style={{ background: 'rgba(37, 43, 107, 0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--navy-mid)' }}>{s}</span>)}
                        </div>

                        <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px', borderLeft: '3px solid var(--indigo-mid)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <Zap size={16} color="var(--indigo-mid)" style={{ marginTop: '2px' }} />
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--navy-deep)', fontWeight: 600, lineHeight: 1.5 }}>
                            {m.gemini_reason || "Selected based on proximity and operational skills."}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* STICKY DISPATCH FOOTER */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', padding: '24px 32px', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '4px' }}>SELECTED FOR DEPLOYMENT</div>
                   <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--navy-deep)' }}>{selectedMatchIds.size} Field Agents</div>
                 </div>
                 <button 
                   onClick={handleDispatchSMS}
                   disabled={loading || selectedMatchIds.size === 0}
                   className="btn btn-coral" 
                   style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '10px' }}
                 >
                   {loading ? <Loader2 className="animate-spin" size={20} /> : <UserCheck size={20} />} 
                   {loading ? 'Transmitting...' : 'CONFIRM & DISPATCH SMS'}
                 </button>
              </div>

            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </div>
  );
};
