/**
 * This script handles the initialization of Google Cloud Vision API client
 * and provides safe wrapper functions for API calls.
 * It supports both service account file path (local) and JSON string (Vercel).
 *
 * UPDATE: Temporarily simplified for debugging Vercel build issues.
 */

import { protos } from '@google-cloud/vision';

// Define a type for the request
type VisionRequest = protos.google.cloud.vision.v1.IAnnotateImageRequest;

// Return dummy functions to avoid build errors
const safeLabelDetection = (request: VisionRequest): Promise<[protos.google.cloud.vision.v1.IAnnotateImageResponse]> => {
  return Promise.resolve([{ labelAnnotations: [] }]);
};
const safeTextDetection = (request: VisionRequest): Promise<[protos.google.cloud.vision.v1.IAnnotateImageResponse]> => {
  return Promise.resolve([{ textAnnotations: [] }]);
};
const safeObjectLocalization = (request: VisionRequest): Promise<[protos.google.cloud.vision.v1.IAnnotateImageResponse]> => {
  return Promise.resolve([{ localizedObjectAnnotations: [] }]);
};

export const vision = {
  client: null, // Explicitly null
  labelDetection: safeLabelDetection,
  textDetection: safeTextDetection,
  objectLocalization: safeObjectLocalization,
};
