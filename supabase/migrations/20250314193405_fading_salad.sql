/*
  # Fix phone number validation regex

  1. Changes
    - Drop existing phone_format constraint
    - Add new phone_format constraint with properly escaped regex
    - Maintain existing validation rules
*/

-- Drop existing phone_format constraint
ALTER TABLE users
DROP CONSTRAINT IF EXISTS phone_format;

-- Add new phone_format constraint with properly escaped regex
ALTER TABLE users
ADD CONSTRAINT phone_format
CHECK (
  phone IS NULL OR 
  phone ~ '^[+]?[0-9]{1,4}[-. ]?[(]?[0-9]{1,3}[)]?[-. ]?[0-9]{1,4}[-. ]?[0-9]{1,4}$'
);