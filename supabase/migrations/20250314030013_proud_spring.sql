/*
  # Fix payment details JSON handling

  1. Changes
    - Add proper JSON validation for payment_details column
    - Update column type to ensure proper JSON handling
    - Add check constraint for valid JSON structure

  2. Security
    - Maintain existing RLS policies
*/

-- First ensure payment_details is proper JSONB type
ALTER TABLE payments 
ALTER COLUMN payment_details TYPE jsonb USING payment_details::jsonb;

-- Add constraint to ensure payment_details is valid JSON
ALTER TABLE payments
ADD CONSTRAINT payment_details_valid_json 
CHECK (payment_details IS NULL OR jsonb_typeof(payment_details) = 'object');

-- Add comment explaining payment_details structure
COMMENT ON COLUMN payments.payment_details IS 'Payment method specific details in JSON format:
Credit Card: {
  "method": "credit_card",
  "timestamp": "2024-03-14T02:21:49Z",
  "info": {
    "last4": "1234",
    "brand": "visa",
    "exp_month": 12,
    "exp_year": 2025
  }
}
ACH: {
  "method": "ach",
  "timestamp": "2024-03-14T02:21:49Z",
  "info": {
    "bank_name": "Test Bank",
    "account_last4": "1234",
    "routing_last4": "5678"
  }
}
Cash: {
  "method": "cash",
  "timestamp": "2024-03-14T02:21:49Z",
  "info": {
    "received_by": "Office",
    "location": "Main Office"
  }
}';