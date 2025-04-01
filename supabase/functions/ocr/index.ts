// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { Groq } from 'npm:groq-sdk'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("OCR Function initialized")

interface VisionAnalysisOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  responseFormat?: { type: 'json_object' };
}

interface RequestBody {
  filePath: string;
  documentType?: string;
  options?: VisionAnalysisOptions;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Max-Age': '86400',
}

// Document type-specific prompts
const DOCUMENT_PROMPTS = {
  id_document: `You are a document analysis expert specializing in ID verification. Analyze this government-issued ID and extract the information. Return the data in this JSON format:
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
  - If the image is not a valid ID document or is of poor quality, set is_valid to false`,

  credit_report: `You are a credit report analysis expert. Analyze this credit report and extract the information. Return the data in this JSON format:
  {
    "credit_score": "The exact numerical score shown",
    "report_date": "Date in YYYY-MM-DD format",
    "payment_history": {
      "on_time_payments_percentage": "Exact percentage shown",
      "late_payments": "Exact number shown"
    },
    "credit_utilization": "Exact percentage shown",
    "length_of_credit_history": "Exact length in years",
    "negative_marks": "Exact number shown",
    "total_accounts": "Exact number shown",
    "is_valid": "boolean indicating if all required fields are clearly visible and legible"
  }
  
  IMPORTANT:
  - If you cannot read any required field clearly, set is_valid to false
  - Required fields for credit reports are: credit_score, report_date
  - Do not make assumptions or fill in missing data
  - Do not generate fake or placeholder data
  - If the image is not a valid credit report or is of poor quality, set is_valid to false`,

  criminal_report: `You are a background check expert. Analyze this criminal background report and extract the information. Return the data in this JSON format:
  {
    "report_date": "Date in YYYY-MM-DD format",
    "has_criminal_record": "true only if records are clearly shown",
    "records": [{
      "offense_date": "Date in YYYY-MM-DD format",
      "offense_type": "Exact offense type as shown",
      "jurisdiction": "Exact jurisdiction as shown",
      "disposition": "Exact case disposition as shown",
      "sentence": "Exact sentence as shown"
    }],
    "is_valid": "boolean indicating if all required fields are clearly visible and legible"
  }
  
  IMPORTANT:
  - If you cannot read any required field clearly, set is_valid to false
  - Required fields for criminal reports are: report_date, has_criminal_record
  - Do not make assumptions or fill in missing data
  - Do not generate fake or placeholder data
  - If the image is not a valid report or is of poor quality, set is_valid to false`,

  eviction_report: `You are an eviction history expert. Analyze this eviction report and extract the information. Return the data in this JSON format:
  {
    "report_date": "Date in YYYY-MM-DD format",
    "has_eviction_record": "true only if records are clearly shown",
    "records": [{
      "filing_date": "Date in YYYY-MM-DD format",
      "address": "Exact property address as shown",
      "reason": "Exact reason as shown",
      "outcome": "Exact outcome as shown",
      "amount_owed": "Exact amount as shown"
    }],
    "is_valid": "boolean indicating if all required fields are clearly visible and legible"
  }
  
  IMPORTANT:
  - If you cannot read any required field clearly, set is_valid to false
  - Required fields for eviction reports are: report_date, has_eviction_record
  - Do not make assumptions or fill in missing data
  - Do not generate fake or placeholder data
  - If the image is not a valid report or is of poor quality, set is_valid to false`,

  income_verification: `You are an income verification expert. Analyze this document and extract the information. Return the data in this JSON format:
  {
    "employer": "Exact employer name as shown",
    "employee": "Exact employee name as shown",
    "employment_status": "Exact status as shown",
    "position": "Exact job title as shown",
    "start_date": "Date in YYYY-MM-DD format",
    "income": {
      "salary": "Exact annual salary amount as shown",
      "pay_frequency": "Exact payment frequency as shown",
      "last_pay_date": "Date in YYYY-MM-DD format",
      "year_to_date": "Exact year-to-date earnings as shown"
    },
    "is_valid": "boolean indicating if all required fields are clearly visible and legible"
  }
  
  IMPORTANT:
  - If you cannot read any required field clearly, set is_valid to false
  - Required fields for income verification are: employer, employee, income.salary
  - Do not make assumptions or fill in missing data
  - Do not generate fake or placeholder data
  - If the image is not a valid income document or is of poor quality, set is_valid to false`,

  lease: `You are a lease agreement expert. Analyze this document and extract the information. Return the data in this JSON format:
  {
    "property": {
      "address": "Exact property address as shown",
      "unit": "Exact unit number as shown"
    },
    "lease_terms": {
      "start_date": "Date in YYYY-MM-DD format",
      "end_date": "Date in YYYY-MM-DD format",
      "monthly_rent": "Exact amount as shown",
      "security_deposit": "Exact amount as shown"
    },
    "landlord": {
      "name": "Exact name as shown",
      "contact": "Exact contact info as shown"
    },
    "tenant": {
      "name": "Exact name as shown",
      "contact": "Exact contact info as shown"
    },
    "is_valid": "boolean indicating if all required fields are clearly visible and legible"
  }
  
  IMPORTANT:
  - If you cannot read any required field clearly, set is_valid to false
  - Required fields for lease agreements are: property.address, lease_terms.start_date, lease_terms.end_date, lease_terms.monthly_rent
  - Do not make assumptions or fill in missing data
  - Do not generate fake or placeholder data
  - If the image is not a valid lease agreement or is of poor quality, set is_valid to false`
};

// Classification prompt
const CLASSIFICATION_PROMPT = `You are a document classification expert. Analyze this image and classify it into one of these categories:
- id_document: Government-issued ID documents (driver's license, passport, state ID)
- credit_report: Credit reports showing credit scores and history
- criminal_report: Criminal background check reports
- eviction_report: Eviction history reports
- income_verification: Income and employment verification documents
- lease: Lease agreements and rental contracts
- other: Any other document type

IMPORTANT:
- Return ONLY the category name as a single word
- If you cannot determine the document type with high confidence, return "other"
- Do not add any explanation or additional text`;

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID()
  console.log(`[${requestId}] New request received`)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }
  
  try {
    const { filePath, documentType, options }: RequestBody = await req.json()
    console.log(`[${requestId}] Request parsed:`, {
      filePath,
      documentType,
      options
    })

    const apiKey = Deno.env.get('GROQ_API_KEY')
    if (!apiKey) {
      console.error(`[${requestId}] GROQ_API_KEY not set`)
      throw new Error('GROQ_API_KEY is not set')
    }

    if (!filePath) {
      console.error(`[${requestId}] No file path provided`)
      throw new Error('File path is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate a signed URL that's valid for 1 hour
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('tenant_documents')
      .createSignedUrl(filePath, 3600) // 1 hour expiration

    if (signedUrlError) {
      console.error(`[${requestId}] Error generating signed URL:`, signedUrlError)
      throw new Error('Failed to generate signed URL')
    }

    if (!signedUrlData?.signedUrl) {
      throw new Error('No signed URL generated')
    }

    console.log(`[${requestId}] Using signed URL:`, signedUrlData.signedUrl)

    // Verify the file exists and is accessible
    const { error: fileError } = await supabase
      .storage
      .from('tenant_documents')
      .list(filePath.split('/').slice(0, -1).join('/'))

    if (fileError) {
      console.error(`[${requestId}] Error checking file:`, fileError)
      throw new Error('File not found or not accessible')
    }

    console.log(`[${requestId}] Initializing Groq client`)
    const groq = new Groq({
      apiKey: apiKey,
    })

    // First, classify the document if type not provided
    let detectedType = documentType;
    if (!detectedType) {
      console.log(`[${requestId}] Classifying document...`)
      const classificationResponse = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: CLASSIFICATION_PROMPT
              },
              {
                type: "image_url",
                image_url: {
                  url: signedUrlData.signedUrl
                }
              }
            ]
          }
        ],
        model: "llama-3.2-90b-vision-preview",
        temperature: 0,
        max_completion_tokens: 50,
        top_p: 1,
        stream: false,
        stop: null
      });

      if ('choices' in classificationResponse) {
        detectedType = classificationResponse.choices[0].message.content.trim().toLowerCase();
        console.log(`[${requestId}] Document classified as: ${detectedType}`);
      }
    }

    // Get the appropriate prompt for the document type
    const prompt = DOCUMENT_PROMPTS[detectedType as keyof typeof DOCUMENT_PROMPTS] || 
      `You are a document analysis expert. Analyze this document and extract ONLY the information that you can see with high confidence. Return the data in JSON format.

      IMPORTANT:
      - If you cannot read something clearly, set it to null
      - Do not make assumptions or fill in missing data
      - Do not generate fake or placeholder data
      - Only include information that is actually visible and legible in the image`;

    console.log(`[${requestId}] Making Groq API call with model: llama-3.2-90b-vision-preview`)
    const startTime = Date.now()
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: signedUrlData.signedUrl
              }
            }
          ]
        }
      ],
      model: "llama-3.2-90b-vision-preview",
      temperature: 0,
      max_completion_tokens: options?.maxTokens ?? 1024,
      top_p: 1,
      stream: false,
      stop: null
    })

    const endTime = Date.now()
    console.log(`[${requestId}] Groq API call completed in ${endTime - startTime}ms`)

    if ('choices' in chatCompletion) {
      console.log(`[${requestId}] Successfully processed response`)
      let content;
      try {
        content = JSON.parse(chatCompletion.choices[0].message.content);
      } catch (error) {
        console.error(`[${requestId}] Error parsing OCR response:`, error);
        return new Response(
          JSON.stringify({
            content: null,
            error: "Failed to parse OCR results. Please try again with a clearer image.",
            detected_type: detectedType
          }),
          { 
            status: 400,
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders
            } 
          }
        );
      }
      
      // Check if the document is valid
      if (!content.is_valid) {
        return new Response(
          JSON.stringify({
            content: null,
            error: "Document quality is insufficient. Please upload a clearer image.",
            detected_type: detectedType
          }),
          { 
            status: 400,
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders
            } 
          }
        );
      }

      // Remove the is_valid field before returning
      delete content.is_valid;
      
      return new Response(
        JSON.stringify({
          content: content,
          detected_type: detectedType,
          error: null
        }),
        { 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      )
    }

    console.error(`[${requestId}] Unexpected response format from Groq API`)
    throw new Error("Unexpected response format")
  } catch (error) {
    console.error(`[${requestId}] Error processing request:`, error)
    return new Response(
      JSON.stringify({
        content: null,
        error: error instanceof Error ? error.message : "Failed to analyze image",
        detected_type: null
      }),
      { 
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
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
      "options": {
        "temperature": 0.1,
        "maxTokens": 1024
      }
    }'
*/
