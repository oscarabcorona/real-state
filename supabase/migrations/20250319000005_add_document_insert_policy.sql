-- Enable RLS if not already enabled
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can read their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;

-- Add RLS policies for document operations
CREATE POLICY "Users can insert their own documents"
ON documents FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  user_id IS NOT NULL
);

CREATE POLICY "Users can read their own documents"
ON documents FOR SELECT
USING (
  auth.uid() = user_id AND
  user_id IS NOT NULL
);

CREATE POLICY "Users can update their own documents"
ON documents FOR UPDATE
USING (
  auth.uid() = user_id AND
  user_id IS NOT NULL
)
WITH CHECK (
  auth.uid() = user_id AND
  user_id IS NOT NULL
);

CREATE POLICY "Users can delete their own documents"
ON documents FOR DELETE
USING (
  auth.uid() = user_id AND
  user_id IS NOT NULL
);

-- Add trigger to automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_user_id_trigger ON documents;
CREATE TRIGGER set_user_id_trigger
  BEFORE INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id(); 