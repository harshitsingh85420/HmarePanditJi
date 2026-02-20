-- Migration 003: Samagri catalog, packages, and muhurat cache

-- ─── PLATFORM SAMAGRI CATALOG ─────────────────────────
CREATE TABLE IF NOT EXISTS samagri_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_hindi VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL
    CHECK (category IN ('flowers', 'grains', 'dairy', 'incense',
                        'metals', 'cloth', 'fruits', 'herbs', 'other')),
  unit VARCHAR(20) NOT NULL,
  base_price_paise INTEGER NOT NULL,
  is_perishable BOOLEAN DEFAULT false,
  image_url TEXT,
  puja_relevance TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_samagri_category ON samagri_items(category);
CREATE INDEX IF NOT EXISTS idx_samagri_puja ON samagri_items USING GIN(puja_relevance);

-- ─── PANDIT SAMAGRI PACKAGES ──────────────────────────
CREATE TABLE IF NOT EXISTS samagri_packages_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandit_id UUID NOT NULL REFERENCES users(id),
  puja_type VARCHAR(50) NOT NULL,
  tier VARCHAR(10) NOT NULL CHECK (tier IN ('basic', 'standard', 'premium')),
  fixed_price_paise INTEGER NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pandit_id, puja_type, tier)
);

CREATE INDEX IF NOT EXISTS idx_packages_v2_pandit ON samagri_packages_v2(pandit_id);
CREATE INDEX IF NOT EXISTS idx_packages_v2_puja ON samagri_packages_v2(puja_type);

-- ─── MUHURAT CACHE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS muhurat_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  puja_type VARCHAR(50),
  date DATE NOT NULL,
  location_lat DECIMAL(6,2),
  location_lng DECIMAL(6,2),
  muhurats JSONB NOT NULL,
  panchang_data JSONB,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_muhurat_cache_key ON muhurat_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_muhurat_date ON muhurat_cache(date);
