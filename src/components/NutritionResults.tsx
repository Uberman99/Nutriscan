



"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Star, Utensils, HeartPulse, Flame, BrainCircuit, Plus, CheckCircle, Camera } from "lucide-react";
import { NutritionInfo } from "@/lib/types";

interface NutritionResultsProps {
  results: {
    foodItems: Array<{ name: string; confidence: number; source: string }>;
    aiAnalysis: {
      description: string;
      suggestions: string[];
      healthScore: number;
    };
    nutritionData: NutritionInfo[];
  };
  onClear: () => void;
}

export default function NutritionResults({ results, onClear }: NutritionResultsProps) {
  const { foodItems, aiAnalysis, nutritionData } = results;
  const [isLogging, setIsLogging] = useState(false);
  const [loggedMeal, setLoggedMeal] = useState<string | null>(null);

  // Function to log meal
  const logMeal = async (mealType: string) => {
    setIsLogging(true);
    try {
      const response = await fetch('/api/log-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mealType,
          foods: nutritionData.map(nutrition => ({
            name: nutrition.food_name,
            calories: nutrition.nf_calories,
            protein: nutrition.nf_protein,
            carbs: nutrition.nf_total_carbohydrate,
            fat: nutrition.nf_total_fat,
            fiber: nutrition.nf_dietary_fiber,
          }))
        })
      });

      if (response.ok) {
        setLoggedMeal(mealType);
        setTimeout(() => setLoggedMeal(null), 3000); // Clear success message after 3 seconds
      } else {
        console.error('Failed to log meal');
      }
    } catch (error) {
      console.error('Error logging meal:', error);
    } finally {
      setIsLogging(false);
    }
  };

  // Animated health score ring
  const HealthScoreRing = ({ score }: { score: number }) => {
    const radius = 36;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progress = Math.max(0, Math.min(score, 100));
    const offset = circumference - (progress / 100) * circumference;
    let color = "#22c55e"; // green
    if (score < 80) color = "#facc15"; // yellow
    if (score < 60) color = "#fb923c"; // orange
    if (score < 40) color = "#ef4444"; // red
    return (
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset: offset, transition: "stroke-dashoffset 1s" }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">{score}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 p-8 mb-8 relative overflow-hidden">
        {/* Enhanced gradient accents */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-green-300/30 via-blue-200/30 to-transparent rounded-full opacity-60 blur-3xl z-0" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-yellow-200/30 via-pink-200/30 to-transparent rounded-full opacity-60 blur-3xl z-0" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-100/20 to-blue-100/20 rounded-full opacity-40 blur-3xl z-0" />
        
        {/* Health Score and Food List */}
        <div className="flex flex-col lg:flex-row items-center gap-8 z-10 relative">
          <div className="flex-shrink-0">
            <HealthScoreRing score={aiAnalysis.healthScore} />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3 flex items-center justify-center lg:justify-start gap-3">
              <Utensils className="h-7 w-7 text-green-500" />
              Detected Foods
            </h2>
            <div className="flex flex-wrap gap-3 mb-4 justify-center lg:justify-start">
              {foodItems.map((item, idx) => (
                <span key={idx} className="inline-flex items-center px-4 py-2 rounded-full font-semibold bg-gradient-to-r from-green-100 to-blue-100 text-green-900 shadow-lg border border-green-200/50 text-base hover:shadow-xl transition-shadow duration-200">
                  {item.name}
                  <Badge className="ml-2 bg-green-200 text-green-800 text-xs px-2 py-0.5">
                    {Math.round(item.confidence * 100)}%
                  </Badge>
                </span>
              ))}
            </div>
            <div className="text-slate-600 mb-4 text-lg leading-relaxed">{aiAnalysis.description}</div>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {aiAnalysis.suggestions.map((s, i) => (
                <Badge key={i} className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-shadow duration-200 border border-blue-200/50">
                  💡 {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Nutrition Table */}
        <div className="mt-10">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
            <Star className="h-6 w-6 text-yellow-500" /> 
            Detailed Nutrition Facts
          </h3>
          <div className="overflow-x-auto rounded-2xl bg-white/80 shadow-xl border border-slate-200/50">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left font-bold text-slate-800 text-base">Food Item</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-800 text-base">Calories</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-800 text-base">Protein</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-800 text-base">Carbs</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-800 text-base">Fat</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-800 text-base">Fiber</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-800 text-base">Sugars</th>
                </tr>
              </thead>
              <tbody>
                {nutritionData.map((nutrition, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-green-50/50 transition-colors duration-200">
                    <td className="px-6 py-4 font-semibold text-slate-800 text-base">{nutrition.food_name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                        🔥 {nutrition.nf_calories || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                        🥩 {nutrition.nf_protein || 0}g
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        🌾 {nutrition.nf_total_carbohydrate || 0}g
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        🥑 {nutrition.nf_total_fat || 0}g
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                        🌿 {nutrition.nf_dietary_fiber || 0}g
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800 border border-pink-200">
                        🍯 {nutrition.nf_sugars || 0}g
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Health Impact Section */}
        <div className="mt-8">
          {nutritionData.map((n, idx) => (
            <div key={idx} className="mb-6">
              <HealthImpactSection healthData={n.healthData} />
            </div>
          ))}
        </div>

        {/* Meal Logging Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border border-blue-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-500" />
            Log This Meal
          </h3>
          
          {loggedMeal ? (
            <div className="flex items-center gap-2 p-4 bg-green-100 rounded-xl border border-green-300">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Successfully logged as {loggedMeal}!
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { type: 'breakfast', icon: '🌅', label: 'Breakfast' },
                { type: 'lunch', icon: '☀️', label: 'Lunch' },
                { type: 'dinner', icon: '🌙', label: 'Dinner' },
                { type: 'snack', icon: '🍎', label: 'Snack' }
              ].map(({ type, icon, label }) => (
                <Button
                  key={type}
                  onClick={() => logMeal(type)}
                  disabled={isLogging}
                  className="flex flex-col items-center gap-2 p-4 h-auto bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  variant="outline"
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="font-medium text-sm">{isLogging ? 'Logging...' : label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center items-center mt-8">
          <Button 
            onClick={onClear} 
            className="rounded-full px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Camera className="h-4 w-4 mr-2" />
            Scan Another Meal
          </Button>
        </div>
      </div>
    </div>
  );
}


const HealthImpactSection = ({ healthData }: { healthData: NutritionInfo['healthData'] }) => {
  if (!healthData) return null;

  const getScoreStyling = (score: number, type: 'gi' | 'inflammatory') => {
    if (type === 'gi') {
      if (score <= 55) return { text: 'text-green-700', bg: 'bg-green-100', label: 'Low' };
      if (score <= 69) return { text: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Medium' };
      return { text: 'text-red-700', bg: 'bg-red-100', label: 'High' };
    }
    if (score < 0) return { text: 'text-green-700', bg: 'bg-green-100', label: 'Anti-inflammatory' };
    if (score > 0) return { text: 'text-red-700', bg: 'bg-red-100', label: 'Pro-inflammatory' };
    return { text: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Neutral' };
  };

  const giStyling = healthData.glycemicIndex !== undefined ? getScoreStyling(healthData.glycemicIndex, 'gi') : null;
  const inflammatoryStyling = healthData.inflammatoryScore !== undefined ? getScoreStyling(healthData.inflammatoryScore, 'inflammatory') : null;

  return (
    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <h4 className="font-bold text-md mb-4 text-slate-800 flex items-center">
        <BrainCircuit className="mr-2 h-5 w-5 text-blue-500" />
        Health Impact Analysis
      </h4>
      <div className="space-y-4 text-sm">
        {healthData.glycemicIndex !== undefined && giStyling && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-gray-600 flex items-center">
                <Activity className="mr-2 h-4 w-4 text-purple-500" />
                Glycemic Index
              </span>
              <span className={`font-bold text-lg ${giStyling.text}`}>{healthData.glycemicIndex}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`${giStyling.bg} h-2.5 rounded-full`} style={{ width: `${(healthData.glycemicIndex / 100) * 100}%` }}></div>
            </div>
            <div className="text-right text-xs font-medium mt-1">
               <Badge className={`${giStyling.bg} ${giStyling.text}`}>{giStyling.label}</Badge>
            </div>
          </div>
        )}
        {healthData.glycemicLoad !== undefined && (
           <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-gray-600 flex items-center">
                <Flame className="mr-2 h-4 w-4 text-orange-500" />
                Glycemic Load
              </span>
              <span className="font-bold text-lg text-gray-800">{healthData.glycemicLoad}</span>
            </div>
             <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-orange-400 h-2.5 rounded-full" style={{ width: `${(healthData.glycemicLoad / 50) * 100}%` }}></div>
            </div>
          </div>
        )}
        {healthData.inflammatoryScore !== undefined && inflammatoryStyling && (
          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold text-gray-600 flex items-center">
              <HeartPulse className="mr-2 h-4 w-4 text-red-500" />
              Inflammatory Profile
            </span>
            <Badge className={`${inflammatoryStyling.bg} ${inflammatoryStyling.text}`}>
              {inflammatoryStyling.label}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

