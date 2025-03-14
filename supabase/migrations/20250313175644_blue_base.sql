/*
  # Update Properties Table Schema and Add Example Data

  1. Changes
    - Update properties table schema with new columns
    - Add example properties with realistic data
  
  2. Security
    - Maintain existing RLS policies
    - Keep foreign key relationships intact
  
  3. Data
    - Add 6 diverse example properties
*/

-- Update the properties table schema by adding new columns
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS price numeric(10,2),
ADD COLUMN IF NOT EXISTS bedrooms integer,
ADD COLUMN IF NOT EXISTS bathrooms numeric(3,1),
ADD COLUMN IF NOT EXISTS square_feet integer,
ADD COLUMN IF NOT EXISTS property_type text,
ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS available_date date,
ADD COLUMN IF NOT EXISTS pet_policy text,
ADD COLUMN IF NOT EXISTS lease_terms text,
ADD COLUMN IF NOT EXISTS published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS syndication jsonb DEFAULT '{"zillow": false, "trulia": false, "realtor": false, "hotpads": false}';

-- Add property type constraint
DO $$ 
BEGIN 
  ALTER TABLE properties 
    ADD CONSTRAINT properties_property_type_check 
    CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse'));
EXCEPTION
  WHEN duplicate_object THEN 
    NULL;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_compliance_status ON properties(compliance_status);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(published);

-- Insert example properties
DO $$ 
DECLARE 
  current_user_id uuid;
BEGIN
  -- Get the first user from the users table as an example user
  SELECT id INTO current_user_id FROM users LIMIT 1;

  IF current_user_id IS NOT NULL THEN
    -- Luxury Downtown Apartment
    INSERT INTO properties (
      user_id, name, address, city, state, zip_code, description, price, bedrooms, bathrooms,
      square_feet, property_type, amenities, images, available_date, pet_policy, lease_terms,
      published, syndication, compliance_status
    ) VALUES (
      current_user_id,
      'Skyline Luxury Apartments',
      '123 Downtown Ave',
      'Seattle',
      'WA',
      '98101',
      'Stunning luxury apartment with panoramic city views, featuring high-end finishes, floor-to-ceiling windows, and premium appliances. Located in the heart of downtown with easy access to restaurants, shopping, and entertainment.',
      3500,
      2,
      2,
      1200,
      'apartment',
      ARRAY['Fitness Center', 'Rooftop Lounge', 'Concierge', 'Package Room', 'EV Charging', 'Smart Home Features'],
      ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2'],
      '2024-04-01',
      'Pets welcome with deposit. Maximum 2 pets. Breed restrictions apply.',
      '12-month lease required. $500 security deposit. First and last month rent due at signing.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant'
    );

    -- Suburban Family Home
    INSERT INTO properties (
      user_id, name, address, city, state, zip_code, description, price, bedrooms, bathrooms,
      square_feet, property_type, amenities, images, available_date, pet_policy, lease_terms,
      published, syndication, compliance_status
    ) VALUES (
      current_user_id,
      'Willow Creek Family Home',
      '456 Maple Street',
      'Bellevue',
      'WA',
      '98004',
      'Spacious family home in quiet suburban neighborhood. Features a large backyard, updated kitchen, and plenty of storage. Close to excellent schools, parks, and shopping centers.',
      4200,
      4,
      2.5,
      2800,
      'house',
      ARRAY['Fenced Yard', 'Two-Car Garage', 'Garden', 'Basement', 'Central Air', 'Security System'],
      ARRAY['https://images.unsplash.com/photo-1518780664697-55e3ad937233', 'https://images.unsplash.com/photo-1449844908441-8829872d2607'],
      '2024-05-01',
      'Small to medium pets allowed with additional deposit.',
      '12-month minimum lease. $2000 security deposit. Credit check required.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'compliant'
    );

    -- Beachfront Condo
    INSERT INTO properties (
      user_id, name, address, city, state, zip_code, description, price, bedrooms, bathrooms,
      square_feet, property_type, amenities, images, available_date, pet_policy, lease_terms,
      published, syndication, compliance_status
    ) VALUES (
      current_user_id,
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
      '2024-06-01',
      'No pets allowed in this unit.',
      '6-month minimum lease. $3000 security deposit. HOA approval required.',
      true,
      '{"zillow": true, "trulia": true, "realtor": true, "hotpads": true}',
      'pending'
    );

    -- Modern Townhouse
    INSERT INTO properties (
      user_id, name, address, city, state, zip_code, description, price, bedrooms, bathrooms,
      square_feet, property_type, amenities, images, available_date, pet_policy, lease_terms,
      published, syndication, compliance_status
    ) VALUES (
      current_user_id,
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
      '2024-05-15',
      'Small pets considered with additional deposit.',
      '12-month lease. $1500 security deposit. Income verification required.',
      true,
      '{"zillow": true, "trulia": true, "realtor": false, "hotpads": true}',
      'compliant'
    );

    -- Urban Studio Apartment
    INSERT INTO properties (
      user_id, name, address, city, state, zip_code, description, price, bedrooms, bathrooms,
      square_feet, property_type, amenities, images, available_date, pet_policy, lease_terms,
      published, syndication, compliance_status
    ) VALUES (
      current_user_id,
      'The Metro Studio',
      '555 Urban Street',
      'San Francisco',
      'CA',
      '94105',
      'Efficient studio apartment in the heart of the city. Perfect for young professionals. Modern amenities and smart space utilization. Close to public transportation and tech hubs.',
      2800,
      0,
      1,
      500,
      'apartment',
      ARRAY['Built-in Storage', 'Murphy Bed', 'Bike Storage', 'Package Lockers', 'Shared Workspace'],
      ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', 'https://images.unsplash.com/photo-1502672023488-70e25813eb80'],
      '2024-04-15',
      'No pets allowed.',
      'Month-to-month available. $1000 security deposit.',
      true,
      '{"zillow": true, "trulia": false, "realtor": true, "hotpads": true}',
      'compliant'
    );

    -- Mountain Vacation Home
    INSERT INTO properties (
      user_id, name, address, city, state, zip_code, description, price, bedrooms, bathrooms,
      square_feet, property_type, amenities, images, available_date, pet_policy, lease_terms,
      published, syndication, compliance_status
    ) VALUES (
      current_user_id,
      'Mountain Vista Retreat',
      '888 Pine Valley Road',
      'Aspen',
      'CO',
      '81611',
      'Stunning mountain home with panoramic views. Perfect for seasonal rentals. Features high-end finishes, a gourmet kitchen, and outdoor entertainment areas. Close to ski resorts and hiking trails.',
      8500,
      5,
      4,
      3500,
      'house',
      ARRAY['Hot Tub', 'Ski Storage', 'Game Room', 'Fire Pit', 'Heated Garage', 'Mountain Views'],
      ARRAY['https://images.unsplash.com/photo-1542718610-a1d656d1884c', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'],
      '2024-07-01',
      'No pets allowed.',
      'Seasonal leases available. $5000 security deposit. Credit check and references required.',
      false,
      '{"zillow": false, "trulia": false, "realtor": false, "hotpads": false}',
      'pending'
    );
  END IF;
END $$;