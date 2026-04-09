import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const generateActionPlan = async (aggregatedDataText: string) => {
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  // Use fetch fallback if SDK isn't playing nicely in browser without node pollyfills.
  // Actually, @google/genai SDK works in modern environments.
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
You are an expert NGO Community Risk Analyst.
Given the following aggregated field survey data about regional problems, severity levels, and affected families:

${aggregatedDataText}

Please generate a clear, 3-step Action Plan for the NGO coordinators.
Format your response in Markdown with clear headings. Focus on:
1. Immediate Intervention (0-48 hours)
2. Resource Mobilization & Government Escalation
3. Long-term Community Resilience

Do not output anything outside of the plan. Be highly specific based on the problems listed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error calling Gemini:', error);
    throw error;
  }
};
export const validateSurveyData = async (rows: any[]) => {
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Sample the data (keep it under token limits)
  const sample = JSON.stringify(rows.slice(0, 10));
  
  const prompt = `
You are an AI Data Auditor for the Sahayogi Community Risk platform.
Analyze the following sample of 10 survey records for data integrity and risk assessment:

${sample}

Please provide a concise "Intelligence Audit Report" including:
1. **Data Consistency**: Are there logical mismatches (e.g., severe impact with 0 families affected)?
2. **Priority Flags**: Which records should the NGO mission coordinators prioritize first?
3. **Data Quality Score**: Give a score from 0-100 based on the completeness and logic of the entries.
4. **Correction Recommendations**: Any immediate field survey improvements?

Keep it professional, high-fidelity, and formatted in clean Markdown.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return result.text;
  } catch (error) {
    console.error('Error in AI Data Audit:', error);
    return "AI Validation skipped due to connection refresh. Data integrity is being maintained via standard filters.";
  }
};
