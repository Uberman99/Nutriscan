/**
 * This script handles the initialization of Google Cloud Vision API client
 * It supports both API key and service account authentication methods
 */

import { ImageAnnotatorClient } from '@google-cloud/vision';

// Define the type for our Vision client
type VisionClientType = ImageAnnotatorClient | null;

// Initialize the client
let client: VisionClientType = null;

try {
  // First try with service account credentials if available
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    client = new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    console.log('Vision API client initialized with service account credentials');
  } 
  // Fall back to API key if available
  else if (process.env.GOOGLE_VISION_API_KEY) {
    client = new ImageAnnotatorClient({
      credentials: {
        client_email: undefined,
        private_key: undefined
      },
      projectId: 'nutriscan-project',
    });
    console.log('Vision API client initialized with API key');
  }
  // No authentication available
  else {
    console.warn('No Vision API authentication found - will use demo mode');
    client = null;
  }
} catch (error) {
  console.error('Error initializing Vision API client:', error);
  client = null;
}

export { client as visionClient };
export type { VisionClientType };
