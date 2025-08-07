'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import imageCompression from 'browser-image-compression';
import { Camera, Upload, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import NutritionResults from '@/components/NutritionResults'
import ResultsSkeleton from '@/components/ResultsSkeleton';
import { NutritionInfo } from '@/lib/types';

interface ScanResults {
  foodItems: { name: string; confidence: number; source: string }[];
  aiAnalysis: {
    description: string;
    suggestions: string[];
    healthScore: number;
  };
  nutritionData: NutritionInfo[];
}

export default function FoodScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<ScanResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsScanning(true);
    setError(null);
    setResults(null);

    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append('image', compressedFile);

      const response = await fetch('/api/scan-food', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image.');
      }

      const scanResults: ScanResults = await response.json();
      setResults(scanResults);

    } catch (err) {
      console.error('Scanning error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleCameraCapture = () => fileInputRef.current?.click();
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleScanAnother = () => {
    setResults(null);
    setError(null);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Your Meal
          </CardTitle>
          <CardDescription>
            Take a photo or upload an image for instant analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 justify-center">
            <Button onClick={handleCameraCapture} className="flex-1" disabled={isScanning}>
              <Camera className="mr-2 h-4 w-4" /> Take Photo
            </Button>
            <Button onClick={handleUploadClick} variant="outline" className="flex-1" disabled={isScanning}>
              <Upload className="mr-2 h-4 w-4" /> Upload Image
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {selectedImage && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Selected Image:</p>
              <div className="relative w-full max-w-md mx-auto aspect-video">
                <Image 
                  src={selectedImage} 
                  alt="Selected food" 
                  fill
                  style={{ objectFit: 'contain' }}
                  className="rounded-lg border-2 border-dashed border-gray-300" 
                />
              </div>
            </div>
          )}

          {isScanning && <ResultsSkeleton />}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Scan Results</h2>
          </div>
          <NutritionResults results={results} onClear={handleScanAnother} />
        </div>
      )}
    </div>
  )
}