import { supabase } from "../lib/supabase";

interface OCRResponse {
  content: string;
  error?: string;
}

interface OCROptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  responseFormat?: { type: 'json_object' };
}

const getPromptForDocumentType = (type: string): string => {
  switch (type) {
    case 'credit_report':
      return 'Analyze this credit report and extract key information including credit score, payment history, and any negative marks. Format the response as a JSON object with these fields.';
    case 'criminal_report':
      return 'Analyze this criminal background report and extract key information including any criminal records, charges, and their status. Format the response as a JSON object with these fields.';
    case 'eviction_report':
      return 'Analyze this eviction report and extract key information including any eviction records, dates, and outcomes. Format the response as a JSON object with these fields.';
    case 'income_verification':
      return 'Analyze this income verification document and extract key information including income amount, frequency, and employer details. Format the response as a JSON object with these fields.';
    case 'id_document':
      return `Analyze this ID document and extract the following information in a structured JSON format:
{
  "document_type": "The type of ID (e.g., driver's license, passport, etc.)",
  "full_name": "Full name as shown on the document",
  "date_of_birth": "Date of birth in ISO format (YYYY-MM-DD)",
  "document_number": "ID number or passport number",
  "expiration_date": "Expiration date in ISO format (YYYY-MM-DD)",
  "address": {
    "street": "Street address",
    "city": "City",
    "state": "State/Province",
    "zip_code": "ZIP/Postal code",
    "country": "Country"
  },
  "additional_info": {
    "height": "Height if available",
    "weight": "Weight if available",
    "eye_color": "Eye color if available",
    "hair_color": "Hair color if available",
    "sex": "Sex/Gender if available"
  }
}
Please ensure all dates are in ISO format (YYYY-MM-DD) and all text is properly extracted.`;
    case 'lease':
      return 'Analyze this lease agreement and extract key information including lease term, rent amount, security deposit, and key dates. Format the response as a JSON object with these fields.';
    default:
      return 'Analyze this document and extract key information. Format the response as a JSON object with relevant fields.';
  }
};

export async function analyzeDocument(
  filePath: string,
  documentType: string,
  options: OCROptions = {}
): Promise<OCRResponse> {
  try {
    // Get the appropriate prompt based on document type
    const prompt = getPromptForDocumentType(documentType);

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ocr', {
      body: {
        filePath,
        prompt,
        options: {
          ...options,
          responseFormat: { type: 'json_object' }
        }
      }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error analyzing document:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Failed to analyze document'
    };
  }
} 