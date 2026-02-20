-- Migration 008: Add geo-location columns to pandit_profiles for Elasticsearch indexing

ALTER TABLE pandit_profiles ADD COLUMN IF NOT EXISTS home_lat DECIMAL(10,8);
ALTER TABLE pandit_profiles ADD COLUMN IF NOT EXISTS home_lng DECIMAL(11,8);
ALTER TABLE pandit_profiles ADD COLUMN IF NOT EXISTS home_city VARCHAR(100);
ALTER TABLE pandit_profiles ADD COLUMN IF NOT EXISTS home_state VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_pandit_home_city ON pandit_profiles(home_city);
CREATE INDEX IF NOT EXISTS idx_pandit_home_state ON pandit_profiles(home_state);
