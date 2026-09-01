/*
# LeaderSide AI - Core Schema

## Purpose
Creates the foundational tables for the B2B Growth Engine: leads, campaigns,
sequence steps, AI personalizations, and activity tracking.

## New Tables
1. `leads` - Extracted B2B leads with company and contact information
   - id, company_name, contact_name, title, email, phone, industry, company_size,
     revenue, website, linkedin, status, score, source, notes, created_at, updated_at
2. `campaigns` - Outreach campaigns grouping leads and sequences
   - id, name, description, status, channel, created_at, updated_at
3. `sequence_steps` - Individual steps within a campaign's email sequence
   - id, campaign_id (FK), step_number, channel, subject, body, delay_days, created_at
4. `personalizations` - AI-generated personalized outreach messages
   - id, lead_id (FK), campaign_id (FK nullable), type, content, tone, created_at
5. `activities` - Timeline of user/system actions
   - id, type, description, lead_id (FK nullable), campaign_id (FK nullable), created_at

## Security
- RLS enabled on all tables.
- Single-tenant app (no sign-in): policies allow anon + authenticated full CRUD.
- `USING (true)` is acceptable because all data is intentionally shared/public.
*/

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text,
  title text,
  email text,
  phone text,
  industry text,
  company_size text,
  revenue text,
  website text,
  linkedin text,
  status text NOT NULL DEFAULT 'new',
  score integer DEFAULT 0,
  source text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "anon_update_leads" ON leads FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "anon_delete_leads" ON leads FOR DELETE
  TO anon, authenticated USING (true);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  channel text NOT NULL DEFAULT 'email',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_campaigns" ON campaigns;
CREATE POLICY "anon_select_campaigns" ON campaigns FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_campaigns" ON campaigns;
CREATE POLICY "anon_insert_campaigns" ON campaigns FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_campaigns" ON campaigns;
CREATE POLICY "anon_update_campaigns" ON campaigns FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_campaigns" ON campaigns;
CREATE POLICY "anon_delete_campaigns" ON campaigns FOR DELETE
  TO anon, authenticated USING (true);

-- Sequence steps table
CREATE TABLE IF NOT EXISTS sequence_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  step_number integer NOT NULL DEFAULT 1,
  channel text NOT NULL DEFAULT 'email',
  subject text,
  body text,
  delay_days integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sequence_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sequence_steps" ON sequence_steps;
CREATE POLICY "anon_select_sequence_steps" ON sequence_steps FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sequence_steps" ON sequence_steps;
CREATE POLICY "anon_insert_sequence_steps" ON sequence_steps FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sequence_steps" ON sequence_steps;
CREATE POLICY "anon_update_sequence_steps" ON sequence_steps FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sequence_steps" ON sequence_steps;
CREATE POLICY "anon_delete_sequence_steps" ON sequence_steps FOR DELETE
  TO anon, authenticated USING (true);

-- Personalizations table
CREATE TABLE IF NOT EXISTS personalizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'email',
  content text NOT NULL,
  tone text DEFAULT 'professional',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE personalizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_personalizations" ON personalizations;
CREATE POLICY "anon_select_personalizations" ON personalizations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_personalizations" ON personalizations;
CREATE POLICY "anon_insert_personalizations" ON personalizations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_personalizations" ON personalizations;
CREATE POLICY "anon_update_personalizations" ON personalizations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_personalizations" ON personalizations;
CREATE POLICY "anon_delete_personalizations" ON personalizations FOR DELETE
  TO anon, authenticated USING (true);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  description text NOT NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_activities" ON activities;
CREATE POLICY "anon_select_activities" ON activities FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_activities" ON activities;
CREATE POLICY "anon_insert_activities" ON activities FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_activities" ON activities;
CREATE POLICY "anon_update_activities" ON activities FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_activities" ON activities;
CREATE POLICY "anon_delete_activities" ON activities FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sequence_steps_campaign_id ON sequence_steps(campaign_id);
CREATE INDEX IF NOT EXISTS idx_personalizations_lead_id ON personalizations(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);

-- Trigger to update updated_at on leads
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
