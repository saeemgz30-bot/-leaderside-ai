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

function logGeminiError(context: string, error: unknown): void {
  console.error(`[Gemini] ${context} failed:`);
  if (error instanceof Error) {
    console.error(`  Message: ${error.message}`);
    console.error(`  Stack: ${error.stack || 'no stack'}`);
    // @ts-expect-error: Gemini SDK errors nest details under .error
    const apiError = (error as Record<string, unknown>).error;
    if (apiError) {
      console.error(`  API Error: ${JSON.stringify(apiError)}`);
    }
  } else {
    console.error(`  Unknown error: ${JSON.stringify(error)}`);
  }
}

// --- Fallback simulated data ---

const FALLBACK_LEAD_TEMPLATES = [
  { company_name: 'CyberShield AI', contact_name: 'Sarah Jenkins', title: 'Chief Information Security Officer', industry: 'Cybersecurity', company_size: '120', website: 'https://cybershield.ai', email: 's.jenkins@cybershield.ai' },
  { company_name: 'AegisNet Security', contact_name: 'Marcus Vance', title: 'VP of Engineering', industry: 'Cybersecurity', company_size: '85', website: 'https://aegisnet.io', email: 'marcus.vance@aegisnet.io' },
  { company_name: 'FortressIdentity', contact_name: 'David Chen', title: 'Head of Growth', industry: 'Cybersecurity', company_size: '75', website: 'https://fortressidentity.tech', email: 'dchen@fortressidentity.tech' },
  { company_name: 'QuantumDefend', contact_name: 'Elena Rostova', title: 'VP of Product', industry: 'Cybersecurity', company_size: '160', website: 'https://quantumdefend.com', email: 'e.rostova@quantumdefend.com' },
  { company_name: 'ThreatPulse Systems', contact_name: 'Amanda Hayes', title: 'Director of Business Development', industry: 'Cybersecurity', company_size: '190', website: 'https://threatpulse.io', email: 'ahayes@threatpulse.io' },
];

function generateFallbackLeads(query: string, industry: string, companySize: string): { leads: ExtractedLead[]; summary: string } {
  const ind = industry || 'Technology';
  const templates = FALLBACK_LEAD_TEMPLATES.map((t, i) => ({
    ...t,
    industry: ind,
    company_size: companySize || t.company_size,
    score: 95 - i * 4,
    reasoning: `Strong match for "${query}" — ${ind} company in the ${companySize || 'target'} size range with relevant growth signals.`,
  }));
  return {
    leads: templates,
    summary: `Generated ${templates.length} simulated leads matching your criteria. (Fallback mode — live AI unavailable)`,
  };
}

function generateFallbackPersonalization(
  lead: { company_name: string; contact_name: string | null; title: string | null; industry: string | null; notes: string | null },
  tone: string,
  type: string,
  context: string,
): PersonalizationResult {
  const firstName = lead.contact_name?.split(' ')[0] || 'there';
  const company = lead.company_name;
  const industry = lead.industry || 'your industry';

  return {
    subject: `Quick question about ${company}'s growth`,
    body: `Hi {{first_name}},\n\nI noticed ${company} has been making moves in the ${industry} space${lead.notes ? ` — ${lead.notes}` : ''}.\n\nWe help companies like yours streamline their outreach and growth workflows${context ? `, especially around ${context}` : ''}. I'd love to share how teams in similar roles are seeing results.\n\nWould you be open to a brief 10-minute chat next week?\n\nBest regards,\n[Your Name]`,
    reasoning: `Fallback message personalized for ${firstName} at ${company}. References their industry${lead.notes ? ' and notes' : ''}. (Fallback mode — live AI unavailable)`,
  };
}

// --- Public API ---

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
  try {
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
  } catch (error) {
    logGeminiError('generatePersonalization', error);
    return generateFallbackPersonalization(lead, tone, type, context);
  }
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
  try {
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
  } catch (error) {
    logGeminiError('extractLeadsFromQuery', error);
    return generateFallbackLeads(query, industry, companySize);
  }
}
