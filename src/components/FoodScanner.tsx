'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import imageCompression from 'browser-image-compression';
import { Camera, Upload, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  analyzeImageForFood,
  analyzeFoodWithAI,
  getNutritionData,
  getPrices,
} from "@/lib/api";
import NutritionResults from '@/components/NutritionResults'
import ResultsSkeleton from '@/components/ResultsSkeleton';
import { NutritionInfo } from '@/lib/types';

interface FoodRecognitionResult {
  name: string;
  confidence: number;
  source: string;
}

interface PriceData {
    name: string;
    price: number;
    url?: string;
}

interface ScanResults {
  foodItems: FoodRecognitionResult[];
  aiAnalysis: {
    description: string
    healthScore: number
    suggestions: string[]
  }
  nutritionData: NutritionInfo[]
  priceData: PriceData[]
}

export default function FoodScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<ScanResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageUpload = async (file: File) => {
    if (!file) return

    setIsScanning(true)
    setError(null)
    setResults(null)

    const reader = new FileReader()
    reader.onload = (e) => setSelectedImage(e.target?.result as string)
    reader.readAsDataURL(file)

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      }
      
      const compressedFile = await imageCompression(file, options);
      
      const foodItems = await analyzeImageForFood(compressedFile);
      
      if (foodItems.length === 0 || foodItems[0].name === 'No food recognized') {
        throw new Error('No food items were detected in the image. Please try again with a clearer picture of the food.')
      }

      const foodNames = foodItems.map(item => item.name);
      const aiAnalysis = await analyzeFoodWithAI(foodNames);

      const nutritionPromises = foodNames.slice(0, 3).map(itemName => getNutritionData(itemName));
      const nutritionData = (await Promise.all(nutritionPromises)).filter((item): item is NutritionInfo => item !== null);

      if (nutritionData.length === 0) {
        throw new Error('Could not retrieve valid nutrition data for the detected food items. The food may not be in our database.');
      }

      const pricePromises = foodNames.slice(0, 3).map(itemName => getPrices(itemName));
      const priceDataResults = await Promise.all(pricePromises);
      const priceData = priceDataResults
        .filter((data): data is { stores: PriceData[] } => data && Array.isArray(data.stores))
        .flatMap(data => data.stores);

      setResults({
        foodItems,
        aiAnalysis,
        nutritionData,
        priceData
      })

    } catch (err) {
      console.error('Scanning error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during the scan.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleActionClick = () => {
    fileInputRef.current?.click()
  }

  const handleScanAnother = () => {
    setResults(null)
    setError(null)
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {!results && (
        <Card>
          <CardHeader className="items-center text-center">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20 mb-2">
                <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">AI Vision Engine</CardTitle>
            <CardDescription>
              Take a photo or upload an image for a complete ingredient and nutritional breakdown.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleActionClick} 
                className="flex-1 shadow-lg shadow-primary/30"
                size="lg"
                disabled={isScanning}
              >
                <Camera className="mr-2 h-5 w-5" />
                Take Photo
              </Button>
              <Button 
                onClick={handleActionClick} 
                variant="secondary" 
                size="lg"
                className="flex-1"
                disabled={isScanning}
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Image
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
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground text-center mb-4">Image Preview:</p>
                <div className="relative w-full max-w-md mx-auto aspect-video rounded-xl overflow-hidden border-2 border-dashed border-border">
                  <Image 
                    src={selectedImage} 
                    alt="Selected food" 
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isScanning && <ResultsSkeleton />}

      {error && !isScanning && (
        <Card className="border-destructive bg-destructive/10 text-destructive-foreground">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="h-8 w-8" />
            <div>
              <p className="font-semibold text-lg">Scan Failed</p>
              <span className="text-sm">{error}</span>
            </div>
             <Button onClick={handleScanAnother} variant="destructive" size="sm" className="ml-auto">Try Again</Button>
          </CardContent>
        </Card>
      )}

      {results && !isScanning && (
        <NutritionResults results={results} onClear={handleScanAnother} />
      )}
    </div>
  )
}