-- Migration 009: Add screenshot URL and UPI Ref to payments for manual UPI verification

ALTER TABLE payments
ADD COLUMN screenshot_url TEXT,
ADD COLUMN upi_ref TEXT;
