-- ============================================================
-- AGENT INTEGRATION SCHEMA
-- Tables for OpenClaw, Hermes, and Paperclip
-- ============================================================

-- 1. OpenClaw: Discovered Places (Micro-locations)
CREATE TABLE IF NOT EXISTS discovered_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  source TEXT DEFAULT 'openclaw_autonomous',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discovered_places_name ON discovered_places (name);
CREATE INDEX IF NOT EXISTS idx_discovered_places_prov ON discovered_places (province);

-- 2. Hermes: Dynamic SEO Injections
CREATE TABLE IF NOT EXISTS seo_injections (
  place_name TEXT NOT NULL,
  province TEXT NOT NULL,
  json_ld JSONB,
  meta_description TEXT,
  ai_strategy TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (place_name, province)
);

-- 3. Paperclip: Affiliate Performance Tracking
CREATE TABLE IF NOT EXISTS affiliate_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  weather_category TEXT NOT NULL, -- e.g., 'heat', 'rain', 'storm', 'cold'
  product_id TEXT NOT NULL,       -- ASIN or custom ID
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(weather_category, product_id)
);

-- 4. Paperclip: Raw Click Log for analysis
CREATE TABLE IF NOT EXISTS affiliate_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_name TEXT,
  weather_code INTEGER,
  temp DOUBLE PRECISION,
  product_id TEXT,
  event_type TEXT DEFAULT 'click',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies (Allow service role and public read for SEO)
ALTER TABLE discovered_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_injections ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read discovered_places" ON discovered_places FOR SELECT TO anon USING (true);
CREATE POLICY "Public read seo_injections" ON seo_injections FOR SELECT TO anon USING (true);
CREATE POLICY "Public read affiliate_perf" ON affiliate_performance FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert affiliate_events" ON affiliate_events FOR INSERT TO anon WITH CHECK (true);
