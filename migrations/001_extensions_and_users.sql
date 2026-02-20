-- Migration 001: Extensions, Users, Profiles, Documents, KYC, OTP
-- HmarePanditJi Database Schema

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ─── USERS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(10) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('customer', 'pandit', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  preferred_language VARCHAR(5) NOT NULL DEFAULT 'hi',
  profile_photo_url TEXT,
  fcm_token TEXT,
  last_login_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_users_type_status ON users(user_type, status);

-- ─── CUSTOMER PROFILES ────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gotra VARCHAR(100),
  family_name VARCHAR(255),
  family_members JSONB NOT NULL DEFAULT '[]',
  saved_addresses JSONB NOT NULL DEFAULT '[]',
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─── PANDIT PROFILES ──────────────────────────────────
CREATE TABLE IF NOT EXISTS pandit_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_status VARCHAR(20) NOT NULL DEFAULT 'not_started'
    CHECK (verification_status IN ('not_started', 'pending', 'under_review', 'verified', 'rejected')),
  aadhaar_encrypted TEXT,
  aadhaar_last_four CHAR(4),
  years_experience INTEGER NOT NULL DEFAULT 0,
  bio_text TEXT,
  bio_audio_url TEXT,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  languages_spoken TEXT[] NOT NULL DEFAULT '{hi}',
  gotra_expertise TEXT[] NOT NULL DEFAULT '{}',
  sect VARCHAR(50),
  device_os VARCHAR(10),
  device_model VARCHAR(100),
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  total_earnings_paise INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMP,
  verified_badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_pandit_verification ON pandit_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_pandit_rating ON pandit_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_pandit_specializations ON pandit_profiles USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_pandit_languages ON pandit_profiles USING GIN(languages_spoken);
CREATE INDEX IF NOT EXISTS idx_pandit_online ON pandit_profiles(is_online) WHERE is_online = true;

-- ─── PANDIT DOCUMENTS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS pandit_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandit_id UUID NOT NULL REFERENCES users(id),
  doc_type VARCHAR(50) NOT NULL
    CHECK (doc_type IN ('aadhaar_front', 'aadhaar_back', 'certificate', 'other')),
  doc_url TEXT NOT NULL,
  original_filename VARCHAR(255),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── KYC SESSIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyc_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandit_id UUID NOT NULL REFERENCES users(id),
  video_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  notes TEXT,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── OTP SESSIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(10) NOT NULL,
  otp_hash TEXT NOT NULL,
  purpose VARCHAR(30) NOT NULL
    CHECK (purpose IN ('login', 'registration', 'password_reset', 'verify_new_phone')),
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone_purpose ON otp_sessions(phone, purpose, used);
