/**
 * This script handles the initialization of Google Cloud Vision API client
 * It supports both service account file path (local) and JSON string (Vercel).
 */

import { ImageAnnotatorClient } from '@google-cloud/vision';

// Define the type for our Vision client
type VisionClientType = ImageAnnotatorClient | null;

// Initialize the client
let client: VisionClientType = null;

try {
  const credentialsStr = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialsStr) {
    try {
      // First, try to parse it as JSON (for Vercel)
      const credentials = JSON.parse(credentialsStr);
      client = new ImageAnnotatorClient({ credentials });
      console.log('Vision API client initialized from credentials JSON string.');
    } catch (e) {
      // If parsing fails, assume it's a file path (for local dev)
      client = new ImageAnnotatorClient({ keyFilename: credentialsStr });
      console.log('Vision API client initialized from credentials file path.');
    }
  } else {
    console.warn('GOOGLE_APPLICATION_CREDENTIALS not set. Vision API will use demo mode.');
    client = null;
  }
} catch (error) {
  console.error('Error initializing Vision API client:', error);
  client = null;
}

export { client as visionClient };
export type { VisionClientType };
