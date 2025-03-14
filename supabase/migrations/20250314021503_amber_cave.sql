-- Add function to handle payment verification and document generation
CREATE OR REPLACE FUNCTION handle_payment_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed to completed
  IF (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') OR
     (TG_OP = 'INSERT' AND NEW.status = 'completed') THEN

    -- Generate invoice number if not exists
    IF NEW.invoice_number IS NULL THEN
      NEW.invoice_number := generate_invoice_number();
    END IF;

    -- Set verification timestamp if not set
    IF NEW.verified_at IS NULL THEN
      NEW.verified_at := CURRENT_TIMESTAMP;
    END IF;

    -- Set verification method if not set
    IF NEW.verification_method IS NULL THEN
      NEW.verification_method := 'automatic';
    END IF;

    -- Generate file paths
    NEW.invoice_file_path := NEW.id || '/invoice.html';
    NEW.receipt_file_path := NEW.id || '/receipt.html';

    -- Generate and store documents
    INSERT INTO storage.objects (bucket_id, name, owner, metadata)
    VALUES 
      ('invoices', NEW.invoice_file_path, auth.uid(), 
       jsonb_build_object('content', generate_pdf_content(NEW.id, 'invoice'))),
      ('receipts', NEW.receipt_file_path, auth.uid(),
       jsonb_build_object('content', generate_pdf_content(NEW.id, 'receipt')));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS payment_completion_trigger ON payments;

-- Create new trigger for payment completion
CREATE TRIGGER payment_completion_trigger
  BEFORE UPDATE OR INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION handle_payment_completion();