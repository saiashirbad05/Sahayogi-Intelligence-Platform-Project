import fs from 'fs';
import path from 'path';

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal'
];

const uts = [
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const allRegions = [...states, ...uts];

const socialSources = ['X (Twitter)', 'LinkedIn', 'Instagram', 'Google Maps', 'YouTube', 'Official Website', 'Google Search'];

const specialties = ['Healthcare', 'Clean Water', 'Education', 'Disaster Relief', 'Sanitation', 'Infrastructure', 'Mobile Health', 'Agriculture', 'Legal Aid', 'Child Welfare', 'Women Empowerment', 'Animal Rights', 'Environmental Conservation'];

// THEMED HIGH-QUALITY IMAGE GALLERY (UNSPLASH)
const galleryPool = {
  'Education': [
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1544648184-55513e14dc94?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'
  ],
  'Healthcare': [
    'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1538108197017-c1a966bd766a?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1504813184591-01592fd03cf7?auto=format&fit=crop&q=80&w=800'
  ],
  'Disaster Relief': [
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800'
  ],
  'Clean Water': [
    'https://images.unsplash.com/photo-1548936568-15f795995ab3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800'
  ],
  'Sanitation': [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=800'
  ],
  'Infrastructure': [
    'https://images.unsplash.com/photo-1503387762-592dea58ef21?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'
  ],
  'Agriculture': [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800'
  ],
  'Child Welfare': [
    'https://images.unsplash.com/photo-1482235225574-c326d09e1346?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800'
  ],
  'Women Empowerment': [
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1623512803859-674ee51afbb6?auto=format&fit=crop&q=80&w=800'
  ]
};

const defaultGallery = [
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800'
];

const missionPrefixes = ['Transforming lives through', 'Empowering communities via', 'Dedicated to excellence in', 'Innovating for', 'Bridging the gap between'];
const missionSuffixes = ['at the grassroots level.', 'with transparency and heart.', 'focusing on sustainable impact.', 'for future generations.', 'across rural and urban divides.'];

const accomplishments = [
  'Awarded Best Social Impact 2023',
  'Reached over 50,000 beneficiaries',
  'Launched 10 new community centers',
  'Collaborated with UN on Sanitation',
  'Impacted 100+ villages last quarter',
  'National Transparency Certificate',
  'Top Rated for Efficiency 2024'
];

const realWorldNGOs = [
  { 
    name: "Pehchaan The Street School", specialty: "Education", location: "Delhi", region: "Delhi", 
    email: "pehchaanschool@gmail.com", website: "www.pehchaanstreetschool.org", 
    address: "Indraprastha Metro Station, Delhi", rating: "4.9", members: 1200, source: "LinkedIn", impact: 8500,
    mission: "To provide free education to underprivileged children across the streets of Delhi, focusing on holistic development and self-identification.",
    achievements: ["Educated 1500+ street children", "Started 7 street centers", "CSR Excellence Award 2024"],
    gallery: galleryPool['Education']
  },
  { 
    name: "Akshaya Patra Foundation", specialty: "Nutrition/Education", location: "Bengaluru", region: "Karnataka", 
    email: "infodesk@akshayapatra.org", website: "www.akshayapatra.org", 
    address: "HKBK, Bengaluru", rating: "4.9", members: 45000, source: "Google Search", impact: 15000,
    mission: "No child in India shall be deprived of education because of hunger. Providing the world's largest mid-day meal program.",
    achievements: ["Served 3 Billion meals to date", "Global Hunger Warrior Award", "Partnered with 12 State Governments"],
    gallery: galleryPool['Education']
  },
  { 
    name: "Goonj", specialty: "Disaster Relief", location: "Delhi", region: "Delhi", 
    email: "mail@goonj.org", website: "www.goonj.org", 
    address: "Madan Pur Khadar, Delhi", rating: "4.8", members: 8000, source: "Instagram", impact: 12000,
    mission: "Using the under-utilized material of cities as a tool for development in rural India. Clothing as a matter of dignity.",
    achievements: ["Massive Relief during Kerala Floods", "Clothes for Work initiative", "Magsaysay Award Recipient"],
    gallery: galleryPool['Disaster Relief']
  }
];

const generateData = () => {
  const entities = [];

  // 1. Core Top Tier NGOs
  realWorldNGOs.forEach((ngo, idx) => {
    entities.push({
      id: `top-ngo-${idx}`,
      type: 'NGO',
      ...ngo,
      rating: parseFloat(ngo.rating),
      last_extracted: new Date().toISOString().split('T')[0],
      head_office: `${ngo.location}, India`
    });
  });

  // 2. National Expansion
  for (let i = 1; i <= 1500; i++) {
    const region = allRegions[Math.floor(Math.random() * allRegions.length)];
    const specialty = specialties[Math.floor(Math.random() * specialties.length)];
    const source = socialSources[Math.floor(Math.random() * socialSources.length)];
    const name = `${specialty} Foundation of ${region}`;
    
    const relevantGallery = galleryPool[specialty] || defaultGallery;

    entities.push({
      id: `reg-ngo-${i}`,
      type: 'NGO',
      name: name,
      specialty: specialty,
      location: region,
      region: region,
      email: `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`,
      website: `www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`,
      address: `Vihar ${Math.floor(Math.random() * 999)}, ${region}`,
      rating: parseFloat((Math.random() * 2 + 2.5).toFixed(1)),
      member_count: Math.floor(Math.random() * 5000) + 100,
      social_source: source,
      impact_score: Math.floor(Math.random() * 5000) + 500,
      mission: `${missionPrefixes[Math.floor(Math.random() * missionPrefixes.length)]} ${specialty.toLowerCase()} ${missionSuffixes[Math.floor(Math.random() * missionSuffixes.length)]}`,
      achievements: [accomplishments[Math.floor(Math.random() * accomplishments.length)], accomplishments[Math.floor(Math.random() * accomplishments.length)]],
      gallery: relevantGallery,
      head_office: `${region}, India`,
      last_extracted: new Date().toISOString().split('T')[0]
    });
  }

  // 3. National Expansion - Volunteers
  for (let i = 1; i <= 1000; i++) {
    const region = allRegions[Math.floor(Math.random() * allRegions.length)];
    const specialty = specialties[Math.floor(Math.random() * specialties.length)];
    const fullName = `Volunteer ${i}`;
    
    entities.push({
      id: `reg-vol-${i}`,
      type: 'Volunteer',
      name: fullName,
      specialty: specialty,
      location: region,
      region: region,
      email: `vol.${i}@gmail.com`,
      address: `Street ${Math.floor(Math.random() * 100)}, ${region}`,
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      member_count: 1,
      social_source: socialSources[Math.floor(Math.random() * socialSources.length)],
      impact_score: Math.floor(Math.random() * 1000) + 100,
      mission: `Dedicated to serving ${region} in the field of ${specialty}.`,
      gallery: defaultGallery,
      head_office: region,
      experience_years: Math.floor(Math.random() * 10) + 1
    });
  }

  // PRIORITY SORTING: Rating (desc) -> Members (desc) -> Impact (desc)
  entities.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.member_count !== a.member_count) return b.member_count - a.member_count;
    return (b.impact_score || 0) - (a.impact_score || 0);
  });

  const dir = './public/data';
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(path.join(dir, 'entities.json'), JSON.stringify(entities, null, 2));
  console.log(`Successfully generated ${entities.length} entities with deep metadata.`);
};

generateData();
