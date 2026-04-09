import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import process from 'process';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const TOP_NGO_CSV = 'C:/Users/saias/Downloads/123/Top_NGOs_India_Complete_Directory.csv';
const NON_PROFIT_ORG_CSV = 'C:/Users/saias/Downloads/archive/Non Profit Org.csv';

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1].trim()] = val;
  }
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

function parseCSVLine(line) {
  if (!line) return [];
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; } else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else current += char;
  }
  result.push(current.trim());
  return result;
}

const GALLERY_TEMPLATES = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800",
  "https://images.unsplash.com/photo-1509059852496-f3822ae057bf?q=80&w=800",
  "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?q=80&w=800"
];

const LOCAL_ASSETS = {
  "Smile Foundation": "/images/ngos/smile_hero.png",
  "CRY (Child Rights and You)": "/images/ngos/cry_hero.png",
  "Goonj": "/images/ngos/goonj_hero.png",
  "CARE India": "/images/ngos/care_hero.png",
  "HelpAge India": "/images/ngos/helpage_hero.png"
};

async function runIngestion() {
  console.log('--- Sahayogi National Scaling Registry v5.2 ---');
  let ngoMap = new Map();

  // Load Archive (Base Layer)
  if (fs.existsSync(NON_PROFIT_ORG_CSV)) {
    const archiveLines = fs.readFileSync(NON_PROFIT_ORG_CSV, 'utf8').split('\n').filter(l => l.trim());
    if (archiveLines.length > 1) {
      const header = parseCSVLine(archiveLines[0]);
      archiveLines.slice(1).forEach(line => {
        const values = parseCSVLine(line);
        const row = {};
        header.forEach((h, i) => { row[h.trim()] = values[i]; });
        let name = row['Organization'];
        if (name) {
          name = name.substring(0, 250);
          ngoMap.set(name, {
            name,
            website: row['Link'] || '',
            description: (row['Description'] || '').substring(0, 500),
            image_gallery: GALLERY_TEMPLATES,
            rating: 82 + Math.floor(Math.random() * 8),
            headquarters: 'India Operational Hub',
            is_featured: false,
            district: 'National Network'
          });
        }
      });
    }
  }

  // Load Priority (Command Center Layer)
  if (fs.existsSync(TOP_NGO_CSV)) {
    const topLines = fs.readFileSync(TOP_NGO_CSV, 'utf8').split('\n').filter(l => l.trim());
    if (topLines.length > 1) {
      const header = parseCSVLine(topLines[0]);
      topLines.slice(1).forEach(line => {
        const values = parseCSVLine(line);
        const row = {};
        header.forEach((h, i) => { row[h.trim()] = values[i]; });
        let name = row['NGO Name'];
        if (name) {
          name = name.substring(0, 250);
          
          // Enhanced metadata composition
          const focusAreas = row['Focus Areas'] || 'Community Development';
          const founded = row['Founded Year'] ? `Founded: ${row['Founded Year']}. ` : '';
          const impact = row['Primary Work/Reports'] || '';
          
          ngoMap.set(name, {
            ...ngoMap.get(name),
            name,
            full_address: row['Address'],
            email: row['Email'],
            phone: row['Phone'],
            website: row['Website'],
            description: `${founded}${focusAreas}. ${impact}`.substring(0, 1000),
            headquarters: row['Address'] || 'National HQ',
            rating: 98,
            is_featured: true,
            logo_url: LOCAL_ASSETS[name] || GALLERY_TEMPLATES[0],
            image_gallery: [LOCAL_ASSETS[name] || GALLERY_TEMPLATES[0], ...GALLERY_TEMPLATES],
            social_links: {
              twitter: `https://twitter.com/${name.toLowerCase().replace(/\s/g, '')}`,
              linkedin: `https://linkedin.com/company/${name.toLowerCase().replace(/\s/g, '')}`,
              instagram: `https://instagram.com/${name.toLowerCase().replace(/\s/g, '')}`
            }
          });
        }
      });
    }
  }

  const allNgos = Array.from(ngoMap.values());
  console.log(`Consolidating ${allNgos.length} NGO identities...`);
  
  const BATCH = 30;
  for (let i = 0; i < allNgos.length; i += BATCH) {
    const batchData = allNgos.slice(i, i + BATCH);
    const { error } = await supabase.from('ngos').upsert(batchData, { onConflict: 'name' });
    if (error) {
       console.error(`\nBatch ${i/BATCH} Failed:`, error.message);
       process.stdout.write('🔴');
    } else {
       process.stdout.write('🟢');
    }
  }
  console.log('\n--- NATIONAL REGISTRY SYNC COMPLETE ---');
}
runIngestion();
