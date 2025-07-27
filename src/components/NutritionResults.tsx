

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Star, Utensils, CheckCircle2, HeartPulse, Flame, BrainCircuit, BookOpen, Coffee, Sun, Moon } from 'lucide-react'
import { NutritionInfo } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import Image from 'next/image';

interface NutritionResultsProps {
  results: {
    foodItems: Array<{ name: string; confidence: number; source: string }>;
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Star, Utensils, CheckCircle2, HeartPulse, Flame, BrainCircuit, BookOpen, Coffee, Sun, Moon } from "lucide-react";
import { NutritionInfo } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import Image from "next/image";

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
  const { toast, ToastContainer } = useToast();

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
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-200 p-8 mb-8 relative overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-green-200 via-blue-100 to-transparent rounded-full opacity-40 blur-2xl z-0" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-yellow-100 via-pink-100 to-transparent rounded-full opacity-40 blur-2xl z-0" />
        {/* Health Score and Food List */}
        <div className="flex flex-col md:flex-row items-center gap-8 z-10 relative">
          <HealthScoreRing score={aiAnalysis.healthScore} />
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Utensils className="h-6 w-6 text-green-500" />
              Detected Foods
            </h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {foodItems.map((item, idx) => (
                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-gradient-to-r from-green-100 to-blue-100 text-green-900 shadow-sm border border-green-200 text-base">{item.name}</span>
              ))}
            </div>
            <div className="text-sm text-gray-500 mb-2">{aiAnalysis.description}</div>
            <div className="flex flex-wrap gap-2">
              {aiAnalysis.suggestions.map((s, i) => (
                <Badge key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium shadow-sm">💡 {s}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition Table */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" /> Nutrition Facts
          </h3>
          <div className="overflow-x-auto rounded-xl bg-white/70 shadow-inner">
            <table className="min-w-full text-sm text-slate-700">
              <thead>
                <tr className="bg-gradient-to-r from-green-100 to-blue-100">
                  <th className="px-4 py-2 text-left font-semibold">Food</th>
                  <th className="px-4 py-2 text-left font-semibold">Calories</th>
                  <th className="px-4 py-2 text-left font-semibold">Protein</th>
                  <th className="px-4 py-2 text-left font-semibold">Carbs</th>
                  <th className="px-4 py-2 text-left font-semibold">Fat</th>
                  <th className="px-4 py-2 text-left font-semibold">Fiber</th>
                  <th className="px-4 py-2 text-left font-semibold">Sugars</th>
                </tr>
              </thead>
              <tbody>
                {nutritionData.map((n, idx) => (
                  <tr key={idx} className="even:bg-slate-50">
                    <td className="px-4 py-2 font-semibold flex items-center gap-2">{n.food_name}</td>
                    <td className="px-4 py-2">{n.nf_calories ?? '-'}</td>
                    <td className="px-4 py-2">{n.nf_protein ?? '-'}g</td>
                    <td className="px-4 py-2">{n.nf_total_carbohydrate ?? '-'}g</td>
                    <td className="px-4 py-2">{n.nf_total_fat ?? '-'}g</td>
                    <td className="px-4 py-2">{n.nf_dietary_fiber ?? '-'}g</td>
                    <td className="px-4 py-2">{n.nf_sugars ?? '-'}g</td>
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

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <Button onClick={onClear} variant="outline" className="rounded-full px-6 py-2 border-2 border-slate-300 bg-white/70 hover:bg-slate-100 shadow">Scan Another</Button>
          {/* You may want to implement logMeal if needed */}
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}

// Helper functions
const getHealthScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600 bg-green-100";
  if (score >= 60) return "text-yellow-600 bg-yellow-100";
  if (score >= 40) return "text-orange-600 bg-orange-100";
  return "text-red-600 bg-red-100";
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return "text-green-600";
  if (confidence >= 0.8) return "text-yellow-600";
  return "text-orange-600";
};

const getFoodIcon = (foodName: string): string => {
  const name = foodName.toLowerCase();
  if (name.includes("burrito") || name.includes("wrap") || name.includes("kati roll")) return "🌯";
  if (name.includes("pizza")) return "🍕";
  if (name.includes("burger") || name.includes("hamburger")) return "🍔";
  if (name.includes("taco")) return "🌮";
  if (name.includes("sandwich") || name.includes("sub")) return "🥪";
  if (name.includes("hot dog") || name.includes("hotdog")) return "🌭";
  if (name.includes("pasta") || name.includes("spaghetti") || name.includes("noodle")) return "🍝";
  if (name.includes("ramen")) return "🍜";
  if (name.includes("soup")) return "🍲";
  if (name.includes("salad")) return "🥗";
  if (name.includes("rice") || name.includes("biryani") || name.includes("fried rice")) return "🍚";
  if (name.includes("curry")) return "🍛";
  if (name.includes("steak") || name.includes("beef") || name.includes("meat")) return "🥩";
  if (name.includes("chicken") || name.includes("poultry")) return "🍗";
  if (name.includes("fish") || name.includes("salmon") || name.includes("tuna")) return "🐟";
  if (name.includes("shrimp") || name.includes("prawn")) return "🍤";
  if (name.includes("egg")) return "🥚";
  if (name.includes("bacon")) return "🥓";
  if (name.includes("cheese")) return "🧀";
  if (name.includes("bread") || name.includes("toast")) return "🍞";
  // ...add more mappings as needed...
  return "🍽️";
};

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
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Utensils className="h-6 w-6 text-green-500" />
              Detected Foods
            </h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {foodItems.map((item, idx) => (
                <span key={idx} className={`inline-flex items-center px-3 py-1 rounded-full font-semibold bg-gradient-to-r from-green-100 to-blue-100 text-green-900 shadow-sm border border-green-200 text-base`}>{item.name}</span>
              ))}
            </div>
            <div className="text-sm text-gray-500 mb-2">{aiAnalysis.description}</div>
            <div className="flex flex-wrap gap-2">
              {aiAnalysis.suggestions.map((s, i) => (
                <Badge key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium shadow-sm">💡 {s}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition Table */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" /> Nutrition Facts
          </h3>
          <div className="overflow-x-auto rounded-xl bg-white/70 shadow-inner">
            <table className="min-w-full text-sm text-slate-700">
              <thead>
                <tr className="bg-gradient-to-r from-green-100 to-blue-100">
                  <th className="px-4 py-2 text-left font-semibold">Food</th>
                  <th className="px-4 py-2 text-left font-semibold">Calories</th>
                  <th className="px-4 py-2 text-left font-semibold">Protein</th>
                  <th className="px-4 py-2 text-left font-semibold">Carbs</th>
                  <th className="px-4 py-2 text-left font-semibold">Fat</th>
                  <th className="px-4 py-2 text-left font-semibold">Fiber</th>
                  <th className="px-4 py-2 text-left font-semibold">Sugars</th>
                </tr>
              </thead>
              <tbody>
                {nutritionData.map((n, idx) => (
                  <tr key={idx} className="even:bg-slate-50">
                    <td className="px-4 py-2 font-semibold flex items-center gap-2">{n.food_name}</td>
                    <td className="px-4 py-2">{n.nf_calories ?? '-'}</td>
                    <td className="px-4 py-2">{n.nf_protein ?? '-'}g</td>
                    <td className="px-4 py-2">{n.nf_total_carbohydrate ?? '-'}g</td>
                    <td className="px-4 py-2">{n.nf_total_fat ?? '-'}g</td>
                    <td className="px-4 py-2">{n.nf_dietary_fiber ?? '-'}g</td>
                    <td className="px-4 py-2">{n.nf_sugars ?? '-'}g</td>
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

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <Button onClick={onClear} variant="outline" className="rounded-full px-6 py-2 border-2 border-slate-300 bg-white/70 hover:bg-slate-100 shadow">Scan Another</Button>
          {/* You may want to implement logMeal if needed */}
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}
            <table className="min-w-full text-sm text-slate-700">
// Helper functions
const getHealthScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 bg-green-100';
  if (score >= 60) return 'text-yellow-600 bg-yellow-100';
  if (score >= 40) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return 'text-green-600';
  if (confidence >= 0.8) return 'text-yellow-600';
  return 'text-orange-600';
};

const getFoodIcon = (foodName: string): string => {
  const name = foodName.toLowerCase();
  if (name.includes('burrito') || name.includes('wrap') || name.includes('kati roll')) return '🌯';
  if (name.includes('pizza')) return '🍕';
  if (name.includes('burger') || name.includes('hamburger')) return '🍔';
  if (name.includes('taco')) return '🌮';
  if (name.includes('sandwich') || name.includes('sub')) return '🥪';
  if (name.includes('hot dog') || name.includes('hotdog')) return '🌭';
  if (name.includes('pasta') || name.includes('spaghetti') || name.includes('noodle')) return '🍝';
  if (name.includes('ramen')) return '🍜';
  if (name.includes('soup')) return '🍲';
  if (name.includes('salad')) return '🥗';
  if (name.includes('rice') || name.includes('biryani') || name.includes('fried rice')) return '🍚';
  if (name.includes('curry')) return '🍛';
  if (name.includes('steak') || name.includes('beef') || name.includes('meat')) return '🥩';
  if (name.includes('chicken') || name.includes('poultry')) return '🍗';
  if (name.includes('fish') || name.includes('salmon') || name.includes('tuna')) return '🐟';
  if (name.includes('shrimp') || name.includes('prawn')) return '🍤';
  if (name.includes('egg')) return '🥚';
  if (name.includes('bacon')) return '🥓';
  if (name.includes('cheese')) return '🧀';
  if (name.includes('bread') || name.includes('toast')) return '🍞';
  // ...add more mappings as needed...
  return '🍽️';
};

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
              <thead>
                <tr className="bg-gradient-to-r from-green-100 to-blue-100">
                  <th className="px-4 py-2 text-left font-semibold">Food</th>
                  <th className="px-4 py-2 text-left font-semibold">Calories</th>
                  <th className="px-4 py-2 text-left font-semibold">Protein</th>
                  <th className="px-4 py-2 text-left font-semibold">Carbs</th>
                  <th className="px-4 py-2 text-left font-semibold">Fat</th>
                  <th className="px-4 py-2 text-left font-semibold">Fiber</th>
                  <th className="px-4 py-2 text-left font-semibold">Sugars</th>
                </tr>
              </thead>
              <tbody>
                {nutritionData.map((n, idx) => (
                  <tr key={idx} className="even:bg-slate-50">
                    <td className="px-4 py-2 font-semibold flex items-center gap-2">{n.food_name}</td>
                    <td className="px-4 py-2">{n.nf_calories ?? '-'}</td>
                    <td className="px-4 py-2">{n.nf_protein ?? '-'}g</td>
                    <td className="px-4 py-2">{n.nf_total_carbohydrate ?? '-'}g</td>
                    <td className="px-4 py-2">{n.nf_total_fat ?? '-'}g</td>
                    <td className="px-4 py-2">{n.nf_dietary_fiber ?? '-'}g</td>
                    <td className="px-4 py-2">{n.nf_sugars ?? '-'}g</td>
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

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <Button onClick={onClear} variant="outline" className="rounded-full px-6 py-2 border-2 border-slate-300 bg-white/70 hover:bg-slate-100 shadow">Scan Another</Button>
          {/* You may want to implement logMeal if needed */}
        </div>
        <ToastContainer />
      </div>
    </div>
  );
