import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldAlert, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NeedScoreRow {
  district: string;
  need_score: number;
  top_category: string;
  report_count: number;
}

export const UrgentAreaCards: React.FC = () => {
  const [urgentAreas, setUrgentAreas] = useState<NeedScoreRow[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadIntel = async () => {
      const { data } = await supabase
        .from('need_scores')
        .select('*')
        .order('need_score', { ascending: false })
        .limit(5);
        
      if (data) setUrgentAreas(data);
    };

    loadIntel();

    const sub = supabase
      .channel('urgent-cards')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'need_scores' }, loadIntel)
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  if (urgentAreas.length === 0) {
    return (
      <div className="card-premium" style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-mid)', fontSize: '14px', fontWeight: 600 }}>No urgent intel areas identified. Monitoring via V8 logic.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--navy-deep)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={20} color="var(--coral)" /> Top Urgent Regions
      </h3>
      {urgentAreas.map((area, idx) => (
        <div key={area.district} className="card-premium" style={{ 
          padding: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderLeft: `4px solid ${area.need_score >= 80 ? '#ef4444' : area.need_score >= 60 ? '#f97316' : '#eab308'}`
        }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-mid)', letterSpacing: '1px', marginBottom: '4px' }}>
              RANK 0{idx + 1}
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--navy-deep)', margin: 0 }}>
              {area.district}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', textTransform: 'capitalize', color: 'var(--navy-mid)' }}>
                {area.top_category}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-mid)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={12} /> {area.report_count} Reports
              </span>
            </div>
          </div>
          
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: area.need_score >= 80 ? '#ef4444' : area.need_score >= 60 ? '#f97316' : '#eab308', lineHeight: 1 }}>
                {area.need_score.toFixed(1)}
              </div>
              <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '1px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <TrendingUp size={10} /> SCORE
              </div>
            </div>
            <button 
              onClick={() => navigate(`/tasks?district=${area.district}&category=${area.top_category}`)}
              style={{ background: 'var(--navy-deep)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
            >
              CREATE TASK <ArrowRight size={10} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
