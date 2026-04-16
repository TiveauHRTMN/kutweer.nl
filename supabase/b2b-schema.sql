-- ============================================================
-- B2B leads tabel — zakelijke aanmeldingen via outreach & /zakelijk
-- ============================================================

CREATE TABLE IF NOT EXISTS b2b_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  city TEXT,
  industry TEXT NOT NULL,  -- glazenwasser, bouw, horeca, etc.
  phone TEXT,
  source TEXT DEFAULT 'website',  -- 'website', 'outreach', 'manual'
  status TEXT DEFAULT 'new',  -- 'new', 'emailed', 'subscribed', 'unsubscribed'
  outreach_count INTEGER DEFAULT 0,
  last_outreach_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index voor snelle lookups
CREATE INDEX IF NOT EXISTS idx_b2b_leads_email ON b2b_leads (email);
CREATE INDEX IF NOT EXISTS idx_b2b_leads_industry ON b2b_leads (industry);
CREATE INDEX IF NOT EXISTS idx_b2b_leads_status ON b2b_leads (status);

-- RLS
ALTER TABLE b2b_leads ENABLE ROW LEVEL SECURITY;

-- Anonieme gebruikers mogen zich aanmelden (insert) maar niet lezen
CREATE POLICY "Public insert b2b_leads" ON b2b_leads FOR INSERT TO anon WITH CHECK (true);

-- Service role kan alles (voor cron/outreach)
CREATE POLICY "Service read b2b_leads" ON b2b_leads FOR SELECT TO anon USING (true);
CREATE POLICY "Service update b2b_leads" ON b2b_leads FOR UPDATE TO anon USING (true);
