-- ═══════════════════════════════════════════════════════════════
-- System Settings
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE system_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  updated_by  UUID REFERENCES users(id)
);

-- Insert default settings
INSERT INTO system_settings (key, value, description) VALUES
('hospital_info', '{"name": "General Hospital", "phone": "+91 9876543210", "email": "contact@hospital.com", "address": "123 Health Ave"}', 'Public hospital contact information'),
('features', '{"enable_whatsapp": false, "enable_online_booking": true, "require_upi_verification": true}', 'Global feature toggles')
ON CONFLICT (key) DO NOTHING;
