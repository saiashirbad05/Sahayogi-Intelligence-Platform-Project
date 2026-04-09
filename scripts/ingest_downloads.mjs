import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase
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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ingestData() {
  const uploadsDir = path.join(process.cwd(), 'public', 'images', 'uploads');
  const files = fs.readdirSync(uploadsDir);
  const images = files.filter(f => f.match(/\.(jpg|jpeg|png)$/i)).map(f => `/images/uploads/${f}`);

  console.log(`Found ${images.length} images to attach.`);
  
  const csvPath = 'C:\\Users\\saias\\Downloads\\csv files\\ngo_dataset_5000_with_images.csv';
  
  if (!fs.existsSync(csvPath)) {
      console.error('CSV file not found');
      process.exit(1);
  }

  const csvData = fs.readFileSync(csvPath, 'utf8');
  // Handle basic CSV parsing, split by newline, ignoring simple embedded commas if possible
  const lines = csvData.split('\n').slice(1);
  
  const records = [];
  
  // Let's digest 1500 records to show a massive live scale increase dynamically
  const ingestCount = Math.min(lines.length, 1500);
  
  for (let i = 0; i < ingestCount; i++) {
     const line = lines[i].trim();
     if (!line) continue;
     
     // basic split by comma, handling potential quotes
     // We will split by simple commas but ignore anything inside quotes for quick large-scale dirty parsing
     const parts = line.split(',');
     if(parts.length < 4) continue;
     
     // NGO_ID,NGO_Name,Country,Sector,Image_Search_Link
     const name = parts[1] ? parts[1].replace(/"/g, '') : `Global NGO ${i}`;
     const location = parts[2] ? parts[2].replace(/"/g, '') : 'Global';
     const sector = parts[3] ? parts[3].replace(/"/g, '') : 'Community Response';
     
     // Randomly pick an image
     const image = images.length > 0 ? images[Math.floor(Math.random() * images.length)] : null;
     const rating = Math.floor(Math.random() * 20) + 80;
     
     records.push({
        name: name,
        location: location,
        category: sector,
        rating: rating,
        featured: Math.random() > 0.9,
        gallery_urls: image ? [image] : [],
        email: `contact@${name.replace(/[^a-zA-Z]/g, '').toLowerCase()}.org`,
        website: `www.${name.replace(/[^a-zA-Z]/g, '').toLowerCase()}.org`
     });
  }

  // Insert in batches of 100
  for (let i = 0; i < records.length; i += 100) {
    const batch = records.slice(i, i + 100);
    const { error } = await supabase.from('ngos').insert(batch);
    if (error) {
      console.error("Error inserting batch:", error.message);
    } else {
      console.log(`Inserted batch ${i} to ${i + batch.length} of ${records.length} NGOs...`);
    }
  }
  
  console.log("Database seeded successfully with local NGO data and linked images!");
  process.exit(0);
}

ingestData();
