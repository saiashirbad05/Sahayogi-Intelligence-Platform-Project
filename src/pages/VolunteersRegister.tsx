import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, ShieldCheck, AlertTriangle, Loader2, CheckCircle, Smartphone } from 'lucide-react';

const INDIA_STATES_UTS = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const SKILL_OPTIONS = [
  'Medical / First Aid',
  'Food & Ration Distribution',
  'Logistics / Driving',
  'Search & Rescue',
  'Crowd Management',
  'Translation / Local Dialect'
];

export const VolunteersRegister: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formState, setFormState] = useState({
    name: '', phone: '', village: '', block: '', district: INDIA_STATES_UTS[0]
  });
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const validatePhone = (phone: string) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');

    if (!validatePhone(formState.phone)) {
      setError('Please enter a valid 10-digit Indian phone number.');
      setLoading(false);
      return;
    }

    if (selectedSkills.length === 0) {
      setError('Please select at least one skill to register.');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('volunteers').insert({
        name: formState.name,
        phone: formState.phone,
        village: formState.village,
        block: formState.block,
        district: formState.district,
        skills: selectedSkills.join(', '),
        available_today: true, // Defaulting to true on day of registration
        reliability_score: 5.0
      });

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('This phone number is already registered in the Sahayogi Volunteer Network.');
        }
        throw insertError;
      }

      setSuccess(`Thank you ${formState.name}! You are now registered and marked as Available Today.`);
      setFormState({ name: '', phone: '', village: '', block: '', district: INDIA_STATES_UTS[0] });
      setSelectedSkills([]);
    } catch (err: any) {
      setError(err.message || 'Failed to register volunteer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', padding: '120px 5% 60px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--navy-deep)' }}>
            <UserPlus size={32} />
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', color: 'var(--navy-deep)', letterSpacing: '-1px' }}>Join the Response Network</h1>
          <p style={{ color: 'var(--text-mid)', fontSize: '16px' }}>Register to receive automated SMS alerts when crisis strikes your district. No app download required.</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', fontWeight: 600 }}>
            <AlertTriangle size={20} /> {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '16px', borderRadius: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', fontWeight: 600 }}>
            <CheckCircle size={20} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-premium" style={{ padding: '40px' }}>
          
          <div style={{ display: 'grid', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
              <input required name="name" value={formState.name} onChange={handleFormChange} placeholder="e.g. Rahul Sharma" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC', fontWeight: 600 }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px', textTransform: 'uppercase' }}>Mobile Number (Used for SMS Dispatch)</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', fontWeight: 800, color: 'var(--text-mid)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={18} /> +91
                </div>
                <input required type="tel" maxLength={10} name="phone" value={formState.phone} onChange={handleFormChange} placeholder="9876543210" style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC', fontWeight: 600, letterSpacing: '1px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px', textTransform: 'uppercase' }}>State / Union Territory</label>
                <select name="district" value={formState.district} onChange={handleFormChange} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC', fontWeight: 600, appearance: 'none' }}>
                  {INDIA_STATES_UTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px', textTransform: 'uppercase' }}>Block</label>
                <input required name="block" value={formState.block} onChange={handleFormChange} placeholder="e.g. Pipili" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC', fontWeight: 600 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px', textTransform: 'uppercase' }}>Village / Base Location</label>
              <input required name="village" value={formState.village} onChange={handleFormChange} placeholder="e.g. Teisipur" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC', fontWeight: 600 }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '12px', textTransform: 'uppercase' }}>Specialized Skills (Select Multiple)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {SKILL_OPTIONS.map(skill => (
                  <button 
                    type="button" 
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    style={{
                      padding: '10px 16px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: selectedSkills.includes(skill) ? 'var(--navy-deep)' : 'var(--off-white)',
                      color: selectedSkills.includes(skill) ? 'white' : 'var(--navy-mid)'
                    }}
                  >
                    {skill} {selectedSkills.includes(skill) && '✓'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px' }}>
              <ShieldCheck size={20} color="#10B981" />
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-mid)', lineHeight: 1.5 }}>
                Your phone number acts as your unique identifier. We will never share your personal information. SMS charges may apply depending on your carrier.
              </p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-navy" style={{ width: '100%', padding: '20px', fontSize: '16px' }}>
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Register for Rapid Dispatch'}
          </button>
        </form>
      </div>
    </div>
  );
};
