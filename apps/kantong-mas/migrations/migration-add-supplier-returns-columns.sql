-- Migration: Add reason and notes to supplier_returns
-- Description: Adds missing columns for returning items to suppliers

ALTER TABLE supplier_returns
ADD COLUMN IF NOT EXISTS reason VARCHAR(255),
ADD COLUMN IF NOT EXISTS notes TEXT;
