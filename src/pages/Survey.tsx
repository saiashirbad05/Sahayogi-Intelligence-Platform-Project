import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ArrowRight, RotateCcw, ShieldPlus, CheckCircle2, 
  MapPin, Activity, 
  Briefcase, Zap, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const missionSteps = [
  { 
    id: 1, 
    label: "PHASE 1: CONTEXT", 
    desc: "Baseline Stability & Personal Infrastructure",
    time: "2m",
    icon: <Activity size={18} />,
    questions: [
      { id: 'q1', text: "Environmental Substance Exposure (Peers/Network)", options: ["None at all", "1-2 sources", "3-5 sources", "Critical (>5)"], scores: [0, 10, 20, 30] },
      { id: 'q2', text: "Current Cognitive Stress & Emotional Resilience", options: ["High Resilience", "Moderate Stress", "Often Overwhelmed", "Critical Burnout"], scores: [0, 10, 20, 40] },
      { id: 'q3', text: "Family-Level Stability & Support Infrastructure", options: ["Very Strong", "Marginally Stable", "Quite Difficult", "Non-Existent"], scores: [0, 5, 20, 40] }
    ]
  },
  { 
    id: 2, 
    label: "PHASE 2: ENVIRONMENT", 
    desc: "Community Safety & Resource Accessibility",
    time: "3m",
    icon: <MapPin size={18} />,
    questions: [
      { id: 'q4', text: "Community Safety Protocols (Night/Lone Travel)", options: ["Secure", "Generally Safe", "Moderately Unsafe", "High Risk Zone"], scores: [0, 10, 25, 45] },
      { id: 'q5', text: "Exposure to Direct Neighborhood Conflict/Violence", options: ["Zero Incidence", "Slightly Heightened", "Severe Conflict", "Active Danger"], scores: [0, 15, 30, 50] },
      { id: 'q6', text: "Participation in Collective Protective Groups (NGOs/SHGs)", options: ["Active Role", "Occasional Involvement", "Minimal", "Disconnected"], scores: [-15, 0, 10, 20] }
    ]
  },
  { 
    id: 3, 
    label: "PHASE 3: OUTLOOK", 
    desc: "Economic Health & Future Certainty",
    time: "4m",
    icon: <Briefcase size={18} />,
    questions: [
      { id: 'q7', text: "Professional/Academic Performance Trajectory", options: ["Strong Ascending", "Stable", "Struggling", "Critical Decline"], scores: [-10, 0, 20, 40] },
      { id: 'q8', text: "Mentorship/Adult Guidance Availability", options: ["Verified Mentor", "Informal Guide", "Peer-Only Only", "Zero Support"], scores: [-15, 5, 15, 30] },
      { id: 'q9', text: "5-Year Future Economic Confidence", options: ["Optimistic", "Cautious", "Highly Uncertain", "Non-Existent"], scores: [-10, 0, 20, 40] }
    ]
  }
];

export const Survey: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [impactReport, setImpactReport] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const stepData = missionSteps.find(s => s.id === currentStep)!;
  const isStepValid = stepData.questions.every(q => answers[q.id] !== undefined);

  const handleSelect = (qId: string, idx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  const nextPhase = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      generateImpactReport();
    }
  };

  const generateImpactReport = async () => {
    setIsSyncing(true);
    let totalScore = 0;
    
    // Process All Scores
    missionSteps.forEach(s => {
      s.questions.forEach(q => {
        const selected = answers[q.id];
        if (selected !== undefined) totalScore += q.scores[selected];
      });
    });

    // Score out of approx 300
    const normalizedScore = Math.max(0, Math.min(100, Math.floor((totalScore / 300) * 100)));
    let riskLevel = normalizedScore > 65 ? 'HIGH PRIORITY' : normalizedScore > 35 ? 'MODERATE RISK' : 'STABLE BASE';

    const report = {
      score: normalizedScore,
      level: riskLevel,
      recommendation: riskLevel === 'HIGH PRIORITY' 
        ? "Immediate Case Management Deployment Recommended. Notify local NGO coordinators for urgent intervention." 
        : "Standard Monitoring required. Recommend participation in local community strength-building workshops.",
      metrics: {
        resilience: Math.max(0, 100 - normalizedScore),
        urgency: normalizedScore
      }
    };

    try {
      // Corrected: Mapping answers properly for Supabase JSONB
      const syncResponse = await supabase.from('survey_responses').insert([{
        answers: JSON.stringify(answers), 
        risk_level: riskLevel, 
        risk_score: normalizedScore, 
        advice: report.recommendation
      }]);
      
      if (syncResponse.error) throw syncResponse.error;
    } catch (e) {
      console.error("Supabase sync failed, continuing for UX continuity:", e);
    }

    setTimeout(() => {
      setImpactReport(report);
      setIsFinalized(true);
      setIsSyncing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  if (isFinalized && impactReport) {
    const isCritical = impactReport.level === 'HIGH PRIORITY';
    const accent = isCritical ? 'var(--coral)' : 'var(--gold)';

    return (
      <div style={{ background: 'var(--off-white)', minHeight: '100vh', padding: '120px 5% 60px' }}>
        <motion.div 
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="card-premium" style={{ maxWidth: '850px', margin: '0 auto', padding: '64px', textAlign: 'center' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(232, 121, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--coral-light)' }}>
              <ShieldPlus size={48} color="var(--coral)" />
            </div>
          </div>
          
          <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', color: 'var(--navy-deep)' }}>ASSESSMENT FINALIZED</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '48px' }}>
             <Activity size={16} color={accent} />
             <span style={{ fontSize: '13px', fontWeight: 800, color: accent, letterSpacing: '2px' }}>{impactReport.level}</span>
          </div>

          <div style={{ background: 'var(--off-white)', borderRadius: '32px', padding: '48px', marginBottom: '48px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '48px', alignItems: 'center', textAlign: 'left' }}>
             <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                <svg width="220" height="220" viewBox="0 0 220 220">
                  <circle cx="110" cy="110" r="100" fill="none" stroke="#E2E8F0" strokeWidth="12" />
                  <motion.circle 
                    cx="110" cy="110" r="100" fill="none" stroke={accent} strokeWidth="12" 
                    initial={{ strokeDashoffset: 628 }}
                    animate={{ strokeDashoffset: 628 - (628 * impactReport.score) / 100 }}
                    strokeDasharray="628" 
                    strokeLinecap="round" transform="rotate(-90 110 110)"
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                   <span style={{ fontSize: '42px', fontWeight: 800, color: 'var(--navy-deep)' }}>{impactReport.score}%</span>
                   <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '1px' }}>VULNERABILITY</span>
                </div>
             </div>
             <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-mid)', textTransform: 'uppercase', marginBottom: '8px' }}>Intelligence Outlook</h4>
                <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--navy-deep)', lineHeight: 1.6, margin: 0 }}>
                  {impactReport.recommendation}
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                   <div style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'white' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-mid)', fontWeight: 800 }}>RESILIENCE</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981' }}>{impactReport.metrics.resilience}%</div>
                   </div>
                   <div style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'white' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-mid)', fontWeight: 800 }}>PRIORITY</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--coral)' }}>HIGH</div>
                   </div>
                </div>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => setIsFinalized(false)} className="btn btn-outline" style={{ flex: 1, padding: '20px' }}>
              <RotateCcw size={18} /> Modify Assessment
            </button>
            <Link to="/dashboard" className="btn btn-navy" style={{ flex: 1, padding: '20px' }}>
              Deploy Resources <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh', padding: '100px 5% 60px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* CINEMATIC MISSION HEADER */}
        <div style={{ position: 'relative', height: '320px', borderRadius: '40px', overflow: 'hidden', marginBottom: '60px', boxShadow: 'var(--shadow-lg)' }}>
           <img src="/images/survey_meeting.png" alt="Field Mission" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.9) 100%)' }} />
           <div style={{ position: 'absolute', bottom: '48px', left: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                 <Zap size={16} color="var(--gold)" />
                 <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '2px' }}>ACTIVE FIELD MISSION</span>
              </div>
              <h1 style={{ color: 'white', fontSize: '42px', fontWeight: 800, margin: 0 }}>Citizen Risk Assessment</h1>
           </div>
        </div>

        {/* PROGRESS NAVIGATION - COMMAND CENTER STYLE */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)' }}>
           {missionSteps.map((s, idx) => (
             <React.Fragment key={s.id}>
               <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', opacity: currentStep === s.id ? 1 : 0.4, transition: 'all 0.3s' }}>
                  <div style={{ 
                    width: '42px', height: '42px', borderRadius: '14px', 
                    background: currentStep >= s.id ? 'var(--navy-deep)' : 'var(--white)', 
                    color: currentStep >= s.id ? 'white' : 'var(--text-mid)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontWeight: 900, fontSize: '14px',
                    boxShadow: currentStep === s.id ? '0 10px 20px rgba(7,1,41,0.15)' : 'none',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                     {currentStep > s.id ? <CheckCircle2 size={18} /> : s.id}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-mid)', letterSpacing: '1px' }}>{s.label}</div>
                     <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--navy-deep)' }}>{s.desc.split(' & ')[0]}</div>
                  </div>
               </div>
               {idx < missionSteps.length - 1 && (
                 <div style={{ width: '40px', height: '2px', background: 'rgba(0,0,0,0.05)', alignSelf: 'center' }} />
               )}
             </React.Fragment>
           ))}
        </div>

        <AnimatePresence mode="wait">
           <motion.div 
             key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
             style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
           >
              <div style={{ height: '4px', width: '100%', background: 'var(--off-white)', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 3) * 100}%` }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, var(--navy-mid), var(--coral))' }}
                />
              </div>
              {stepData.questions.map((q, idx) => (
                <div key={q.id} className="card-premium" style={{ padding: '48px' }}>
                   <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                      <span style={{ fontSize: '24px', fontWeight: 800, color: 'rgba(232, 121, 58, 0.2)' }}>
                        {currentStep}.{idx + 1}
                      </span>
                      <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy-deep)', margin: 0, lineHeight: 1.4 }}>{q.text}</h3>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      {q.options.map((opt, oIdx) => {
                        const isSelected = answers[q.id] === oIdx;
                        return (
                          <motion.button
                            key={oIdx} 
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(q.id, oIdx)}
                            style={{ 
                              padding: '24px', borderRadius: '20px', border: '1px solid ' + (isSelected ? 'var(--coral)' : 'rgba(0,0,0,0.05)'),
                              background: isSelected ? 'rgba(232, 121, 58, 0.05)' : 'white', cursor: 'pointer', transition: 'all 0.2s',
                              textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px',
                              boxShadow: isSelected ? '0 10px 20px rgba(232,121,58,0.1)' : 'var(--shadow-sm)'
                            }}
                          >
                             <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid ' + (isSelected ? 'var(--coral)' : '#CBD5E1'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isSelected && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--coral)' }} />}
                             </div>
                             <span style={{ fontSize: '16px', fontWeight: 700, color: isSelected ? 'var(--coral)' : 'var(--navy-deep)' }}>{opt}</span>
                          </motion.button>
                        );
                      })}
                   </div>
                </div>
              ))}
           </motion.div>
        </AnimatePresence>

        <div style={{ marginTop: '64px' }}>
           <button 
             className="btn btn-navy btn-full" disabled={!isStepValid || isSyncing} onClick={nextPhase}
             style={{ padding: '24px', fontSize: '16px', fontWeight: 800, borderRadius: '24px', height: 'auto', width: '100%' }}
           >
              {isSyncing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                  <Loader2 className="reveal" style={{ animation: 'spin 1s linear infinite' }} /> Processing Intelligence...
                </div>
              ) : (
                currentStep === 3 ? "SYNC TO GLOBAL MISSION CONTROL" : "PROCEED TO NEXT ASSESSMENT PHASE"
              )}
           </button>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
