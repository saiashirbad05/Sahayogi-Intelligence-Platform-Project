import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import process from 'process';

// Bypass TLS for node-fetch in local environment if needed
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configuration
const TOP_NGO_CSV = 'C:/Users/saias/Downloads/123/Top_NGOs_India_Complete_Directory.csv';
const ARCHIVE_CSV = 'C:/Users/saias/Downloads/Archive/Final_NGO_Registry_India_Standardized.csv';

// Load Environment
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

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const GALLERY_TEMPLATES = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800",
  "https://images.unsplash.com/photo-1509059852496-f3822ae057bf?q=80&w=800",
  "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?q=80&w=800",
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800",
  "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=800"
];

async function upsertWithRetry(batch, retryCount = 5) {
  for (let i = 0; i < retryCount; i++) {
    try {
      const { error } = await supabase.from('ngos').upsert(batch, { onConflict: 'name' });
      if (!error) return true;
      console.error(`\nRetry ${i+1} failed:`, error.message);
    } catch (e) {
      console.error(`\nAttempt ${i+1} caught error:`, e.message);
    }
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
  }
  return false;
}

async function runIngestion() {
  console.log('--- Resilient National NGO Ingestion V2 ---');
  
  let allNgos = [];
  
  // 1. Process Priority NGOs
  if (fs.existsSync(TOP_NGO_CSV)) {
    console.log('Processing Priority NGOs from 123 folder...');
    const topLines = fs.readFileSync(TOP_NGO_CSV, 'utf8').split('\n').filter(l => l.trim());
    const topHeader = parseCSVLine(topLines[0]);
    
    topLines.slice(1).forEach(line => {
      const values = parseCSVLine(line);
      const row = {};
      topHeader.forEach((h, i) => { row[h.trim()] = values[i]; });
      
      if (row.name) {
        allNgos.push({
          name: row.name,
          category: row.category || 'General Welfare',
          location: row.location || 'India',
          impact_score: 95,
          is_featured: true,
          email: row.email || `contact@${row.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`,
          website: row.website || `http://www.${row.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`,
          phone: row.phone || '+91 XXX-XXX-XXXX',
          address: row.address || 'India',
          image_gallery: GALLERY_TEMPLATES,
          social_links: { twitter: '#', facebook: '#', linkedin: '#' }
        });
      }
    });
  }

  // 2. Process Archive
  if (fs.existsSync(ARCHIVE_CSV)) {
    console.log('Processing Archive NGOs...');
    const archiveLines = fs.readFileSync(ARCHIVE_CSV, 'utf8').split('\n').filter(l => l.trim());
    const archiveHeader = parseCSVLine(archiveLines[0]);
    
    archiveLines.slice(1).forEach(line => {
      const values = parseCSVLine(line);
      const row = {};
      archiveHeader.forEach((h, i) => { row[h.trim()] = values[i]; });
      
      if (row.name && !allNgos.find(n => n.name === row.name)) {
        allNgos.push({
          name: row.name,
          category: row.category || 'Humanitarian',
          location: row.location || 'India',
          impact_score: 75,
          is_featured: false,
          image_gallery: GALLERY_TEMPLATES
        });
      }
    });
  }

  // 3. Batching
  const BATCH_SIZE = 25; // Smaller batch size for stability
  console.log(`Syncing ${allNgos.length} records in small batches...`);
  
  for (let i = 0; i < allNgos.length; i += BATCH_SIZE) {
    const batch = allNgos.slice(i, i + BATCH_SIZE);
    const success = await upsertWithRetry(batch);
    if (success) {
      process.stdout.write('✅');
    } else {
      process.stdout.write('❌');
      console.error(`\nBatch at offset ${i} failed after retries.`);
    }
  }

  console.log('\n--- INGESTION COMPLETE ---');
}

runIngestion();
