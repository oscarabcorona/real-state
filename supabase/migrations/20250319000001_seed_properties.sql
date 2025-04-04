/*
  # Seed Properties with Example Data
  
  1. Changes
    - Insert 10 diverse properties with realistic data
    - Include various property types, locations, and amenities
    - Set appropriate pricing and availability dates
*/

DO $$
DECLARE
  current_user_id uuid;
  default_workspace_id uuid;
BEGIN
  -- Create a default user in auth.users if none exists
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    role
  ) VALUES (
    gen_random_uuid(),
    'admin@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    'admin'
  )
  RETURNING id INTO current_user_id;

  -- If no user was created, get the first existing user
  IF current_user_id IS NULL THEN
    SELECT id INTO current_user_id FROM auth.users LIMIT 1;
  END IF;

  -- Create corresponding entry in users table
  INSERT INTO users (
    id,
    email,
    role,
    full_name
  ) VALUES (
    current_user_id,
    'admin@example.com',
    'admin',
    'Admin User'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Get or create default workspace
  SELECT id INTO default_workspace_id 
  FROM workspaces 
  WHERE owner_id = current_user_id 
  AND is_default = true 
  LIMIT 1;
  
  IF default_workspace_id IS NULL THEN
    INSERT INTO workspaces (
      name,
      description,
      owner_id,
      is_default,
      tier
    ) VALUES (
      'Default Workspace',
      'Default workspace for property management',
      current_user_id,
      true,
      'pro'
    ) RETURNING id INTO default_workspace_id;
  END IF;

  -- Insert 10 diverse properties
  INSERT INTO properties (
    user_id,
    workspace_id,
    name,
    address,
    city,
    state,
    zip_code,
    description,
    price,
    bedrooms,
    bathrooms,
    square_feet,
    property_type,
    amenities,
    images,
    available_date,
    pet_policy,
    lease_terms,
    published,
    syndication,
    compliance_status,
    region,
    measurement_system
  ) VALUES
    -- Luxury Beachfront Condo
    (
      current_user_id,
      default_workspace_id,
      'Oceanview Paradise',
      '789 Beach Blvd',
      'San Diego',
      'CA',
      '92109',
      'Luxurious beachfront condo with breathtaking ocean views. Recently renovated with modern fixtures and appliances. Steps away from the beach and popular waterfront restaurants.',
      5000,
      3,
      2,
      1800,
      'condo',
      ARRAY['Private Beach Access', 'Pool', 'Hot Tub', 'Covered Parking', 'Beach Equipment Storage', 'Balcony'],
      ARRAY['https://images.unsplash.com/photo-1519302959554-a75be0afc082', 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba'],
      CURRENT_DATE + INTERVAL '30 days',
      'No pets allowed in this unit.',
      '6-month minimum lease. $3000 security deposit. HOA approval required.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Modern Townhouse
    (
      current_user_id,
      default_workspace_id,
      'Urban Edge Townhomes',
      '321 City Park Way',
      'Portland',
      'OR',
      '97209',
      'Contemporary townhouse in trendy neighborhood. Features modern design, energy-efficient appliances, and a private rooftop deck. Walking distance to popular restaurants and shops.',
      3200,
      3,
      2.5,
      1600,
      'townhouse',
      ARRAY['Rooftop Deck', 'Smart Home System', 'Attached Garage', 'Wine Cellar', 'Home Office'],
      ARRAY['https://images.unsplash.com/photo-1448630360428-65456885c650', 'https://images.unsplash.com/photo-1464146072230-91cabc968266'],
      CURRENT_DATE + INTERVAL '15 days',
      'Small pets considered with additional deposit.',
      '12-month lease. $1500 security deposit. Income verification required.',
      true,
      '{"zillow": true, "trulia": true, "realtor": false, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Cozy Studio Apartment
    (
      current_user_id,
      default_workspace_id,
      'Downtown Studio Loft',
      '123 Main Street',
      'Seattle',
      'WA',
      '98101',
      'Modern studio apartment in the heart of downtown. Features high ceilings, exposed brick, and a fully equipped kitchen. Perfect for urban professionals.',
      1800,
      0,
      1,
      600,
      'apartment',
      ARRAY['High Ceilings', 'Exposed Brick', 'Fully Equipped Kitchen', 'Building Security', 'Bike Storage'],
      ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
      CURRENT_DATE + INTERVAL '7 days',
      'Cats only, with additional deposit.',
      '12-month lease. $900 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Family Home
    (
      current_user_id,
      default_workspace_id,
      'Suburban Family Haven',
      '456 Maple Lane',
      'Austin',
      'TX',
      '78759',
      'Spacious family home in a quiet suburban neighborhood. Features a large backyard, modern kitchen, and plenty of storage space. Close to schools and parks.',
      2800,
      4,
      2,
      2200,
      'house',
      ARRAY['Large Backyard', 'Modern Kitchen', 'Storage Space', 'Garage', 'Playground'],
      ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
      CURRENT_DATE + INTERVAL '45 days',
      'Pets welcome with additional deposit.',
      '12-month lease. $1400 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Luxury Penthouse
    (
      current_user_id,
      default_workspace_id,
      'Skyline Penthouse',
      '789 High Rise Ave',
      'New York',
      'NY',
      '10001',
      'Stunning penthouse with panoramic city views. Features floor-to-ceiling windows, private terrace, and high-end finishes throughout.',
      8500,
      3,
      3.5,
      2500,
      'apartment',
      ARRAY['Private Terrace', 'Floor-to-Ceiling Windows', 'Wine Room', 'Home Theater', 'Concierge Service'],
      ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
      CURRENT_DATE + INTERVAL '60 days',
      'No pets allowed.',
      '24-month lease. $4250 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Mountain View Cabin
    (
      current_user_id,
      default_workspace_id,
      'Mountain Retreat',
      '321 Forest Road',
      'Denver',
      'CO',
      '80202',
      'Cozy cabin with stunning mountain views. Features a wood-burning fireplace, outdoor hot tub, and hiking trails nearby.',
      2200,
      2,
      1,
      1200,
      'house',
      ARRAY['Wood-burning Fireplace', 'Hot Tub', 'Mountain Views', 'Hiking Trails', 'Garage'],
      ARRAY['https://images.unsplash.com/photo-1449157291145-7efd050a4d0e', 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e'],
      CURRENT_DATE + INTERVAL '90 days',
      'Dogs welcome with additional deposit.',
      '12-month lease. $1100 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Modern Loft
    (
      current_user_id,
      default_workspace_id,
      'Industrial Loft',
      '567 Warehouse District',
      'Chicago',
      'IL',
      '60601',
      'Converted industrial space with exposed brick and steel beams. Features an open floor plan and large windows.',
      2400,
      1,
      1,
      1000,
      'apartment',
      ARRAY['Exposed Brick', 'Steel Beams', 'High Ceilings', 'Building Security', 'Bike Storage'],
      ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
      CURRENT_DATE + INTERVAL '30 days',
      'Cats only, with additional deposit.',
      '12-month lease. $1200 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Waterfront Villa
    (
      current_user_id,
      default_workspace_id,
      'Lakeside Villa',
      '890 Lakeview Drive',
      'Miami',
      'FL',
      '33139',
      'Luxurious waterfront villa with private dock and pool. Features high-end finishes and outdoor living spaces.',
      4500,
      4,
      3,
      3000,
      'house',
      ARRAY['Private Dock', 'Pool', 'Outdoor Kitchen', 'Wine Cellar', 'Smart Home System'],
      ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
      CURRENT_DATE + INTERVAL '45 days',
      'Pets welcome with additional deposit.',
      '12-month lease. $2250 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Garden Apartment
    (
      current_user_id,
      default_workspace_id,
      'Garden Level Suite',
      '234 Park Avenue',
      'Boston',
      'MA',
      '02108',
      'Charming garden-level apartment with private patio. Features updated kitchen and plenty of natural light.',
      2100,
      2,
      1,
      900,
      'apartment',
      ARRAY['Private Patio', 'Updated Kitchen', 'Natural Light', 'Storage Space', 'Building Security'],
      ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
      CURRENT_DATE + INTERVAL '15 days',
      'No pets allowed.',
      '12-month lease. $1050 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Historic Brownstone
    (
      current_user_id,
      default_workspace_id,
      'Historic Brownstone',
      '456 Brownstone Street',
      'Brooklyn',
      'NY',
      '11201',
      'Beautifully restored historic brownstone with original details. Features high ceilings, crown molding, and a private garden.',
      3800,
      3,
      2,
      2000,
      'house',
      ARRAY['Original Details', 'High Ceilings', 'Crown Molding', 'Private Garden', 'Fireplace'],
      ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
      CURRENT_DATE + INTERVAL '60 days',
      'Pets welcome with additional deposit.',
      '24-month lease. $1900 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    );
END $$; 