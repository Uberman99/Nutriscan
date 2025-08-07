'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, PieChart, Utensils, TrendingUp, Activity, Coffee, Sun, Moon, Trash2 } from 'lucide-react'
import { MealLog, NutritionInfo } from '@/lib/types'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'

interface DailySummary {
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  totalFiber: number;
  mealCount: number;
}

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState('');
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [summary, setSummary] = useState<DailySummary>({
    totalCalories: 0,
    totalCarbs: 0,
    totalProtein: 0,
    totalFat: 0,
    totalFiber: 0,
    mealCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const { toast, ToastContainer } = useToast();

  // Set the initial date only on the client-side to avoid hydration mismatch
  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  const fetchMeals = useCallback(async () => {
    if (!selectedDate) return; // Don't fetch if date is not set yet
    
    try {
      setLoading(true);
      const response = await fetch(`/api/get-meals?date=${selectedDate}`);
      const data = await response.json();

      if (data.success) {
        setMeals(data.meals);
        calculateSummary(data.meals);
      } else {
        toast({
          title: "Failed to Load Meals",
          description: data.error || "Unable to retrieve your meal data",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
      toast({
        title: "Connection Error",
        description: "Please check your internet connection and try again",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, toast]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const handleClearMeals = async () => {
    if (!selectedDate || meals.length === 0) return;

    setIsClearing(true);
    try {
      const response = await fetch('/api/clear-meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: selectedDate }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Meals Cleared",
          description: "All meals for the selected date have been cleared.",
          variant: "success",
        });
        fetchMeals();
      } else {
        throw new Error(result.error || 'Failed to clear meals');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error Clearing Meals",
        description: errorMessage,
        variant: "error",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const calculateSummary = (mealsData: MealLog[]) => {
    const totals = mealsData.flatMap(meal => meal.foods).reduce((acc, food) => {
        acc.totalCalories += food.nf_calories || 0;
        acc.totalCarbs += food.nf_total_carbohydrate || 0;
        acc.totalProtein += food.nf_protein || 0;
        acc.totalFat += food.nf_total_fat || 0;
        acc.totalFiber += food.nf_dietary_fiber || 0;
        return acc;
    }, { totalCalories: 0, totalCarbs: 0, totalProtein: 0, totalFat: 0, totalFiber: 0 });

    setSummary({
      totalCalories: Math.round(totals.totalCalories),
      totalCarbs: Math.round(totals.totalCarbs),
      totalProtein: Math.round(totals.totalProtein),
      totalFat: Math.round(totals.totalFat),
      totalFiber: Math.round(totals.totalFiber),
      mealCount: mealsData.length
    });
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast': return <Coffee className="h-5 w-5 text-yellow-600" />;
      case 'lunch': return <Sun className="h-5 w-5 text-orange-600" />;
      case 'dinner': return <Moon className="h-5 w-5 text-blue-600" />;
      case 'snack': return <Utensils className="h-5 w-5 text-green-600" />;
      default: return <Utensils className="h-5 w-5 text-gray-600" />;
    }
  };

  const groupedMeals = meals.reduce((acc, meal) => {
    (acc[meal.mealType] = acc[meal.mealType] || []).push(meal);
    return acc;
  }, {} as Record<string, MealLog[]>);
  
  // Render a loading state until the date is set on the client
  if (!selectedDate) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Activity className="h-8 w-8 animate-spin text-blue-600" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Activity className="mr-3 h-8 w-8 text-blue-600" />
            Daily Nutrition Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-6">Track your meals and monitor your nutritional intake</p>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Calendar className="h-5 w-5 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:outline-none"
            />
            <Button
              onClick={handleClearMeals}
              disabled={isClearing || meals.length === 0}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isClearing ? 'Clearing...' : "Clear Day's Meals"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Summary Cards */}
        </div>

        {loading ? (
            <Card><CardContent className="p-8 text-center text-lg text-gray-600">Loading meals...</CardContent></Card>
        ) : meals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">No meals logged for {selectedDate}</p>
              <p className="text-sm text-gray-500">Start scanning your food to track your nutrition!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMeals).map(([mealType, mealList]) => (
              <Card key={mealType}>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    {getMealIcon(mealType)}
                    <span className="ml-3 capitalize">{mealType}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Meal Details */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}