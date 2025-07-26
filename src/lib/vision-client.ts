/**
 * This script handles the initialization of Google Cloud Vision API client
 * and provides safe wrapper functions for API calls.
 * It supports both service account file path (local) and JSON string (Vercel).
 */

import { ImageAnnotatorClient, protos } from '@google-cloud/vision';

type VisionClientType = ImageAnnotatorClient | null;
let client: VisionClientType = null;

try {
  const credentialsStr = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialsStr) {
    try {
      const credentials = JSON.parse(credentialsStr);
      client = new ImageAnnotatorClient({ credentials });
      console.log('Vision API client initialized from credentials JSON string.');
    } catch (e) {
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

// Define a type for the request
type VisionRequest = protos.google.cloud.vision.v1.IAnnotateImageRequest;

// Safe wrapper for labelDetection
const safeLabelDetection = (request: VisionRequest): Promise<[protos.google.cloud.vision.v1.IAnnotateImageResponse]> => {
  if (client && typeof client.labelDetection === 'function') {
    return client.labelDetection(request);
  }
  return Promise.resolve([{ labelAnnotations: [] }]);
};

// Safe wrapper for textDetection
const safeTextDetection = (request: VisionRequest): Promise<[protos.google.cloud.vision.v1.IAnnotateImageResponse]> => {
  if (client && typeof client.textDetection === 'function') {
    return client.textDetection(request);
  }
  return Promise.resolve([{ textAnnotations: [] }]);
};

// Safe wrapper for objectLocalization
const safeObjectLocalization = (request: VisionRequest): Promise<[protos.google.cloud.vision.v1.IAnnotateImageResponse]> => {
  if (client && typeof client.objectLocalization === 'function') {
    return client.objectLocalization(request);
  }
  return Promise.resolve([{ localizedObjectAnnotations: [] }]);
};


export const vision = {
  client,
  labelDetection: safeLabelDetection,
  textDetection: safeTextDetection,
  objectLocalization: safeObjectLocalization,
};
