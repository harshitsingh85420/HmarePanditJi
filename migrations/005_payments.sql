-- Migration 005: Transactions, payouts, GST invoices

-- ─── TRANSACTIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  razorpay_order_id VARCHAR(100) UNIQUE,
  razorpay_payment_id VARCHAR(100) UNIQUE,
  razorpay_signature VARCHAR(255),
  amount_paise INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL
    CHECK (type IN ('booking_payment', 'consultation_fee', 'refund', 'payout')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  breakdown JSONB NOT NULL DEFAULT '{}',
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_booking ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- ─── PAYOUTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandit_id UUID NOT NULL REFERENCES users(id),
  booking_id UUID,
  amount_paise INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
  utr_number VARCHAR(50),
  processed_at TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_pandit ON payouts(pandit_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- ─── GST INVOICES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS gst_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES users(id),
  dakshina_paise INTEGER DEFAULT 0,
  platform_fee_paise INTEGER DEFAULT 0,
  travel_fee_paise INTEGER DEFAULT 0,
  samagri_fee_paise INTEGER DEFAULT 0,
  backup_fee_paise INTEGER DEFAULT 0,
  taxable_amount_paise INTEGER DEFAULT 0,
  is_interstate BOOLEAN DEFAULT false,
  cgst_paise INTEGER DEFAULT 0,
  sgst_paise INTEGER DEFAULT 0,
  igst_paise INTEGER DEFAULT 0,
  total_paise INTEGER DEFAULT 0,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
