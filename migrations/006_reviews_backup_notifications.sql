-- Migration 006: Reviews, backup assignments, notifications

-- ─── REVIEWS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  knowledge_stars INTEGER NOT NULL CHECK (knowledge_stars BETWEEN 1 AND 5),
  punctuality_stars INTEGER NOT NULL CHECK (punctuality_stars BETWEEN 1 AND 5),
  behavior_stars INTEGER NOT NULL CHECK (behavior_stars BETWEEN 1 AND 5),
  overall_stars INTEGER NOT NULL CHECK (overall_stars BETWEEN 1 AND 5),
  comment TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT true,
  pandit_reply TEXT,
  pandit_replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_v2_reviewee ON reviews_v2(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_v2_overall ON reviews_v2(overall_stars DESC);

-- ─── BACKUP ASSIGNMENTS ────────────────────────────────
CREATE TABLE IF NOT EXISTS backup_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_booking_id UUID NOT NULL,
  standby_pandit_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'on_standby'
    CHECK (status IN ('on_standby', 'triggered', 'accepted', 'rejected',
                      'completed', 'released')),
  triggered_at TIMESTAMP,
  trigger_reason TEXT,
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── NOTIFICATION LOG ──────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  channel VARCHAR(10) NOT NULL
    CHECK (channel IN ('push', 'sms', 'both')),
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_v2_user ON notifications_v2(user_id, is_read, sent_at DESC);
