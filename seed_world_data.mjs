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

const countriesAndRegions = {
  "Ukraine": ["Donetsk", "Luhansk", "Kharkiv", "Kherson", "Zaporizhzhia", "Mykolaiv", "Dnipro"],
  "Turkey": ["Gaziantep", "Hatay", "Kahramanmaras", "Adiyaman", "Sanliurfa", "Malatya", "Osmaniye"],
  "Lebanon": ["Beirut", "Tripoli", "Sidon", "Tyre", "Baalbek", "Zahlé", "Nabatieh"],
  "Peru": ["Lima", "Arequipa", "Cusco", "Piura", "Iquitos", "Chiclayo", "Trujillo"],
  "El Salvador": ["San Salvador", "Santa Ana", "San Miguel", "Soyapango", "Apopa", "Mejicanos"],
  "Honduras": ["Tegucigalpa", "San Pedro Sula", "Choloma", "La Ceiba", "El Progreso", "Comayagua"],
  "Papua New Guinea": ["Port Moresby", "Lae", "Mount Hagen", "Madang", "Goroka", "Wewak", "Popondetta"],
  "Myanmar": ["Yangon", "Mandalay", "Naypyidaw", "Bago", "Mawlamyine", "Taunggyi", "Sittwe"],
  "Sri Lanka": ["Colombo", "Kandy", "Galle", "Jaffna", "Negombo", "Anuradhapura", "Trincomalee"],
  "Nepal": ["Kathmandu", "Pokhara", "Lalitpur", "Biratnagar", "Bharatpur", "Birgunj", "Dharan"],
  "Sudan": ["Khartoum", "Omdurman", "Nyala", "Port Sudan", "Kassala", "El Obeid", "Kosti"],
  "Somalia": ["Mogadishu", "Hargeisa", "Kismayo", "Baidoa", "Bosaso", "Garowe", "Galkayo"]
};

const problemTypes = [
  "Water Scarcity", 
  "Healthcare Access", 
  "Education Deficit", 
  "Infrastructure Collapse",
  "Agricultural Crises",
  "Sanitation Issues",
  "Child Malnutrition",
  "Refugee Displacement",
  "Disease Outbreak",
  "Food Insecurity"
];

const severities = ["High", "High", "High", "Medium", "Medium", "Low"]; // Weighted heavily towards High/Med for actionability
const surveyors = ["John Smith", "Maria Garcia", "Alice Nkomo", "David Chen", "Amina Yusuf", "Carlos Rodriguez", "Sarah Johnson", "Jean-Paul Dubois", "Mei Lin", "Tariq Ali"];

const templates = [
  "Severe drought has depleted local wells. Immediate water trucking needed.",
  "Only clinic in a 50km radius lacks essential medicines for malaria and cholera.",
  "Schools closed due to severe flooding. Tents needed for temporary classrooms.",
  "Bridges destroyed by recent earthquake. Remote communities cut off from supply lines.",
  "Locust swarms have devastated seasonal crops. Imminent food shortage risk.",
  "Overcrowded temporary shelters leading to rapid spread of infectious diseases.",
  "High rates of severe acute malnutrition observed in children under 5.",
  "Recent conflict has displaced thousands who arrived with no belongings.",
  "Suspicious cluster of fever and respiratory issues requires immediate medical team.",
  "Hyperinflation has made basic food staples completely unaffordable for 80% of families."
];

async function seedData() {
  const records = [];
  
  // Generating a randomized list of around ~300 unique entries
  for (const [country, regions] of Object.entries(countriesAndRegions)) {
    for (let i = 0; i < 3; i++) { 
        regions.forEach(region => {
            const problem = problemTypes[Math.floor(Math.random() * problemTypes.length)];
            const severity = severities[Math.floor(Math.random() * severities.length)];
            const temp = templates[Math.floor(Math.random() * templates.length)];
            
            // Random date within the last 45 days
            const surveyDate = new Date(Date.now() - Math.floor(Math.random() * 45 * 24 * 60 * 60 * 1000));
            
            records.push({
                village_name: `${region}, ${country}`,
                problem_type: problem,
                severity: severity,
                affected_families: Math.floor(Math.random() * 800) + 50, // 50 to 850 families
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

  console.log(`Prepared ${records.length} global records. Uploading...`);

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
  
  console.log("Database seeded successfully with vast global NGO data!");
  process.exit(0);
}

seedData();
