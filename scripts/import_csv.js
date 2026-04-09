import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Mock env resolution for the script execution context
const supabaseUrl = 'https://zodrhrqqeyehsuswgtbh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZHJocnFxZXllaHN1c3dndGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzA4ODIsImV4cCI6MjA5MDAwNjg4Mn0.na0KDjwIarz9qGOWI92RVdhDwZejEJT3OkjUs0MCW98';
const supabase = createClient(supabaseUrl, supabaseKey);

const CSV_PATH = 'C:\\Users\\saias\\Downloads\\volunteers.csv';

const INDIA_STATES_UTS = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`ERROR: CSV not found at ${CSV_PATH}`);
    return;
  }

  const rawData = fs.readFileSync(CSV_PATH, 'utf8');
  console.log(`Read ${rawData.length} bytes from CSV.`);
  
  const lines = rawData.split(/\n/);
  
  const parsedVolunteers = [];
  let validCount = 0;

  for (let i = 1; i < lines.length; i++) { // Skip header
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma
    const parts = line.split(',');
    if (parts.length < 3) continue; // Too malformed to recover
    
    const sno = parts[0];
    const rawName = String(parts[1] || '').replace(/\(\d+\)/, '').trim();
    const rawAddress = String(parts[2] || '');
    const rawPhone = String(parts[3] || '').replace(/\D/g, '');
    const rawEmail = String(parts[4] || '').trim();

    // Deduce state by looking for substrings in Address
    let determinedState = INDIA_STATES_UTS[0];
    const upperAddress = rawAddress.toUpperCase();
    for (const state of INDIA_STATES_UTS) {
      if (upperAddress.includes(state.toUpperCase())) {
         determinedState = state;
         break;
      }
    }

    if (rawName && rawName.length > 2) {
      parsedVolunteers.push({
        name: rawName || 'Unknown Agent',
        phone: rawPhone || 'Unavailable',
        email: rawEmail || null,
        district: determinedState,
        full_address: rawAddress || null,
        skills: ['General Relief', 'Community Outreach'],
        available_today: Math.random() > 0.5,
        reliability_score: Math.floor(Math.random() * 40) + 60, // 60 to 100
      });
      validCount++;
    }

    // Limit to 500 to respect Supabase anon key rate limits
    if (validCount >= 100) break; // Reduced to 100 for safety over anon key tests
  }

  console.log(`Cleaned ${validCount} valid volunteer profiles. Pushing to Supabase...`);

  if (parsedVolunteers.length > 0) {
      const { error } = await supabase.from('volunteers').insert(parsedVolunteers);
      
      if (error) {
        console.error(`Chunk insert failed:`, error.message);
      } else {
        console.log(`✅ Chunk inserted successfully (${parsedVolunteers.length} records).`);
      }
  }

  console.log('Ingestion pipeline completed.');
}

main();
