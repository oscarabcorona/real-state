/*
  # Enhance payments with invoices and verification

  1. Changes
    - Add invoice tracking fields
    - Add verification fields
    - Add payment details storage
    - Add automatic invoice number generation
    - Add payment verification function
*/

-- Add new fields to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS invoice_number text,
ADD COLUMN IF NOT EXISTS invoice_file_path text,
ADD COLUMN IF NOT EXISTS receipt_file_path text,
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES users(id),
ADD COLUMN IF NOT EXISTS verified_at timestamptz,
ADD COLUMN IF NOT EXISTS verification_method text CHECK (verification_method IN ('automatic', 'manual')),
ADD COLUMN IF NOT EXISTS payment_details jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS notes text;

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS payment_invoice_seq;

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  current_year text;
  next_seq int;
BEGIN
  current_year := to_char(CURRENT_DATE, 'YYYY');
  next_seq := nextval('payment_invoice_seq');
  RETURN 'INV-' || current_year || '-' || LPAD(next_seq::text, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_invoice_number
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- Function to verify payment
CREATE OR REPLACE FUNCTION verify_payment(
  payment_id uuid,
  verifier_id uuid,
  verification_type text DEFAULT 'manual'
)
RETURNS void AS $$
BEGIN
  UPDATE payments
  SET 
    status = 'completed',
    verified_by = verifier_id,
    verified_at = CURRENT_TIMESTAMP,
    verification_method = verification_type,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = payment_id;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_payments_invoice_number ON payments(invoice_number);
CREATE INDEX IF NOT EXISTS idx_payments_verified_at ON payments(verified_at);

-- Add example payment details templates
COMMENT ON COLUMN payments.payment_details IS 'Payment method specific details in JSON format:
Credit Card: {
  "last4": "1234",
  "brand": "visa",
  "exp_month": 12,
  "exp_year": 2025
}
ACH: {
  "bank_name": "Chase",
  "account_last4": "1234",
  "routing_last4": "5678"
}
Cash: {
  "received_by": "John Doe",
  "location": "Office"
}';

-- Update existing payments to have invoice numbers
UPDATE payments 
SET invoice_number = generate_invoice_number()
WHERE invoice_number IS NULL;