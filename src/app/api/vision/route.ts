import { NextRequest, NextResponse } from 'next/server';
import { visionClient } from '@/lib/vision-client';
import { mockFoodRecognition } from '@/lib/demo-data';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const client = visionClient;

    // If no Vision client is available, use mock data
    if (!client) {
      console.log('Using mock data for Vision API');
      return NextResponse.json({ 
        labels: mockFoodRecognition,
        success: true 
      });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image, 'base64');

    // Perform multiple types of analysis for better food recognition
    const requests = [];

    if (client.labelDetection) {
      requests.push(client.labelDetection({ image: { content: imageBuffer } }));
    } else {
      requests.push(Promise.resolve([{ labelAnnotations: [] }]));
    }

    if (client.textDetection) {
      requests.push(client.textDetection({ image: { content: imageBuffer } }));
    } else {
      requests.push(Promise.resolve([{ textAnnotations: [] }]));
    }

    if (client.objectLocalization) {
      requests.push(client.objectLocalization({ image: { content: imageBuffer } }));
    } else {
      requests.push(Promise.resolve([{ localizedObjectAnnotations: [] }]));
    }

    const [labelResult, textResult, objectResult] = await Promise.all(requests);

    const labels = labelResult[0].labelAnnotations || [];
    const textAnnotations = textResult[0].textAnnotations || [];
    const objects = objectResult[0].localizedObjectAnnotations || [];
    
    // Extract text for restaurant/brand recognition
    const detectedText = textAnnotations.map((annotation: any) => annotation.description || '').join(' ').toLowerCase();
    
    // Restaurant/brand specific food mapping
    const restaurantFoodMap: { [key: string]: string[] } = {
      'guzman': ['Burrito Bowl', 'Mexican Bowl', 'Burrito', 'Nachos', 'Quesadilla'],
      'gyg': ['Burrito Bowl', 'Mexican Bowl', 'Burrito', 'Nachos', 'Quesadilla'],
      'chipotle': ['Burrito Bowl', 'Mexican Bowl', 'Burrito', 'Nachos'],
      'subway': ['Sandwich', 'Sub', 'Wrap', 'Salad'],
      'mcdonalds': ['Burger', 'Fries', 'McNuggets', 'Big Mac'],
      'kfc': ['Fried Chicken', 'Chicken Wings', 'Popcorn Chicken'],
      'dominos': ['Pizza', 'Garlic Bread', 'Chicken Wings'],
      'pizza hut': ['Pizza', 'Pasta', 'Garlic Bread'],
      'nandos': ['Peri Peri Chicken', 'Chicken Burger', 'Chips'],
      'red rooster': ['Roast Chicken', 'Chicken Roll', 'Chips']
    };
    
    // Check for restaurant brands in detected text
    let brandSpecificFoods: string[] = [];
    for (const [brand, foods] of Object.entries(restaurantFoodMap)) {
      if (detectedText.includes(brand)) {
        brandSpecificFoods = foods;
        break;
      }
    }
    
    // Enhanced food-related keywords with fries detection
    const foodKeywords = [
      'food', 'meal', 'dish', 'bowl', 'plate', 'serving',
      'burrito', 'bowl', 'rice', 'beans', 'chicken', 'beef', 'pork',
      'salad', 'lettuce', 'tomato', 'cheese', 'avocado', 'guacamole',
      'pizza', 'burger', 'sandwich', 'wrap', 'taco', 'nacho',
      'pasta', 'noodles', 'soup', 'curry', 'stir fry',
      'fruit', 'vegetable', 'meat', 'bread', 'dessert', 'cake',
      'samosa', 'dosa', 'biryani', 'curry', 'dal', 'naan',
      'fried', 'grilled', 'baked', 'roasted', 'steamed',
      'fries', 'chips', 'potato', 'sweet potato', 'french fries'
    ];
    
    // Enhanced label filtering with better food detection
    const foodLabels = labels
      .filter((label: any) => {
        if (!label.score || label.score < 0.3) return false; // Even lower threshold
        const description = label.description?.toLowerCase() || '';
        
        // Prioritize food-specific terms
        if (description.includes('bowl') && (description.includes('food') || detectedText.includes('gyg') || detectedText.includes('guzman'))) {
          return true;
        }
        
        // Special handling for fries/potato dishes
        if (description.includes('fries') || description.includes('potato') || 
            (description.includes('fried') && description.includes('food'))) {
          return true;
        }
        
        return foodKeywords.some(keyword => description.includes(keyword)) ||
               description.match(/\b(eating|cooking|cuisine|dish|meal|snack|treat|mexican|asian|indian)\b/);
      })
      .map((label: any) => {
        const desc = label.description || '';
        const lowerDesc = desc.toLowerCase();
        
        // Enhanced fries detection
        if (lowerDesc.includes('sweet') && lowerDesc.includes('potato')) {
          return 'Sweet Potato Fries';
        }
        if (lowerDesc.includes('fries') || (lowerDesc.includes('french') && lowerDesc.includes('potato'))) {
          return 'French Fries';
        }
        if (lowerDesc.includes('fried') && lowerDesc.includes('potato')) {
          return 'Fried Potatoes';
        }
        
        return desc;
      })
      .slice(0, 10);

    // Enhanced object detection for food items
    const foodObjects = objects
      .filter((obj: any) => obj.score && obj.score > 0.4)
      .map((obj: any) => obj.name || '')
      .slice(0, 5);

    // Smart food identification based on context
    let identifiedFoods: string[] = [];
    
    if (brandSpecificFoods.length > 0) {
      // If we identified a restaurant brand, use specific items
      identifiedFoods = brandSpecificFoods;
    } else {
      // Combine all detection methods
      const allDetections = [...foodLabels, ...foodObjects];
      
      // Smart mapping of generic terms to specific foods
      const contextualMapping: { [key: string]: string } = {
        'bowl': detectedText.includes('mexican') || detectedText.includes('gyg') || detectedText.includes('guzman') ? 'Burrito Bowl' : 'Food Bowl',
        'food': 'Mixed Meal',
        'dish': 'Prepared Meal',
        'meal': 'Complete Meal',
        'snack': 'Light Snack',
        'fast food': 'Fast Food Meal'
      };
      
      identifiedFoods = allDetections.map(item => {
        const lowerItem = item.toLowerCase();
        return contextualMapping[lowerItem] || item;
      });
    }
    
    // Remove duplicates and filter out generic terms
    const finalFoodItems = [...new Set(identifiedFoods)]
      .filter(item => item && item.length > 2)
      .slice(0, 8);

    // If we have specific context clues, enhance the results
    if (detectedText.includes('gyg') || detectedText.includes('guzman')) {
      if (!finalFoodItems.some(item => item.toLowerCase().includes('burrito'))) {
        finalFoodItems.unshift('Burrito Bowl');
      }
    }

    console.log('Vision API Results:', {
      detectedText: detectedText.slice(0, 100),
      brandSpecificFoods,
      finalFoodItems
    });

    // Combine all detected items
    const allItems = [
      ...labels.map((label: any) => ({ name: label.description, score: label.score })),
      ...objects.map((obj: any) => ({ name: obj.name, score: obj.score })),
      ...brandSpecificFoods.map(food => ({ name: food, score: 0.95 })) // High confidence for text match
    ];

    // Filter and rank results
    const foodRelatedKeywords = ['food', 'meal', 'dish', 'cuisine', 'ingredient', 'snack', 'dessert', 'drink', 'beverage'];
    const filteredItems = allItems.filter(item => 
      item.name &&
      item.score > 0.6 && // Confidence threshold
      !foodRelatedKeywords.includes(item.name.toLowerCase())
    );

    // Deduplicate and combine scores
    const rankedItems: { [key: string]: number } = {};
    filteredItems.forEach(item => {
      if (item.name) {
        const name = item.name.toLowerCase();
        rankedItems[name] = Math.max(rankedItems[name] || 0, item.score);
      }
    });

    const finalLabels = Object.entries(rankedItems)
      .sort(([, a], [, b]) => b - a)
      .map(([name, score]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), score }));

    return NextResponse.json({ 
      labels: finalLabels.slice(0, 10),
      success: true 
    });
  } catch (error) {
    console.error('Vision API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' }, 
      { status: 500 }
    );
  }
}
