import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertTriangle, Loader2, MapPin, Calendar, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const VolunteerStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [taskDetails, setTaskDetails] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or Missing Token. Please use the exact link sent via SMS.');
      setLoading(false);
      return;
    }

    const verifyAndLoad = async () => {
      try {
        // 1. Verify Token
        const { data: tokenData, error: tkErr } = await supabase
          .from('confirmation_tokens')
          .select('used, expires_at, task_id, volunteer_phone')
          .eq('token', token)
          .single();

        if (tkErr || !tokenData) throw new Error('Security token invalid or expired.');
        if (tokenData.used) throw new Error('This intervention link has already been used.');
        if (new Date() > new Date(tokenData.expires_at)) throw new Error('This intervention link has expired.');

        // 2. Load Task
        const { data: taskData, error: taskErr } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', tokenData.task_id)
          .single();

        if (taskErr || !taskData) throw new Error('Task no longer available.');
        
        setTaskDetails({ ...taskData, volunteer_phone: tokenData.volunteer_phone, tokenData });
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    verifyAndLoad();
  }, [token]);

  const handleConfirm = async () => {
    if (!taskDetails || !token) return;
    setLoading(true);

    try {
      // 1. Mark Token as Used
      await supabase.from('confirmation_tokens').update({ used: true }).eq('token', token);

      // 2. Update task_matches to confirmed
      await supabase
        .from('task_matches')
        .update({ status: 'confirmed' })
        .eq('task_id', taskDetails.id)
        .eq('volunteer_phone', taskDetails.volunteer_phone);
        
      // 3. Increment Volunteer total_assignments (for reliability scoring)
      const { data: vol } = await supabase.from('volunteers').select('total_assignments').eq('phone', taskDetails.volunteer_phone).single();
      if (vol) {
         await supabase.from('volunteers').update({ total_assignments: vol.total_assignments + 1 }).eq('phone', taskDetails.volunteer_phone);
      }

      setSuccess('Intervention Confirmed! The coordinator has been notified of your deployment.');
    } catch (err: any) {
      setError('System Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off-white)' }}>
       <Loader2 className="animate-spin" size={48} color="var(--navy-mid)" />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', padding: '60px 5%' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {error && (
          <div className="card-premium" style={{ borderTop: '4px solid #ef4444', textAlign: 'center', padding: '40px' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', color: 'var(--navy-deep)' }}>Link Invalid</h2>
            <p style={{ color: 'var(--text-mid)', fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {success && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-premium" style={{ borderTop: '4px solid #10b981', textAlign: 'center', padding: '40px' }}>
            <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={40} color="#166534" />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', color: 'var(--navy-deep)' }}>Confirmed Deployment</h2>
            <p style={{ color: 'var(--text-mid)', fontWeight: 600, fontSize: '16px', marginBottom: '24px' }}>{success}</p>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <ShieldCheck size={18} color="var(--navy-mid)" /> 
               <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--navy-mid)' }}>Report to your District Hub or designated Sub-inspector immediately.</span>
            </div>
          </motion.div>
        )}

        {!error && !success && taskDetails && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card-premium" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 900, background: '#f59e0b20', color: '#f59e0b', padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  URGENT CALL OUT
                </span>
                <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '12px 0 8px', color: 'var(--navy-deep)', letterSpacing: '-0.5px' }}>
                  {taskDetails.title}
                </h1>
                <p style={{ color: 'var(--text-mid)', fontSize: '15px', margin: 0, lineHeight: 1.6 }}>{taskDetails.description}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <MapPin size={24} color="var(--indigo-mid)" />
                 <div><div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-mid)', textTransform: 'uppercase' }}>Location</div><div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--navy-deep)' }}>{taskDetails.village}, {taskDetails.district}</div></div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <Calendar size={24} color="var(--indigo-mid)" />
                 <div><div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-mid)', textTransform: 'uppercase' }}>Date required</div><div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--navy-deep)' }}>Today</div></div>
              </div>
            </div>

            <button onClick={handleConfirm} disabled={loading} className="btn btn-navy" style={{ width: '100%', padding: '20px', fontSize: '18px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
               <CheckCircle size={22} /> I Am Available. Deploy Me.
            </button>
            <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-mid)', marginTop: '16px', fontWeight: 600 }}>
              By clicking this, you mark yourself officially assigned. Do not accept unless you can physically reach the spot.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
