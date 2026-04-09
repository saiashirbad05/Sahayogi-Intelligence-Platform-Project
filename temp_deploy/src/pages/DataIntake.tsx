import React, { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { calculateDistrictScores } from '../lib/needEngine';
import { GoogleGenAI } from '@google/genai';
import { 
  FileSpreadsheet, FileText, Camera, UploadCloud, 
  CheckCircle, AlertTriangle, Loader2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const INDIA_STATES_UTS = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const DataIntake: React.FC = () => {
  const [method, setMethod] = useState<'csv' | 'form' | 'scan'>('csv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [formState, setFormState] = useState({
    ngo_name: '', village: '', block: '', district: INDIA_STATES_UTS[0],
    category: 'food', severity: 1, description: '', impacted: 0
  });

  const handleFormChange = (e: any) => setFormState({ ...formState, [e.target.name]: e.target.value });

  // Handle CSV
  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setLoading(true);
    setError(''); setSuccess('');
    
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const docs = results.data.map((row: any) => ({
             ngo_name: row.ngo_name || 'CSV Batch',
             village: row.village || 'Unknown',
             block: row.block || 'Unknown',
             district: row.district || INDIA_STATES_UTS[0],
             category: row.category || 'other',
             severity: parseInt(row.severity || '1', 10),
             description: row.description || '',
             date_reported: new Date().toISOString().split('T')[0],
             ingestion_method: 'csv'
          }));

          const { error: insertError } = await supabase.from('community_reports').insert(docs);
          if (insertError) throw insertError;
          
          await calculateDistrictScores();
          setSuccess(`Successfully ingested ${docs.length} records logic complete.`);
        } catch (err: any) {
          setError(err.message || 'CSV sync failed.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Handle Scan
  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setLoading(true); setError(''); setSuccess('');
    
    try {
      if (!apiKey) throw new Error("Missing Gemini API Key");
      
      const file = e.target.files[0];
      const ai = new GoogleGenAI({ apiKey });
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(',')[1];
        if (!base64data) throw new Error("Base64 conversion failed");

        try {
          const prompt = `
          Extract the following intelligence from this handwritten or printed relief form.
          If any field is missing, guess a reasonable default. District must be an Indian State or Union Territory.
          Return EXACTLY a JSON object with: ngo_name, village, block, district, category (health, food, sanitation, shelter, other), severity (1-5), description.
          Do NOT format with markdown ticks, just pure JSON.
          `;
          
          const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite',
            contents: [{ role: 'user', parts: [
              { text: prompt },
              { inlineData: { data: base64data, mimeType: file.type } }
            ]}]
          });
          
          const resultText = (result as any).text || '';
          let cleaned = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
          const p = JSON.parse(cleaned);
          
          // Populate the form for user review
          setFormState({
            ngo_name: p.ngo_name || 'Vision Extracted NGO',
            village: p.village || 'Unknown',
            block: p.block || 'Unknown',
            district: INDIA_STATES_UTS.includes(p.district) ? p.district : INDIA_STATES_UTS[0],
            category: p.category || 'other',
            severity: parseInt(p.severity || 1),
            description: p.description || 'Scanned via V-INTEL',
            impacted: 0
          });
          
          setMethod('form');
          setSuccess('Image scanned successfully. Please review the extracted data before final submission.');
        } catch (scanError) {
          setError("Vision extraction failed. Could not parse form.");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');

    try {
      const doc = {
        ...formState,
        date_reported: new Date().toISOString().split('T')[0],
        ingestion_method: 'form'
      };
      
      const { error: insertError } = await supabase.from('community_reports').insert(doc);
      if (insertError) throw insertError;

      await calculateDistrictScores();
      setSuccess('Manual report submitted securely.');
      setFormState({ ngo_name: '', village: '', block: '', district: INDIA_STATES_UTS[0], category: 'food', severity: 1, description: '', impacted: 0 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', padding: '120px 5% 60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', color: 'var(--navy-deep)' }}>Unified Intel Ingestion</h1>
        <p style={{ color: 'var(--text-mid)', marginBottom: '40px' }}>Sahayogi V8 Protocol - Accept intelligence from any source, verified via Gemini 3.1 Pro.</p>

        {/* Method Toggles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '40px' }}>
          {[
            { id: 'csv', label: 'CSV Batch', icon: <FileSpreadsheet size={20} /> },
            { id: 'form', label: 'Manual Entry', icon: <FileText size={20} /> },
            { id: 'scan', label: 'Vision Scan', icon: <Camera size={20} /> }
          ].map(m => (
            <button 
              key={m.id}
              onClick={() => { setMethod(m.id as any); setError(''); setSuccess(''); }}
              style={{
                background: method === m.id ? 'var(--navy-deep)' : 'white',
                color: method === m.id ? 'white' : 'var(--navy-mid)',
                padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '12px', border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease', fontWeight: 800
              }}
              className={method !== m.id ? 'card-premium' : ''}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '16px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'center', fontWeight: 600 }}>
            <AlertTriangle size={20} /> {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '16px', borderRadius: '16px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'center', fontWeight: 600 }}>
            <CheckCircle size={20} /> {success}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* CSV BATCH */}
          {method === 'csv' && (
            <motion.div key="csv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card-premium" style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ border: '3px dashed var(--indigo-light)', borderRadius: '32px', padding: '60px 40px', position: 'relative', cursor: 'pointer' }}>
                <input type="file" accept=".csv" onChange={handleCSV} disabled={loading} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: loading ? 'not-allowed' : 'pointer' }} />
                <UploadCloud size={40} color="var(--indigo-mid)" style={{ margin: '0 auto 24px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Drop ODK/Kobo CSV</h3>
                <p style={{ color: 'var(--text-mid)', fontSize: '14px' }}>Batch insert hundreds of reports directly to the Need Engine.</p>
              </div>
              {loading && <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', color: 'var(--navy-deep)' }}><Loader2 className="animate-spin" size={24} /></div>}
            </motion.div>
          )}

          {/* VISION SCAN */}
          {method === 'scan' && (
            <motion.div key="scan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card-premium" style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ border: '3px dashed var(--coral)', borderRadius: '32px', padding: '60px 40px', position: 'relative', cursor: 'pointer', background: 'rgba(232, 105, 60, 0.03)' }}>
                <input type="file" accept="image/*" onChange={handleScan} disabled={loading} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: loading ? 'not-allowed' : 'pointer' }} />
                <Camera size={40} color="var(--coral)" style={{ margin: '0 auto 24px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Camera Intel Extract</h3>
                <p style={{ color: 'var(--text-mid)', fontSize: '14px' }}>Upload a photo of a paper form. Gemini 3.1 Pro Vision will extract the fields automatically.</p>
              </div>
              {loading && <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', color: 'var(--coral)' }}><Loader2 className="animate-spin" size={24} /></div>}
            </motion.div>
          )}

          {/* MANUAL FORM */}
          {method === 'form' && (
            <motion.form 
              key="form" onSubmit={handleFormSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
              className="card-premium" style={{ padding: '40px' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px', textTransform: 'uppercase' }}>NGO / Submitter</label>
                  <input required name="ngo_name" value={formState.ngo_name} onChange={handleFormChange} className="form-input" placeholder="e.g. Red Cross" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px', textTransform: 'uppercase' }}>State / Union Territory</label>
                  <select name="district" value={formState.district} onChange={handleFormChange} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC', fontWeight: 600, appearance: 'none' }}>
                    {INDIA_STATES_UTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px', textTransform: 'uppercase' }}>Block</label>
                  <input required name="block" value={formState.block} onChange={handleFormChange} className="form-input" placeholder="e.g. Pipili" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px', textTransform: 'uppercase' }}>Village/Panchayat</label>
                  <input required name="village" value={formState.village} onChange={handleFormChange} className="form-input" placeholder="e.g. Teisipur" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px', textTransform: 'uppercase' }}>Crisis Category</label>
                  <select name="category" value={formState.category} onChange={handleFormChange} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC', fontWeight: 600 }}>
                    <option value="health">Healthcare / Medical</option>
                    <option value="food">Food & Rations</option>
                    <option value="sanitation">Sanitation / Water</option>
                    <option value="shelter">Shelter / Housing</option>
                    <option value="other">Other Incident</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px', textTransform: 'uppercase' }}>Severity Filter (1-5)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setFormState({...formState, severity: s})} style={{
                        flex: 1, padding: '12px 0', border: 'none', borderRadius: '8px', fontWeight: 800,
                        background: formState.severity === s ? (s >= 4 ? 'var(--coral)' : 'var(--navy-deep)') : '#F8FAFC',
                        color: formState.severity === s ? 'white' : 'var(--text-mid)', cursor: 'pointer', transition: 'all 0.2s'
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '8px', textTransform: 'uppercase' }}>Field Intelligence Notes</label>
                <textarea required name="description" value={formState.description} onChange={handleFormChange} rows={3} placeholder="Describe the acute problem on the ground..." style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.05)', background: '#F8FAFC', resize: 'vertical' }} />
              </div>

              <button type="submit" disabled={loading} className="btn btn-navy" style={{ width: '100%', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><ArrowRight size={18} /> Push into Need Engine</>}
              </button>
            </motion.form>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
