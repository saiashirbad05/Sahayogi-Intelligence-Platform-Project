import fs from 'fs';
import path from 'path';
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

async function ingestAll() {
  const csvDir = 'C:\\Users\\saias\\Downloads\\csv files';
  const rawDiskFiles = fs.readdirSync(csvDir);
  const csvFiles = rawDiskFiles.filter(f => f.endsWith('.csv') && !f.includes('ngo_dataset_5000_with_images.csv'));

  const pdfDir = path.join(process.cwd(), 'public', 'pdfs', 'uploads');
  let pdfs = [];
  try {
     const rawPdfs = fs.existsSync(pdfDir) ? fs.readdirSync(pdfDir) : [];
     pdfs = rawPdfs.filter(f => f.endsWith('.pdf')).map(f => `/pdfs/uploads/${f}`);
  } catch (e) { console.error("Could not read pdf directory"); }
  
  const imgDir = path.join(process.cwd(), 'public', 'images', 'uploads');
  let images = [];
  try {
     const rawImages = fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : [];
     images = rawImages.filter(f => f.match(/\.(jpg|jpeg|png)$/i)).map(f => `/images/uploads/${f}`);
  } catch (e) { console.error("Could not read images directory"); }

  console.log(`Found ${csvFiles.length} CSV files, ${pdfs.length} PDFs, and ${images.length} images.`);

  let recordsToInsert = [];
  let index = 0;

  for (const file of csvFiles) {
    let content = "";
    try {
        content = fs.readFileSync(path.join(csvDir, file), 'utf8');
    } catch (e) { continue; }
    
    const lines = content.split('\n').slice(1);
    const sample = lines.slice(0, 30);
    
    for (const line of sample) {
      if (!line.trim()) continue;
      const parts = line.split(',');
      if (parts.length < 2) continue;
      
      const rawName = (parts[0] && parts[0].length > 4) ? parts[0] : (parts[1] && parts[1].length > 4 ? parts[1] : `Global Institution ${index}`);
      const name = rawName.replace(/"/g, '').trim();
      
      const location = parts.length > 2 ? parts[parts.length - 1].replace(/"/g, '').trim() : 'India';
      
      if (name === "undefined" || !name) continue;

      // 40% chance to assign a PDF if we have one
      const randomPdf = pdfs.length > 0 && Math.random() > 0.6 ? pdfs[Math.floor(Math.random() * pdfs.length)] : null;
      // 50% chance to assign an Image if we have one
      const randomImage = images.length > 0 && Math.random() > 0.5 ? images[Math.floor(Math.random() * images.length)] : null;
      
      const isTop = index < 80; // The first 80 entities hit will be 100 rating featured!
      
      recordsToInsert.push({
         name: name.substring(0, 60),
         location: location.substring(0, 30),
         category: 'Health & Community Development',
         rating: isTop ? 100 : Math.floor(Math.random() * 20) + 70, // 100 rating for top!
         featured: isTop,
         gallery_urls: randomImage ? [randomImage] : [],
         social_links: randomPdf ? { report: randomPdf } : {},
         email: `contact@${name.replace(/[^a-zA-Z]/g, '').toLowerCase().substring(0, 10)}.org`,
      });
      index++;
    }
  }

  console.log(`Prepared ${recordsToInsert.length} total NGO records. Slicing into batches...`);

  const finalRecords = recordsToInsert.slice(0, 2500);

  for (let i = 0; i < finalRecords.length; i += 100) {
    const batch = finalRecords.slice(i, i + 100);
    const { error } = await supabase.from('ngos').insert(batch);
    if (error) {
      console.error("Error inserting batch:", error.message);
    } else {
      console.log(`Inserted batch ${i} to ${i + batch.length} of ${finalRecords.length} NGOs...`);
    }
  }

  console.log("Global bulk CSV and PDF data seeded successfully!");
  process.exit(0);
}

ingestAll();
