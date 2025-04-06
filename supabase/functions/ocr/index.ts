// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { Groq } from 'npm:groq-sdk'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("OCR Function initialized") 

// ID Document OCR Prompt
const ID_ANALYSIS_PROMPT = `You are a document analysis expert specializing in ID verification. Analyze this government-issued ID and extract the information. Return the data in this JSON format:
{
  "document_type": "The specific type of ID (e.g., Driver's License, Passport, State ID)",
  "full_name": "Full name exactly as shown",
  "date_of_birth": "Date in YYYY-MM-DD format",
  "document_number": "ID/license number exactly as shown",
  "expiration_date": "Date in YYYY-MM-DD format",
  "address": {
    "street": "Street address exactly as shown",
    "city": "City name exactly as shown",
    "state": "State exactly as shown",
    "zip_code": "ZIP code exactly as shown",
    "country": "Country exactly as shown"
  },
  "additional_info": {
    "sex": "Gender exactly as shown",
    "height": "Height exactly as shown",
    "weight": "Weight exactly as shown",
    "eye_color": "Eye color exactly as shown",
    "hair_color": "Hair color exactly as shown"
  },
  "is_valid": "boolean indicating if all required fields are clearly visible and legible"
}

IMPORTANT:
- If you cannot read any required field clearly, set is_valid to false
- Required fields for ID documents are: document_type, full_name, date_of_birth, document_number, expiration_date
- Do not make assumptions or fill in missing data
- Do not generate fake or placeholder data
- If the image is not a valid ID document or is of poor quality, set is_valid to false`;

// Credit Report OCR Prompt
const CREDIT_REPORT_ANALYSIS_PROMPT = `You are a document analysis expert specializing in credit report verification. Analyze this credit report and extract the information. Return the data in this JSON format:
{
  "document_type": "Credit Report",
  "report_date": "Date in YYYY-MM-DD format",
  "personal_info": {
    "full_name": "Full name exactly as shown",
    "current_address": "Current address exactly as shown",
    "previous_addresses": ["Array of previous addresses as shown"],
    "social_security": "Last 4 digits of SSN as shown (e.g., XXX-XX-1234)"
  },
  "credit_score": {
    "score": "Numeric score exactly as shown",
    "score_type": "Type of score (e.g., FICO, VantageScore)",
    "score_range": "Range of the score (e.g., 300-850)"
  },
  "accounts": {
    "total_accounts": "Number of total accounts",
    "accounts_in_good_standing": "Number of accounts in good standing",
    "delinquent_accounts": "Number of delinquent accounts"
  },
  "payment_history": {
    "on_time_payments_percentage": "Percentage of on-time payments",
    "late_payments": "Number of late payments"
  },
  "derogatory_marks": {
    "collections": "Number of accounts in collections",
    "public_records": "Number of public records",
    "bankruptcies": "Number of bankruptcies"
  },
  "credit_utilization": "Percentage of available credit being used",
  "inquiries": "Number of hard inquiries in the last 2 years",
  "is_valid": "boolean indicating if the document is clearly a credit report with essential information"
}

IMPORTANT:
- If you cannot read any required field clearly, set is_valid to false
- Required fields for credit reports are: document_type, report_date, credit_score
- If a field is not present in the report, set its value to null
- Do not make assumptions or fill in missing data
- Do not generate fake or placeholder data
- If the image is not a valid credit report or is of poor quality, set is_valid to false`;

// Income Verification OCR Prompt
const INCOME_VERIFICATION_PROMPT = `You are a document analysis expert specializing in income verification. Analyze this income document and extract the information. Return the data in this JSON format:
{
  "document_type": "Income Verification Document",
  "employer_name": "Name of the employer",
  "position": "Job title or position",
  "employment_status": "Employment status (full-time, part-time, contract, etc.)",
  "start_date": "Employment start date in YYYY-MM-DD format",
  "salary": {
    "amount": "Salary amount as shown",
    "frequency": "Payment frequency (annually, monthly, bi-weekly, etc.)",
    "currency": "Currency code (e.g., USD, CAD, MXN)"
  },
  "income_history": [
    {
      "year": "Year of income",
      "total_income": "Total income for that year"
    }
  ],
  "documentation_type": "Type of document (W-2, paystubs, tax return, etc.)",
  "verification_date": "Date of verification in YYYY-MM-DD format",
  "is_valid": "boolean indicating if the document is clearly an income verification document with essential information"
}

IMPORTANT:
- If you cannot read any required field clearly, set is_valid to false
- Required fields for income verification are: document_type, employer_name, salary or income_history
- If a field is not present in the document, set its value to null
- Do not make assumptions or fill in missing data
- Do not generate fake or placeholder data
- If the image is not a valid income verification document or is of poor quality, set is_valid to false`;

// Criminal Report OCR Prompt
const CRIMINAL_REPORT_PROMPT = `You are a document analysis expert specializing in criminal background reports. Analyze this criminal background check and extract the information. Return the data in this JSON format:
{
  "document_type": "Criminal Background Report",
  "report_date": "Date of the report in YYYY-MM-DD format",
  "personal_info": {
    "full_name": "Full name of the subject",
    "date_of_birth": "Date of birth in YYYY-MM-DD format if shown",
    "social_security": "Last 4 digits of SSN if shown (e.g., XXX-XX-1234)"
  },
  "records_found": "Boolean indicating if criminal records were found",
  "record_count": "Number of criminal records found",
  "conviction_details": [
    {
      "offense": "Description of the offense",
      "offense_date": "Date of offense in YYYY-MM-DD format",
      "offense_type": "Type of offense (felony, misdemeanor, etc.)",
      "disposition": "Outcome of the case (convicted, dismissed, etc.)",
      "sentence": "Sentence if convicted",
      "jurisdiction": "Court/jurisdiction where the case was heard"
    }
  ],
  "search_jurisdictions": ["List of jurisdictions searched"],
  "is_valid": "boolean indicating if the document is clearly a criminal background report"
}

IMPORTANT:
- If you cannot read any required field clearly, set is_valid to false
- Required fields are: document_type, report_date, records_found
- If a field is not present in the document, set its value to null
- Do not make assumptions or fill in missing data
- Do not generate fake or placeholder data
- If the image is not a valid criminal background report or is of poor quality, set is_valid to false`;

// Eviction Report OCR Prompt
const EVICTION_REPORT_PROMPT = `You are a document analysis expert specializing in eviction reports. Analyze this eviction history report and extract the information. Return the data in this JSON format:
{
  "document_type": "Eviction Report",
  "report_date": "Date of the report in YYYY-MM-DD format",
  "personal_info": {
    "full_name": "Full name of the subject",
    "current_address": "Current address if shown",
    "previous_addresses": ["Array of previous addresses if shown"]
  },
  "records_found": "Boolean indicating if eviction records were found",
  "eviction_count": "Number of evictions found",
  "eviction_details": [
    {
      "filing_date": "Date the eviction was filed in YYYY-MM-DD format",
      "address": "Address where eviction occurred",
      "county": "County of filing",
      "state": "State of filing",
      "plaintiff": "Name of plaintiff/landlord",
      "judgment_amount": "Monetary judgment amount if any",
      "disposition": "Outcome of the case (judgment for plaintiff, dismissed, etc.)"
    }
  ],
  "is_valid": "boolean indicating if the document is clearly an eviction report"
}

IMPORTANT:
- If you cannot read any required field clearly, set is_valid to false
- Required fields are: document_type, report_date, records_found
- If a field is not present in the document, set its value to null
- Do not make assumptions or fill in missing data
- Do not generate fake or placeholder data
- If the image is not a valid eviction report or is of poor quality, set is_valid to false`;

// Lease Agreement OCR Prompt
const LEASE_AGREEMENT_PROMPT = `You are a document analysis expert specializing in lease agreements. Analyze this lease document and extract the information. Return the data in this JSON format:
{
  "document_type": "Lease Agreement",
  "property_address": "Full address of the rental property",
  "lease_term": {
    "start_date": "Lease start date in YYYY-MM-DD format",
    "end_date": "Lease end date in YYYY-MM-DD format",
    "term_length": "Duration of the lease (e.g., 12 months)"
  },
  "rent_details": {
    "amount": "Monthly rent amount",
    "frequency": "Payment frequency (monthly, weekly, etc.)",
    "currency": "Currency code (e.g., USD, CAD, MXN)",
    "due_date": "Day of month rent is due",
    "late_fee": "Late fee amount or policy"
  },
  "security_deposit": "Security deposit amount",
  "landlord_info": {
    "name": "Landlord's name or company",
    "company": "Property management company if applicable",
    "contact": "Contact information"
  },
  "tenant_info": {
    "names": ["Names of all tenants listed"],
    "contact": "Contact information for tenants"
  },
  "additional_terms": ["Notable additional terms or clauses"],
  "signature_date": "Date the lease was signed in YYYY-MM-DD format",
  "is_signed": "Boolean indicating if the lease is signed by all parties",
  "is_valid": "boolean indicating if the document is clearly a valid lease agreement"
}

IMPORTANT:
- If you cannot read any required field clearly, set is_valid to false
- Required fields are: document_type, property_address, lease_term, rent_details
- If a field is not present in the document, set its value to null
- Do not make assumptions or fill in missing data
- Do not generate fake or placeholder data
- If the image is not a valid lease agreement or is of poor quality, set is_valid to false`;

// Bank Statement OCR Prompt (Guatemala)
const BANK_STATEMENT_PROMPT = `You are a document analysis expert specializing in bank statements. Analyze this bank statement and extract the information. Return the data in this JSON format:
{
  "document_type": "Bank Statement",
  "bank_name": "Name of the bank",
  "account_holder": "Name of the account holder",
  "account_number": "Account number (may be partially masked)",
  "account_type": "Type of account (checking, savings, etc.)",
  "statement_period": {
    "start_date": "Start date of statement period in YYYY-MM-DD format",
    "end_date": "End date of statement period in YYYY-MM-DD format"
  },
  "opening_balance": "Opening balance amount",
  "closing_balance": "Closing balance amount",
  "average_balance": "Average balance during the period if shown",
  "currency": "Currency code (e.g., GTQ, USD)",
  "transactions": {
    "total_deposits": "Total amount of deposits during the period",
    "total_withdrawals": "Total amount of withdrawals during the period",
    "transaction_count": "Total number of transactions"
  },
  "country": "Country of bank (e.g., GUATEMALA)",
  "is_valid": "boolean indicating if the document is clearly a valid bank statement"
}

IMPORTANT:
- If you cannot read any required field clearly, set is_valid to false
- Required fields are: document_type, bank_name, account_holder, statement_period
- If a field is not present in the document, set its value to null
- Do not make assumptions or fill in missing data
- Do not generate fake or placeholder data
- If the image is not a valid bank statement or is of poor quality, set is_valid to false`;

// Employment Letter OCR Prompt (Guatemala)
const EMPLOYMENT_LETTER_PROMPT = `You are a document analysis expert specializing in employment verification letters. Analyze this employment letter and extract the information. Return the data in this JSON format:
{
  "document_type": "Employment Verification Letter",
  "employer_name": "Name of the employer or company",
  "employer_address": "Address of the employer",
  "employee_name": "Name of the employee",
  "position": "Job title or position",
  "employment_duration": "Length of employment as stated",
  "start_date": "Employment start date in YYYY-MM-DD format",
  "salary": {
    "amount": "Salary amount as shown",
    "frequency": "Payment frequency (annually, monthly, etc.)",
    "currency": "Currency code (e.g., GTQ, USD)"
  },
  "issuer": {
    "name": "Name of person who issued the letter",
    "position": "Position of the issuer",
    "contact": "Contact information of issuer"
  },
  "issue_date": "Date the letter was issued in YYYY-MM-DD format",
  "letterhead_verified": "Boolean indicating if the letter is on official letterhead",
  "signature_verified": "Boolean indicating if the letter is properly signed",
  "country": "Country of employment (e.g., GUATEMALA)",
  "is_valid": "boolean indicating if the document is clearly a valid employment letter"
}

IMPORTANT:
- If you cannot read any required field clearly, set is_valid to false
- Required fields are: document_type, employer_name, employee_name, issue_date
- If a field is not present in the document, set its value to null
- Do not make assumptions or fill in missing data
- Do not generate fake or placeholder data
- If the image is not a valid employment letter or is of poor quality, set is_valid to false`;

// Helper function to get file extension
function getFileExtension(filePath: string): string {
  const parts = filePath.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

// Helper function to check if file is supported
function isSupportedFileType(contentType: string | null, filePath: string): boolean {
  if (!contentType) {
    // If content type is not available, try to determine from extension
    const ext = getFileExtension(filePath);
    return ['jpg', 'jpeg', 'png', 'pdf', 'heic', 'heif', 'webp', 'tiff', 'tif'].includes(ext);
  }
  
  return (
    contentType.startsWith('image/') || 
    contentType === 'application/pdf'
  );
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Request body must be a JSON object' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { filePath, options, documentType, country } = body;

    if (!filePath) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'File path is required' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get environment variables
    const apiKey = Deno.env.get('GROQ_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Required environment variables are not set' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate a signed URL that's valid for 1 hour
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('tenant_documents')
      .createSignedUrl(filePath, 3600)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to generate signed URL: ${signedUrlError?.message || 'No signed URL generated'}` 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Groq client
    const groq = new Groq({ apiKey })
    
    // Try to fetch the file first to ensure it exists and is accessible
    const fileResponse = await fetch(signedUrlData.signedUrl);
      
    if (!fileResponse.ok) {
      console.error(`File fetch failed with status: ${fileResponse.status}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to access file: ${fileResponse.statusText}` 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check Content-Type to ensure it's an image or PDF
    const contentType = fileResponse.headers.get('Content-Type');
    console.log(`File content type: ${contentType}`);
    console.log(`File extension: ${getFileExtension(filePath)}`);
    
    // Validate supported file types (images and PDFs)
    if (!isSupportedFileType(contentType, filePath)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unsupported file type: ${contentType || 'unknown'}. Supported formats are images (jpg, png, etc.) and PDF.` 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Log important info for debugging
    console.log(`Processing file: ${filePath}`);
    console.log(`Document type: ${documentType}`);
    console.log(`Country: ${country || 'Not specified'}`);
    
    // Select the appropriate prompt based on document type
    let analysisPrompt: string;
    switch (documentType) {
      case 'credit_report':
        analysisPrompt = CREDIT_REPORT_ANALYSIS_PROMPT;
        break;
      case 'income_verification':
        analysisPrompt = INCOME_VERIFICATION_PROMPT;
        break;
      case 'criminal_report':
        analysisPrompt = CRIMINAL_REPORT_PROMPT;
        break;
      case 'eviction_report':
        analysisPrompt = EVICTION_REPORT_PROMPT;
        break;
      case 'lease':
        analysisPrompt = LEASE_AGREEMENT_PROMPT;
        break;
      case 'bank_statements':
        analysisPrompt = BANK_STATEMENT_PROMPT;
        break;
      case 'employment_letter':
        analysisPrompt = EMPLOYMENT_LETTER_PROMPT;
        break;
      case 'id_document':
      case 'government_id':
      default:
        analysisPrompt = ID_ANALYSIS_PROMPT;
        break;
    }
    
    // Call Groq API to analyze the document
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: analysisPrompt },
            { type: "image_url", image_url: { url: signedUrlData.signedUrl } }
          ]
        }
      ],
      model: "llama-3.2-90b-vision-preview",
      temperature: options?.temperature ?? 0,
      max_completion_tokens: options?.maxTokens ?? 1024,
      top_p: options?.topP ?? 1,
      stream: options?.stream ?? false,
      stop: null,
      response_format: { type: "json_object" }
    })

    const content = JSON.parse(chatCompletion.choices[0].message.content)
    
    // Add country info if provided
    if (country && !content.country) {
      content.country = country;
    }
    
    // Add result_type to match our TypeScript type system
    let resultType: string;
    switch (documentType) {
      case 'credit_report':
        resultType = 'credit_report';
        break;
      case 'income_verification':
        resultType = 'income_verification';
        break;
      case 'criminal_report':
        resultType = 'criminal_report';
        break;
      case 'eviction_report':
        resultType = 'eviction_report';
        break;
      case 'lease':
        resultType = 'lease';
        break;
      case 'bank_statements':
        resultType = 'bank_statements';
        break;
      case 'employment_letter':
        resultType = 'employment_letter';
        break;
      case 'id_document':
      case 'government_id':
        resultType = 'id_document';
        break;
      default:
        resultType = 'other';
        break;
    }
    
    // Add result_type to content
    content.result_type = resultType;
    
    // Update the document with OCR results
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        ocr_results: content,
        ocr_status: 'completed',
        ocr_completed_at: new Date().toISOString(),
        ocr_error: null
      })
      .eq('file_path', filePath)

    if (updateError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to save OCR results: ${updateError.message}` 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: content }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error processing document:', error)
    
    // Update document with error status if possible
    try {
      const { filePath } = await req.json();
      if (filePath) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey)
          await supabase
            .from('documents')
            .update({
              ocr_status: 'failed',
              ocr_error: error instanceof Error ? error.message : 'Unknown error occurred during processing',
              ocr_completed_at: new Date().toISOString()
            })
            .eq('file_path', filePath)
        }
      }
    } catch (updateError) {
      console.error('Failed to update document error status:', updateError)
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process request' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ocr' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{
      "filePath": "path/to/document.jpg",
      "documentType": "id_document", 
      "country": "USA",
      "options": {
        "temperature": 0.1,
        "maxTokens": 1024
      }
    }'
*/
