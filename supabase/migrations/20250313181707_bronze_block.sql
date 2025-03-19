/*
  # Insert mock payment data

  1. Changes
    - Adds 7 example payments with various statuses, amounts, and payment methods
    - Links payments to existing properties and users
    - Includes different payment scenarios (completed, pending, failed)
    - Adds error handling to prevent not-null constraint violations
*/

-- Use a DO block for better error handling and transaction control
DO $$
DECLARE
  user_id uuid;
  property_id uuid;
  user_exists boolean;
  property_exists boolean;
BEGIN
  -- Check if we have any users
  SELECT EXISTS(SELECT 1 FROM users LIMIT 1) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE NOTICE 'No users found - creating a sample user for payments';
    
    -- Insert a sample user if none exists
    INSERT INTO users (
      id, 
      email, 
      full_name, 
      created_at, 
      updated_at
    ) 
    VALUES (
      gen_random_uuid(),
      'sample@example.com',
      'Sample User',
      now(),
      now()
    )
    RETURNING id INTO user_id;
  ELSE
    -- Get the first available user
    SELECT id INTO user_id FROM users LIMIT 1;
  END IF;
  
  -- Check if we have any properties for this user
  SELECT EXISTS(
    SELECT 1 FROM properties 
    WHERE user_id = user_id 
    LIMIT 1
  ) INTO property_exists;
  
  IF NOT property_exists THEN
    RAISE NOTICE 'No properties found for user - creating a sample property';
    
    -- Insert a sample property if none exists
    INSERT INTO properties (
      id,
      user_id,
      name,
      address,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      user_id,
      'Sample Property',
      '123 Example St, Sample City',
      now(),
      now()
    )
    RETURNING id INTO property_id;
  ELSE
    -- Get the first available property for this user
    SELECT id INTO property_id
    FROM properties 
    WHERE user_id = user_id 
    LIMIT 1;
  END IF;
  
  -- Now we can safely insert payments with valid user_id and property_id
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
    user_id,
    property_id,
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
  
  RAISE NOTICE 'Successfully inserted 7 sample payment records';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting payments: %', SQLERRM;
END
$$;