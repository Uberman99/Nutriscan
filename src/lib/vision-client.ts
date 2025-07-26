/**
 * This script handles the initialization of Google Cloud Vision API client
 * and provides safe wrapper functions for API calls.
 * It supports both service account file path (local) and JSON string (Vercel).
 *
 * UPDATE: Temporarily simplified for debugging Vercel build issues.
 */

// Define a placeholder type for VisionRequest
interface VisionRequest {
  image: {
    content: Buffer;
  };
}

// Return dummy functions to avoid build errors
const safeLabelDetection = (request: VisionRequest): Promise<{ labelAnnotations: unknown[] }> => {
  console.log('Label detection request:', request); // Log the request for debugging
  return Promise.resolve({ labelAnnotations: [] });
};
const safeTextDetection = (request: VisionRequest): Promise<{ textAnnotations: unknown[] }> => {
  console.log('Text detection request:', request); // Log the request for debugging
  return Promise.resolve({ textAnnotations: [] });
};
const safeObjectLocalization = (request: VisionRequest): Promise<{ localizedObjectAnnotations: unknown[] }> => {
  console.log('Object localization request:', request); // Log the request for debugging
  return Promise.resolve({ localizedObjectAnnotations: [] });
};

export const vision = {
  client: null, // Explicitly null
  labelDetection: safeLabelDetection,
  textDetection: safeTextDetection,
  objectLocalization: safeObjectLocalization,
};
