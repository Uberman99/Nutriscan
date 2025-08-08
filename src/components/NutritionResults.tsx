"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Star, Utensils, HeartPulse, Flame, BrainCircuit, Lightbulb, CheckCircle } from "lucide-react";
import { NutritionInfo } from "@/lib/types";
import { useToast } from "@/components/ui/toast";

const HealthScoreRing = ({ score }: { score: number }) => {
    const radius = 50;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progress = Math.max(0, Math.min(score, 100));
    const offset = circumference - (progress / 100) * circumference;
    let colorClass = "text-accent";
    if (score < 75) colorClass = "text-yellow-500";
    if (score < 50) colorClass = "text-orange-500";
    if (score < 30) colorClass = "text-destructive";
    return (
      <div className="relative w-28 h-28 flex items-center justify-center animate-in fade-in duration-500">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
          <circle className="text-muted/50" stroke="currentColor" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius}/>
          <circle className={`${colorClass} transition-all duration-1000 ease-out`} stroke="currentColor" fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + " " + circumference} style={{ strokeDashoffset: offset }} r={normalizedRadius} cx={radius} cy={radius} strokeLinecap="round"/>
        </svg>
        <span className={`absolute text-3xl font-bold ${colorClass}`}>{score}</span>
      </div>
    );
};


export default function NutritionResults({ results, onClear }: { results: any, onClear: () => void }) {
  const { foodItems, aiAnalysis, nutritionData } = results;
  const [activeTab, setActiveTab] = useState<'nutrition' | 'health'>('nutrition');
  const [isLogging, setIsLogging] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | null>(null);
  const { toast, ToastContainer } = useToast();
  const topFood = nutritionData[0];

  const handleLogMeal = async () => {
    if (!selectedMealType) {
      toast({ title: "Selection Required", description: "Please select a meal type.", variant: "error" });
      return;
    }
    setIsLogging(true);
    try {
      const mealName = foodItems.map((item: { name: string }) => item.name).join(', ');
      const response = await fetch('/api/log-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: selectedMealType,
          mealName: mealName,
          foods: nutritionData,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to log meal.');
      
      toast({
        title: "Meal Logged!",
        description: `${selectedMealType} saved to your dashboard.`,
        variant: "success",
      });
      setTimeout(onClear, 1500);

    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Logging Failed", description: msg, variant: "error" });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Card className="w-full max-w-3xl mx-auto overflow-hidden">
        <CardHeader className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <HealthScoreRing score={aiAnalysis.healthScore} />
            <div className="flex-1 text-center sm:text-left">
              <Badge variant="secondary" className="mb-2 border-accent/20 bg-accent/10 text-accent-foreground">AI Health Score</Badge>
              <CardTitle className="text-3xl font-extrabold text-gradient-primary">
                {foodItems.map((item: any) => item.name).join(', ')}
              </CardTitle>
              <CardDescription className="mt-2 text-base text-muted-foreground">
                {aiAnalysis.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
           <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-accent"/>AI Suggestions</h3>
              <div className="space-y-2">
                  {aiAnalysis.suggestions.map((suggestion: string, i: number) => (
                      <div key={i} className="flex items-start p-3 bg-accent/10 rounded-lg border border-accent/20">
                          <span className="text-accent font-bold mr-2">✦</span>
                          <p className="text-sm text-accent-foreground/80">{suggestion}</p>
                      </div>
                  ))}
              </div>
          </div>

           <div className="flex border-b mb-6">
              <button onClick={() => setActiveTab('nutrition')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'nutrition' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  Nutrition Details
              </button>
              <button onClick={() => setActiveTab('health')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'health' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  Health Impact
              </button>
          </div>

          {activeTab === 'nutrition' && topFood && <NutritionTable data={topFood} />}
          {activeTab === 'health' && topFood && topFood.healthData && <HealthImpactSection healthData={topFood.healthData} />}

          <div className="mt-8 border-t border-white/10 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-center text-foreground">Log this Meal to Your Dashboard</h3>
              <div className="flex justify-center gap-2 flex-wrap">
                  {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(type => (
                      <Button key={type} variant={selectedMealType === type ? "default" : "secondary"} onClick={() => setSelectedMealType(type)}>
                          {type}
                      </Button>
                  ))}
              </div>
              <Button onClick={handleLogMeal} disabled={isLogging || !selectedMealType} size="lg" className="w-full shadow-lg shadow-primary/30">
                  <CheckCircle className="mr-2 h-5 w-5"/>
                  {isLogging ? "Logging..." : `Log as ${selectedMealType || '...'}`}
              </Button>
          </div>
        </CardContent>
      </Card>
      <div className="text-center">
        <Button onClick={onClear} variant="outline" size="lg">Scan Another Item</Button>
      </div>
       <ToastContainer />
    </div>
  );
}

const NutritionTable = ({ data }: { data: NutritionInfo }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center"><Star className="w-5 h-5 mr-2 text-yellow-400"/>Macronutrients</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <NutrientCard label="Calories" value={data.nf_calories} unit="kcal" icon={Flame} color="text-red-400" />
                <NutrientCard label="Protein" value={data.nf_protein} unit="g" icon={Utensils} color="text-orange-400" />
                <NutrientCard label="Carbs" value={data.nf_total_carbohydrate} unit="g" icon={BrainCircuit} color="text-blue-400" />
                <NutrientCard label="Fat" value={data.nf_total_fat} unit="g" icon={HeartPulse} color="text-purple-400" />
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-accent"/>Micronutrients & More</h3>
            <ul className="space-y-2 text-sm">
                <MicroNutrientRow label="Saturated Fat" value={data.nf_saturated_fat} unit="g" />
                <MicroNutrientRow label="Sugars" value={data.nf_sugars} unit="g" />
                <MicroNutrientRow label="Dietary Fiber" value={data.nf_dietary_fiber} unit="g" />
                <MicroNutrientRow label="Sodium" value={data.nf_sodium} unit="mg" />
                <MicroNutrientRow label="Potassium" value={data.nf_potassium} unit="mg" />
                <MicroNutrientRow label="Cholesterol" value={data.nf_cholesterol} unit="mg" />
            </ul>
        </div>
    </div>
);

const NutrientCard = ({ label, value, unit, icon: Icon, color }: { label: string, value: number | null | undefined, unit: string, icon: React.ElementType, color: string }) => (
    <div className="bg-muted/50 p-4 rounded-xl text-center border border-white/10">
        <Icon className={`w-7 h-7 mx-auto mb-2 ${color}`} />
        <span className="text-2xl font-bold text-foreground">{value?.toFixed(0) ?? '-'}</span>
        <span className="text-xs text-muted-foreground ml-1">{unit}</span>
        <p className="text-sm font-medium text-muted-foreground mt-1">{label}</p>
    </div>
)

const MicroNutrientRow = ({ label, value, unit }: { label: string, value: number | null | undefined, unit: string }) => (
    <li className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value?.toFixed(1) ?? 'N/A'} {unit}</span>
    </li>
)

const HealthImpactSection = ({ healthData }: { healthData: NutritionInfo['healthData'] }) => {
  const getScoreStyling = (score: number, type: 'gi' | 'inflammatory') => {
    if (type === 'gi') {
        if (score <= 55) return { text: 'text-green-400', bg: 'bg-green-500', label: 'Low' };
        if (score <= 69) return { text: 'text-yellow-400', bg: 'bg-yellow-500', label: 'Medium' };
        return { text: 'text-red-400', bg: 'bg-red-500', label: 'High' };
    }
    if (score < 0) return { text: 'text-green-400', bg: 'bg-green-500/20', label: 'Anti-inflammatory' };
    if (score > 0) return { text: 'text-red-400', bg: 'bg-red-500/20', label: 'Pro-inflammatory' };
    return { text: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Neutral' };
  };

  const giStyling = healthData?.glycemicIndex !== undefined ? getScoreStyling(healthData.glycemicIndex, 'gi') : null;
  const inflammatoryStyling = healthData?.inflammatoryScore !== undefined ? getScoreStyling(healthData.inflammatoryScore, 'inflammatory') : null;

  return (
    <div className="space-y-6">
      {giStyling && healthData?.glycemicIndex !== undefined && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-muted-foreground">Glycemic Index</h4>
            <span className={`font-bold text-lg ${giStyling.text}`}>{healthData.glycemicIndex} <Badge variant="outline" className={`${giStyling.text} border-current`}>{giStyling.label}</Badge></span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className={`${giStyling.bg} h-2.5 rounded-full`} style={{ width: `${Math.min(healthData.glycemicIndex, 100)}%` }} />
          </div>
        </div>
      )}
       {healthData?.glycemicLoad !== undefined && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-muted-foreground">Glycemic Load</h4>
              <span className="font-bold text-lg text-foreground">{healthData.glycemicLoad}</span>
            </div>
             <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min((healthData.glycemicLoad / 40) * 100, 100)}%` }}/>
            </div>
          </div>
        )}
      {inflammatoryStyling && (
        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
          <h4 className="font-semibold text-muted-foreground">Inflammatory Profile</h4>
          <Badge className={`${inflammatoryStyling.bg} ${inflammatoryStyling.text} text-sm`}>
            {inflammatoryStyling.label}
          </Badge>
        </div>
      )}
    </div>
  );
};