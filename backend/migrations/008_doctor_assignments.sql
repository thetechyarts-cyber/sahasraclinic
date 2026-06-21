-- Migration 008: Add doctor assignment to queue tokens

ALTER TABLE queue_tokens
ADD COLUMN doctor_id UUID REFERENCES users(id) ON DELETE SET NULL;
