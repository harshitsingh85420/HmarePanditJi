-- Migration 002: Travel preferences and itineraries

-- ─── PANDIT TRAVEL PREFERENCES ────────────────────────
CREATE TABLE IF NOT EXISTS pandit_travel_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandit_id UUID NOT NULL REFERENCES users(id),
  max_distance_km INTEGER NOT NULL DEFAULT 50,
  self_drive_enabled BOOLEAN DEFAULT false,
  self_drive_max_km INTEGER DEFAULT 0,
  self_drive_rate_paise INTEGER DEFAULT 1200,
  vehicle_type VARCHAR(10) CHECK (vehicle_type IN ('car', 'bike')),
  available_modes TEXT[] NOT NULL DEFAULT '{cab}',
  mode_distance_ranges JSONB NOT NULL DEFAULT '[]',
  hotel_preference VARCHAR(20) DEFAULT 'any'
    CHECK (hotel_preference IN ('budget', 'comfort', 'any')),
  advance_notice_days INTEGER DEFAULT 3,
  blackout_dates TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pandit_id)
);

-- ─── TRAVEL ITINERARIES ──────────────────────────────
CREATE TABLE IF NOT EXISTS travel_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  pandit_id UUID NOT NULL REFERENCES users(id),
  travel_mode VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'booking_done', 'started', 'completed', 'cancelled')),
  segments JSONB NOT NULL DEFAULT '[]',
  total_cost_paise INTEGER DEFAULT 0,
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  current_step INTEGER DEFAULT 0,
  next_checkpoint TEXT,
  estimated_arrival TIMESTAMP,
  puja_started_at TIMESTAMP,
  puja_completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itinerary_booking ON travel_itineraries(booking_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_status ON travel_itineraries(status);
