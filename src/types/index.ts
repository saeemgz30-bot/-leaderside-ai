export type LeadStatus = 'new' | 'contacted' | 'engaged' | 'qualified' | 'disqualified';

export interface Lead {
  id: string;
  company_name: string;
  contact_name: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  company_size: string | null;
  revenue: string | null;
  website: string | null;
  linkedin: string | null;
  status: LeadStatus;
  score: number;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  channel: string;
  created_at: string;
  updated_at: string;
}

export interface SequenceStep {
  id: string;
  campaign_id: string;
  step_number: number;
  channel: string;
  subject: string | null;
  body: string | null;
  delay_days: number;
  created_at: string;
}

export interface Personalization {
  id: string;
  lead_id: string;
  campaign_id: string | null;
  type: string;
  content: string;
  tone: string;
  created_at: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  lead_id: string | null;
  campaign_id: string | null;
  created_at: string;
}

export type ViewKey =
  | 'dashboard'
  | 'leads'
  | 'extractor'
  | 'studio'
  | 'sequences'
  | 'campaigns'
  | 'settings';
