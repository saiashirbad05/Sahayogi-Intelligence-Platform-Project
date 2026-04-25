import { supabase } from './supabase';

export interface NeedScore {
  district: string;
  need_score: number;
  top_category: string;
  report_count: number;
  category_breakdown: Record<string, number>;
}

export async function calculateDistrictScores() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: reports, error } = await supabase
    .from('community_reports')
    .select('*')
    .gte('date_reported', thirtyDaysAgo.toISOString().split('T')[0]);

  if (error) {
    console.error('Error fetching reports for engine:', error);
    return;
  }

  const districtData: Record<string, { sum: number; categories: Record<string, number>; count: number }> = {};
  const now = new Date();

  reports.forEach(report => {
    const reportDate = new Date(report.date_reported);
    const diffDays = Math.ceil((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
    const weight = diffDays <= 7 ? 1.2 : 1.0;
    
    if (!districtData[report.district]) {
      districtData[report.district] = { sum: 0, categories: {}, count: 0 };
    }

    districtData[report.district].sum += report.severity * weight;
    districtData[report.district].count += 1;
    districtData[report.district].categories[report.category] = (districtData[report.district].categories[report.category] || 0) + 1;
  });

  for (const [district, info] of Object.entries(districtData)) {
    const finalScore = Math.min(100, info.sum);
    
    // Find top category
    let topCat = 'other';
    let maxCount = 0;
    Object.entries(info.categories).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCat = cat;
      }
    });

    // Update need_scores table
    const { error: upsertError } = await supabase
      .from('need_scores')
      .upsert({
        district,
        need_score: finalScore,
        top_category: topCat,
        report_count: info.count,
        category_breakdown: info.categories,
        last_updated: new Date().toISOString()
      });

    if (upsertError) console.error(`Error upserting score for ${district}:`, upsertError);

    // AUTO-TASK TRIGGER: If score > 70
    if (finalScore > 70) {
      await autoCreateTask(district, topCat);
    }
  }
}

async function autoCreateTask(district: string, category: string) {
  // Check if an open task for this district/category already exists to avoid spam
  const { data: existing } = await supabase
    .from('tasks')
    .select('id')
    .eq('district', district)
    .eq('category', category)
    .eq('status', 'open')
    .limit(1);

  if (existing && existing.length > 0) return;

  const { error } = await supabase
    .from('tasks')
    .insert({
      title: `Urgent Relief: ${category.toUpperCase()} in ${district}`,
      description: `Automated alert: High need score detected. Crisis level reports indicate immediate resource deployment required for ${category}.`,
      village: 'Multiple',
      block: 'District Wide',
      district: district,
      category: category,
      skills_required: 'General Relief, Coordination',
      urgency: 3,
      volunteers_needed: 5,
      task_date: new Date().toISOString().split('T')[0],
      status: 'open',
      created_by_ngo: 'Sahayogi AI Intel'
    });

  if (error) console.error('Error creating auto-task:', error);
}
