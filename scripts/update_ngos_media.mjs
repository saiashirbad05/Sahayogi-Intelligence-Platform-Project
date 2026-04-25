import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zodrhrqqeyehsuswgtbh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZHJocnFxZXllaHN1c3dndGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzA4ODIsImV4cCI6MjA5MDAwNjg4Mn0.na0KDjwIarz9qGOWI92RVdhDwZejEJT3OkjUs0MCW98'
);

// All available images from the csv files folder
const ALL_IMAGES = [
  '/images/uploads/IMG-20260401-WA0000.jpg',
  '/images/uploads/IMG-20260401-WA0001.jpg',
  '/images/uploads/IMG-20260401-WA0002.jpg',
  '/images/uploads/IMG-20260401-WA0003.jpg',
  '/images/uploads/IMG-20260401-WA0004.jpg',
  '/images/uploads/IMG-20260401-WA0005.jpg',
  '/images/uploads/IMG-20260401-WA0006.jpg',
  '/images/uploads/IMG-20260401-WA0007.jpg',
  '/images/uploads/IMG-20260401-WA0008.jpg',
  '/images/uploads/IMG-20260401-WA0009.jpg',
  '/images/uploads/IMG-20260401-WA0010.jpg',
  '/images/uploads/IMG-20260401-WA0011.jpg',
  '/images/uploads/IMG-20260402-WA0000.jpg',
  '/images/uploads/IMG-20260402-WA0001.jpg',
  '/images/uploads/IMG-20260402-WA0002.jpg',
  '/images/uploads/IMG-20260402-WA0003.jpg',
  '/images/uploads/IMG-20260402-WA0004.jpg',
  '/images/uploads/IMG-20260402-WA0005.jpg',
  '/images/uploads/IMG-20260402-WA0006.jpg',
  '/images/uploads/IMG-20260402-WA0007.jpg',
  '/images/uploads/IMG-20260402-WA0008.jpg',
  '/images/uploads/IMG-20260402-WA0009.jpg',
  '/images/uploads/IMG-20260402-WA0010.jpg',
  '/images/uploads/IMG-20260402-WA0011.jpg',
  '/images/uploads/IMG-20260402-WA0012.jpg',
  '/images/uploads/IMG-20260402-WA0013.jpg',
  '/images/uploads/IMG-20260402-WA0014.jpg',
  '/images/uploads/IMG-20260402-WA0015.jpg',
  '/images/uploads/IMG-20260402-WA0016.jpg',
  '/images/uploads/IMG-20260402-WA0017.jpg',
  '/images/uploads/IMG-20260402-WA0018.jpg',
  '/images/uploads/IMG-20260402-WA0019.jpg',
  '/images/uploads/IMG-20260402-WA0020.jpg',
  '/images/uploads/IMG-20260402-WA0021.jpg',
  '/images/uploads/IMG-20260402-WA0022.jpg',
  '/images/uploads/IMG-20260402-WA0023.jpg',
  '/images/uploads/IMG-20260402-WA0024.jpg',
  '/images/uploads/IMG-20260402-WA0025.jpg',
  '/images/uploads/IMG-20260402-WA0026.jpg',
  '/images/uploads/download.jpg',
  '/images/uploads/download (1).jpg',
  '/images/uploads/download (2).jpg',
  '/images/uploads/images (3).jpg',
  '/images/uploads/images (4).jpg',
  '/images/uploads/images (5).jpg',
];

// All PDF reports from csv files folder
const ALL_PDFS = [
  '/pdfs/uploads/1730966679_Annual Report_Website 2023-24.pdf',
  '/pdfs/uploads/2019-SEWA-Bharat-Annual-Report.pdf',
  '/pdfs/uploads/Annual Report 2020.pdf',
  '/pdfs/uploads/Annual Report 2023 (3).pdf',
  '/pdfs/uploads/Annual Report 2024-25.pdf',
  '/pdfs/uploads/Annual Report.pdf',
  '/pdfs/uploads/Annual Report_Master Document_2021_2.pdf',
  '/pdfs/uploads/Annual-Report-20-21.pdf',
  '/pdfs/uploads/Annual-Report-2015-16.pdf',
  '/pdfs/uploads/Annual-Report-2016-2017.pdf',
  '/pdfs/uploads/Annual-Report-2022-23 (1).pdf',
  '/pdfs/uploads/Annual-report-2022-23.pdf',
  '/pdfs/uploads/Annual-Report-22-23-2.pdf',
  '/pdfs/uploads/annualreport 2008-09.pdf',
  '/pdfs/uploads/Annual_Report_24-25_Tapestry_web.pdf',
  '/pdfs/uploads/AR-2013_Final-F.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2008.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2009.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2010.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2011.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2012.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2013.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2014.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2015.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2016.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2017.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2018.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2019.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2020.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2021.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2022.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2023.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2024.pdf',
  '/pdfs/uploads/Bal-raksha-bharat-annual-report-2025.pdf',
  '/pdfs/uploads/CRY-Annual-Report-2024-25.pdf',
  '/pdfs/uploads/NGO_report_small.pdf',
  '/pdfs/uploads/Seva_annual_report_2020.pdf',
  '/pdfs/uploads/Seva_annual_report_2021.pdf',
  '/pdfs/uploads/Seva_annual_report_2022.pdf',
  '/pdfs/uploads/Seva_annual_report_2023.pdf',
  '/pdfs/uploads/Seva_annual_report_2024.pdf',
  '/pdfs/uploads/Seva_annual_report_2025.pdf',
  '/pdfs/uploads/SEWA Bharat Annual Report 2022 final.pdf',
  "/pdfs/uploads/SEWA Bharat's Annual Report_ 2024  (3).pdf",
  '/pdfs/uploads/SEWA-Annual-Report-2014.pdf',
  '/pdfs/uploads/SEWA-Bharat-AR-2012-small.pdf',
];

// Helper: get N unique random images starting from an offset
function getImageSet(index, count = 5) {
  const start = (index * 7) % ALL_IMAGES.length;
  const imgs = [];
  for (let i = 0; i < count; i++) {
    imgs.push(ALL_IMAGES[(start + i) % ALL_IMAGES.length]);
  }
  return imgs;
}

async function run() {
  console.log('=== SAHAYOGI MEDIA UPDATE SCRIPT ===');

  // Step 1: Fetch all featured NGOs
  const { data: featured, error: fErr } = await supabase
    .from('ngos')
    .select('id, name')
    .eq('featured', true);

  if (fErr) { console.error('Error fetching featured:', fErr); return; }
  console.log(`Found ${featured.length} featured NGOs`);

  // Step 2: Update each featured NGO with unique image combos and a PDF
  for (let i = 0; i < featured.length; i++) {
    const ngo = featured[i];
    const images = getImageSet(i, 6);
    const pdf = ALL_PDFS[i % ALL_PDFS.length];

    const { error } = await supabase
      .from('ngos')
      .update({
        image_gallery: images,
        social_links: { report: pdf, twitter: '#', linkedin: '#', instagram: '#' }
      })
      .eq('id', ngo.id);

    if (error) {
      console.error(`  FAIL: ${ngo.name}`, error.message);
    } else {
      console.log(`  ✓ ${ngo.name} → ${images.length} imgs + report`);
    }
  }

  // Step 3: Also assign images to the top 100 non-featured NGOs by rating
  const { data: topRated, error: tErr } = await supabase
    .from('ngos')
    .select('id, name')
    .eq('featured', false)
    .order('impact_rating', { ascending: false })
    .limit(100);

  if (tErr) { console.error('Error fetching top rated:', tErr); return; }
  console.log(`\nFound ${topRated.length} top-rated non-featured NGOs`);

  for (let i = 0; i < topRated.length; i++) {
    const ngo = topRated[i];
    const images = getImageSet(i + 50, 4); // offset to get different combos
    const pdf = ALL_PDFS[(i + 20) % ALL_PDFS.length];

    const { error } = await supabase
      .from('ngos')
      .update({
        image_gallery: images,
        social_links: { report: pdf }
      })
      .eq('id', ngo.id);

    if (error) {
      console.error(`  FAIL: ${ngo.name}`, error.message);
    } else {
      console.log(`  ✓ ${ngo.name} → ${images.length} imgs`);
    }
  }

  console.log('\n=== MEDIA UPDATE COMPLETE ===');
}

run().catch(console.error);
