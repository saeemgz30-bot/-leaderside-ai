import { GoogleGenAI } from '@google/genai';

function getClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is not configured. Set it in .env');
  }
  return new GoogleGenAI({ apiKey: key });
}

function parseJsonResponse(text: string): unknown {
  if (!text) throw new Error('AI returned an empty response');
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI returned invalid response format');
  }
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('AI returned malformed JSON');
  }
}

export interface PersonalizationResult {
  subject: string;
  body: string;
  reasoning: string;
}

export async function generatePersonalization(
  lead: {
    company_name: string;
    contact_name: string | null;
    title: string | null;
    industry: string | null;
    company_size: string | null;
    revenue: string | null;
    website: string | null;
    notes: string | null;
  },
  tone: string,
  type: string,
  context: string,
): Promise<PersonalizationResult> {
  const client = getClient();
  const firstName = lead.contact_name?.split(' ')[0] || 'there';

  const prompt = `You are an expert B2B sales copywriter. Write a hyper-personalized ${type} outreach message.

LEAD DETAILS:
- Company: ${lead.company_name}
- Contact: ${lead.contact_name || 'Unknown'}
- Title: ${lead.title || 'Unknown'}
- Industry: ${lead.industry || 'Unknown'}
- Company Size: ${lead.company_size || 'Unknown'}
- Revenue: ${lead.revenue || 'Unknown'}
- Website: ${lead.website || 'Unknown'}
- Notes: ${lead.notes || 'None'}

TONE: ${tone}
ADDITIONAL CONTEXT: ${context || 'None'}

Requirements:
1. Subject line must be under 60 characters and compelling
2. Body must be concise (max 150 words), personalized, and value-driven
3. Reference specific details about their company/industry
4. Include a clear, soft CTA
5. Use {{first_name}} as placeholder for the contact's first name (${firstName})

Return ONLY valid JSON in this exact format:
{"subject": "...", "body": "...", "reasoning": "Brief explanation of personalization choices"}`;

  const response = await client.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
  });

  return parseJsonResponse(response.text || '') as PersonalizationResult;
}

export interface ExtractedLead {
  company_name: string;
  contact_name: string;
  title: string;
  industry: string;
  company_size: string;
  website: string;
  email: string;
  score: number;
  reasoning: string;
}

export async function extractLeadsFromQuery(
  query: string,
  industry: string,
  companySize: string,
): Promise<{ leads: ExtractedLead[]; summary: string }> {
  const client = getClient();

  const prompt = `You are a B2B lead generation expert. Based on the following search criteria, generate realistic-looking prospect leads that match the criteria.

SEARCH QUERY: ${query}
INDUSTRY FILTER: ${industry || 'Any'}
COMPANY SIZE FILTER: ${companySize || 'Any'}

Generate 5 high-quality leads. For each lead, assign a fit score (0-100) based on how well they match the criteria.

Return ONLY valid JSON in this exact format:
{
  "leads": [
    {
      "company_name": "...",
      "contact_name": "...",
      "title": "...",
      "industry": "...",
      "company_size": "...",
      "website": "...",
      "email": "...",
      "score": 85,
      "reasoning": "Why this lead is a good fit"
    }
  ],
  "summary": "Brief summary of the extraction results"
}`;

  const response = await client.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
  });

  return parseJsonResponse(response.text || '') as { leads: ExtractedLead[]; summary: string };
}
