-- Add original_price and discount_amount to transaction_items table
ALTER TABLE transaction_items
ADD COLUMN original_price DECIMAL(12, 2),
ADD COLUMN discount_amount DECIMAL(12, 2) DEFAULT 0;

-- Optionally set existing rows original_price to price so it's not null
UPDATE transaction_items SET original_price = price WHERE original_price IS NULL;
