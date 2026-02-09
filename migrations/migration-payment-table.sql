-- ============================================
-- Payment Table Migration
-- Online Payment System Integration
-- Issue #1349 - Phase 1
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'failed', 'expired', 'cancelled')),
  payment_method TEXT CHECK(payment_method IN ('va', 'bank_transfer', 'ewallet', 'qris', 'credit_card')),
  transaction_id TEXT UNIQUE,
  payment_url TEXT,
  due_date TIMESTAMP,
  payment_date TIMESTAMP,
  expiry_date TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_parent_id ON payments(parent_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- ============================================
-- Payment Settings Table (Optional)
-- Stores parent payment preferences
-- ============================================

CREATE TABLE IF NOT EXISTS payment_settings (
  parent_id TEXT PRIMARY KEY,
  default_payment_method TEXT CHECK(default_payment_method IN ('va', 'bank_transfer', 'ewallet', 'qris', 'credit_card', NULL)),
  email_notifications BOOLEAN DEFAULT 1,
  push_notifications BOOLEAN DEFAULT 1,
  auto_payment BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);
