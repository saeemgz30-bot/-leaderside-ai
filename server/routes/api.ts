import { Router } from 'express';
import { generatePersonalization, extractLeadsFromQuery } from '../services/gemini';

const router = Router();

router.post('/personalize', async (req, res) => {
  try {
    const { lead, tone, type, context } = req.body;
    if (!lead) {
      return res.status(400).json({ error: 'Lead data is required' });
    }
    const result = await generatePersonalization(lead, tone || 'professional', type || 'email', context || '');
    res.json(result);
  } catch (error) {
    console.error('Personalization error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate personalization' });
  }
});

router.post('/extract', async (req, res) => {
  try {
    const { query, industry, companySize } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const result = await extractLeadsFromQuery(query, industry || '', companySize || '');
    res.json(result);
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to extract leads' });
  }
});

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LeaderSide AI API v1' });
});

export default router;
