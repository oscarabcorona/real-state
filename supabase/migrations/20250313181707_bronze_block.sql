/*
  # Insert mock payment data

  1. Changes
    - Adds 7 example payments with various statuses, amounts, and payment methods
    - Links payments to existing properties and users
    - Includes different payment scenarios (completed, pending, failed)
*/

-- Insert mock payments with proper table references
WITH first_user AS (
  SELECT id FROM users LIMIT 1
),
first_property AS (
  SELECT id 
  FROM properties 
  WHERE user_id = (SELECT id FROM first_user) 
  LIMIT 1
)
INSERT INTO payments (
  id,
  user_id,
  property_id,
  amount,
  payment_method,
  status,
  description,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM first_user),
  (SELECT id FROM first_property),
  v.amount,
  v.payment_method,
  v.status,
  v.description,
  v.created_at,
  v.updated_at
FROM (
  VALUES
    (2500.00, 'credit_card', 'completed', 'Monthly rent payment - March 2024', '2024-03-01 10:00:00'::timestamptz, '2024-03-01 10:00:00'::timestamptz),
    (1800.00, 'ach', 'completed', 'Monthly rent payment - March 2024', '2024-03-02 14:30:00'::timestamptz, '2024-03-02 14:30:00'::timestamptz),
    (3000.00, 'credit_card', 'pending', 'Monthly rent payment - March 2024', '2024-03-15 09:15:00'::timestamptz, '2024-03-15 09:15:00'::timestamptz),
    (2200.00, 'cash', 'completed', 'Monthly rent payment - March 2024', '2024-03-10 16:45:00'::timestamptz, '2024-03-10 16:45:00'::timestamptz),
    (1500.00, 'credit_card', 'failed', 'Monthly rent payment - March 2024', '2024-03-12 11:20:00'::timestamptz, '2024-03-12 11:20:00'::timestamptz),
    (2800.00, 'ach', 'pending', 'Monthly rent payment - March 2024', '2024-03-14 13:10:00'::timestamptz, '2024-03-14 13:10:00'::timestamptz),
    (1950.00, 'credit_card', 'completed', 'Monthly rent payment - March 2024', '2024-03-05 15:30:00'::timestamptz, '2024-03-05 15:30:00'::timestamptz)
) AS v(amount, payment_method, status, description, created_at, updated_at);