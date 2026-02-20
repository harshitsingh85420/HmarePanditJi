-- Migration 004: Bookings and timeline

CREATE TABLE IF NOT EXISTS bookings_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  pandit_id UUID NOT NULL REFERENCES users(id),
  backup_pandit_id UUID REFERENCES users(id),
  puja_type VARCHAR(50) NOT NULL,
  event_date DATE NOT NULL,
  muhurat_time TIME,
  event_duration_days INTEGER NOT NULL DEFAULT 1,
  regional_ritual_variant VARCHAR(100),
  special_instructions TEXT,
  venue_address JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'requested', 'confirmed', 'pandit_en_route',
                      'pandit_arrived', 'in_progress', 'completed',
                      'cancelled', 'refunded')),
  samagri_choice VARCHAR(20) NOT NULL CHECK (samagri_choice IN ('pandit_package', 'custom_list', 'self_arranged')),
  selected_package_id UUID,
  custom_samagri_items JSONB DEFAULT '[]',
  selected_travel_mode VARCHAR(20),
  food_by_customer BOOLEAN DEFAULT false,
  accommodation_by_platform BOOLEAN DEFAULT false,
  backup_enabled BOOLEAN DEFAULT false,

  -- ALL AMOUNTS IN PAISE (INTEGER ONLY)
  dakshina_paise INTEGER DEFAULT 0,
  samagri_paise INTEGER DEFAULT 0,
  travel_paise INTEGER DEFAULT 0,
  food_allowance_paise INTEGER DEFAULT 0,
  accommodation_paise INTEGER DEFAULT 0,
  platform_fee_paise INTEGER DEFAULT 0,
  travel_service_fee_paise INTEGER DEFAULT 0,
  samagri_service_fee_paise INTEGER DEFAULT 0,
  backup_fee_paise INTEGER DEFAULT 0,
  gst_paise INTEGER DEFAULT 0,
  total_paise INTEGER DEFAULT 0,

  -- Timestamps for SLA tracking
  requested_at TIMESTAMP,
  pandit_responded_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  travel_started_at TIMESTAMP,
  arrived_at TIMESTAMP,
  puja_started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  cancelled_by VARCHAR(10) CHECK (cancelled_by IN ('customer', 'pandit', 'admin')),

  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_v2_customer ON bookings_v2(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_pandit ON bookings_v2(pandit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_status ON bookings_v2(status);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_event_date ON bookings_v2(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_puja_type ON bookings_v2(puja_type);

-- Add foreign key to travel_itineraries
ALTER TABLE travel_itineraries
  ADD CONSTRAINT fk_itinerary_booking_v2
  FOREIGN KEY (booking_id) REFERENCES bookings_v2(id);

-- ─── BOOKING TIMELINE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings_v2(id),
  event_type VARCHAR(50) NOT NULL,
  occurred_at TIMESTAMP DEFAULT NOW(),
  actor_id UUID REFERENCES users(id),
  actor_type VARCHAR(10),
  description TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_timeline_booking ON booking_timeline(booking_id, occurred_at);
