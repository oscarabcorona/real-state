/*
  # Add storage buckets for invoices and receipts

  1. Changes
    - Create storage buckets for invoices and receipts
    - Set up RLS policies for bucket access
    - Add trigger to generate receipt files on payment completion

  2. Security
    - Enable RLS on storage buckets
    - Ensure proper access control for files
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('invoices', 'invoices', false),
  ('receipts', 'receipts', false);

-- Enable RLS on buckets
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for lessors to manage invoice files
CREATE POLICY "Lessors can manage invoice files"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'invoices' AND
    EXISTS (
      SELECT 1 FROM payments p
      JOIN properties prop ON prop.id = p.property_id
      WHERE prop.user_id = auth.uid()
      AND name LIKE (p.id || '/%')
    )
  );

-- Policy for tenants to read invoice files
CREATE POLICY "Tenants can read invoice files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'invoices' AND
    EXISTS (
      SELECT 1 FROM payments p
      JOIN tenant_property_access tpa ON tpa.property_id = p.property_id
      WHERE tpa.tenant_user_id = auth.uid()
      AND name LIKE (p.id || '/%')
    )
  );

-- Policy for lessors to manage receipt files
CREATE POLICY "Lessors can manage receipt files"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'receipts' AND
    EXISTS (
      SELECT 1 FROM payments p
      JOIN properties prop ON prop.id = p.property_id
      WHERE prop.user_id = auth.uid()
      AND name LIKE (p.id || '/%')
    )
  );

-- Policy for tenants to read receipt files
CREATE POLICY "Tenants can read receipt files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'receipts' AND
    EXISTS (
      SELECT 1 FROM payments p
      JOIN tenant_property_access tpa ON tpa.property_id = p.property_id
      WHERE tpa.tenant_user_id = auth.uid()
      AND name LIKE (p.id || '/%')
    )
  );

-- Function to generate PDF content (placeholder)
CREATE OR REPLACE FUNCTION generate_pdf_content(
  payment_id uuid,
  doc_type text
) RETURNS text AS $$
DECLARE
  template text;
  payment_data jsonb;
BEGIN
  -- Get payment data
  SELECT jsonb_build_object(
    'invoice_number', invoice_number,
    'amount', amount,
    'payment_method', payment_method,
    'created_at', created_at,
    'property_name', (SELECT name FROM properties WHERE id = property_id),
    'tenant_name', (
      SELECT t.name 
      FROM tenants t
      JOIN tenant_property_access tpa ON tpa.tenant_user_id = t.user_id
      WHERE tpa.property_id = property_id
      LIMIT 1
    ),
    'lessor_name', (
      SELECT u.full_name 
      FROM users u
      JOIN properties p ON p.user_id = u.id
      WHERE p.id = property_id
    )
  )
  INTO payment_data
  FROM payments
  WHERE id = payment_id;

  -- Basic HTML template
  IF doc_type = 'invoice' THEN
    template := '
      <!DOCTYPE html>
      <html>
      <head><title>Invoice #' || payment_data->>'invoice_number' || '</title></head>
      <body>
        <h1>Invoice #' || payment_data->>'invoice_number' || '</h1>
        <p>Property: ' || payment_data->>'property_name' || '</p>
        <p>Tenant: ' || payment_data->>'tenant_name' || '</p>
        <p>Amount: $' || payment_data->>'amount' || '</p>
        <p>Date: ' || payment_data->>'created_at' || '</p>
      </body>
      </html>
    ';
  ELSE
    template := '
      <!DOCTYPE html>
      <html>
      <head><title>Receipt #' || payment_data->>'invoice_number' || '</title></head>
      <body>
        <h1>Receipt #' || payment_data->>'invoice_number' || '</h1>
        <p>Property: ' || payment_data->>'property_name' || '</p>
        <p>Tenant: ' || payment_data->>'tenant_name' || '</p>
        <p>Amount: $' || payment_data->>'amount' || '</p>
        <p>Payment Method: ' || payment_data->>'payment_method' || '</p>
        <p>Date: ' || payment_data->>'created_at' || '</p>
        <p>Status: PAID</p>
      </body>
      </html>
    ';
  END IF;

  RETURN template;
END;
$$ LANGUAGE plpgsql;

-- Function to generate and store PDF files
CREATE OR REPLACE FUNCTION generate_payment_documents()
RETURNS TRIGGER AS $$
DECLARE
  invoice_content text;
  receipt_content text;
  invoice_path text;
  receipt_path text;
BEGIN
  -- Only proceed if status changed to completed
  IF (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') OR
     (TG_OP = 'INSERT' AND NEW.status = 'completed') THEN
    
    -- Generate file paths
    invoice_path := NEW.id || '/invoice.html';
    receipt_path := NEW.id || '/receipt.html';

    -- Generate document content
    invoice_content := generate_pdf_content(NEW.id, 'invoice');
    receipt_content := generate_pdf_content(NEW.id, 'receipt');

    -- Store invoice
    INSERT INTO storage.objects (bucket_id, name, owner, metadata)
    VALUES ('invoices', invoice_path, auth.uid(), jsonb_build_object('content', invoice_content));

    -- Store receipt
    INSERT INTO storage.objects (bucket_id, name, owner, metadata)
    VALUES ('receipts', receipt_path, auth.uid(), jsonb_build_object('content', receipt_content));

    -- Update payment record with file paths
    UPDATE payments
    SET 
      invoice_file_path = invoice_path,
      receipt_file_path = receipt_path
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document generation
CREATE TRIGGER payment_documents_trigger
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION generate_payment_documents();