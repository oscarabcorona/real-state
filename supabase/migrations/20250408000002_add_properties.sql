DO $$
DECLARE
  current_user_id uuid;
  default_workspace_id uuid;
BEGIN
  -- Get the user ID for oabc4004@gmail.com
  SELECT id INTO current_user_id 
  FROM auth.users 
  WHERE email = 'oabc4004@gmail.com';

  -- If user not found, exit
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email oabc4004@gmail.com not found. Please create the user first.';
  END IF;

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
      tier,
      max_properties,
      region,
      currency,
      timezone
    ) VALUES (
      'Default Workspace',
      'Default workspace for property management',
      current_user_id,
      true,
      'pro',
      100,
      'USA',
      'USD',
      'America/New_York'
    ) RETURNING id INTO default_workspace_id;
  END IF;

  -- Update user's preferred workspace
  UPDATE users
  SET preferred_workspace_id = default_workspace_id
  WHERE id = current_user_id;

  -- Insert 20 diverse properties
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
    ),
    -- Modern High-Rise Apartment
    (
      current_user_id,
      default_workspace_id,
      'Skyline Heights',
      '123 Skyline Blvd',
      'New York',
      'NY',
      '10001',
      'Luxury apartment with panoramic city views. Features floor-to-ceiling windows and modern amenities.',
      850000,
      2,
      2,
      1200,
      'apartment',
      ARRAY['City Views', 'Fitness Center', 'Rooftop Deck', 'Concierge', 'Parking'],
      ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
      CURRENT_DATE + INTERVAL '15 days',
      'No pets allowed',
      '12-month lease. $4250 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Waterfront Loft
    (
      current_user_id,
      default_workspace_id,
      'Harbor View Lofts',
      '456 Harbor Dr',
      'San Francisco',
      'CA',
      '94105',
      'Modern loft with waterfront views. Features high ceilings and exposed brick.',
      1200000,
      3,
      2,
      1800,
      'apartment',
      ARRAY['Waterfront Views', 'High Ceilings', 'Exposed Brick', 'Building Security', 'Bike Storage'],
      ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
      CURRENT_DATE + INTERVAL '30 days',
      'Cats only',
      '12-month lease. $6000 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Spacious Family Home
    (
      current_user_id,
      default_workspace_id,
      'Maplewood Estate',
      '321 Maple Ave',
      'Seattle',
      'WA',
      '98101',
      'Spacious family home with large backyard. Perfect for growing families.',
      950000,
      4,
      3,
      2800,
      'house',
      ARRAY['Large Backyard', 'Modern Kitchen', 'Garage', 'Playground', 'Storage Space'],
      ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
      CURRENT_DATE + INTERVAL '45 days',
      'Pets welcome',
      '12-month lease. $4750 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Traditional Family Home
    (
      current_user_id,
      default_workspace_id,
      'Pinecrest Manor',
      '654 Pine St',
      'Boston',
      'MA',
      '02108',
      'Traditional home in quiet neighborhood. Features classic architecture and modern updates.',
      1100000,
      5,
      4,
      3200,
      'house',
      ARRAY['Fireplace', 'Finished Basement', 'Garage', 'Garden', 'Storage Space'],
      ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
      CURRENT_DATE + INTERVAL '60 days',
      'Pets welcome with deposit',
      '12-month lease. $5500 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Smart Home
    (
      current_user_id,
      default_workspace_id,
      'Oakridge Residence',
      '987 Oak Rd',
      'Austin',
      'TX',
      '78701',
      'Modern family home with smart features. Energy efficient and tech-forward.',
      850000,
      3,
      2,
      2200,
      'house',
      ARRAY['Smart Home System', 'Modern Kitchen', 'Garage', 'Backyard', 'Storage Space'],
      ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
      CURRENT_DATE + INTERVAL '30 days',
      'Pets welcome',
      '12-month lease. $4250 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Luxury Beachfront
    (
      current_user_id,
      default_workspace_id,
      'Oceanfront Villa',
      '123 Beach Blvd',
      'Miami',
      'FL',
      '33139',
      'Luxury beachfront property with private beach access and resort-style amenities.',
      2500000,
      5,
      5,
      4500,
      'house',
      ARRAY['Private Beach Access', 'Pool', 'Wine Cellar', 'Smart Home System', 'Garage'],
      ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
      CURRENT_DATE + INTERVAL '90 days',
      'No pets allowed',
      '12-month lease. $12500 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Mountain Estate
    (
      current_user_id,
      default_workspace_id,
      'Mountain View Estate',
      '456 Summit Dr',
      'Denver',
      'CO',
      '80202',
      'Luxury home with mountain views. Perfect for outdoor enthusiasts.',
      1800000,
      6,
      5,
      3800,
      'house',
      ARRAY['Mountain Views', 'Wine Cellar', 'Home Theater', 'Smart Home System', 'Garage'],
      ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
      CURRENT_DATE + INTERVAL '75 days',
      'Pets welcome with deposit',
      '12-month lease. $9000 security deposit.',
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
      'Garden Court Townhouse',
      '321 Garden St',
      'Portland',
      'OR',
      '97201',
      'Modern townhouse with private garden. Features contemporary design and smart home features.',
      750000,
      3,
      2,
      1800,
      'townhouse',
      ARRAY['Private Garden', 'Modern Kitchen', 'Garage', 'Storage Space', 'Smart Home System'],
      ARRAY['https://images.unsplash.com/photo-1448630360428-65456885c650', 'https://images.unsplash.com/photo-1464146072230-91cabc968266'],
      CURRENT_DATE + INTERVAL '45 days',
      'Small pets allowed',
      '12-month lease. $3750 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    ),
    -- Waterfront Townhouse
    (
      current_user_id,
      default_workspace_id,
      'Riverside Townhouse',
      '654 River Rd',
      'Charleston',
      'SC',
      '29401',
      'Waterfront townhouse with dock. Features modern amenities and stunning views.',
      950000,
      4,
      3,
      2200,
      'townhouse',
      ARRAY['Waterfront Access', 'Private Dock', 'Modern Kitchen', 'Garage', 'Storage Space'],
      ARRAY['https://images.unsplash.com/photo-1448630360428-65456885c650', 'https://images.unsplash.com/photo-1464146072230-91cabc968266'],
      CURRENT_DATE + INTERVAL '60 days',
      'Pets welcome with deposit',
      '12-month lease. $4750 security deposit.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant',
      'USA',
      'imperial'
    );
    
END $$; 