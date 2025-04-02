// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { Groq } from 'npm:groq-sdk'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("OCR Function initialized") 

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

    const { filePath, options } = body;

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
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: ID_ANALYSIS_PROMPT },
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
    console.error('Error:', error)
    
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
      "options": {
        "temperature": 0.1,
        "maxTokens": 1024
      }
    }'
*/
