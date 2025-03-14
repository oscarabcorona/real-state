/*
  # Simplify phone number handling
  
  1. Changes
    - Drop existing phone_format constraint
    - Allow any phone number format
*/

-- Drop existing phone_format constraint
ALTER TABLE users
DROP CONSTRAINT IF EXISTS phone_format;