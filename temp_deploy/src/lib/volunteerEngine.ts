import { supabase } from './supabase';
import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export async function matchVolunteersToTask(taskId: string) {
  if (!apiKey) {
    console.error('Gemini API key missing for volunteer matching');
    return false;
  }

  // 1. Fetch Task Details
  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (!task) return false;

  // 2. Fetch Available Volunteers in the same district
  const { data: volunteers } = await supabase
    .from('volunteers')
    .select('*')
    .eq('district', task.district)
    .eq('available_today', true);

  if (!volunteers || volunteers.length === 0) {
    console.warn(`No active volunteers found in district ${task.district}`);
    return false;
  }

  // 3. Gemini Ranking Prompt
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are the Sahayogi Volunteer Coordination AI.
We have an urgent task and a pool of available volunteers.
TASK: ${JSON.stringify({ 
  category: task.category, 
  required_skills: task.skills_required, 
  urgency: task.urgency 
})}

AVAILABLE VOLUNTEERS: ${JSON.stringify(volunteers.map(v => ({ 
  phone: v.phone, 
  skills: v.skills, 
  reliability: v.reliability_score 
})))}

Rank the top ${task.volunteers_needed} best matching volunteers for this task based on skills and reliability score.
Respond EXACTLY with a JSON array of objects. Each object must have "phone" (string), "match_score" (integer 0-100), and "gemini_reason" (string).
No markdown formatting, just raw JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
    });
    
    // Clean string (just in case they put backticks)
    let jsonStr = response.text || "[]";
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const matches: Array<{ phone: string, match_score: number, gemini_reason: string }> = JSON.parse(jsonStr);

    // 4. Insert into task_matches
    for (const match of matches) {
      await supabase
        .from('task_matches')
        .insert({
          task_id: taskId,
          volunteer_phone: match.phone,
          match_score: match.match_score,
          gemini_reason: match.gemini_reason,
          status: 'pending'
        });
    }

    return true;
  } catch (error) {
    console.error('Error matching volunteers:', error);
    return false;
  }
}
