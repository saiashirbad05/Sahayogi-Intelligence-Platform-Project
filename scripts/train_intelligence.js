import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env manually
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1].trim()] = val;
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];
const geminiApiKey = env['VITE_GEMINI_API_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function train() {
  console.log('--- Starting Intelligence Training (REST API) ---');
  
  // 1. Fetch data snapshots
  const { count: ngoCount } = await supabase.from('ngos').select('*', { count: 'exact', head: true });
  const { count: volunteerCount } = await supabase.from('volunteers').select('*', { count: 'exact', head: true });
  const { count: cityCount } = await supabase.from('india_cities').select('*', { count: 'exact', head: true });
  const { data: healthSample } = await supabase.from('health_metrics').select('state, district, risk_level, indicator_name').limit(10);

  console.log(`Analyzing ${ngoCount} NGOs, ${volunteerCount} Volunteers, and ${cityCount} Cities...`);

  // 2. Prepare prompt
  const prompt = `
    You are the Sahayogi AI Intelligence Engine. 
    We have just scaled our database with archive data:
    - Total NGOs: ${ngoCount}
    - Total Volunteers: ${volunteerCount}
    - Cities covered: ${cityCount}
    - Recent Health Indicators Sample: ${JSON.stringify(healthSample)}

    Generate a comprehensive "Community Risk Intelligence Plan (CRIP) - National Scale 2026".
    Focus on:
    1. Resource optimization (where to send volunteers).
    2. High-risk health clusters identified in the data.
    3. Strategic NGO partnerships.
    
    Format the output as a Markdown report that looks like a professional command center briefing.
  `;

  // 3. Generate response using REST API
  console.log('Generating AI insights via REST...');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const result = await response.json();
  
  if (!result.candidates || !result.candidates[0]) {
    console.error('AI Generation Failed:', JSON.stringify(result));
    return;
  }
  
  const planText = result.candidates[0].content.parts[0].text;

  console.log('Intelligence plan generated. Saving...');

  // 4. Save to DB
  const { error } = await supabase.from('gemini_plans').insert({
    plan_text: planText,
    data_snapshot: {
      ngos: ngoCount,
      volunteers: volunteerCount,
      cities: cityCount,
      health_rows: 7500
    }
  });

  if (error) {
    console.error('Failed to save plan:', error.message);
  } else {
    console.log('✅ Intelligence training complete and plan archived.');
  }
}

train();
