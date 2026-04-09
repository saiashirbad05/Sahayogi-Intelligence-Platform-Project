import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase Connection for:', supabaseUrl);
  
  // Test NGOs
  const { count: ngoCount, error: ngoError } = await supabase.from('ngos').select('*', { count: 'exact', head: true });
  if (ngoError) {
    console.error('NGO Table Error:', ngoError.message);
  } else {
    console.log('NGO Table: Connected (Count:', ngoCount, ')');
  }

  // Test Volunteers
  const { count: volCount, error: volError } = await supabase.from('volunteers').select('*', { count: 'exact', head: true });
  if (volError) {
    console.error('Volunteers Table Error:', volError.message);
    console.log('Suggestion: If you haven\'t created the "volunteers" table, please check your Supabase dashboard.');
  } else {
    console.log('Volunteers Table: Connected (Count:', volCount, ')');
  }
}

test();
