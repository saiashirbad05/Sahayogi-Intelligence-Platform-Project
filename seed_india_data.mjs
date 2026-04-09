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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const statesAndVillages = {
  "Odisha": ["Baripada", "Rourkela", "Joda", "Binka", "Kamakhyanagar", "Pipili", "Asika", "Balangir", "Bhadrak", "Cuttack"],
  "Maharashtra": ["Ralegan Siddhi", "Hiware Bazar", "Patan", "Shirpur", "Khed", "Bhor", "Alibag", "Chiplun", "Jalna"],
  "Bihar": ["Dharnai", "Saurath", "Maner", "Sonepur", "Rajgir", "Bikram", "Gaya", "Munger", "Purnia", "Chhapra"],
  "Uttar Pradesh": ["Barabanki", "Koraon", "Sardhana", "Gursahaiganj", "Khekra", "Siana", "Mathura", "Aligarh", "Banda"],
  "Rajasthan": ["Piplantri", "Bhangarh", "Khimsar", "Mandawa", "Samode", "Rohet", "Bikaner", "Alwar", "Pali"],
  "Tamil Nadu": ["Odanthurai", "Kallidaikurichi", "Thiruvidaimarudur", "Aruppukkottai", "Bhavani", "Erode", "Dindigul"],
  "Gujarat": ["Punsari", "Dharampur", "Mahuva", "Radhanpur", "Umreth", "Anand", "Bharuch", "Navsari", "Vapi"],
  "Karnataka": ["Kokkare Bellur", "Agumbe", "Gokarna", "Banavasi", "Puttur", "Udupi", "Hampi", "Hassan", "Bidar"],
  "West Bengal": ["Bishnupur", "Jhargram", "Purulia", "Bankura", "Birbhum", "Hooghly", "Nadia", "Malda", "Darjeeling"],
  "Madhya Pradesh": ["Mandu", "Orchha", "Chanderi", "Pachmarhi", "Khajuraho", "Shivpuri", "Rewa", "Satna", "Sagar"],
  "Punjab": ["Kapurthala", "Bathinda", "Pathankot", "Hoshiarpur", "Moga", "Faridkot", "Muktsar", "Fazilka"],
  "Haryana": ["Karnal", "Panipat", "Rohtak", "Hisar", "Sonipat", "Jhajjar", "Rewari", "Panchkula"]
};

const problemTypes = [
  "Water Scarcity", 
  "Healthcare Access", 
  "Education Deficit", 
  "Infrastructure Collapse",
  "Agricultural Crises",
  "Sanitation Issues",
  "Child Malnutrition",
  "Flooding Infrastructure",
  "Power Outages"
];

const severities = ["High", "High", "High", "Medium", "Medium", "Low"]; // Weighted heavily towards High/Med for actionability
const surveyors = ["Rahul Sharma", "Priya Singh", "Amit Patel", "Sneha Rao", "Ravi Kumar", "Anjali Desa", "Vikram Singh", "Pooja Gupta", "Arun Verma", "Nisha Reddy"];

const templates = [
  "Severe shortage reported during summer months. Wells have dried up completely.",
  "Primary health center is 20km away. Urgent medical supplies needed for maternal care.",
  "Local school building damaged by recent storms. Children have nowhere to study.",
  "Connecting roads washed away by monsoon rains. Village completely isolated from main market.",
  "Massive crop failure due to unpredictable weather patterns. Farmers in severe distress.",
  "Lack of clean drinking water causing repeated cholera outbreak infections.",
  "Anganwadi center lacks basic nutritional supplies for infants under 3 years.",
  "No electricity for the past 7 days due to broken transformer poles.",
  "Stagnant water causing massive dengue fever outbreak across 50+ households."
];

async function seedData() {
  const records = [];
  
  // Generating a randomized list of around ~350 unique entries
  for (const [state, villages] of Object.entries(statesAndVillages)) {
    for (let i = 0; i < 3; i++) { // Repeat to generate multiple reports for large states
        villages.forEach(village => {
            const problem = problemTypes[Math.floor(Math.random() * problemTypes.length)];
            const severity = severities[Math.floor(Math.random() * severities.length)];
            const temp = templates[Math.floor(Math.random() * templates.length)];
            
            // Random date within the last 30 days
            const surveyDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
            
            records.push({
                village_name: `${village}, ${state}`,
                problem_type: problem,
                severity: severity,
                affected_families: Math.floor(Math.random() * 400) + 20, // 20 to 420 families
                notes: temp,
                survey_date: surveyDate.toISOString().split('T')[0],
                surveyor_name: surveyors[Math.floor(Math.random() * surveyors.length)]
            });
        });
    }
  }

  // Shuffle array
  for (let i = records.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [records[i], records[j]] = [records[j], records[i]];
  }

  console.log(`Prepared ${records.length} records. Uploading...`);

  // Insert in batches of 50
  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50);
    const { error } = await supabase.from('survey_data').insert(batch);
    if (error) {
      console.error("Error inserting batch:", error.message);
    } else {
      console.log(`Inserted batch ${i} to ${i + batch.length} of ${records.length} records...`);
    }
  }
  
  console.log("Database seeded successfully with vast Indian village data!");
  process.exit(0);
}

seedData();
