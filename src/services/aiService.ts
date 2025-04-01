import { Groq } from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

interface VisionAnalysisOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  responseFormat?: { type: 'json_object' };
}

interface VisionAnalysisResult {
  content: string;
  error?: string;
}

/**
 * Analyze an image using Groq's vision model
 * @param imageUrl URL of the image to analyze
 * @param prompt Text prompt for the analysis
 * @param options Additional options for the API call
 */
export async function analyzeImage(
  imageUrl: string,
  prompt: string,
  options: VisionAnalysisOptions = {}
): Promise<VisionAnalysisResult> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: JSON.stringify([
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ])
        }
      ],
      model: "llama-3.2-90b-vision-preview",
      temperature: options.temperature ?? 1,
      max_tokens: options.maxTokens ?? 1024,
      top_p: options.topP ?? 1,
      stream: false,
      response_format: options.responseFormat,
      stop: null
    });

    if ('choices' in chatCompletion) {
      return {
        content: chatCompletion.choices[0].message.content
      };
    }

    return {
      content: "",
      error: "Unexpected response format"
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      content: "",
      error: error instanceof Error ? error.message : "Failed to analyze image"
    };
  }
}

/**
 * Analyze a base64 encoded image
 * @param base64Image Base64 encoded image string
 * @param prompt Text prompt for the analysis
 * @param options Additional options for the API call
 */
export async function analyzeBase64Image(
  base64Image: string,
  prompt: string,
  options: VisionAnalysisOptions = {}
): Promise<VisionAnalysisResult> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: JSON.stringify([
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ])
        }
      ],
      model: "llama-3.2-90b-vision-preview",
      temperature: options.temperature ?? 1,
      max_tokens: options.maxTokens ?? 1024,
      top_p: options.topP ?? 1,
      stream: false,
      response_format: options.responseFormat,
      stop: null
    });

    if ('choices' in chatCompletion) {
      return {
        content: chatCompletion.choices[0].message.content
      };
    }

    return {
      content: "",
      error: "Unexpected response format"
    };
  } catch (error) {
    console.error("Error analyzing base64 image:", error);
    return {
      content: "",
      error: error instanceof Error ? error.message : "Failed to analyze image"
    };
  }
}

/**
 * Convert a File object to base64 string
 * @param file File object to convert
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Analyze a local file using Groq's vision model
 * @param file File object to analyze
 * @param prompt Text prompt for the analysis
 * @param options Additional options for the API call
 */
export async function analyzeLocalFile(
  file: File,
  prompt: string,
  options: VisionAnalysisOptions = {}
): Promise<VisionAnalysisResult> {
  try {
    // Convert file to base64
    const base64Image = await fileToBase64(file);
    return await analyzeBase64Image(base64Image, prompt, options);
  } catch (error) {
    console.error("Error analyzing local file:", error);
    return {
      content: "",
      error: error instanceof Error ? error.message : "Failed to analyze file"
    };
  }
} 