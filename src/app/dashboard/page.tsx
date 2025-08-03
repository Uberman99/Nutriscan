"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  PieChart,
  Utensils,
  TrendingUp,
  Activity,
  Coffee,
  Sun,
  Moon,
  Trash2,
} from "lucide-react";
import { MealLog, NutritionInfo } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

// Simplified DailySummary interface
interface DailySummary {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  mealCount: number;
}

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser();
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  // Safeguard to ensure date is never empty
  const safeSelectedDate = selectedDate || new Date().toISOString().split("T")[0];
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [summary, setSummary] = useState<DailySummary>({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    fiber: 0,
    mealCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const { toast, ToastContainer } = useToast();

  const calculateSummary = useCallback((mealsData: MealLog[]) => {
    const newSummary: DailySummary = mealsData.reduce(
      (acc, meal) => {
        meal.foods.forEach((food: NutritionInfo) => {
          acc.calories += food.nf_calories || 0;
          acc.carbs += food.nf_total_carbohydrate || 0;
          acc.protein += food.nf_protein || 0;
          acc.fat += food.nf_total_fat || 0;
          acc.fiber += food.nf_dietary_fiber || 0;
        });
        return acc;
      },
      { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, mealCount: 0 },
    );

    newSummary.mealCount = mealsData.length;
    setSummary({
      calories: Math.round(newSummary.calories),
      carbs: Math.round(newSummary.carbs),
      protein: Math.round(newSummary.protein),
      fat: Math.round(newSummary.fat),
      fiber: Math.round(newSummary.fiber),
      mealCount: newSummary.mealCount,
    });
  }, []);

  const fetchMeals = useCallback(
    async (date: string) => {
      // Ensure we have a valid date before making the API call
      const validDate = date && date.trim() !== '' ? date : new Date().toISOString().split('T')[0];
      
      setLoading(true);
      console.log(`[Dashboard] 🔐 Authentication status:`, { isLoaded, isSignedIn });
      
      try {
        const todayForComparison = new Date().toISOString().split('T')[0];
        console.log(`[Dashboard] 📅 Today's date: ${todayForComparison}`);
        console.log(`[Dashboard] 📅 Fetching meals for date: ${validDate}`);
        console.log(`[Dashboard] 📅 Date match: ${validDate === todayForComparison ? 'YES' : 'NO'}`);
        
        const response = await fetch(`/api/get-meals?date=${validDate}`);

        console.log(`[Dashboard] API response status: ${response.status}`);
        const data = await response.json();
        console.log("[Dashboard] API response data:", data);

        if (response.ok && data.success) {
          setMeals(data.meals);
          calculateSummary(data.meals);
        } else {
          setMeals([]);
          calculateSummary([]);
          toast({
            title: "Failed to Load Meals",
            description: data.error || "Could not retrieve your meal data.",
            variant: "error",
          });
        }
      } catch (error) {
        console.error("[Dashboard] Error fetching meals:", error);
        toast({
          title: "Network Error",
          description: "Please check your internet connection.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast, calculateSummary, isLoaded, isSignedIn],
  );

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchMeals(safeSelectedDate);
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
      setMeals([]);
      calculateSummary([]);
    }
  }, [safeSelectedDate, isLoaded, isSignedIn, fetchMeals, calculateSummary]);

  const handleClearMeals = async () => {
    if (!safeSelectedDate || meals.length === 0) return;

    setIsClearing(true);
    try {
      const response = await fetch("/api/clear-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: safeSelectedDate }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to clear meals");

      toast({
        title: "Meals Cleared",
        description: "Your meals for the selected date have been cleared.",
        variant: "success",
      });
      fetchMeals(safeSelectedDate); // Refresh meal list
    } catch (error) {
      console.error("[Dashboard] Error clearing meals:", error);
      toast({
        title: "Error Clearing Meals",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "error",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case "breakfast":
        return <Coffee className="h-5 w-5 text-yellow-600" />;
      case "lunch":
        return <Sun className="h-5 w-5 text-orange-600" />;
      case "dinner":
        return <Moon className="h-5 w-5 text-blue-600" />;
      case "snack":
        return <Utensils className="h-5 w-5 text-green-600" />;
      default:
        return <Utensils className="h-5 w-5 text-gray-600" />;
    }
  };

  const groupedMeals = meals.reduce(
    (acc, meal) => {
      if (!acc[meal.mealType]) {
        acc[meal.mealType] = [];
      }
      acc[meal.mealType].push(meal);
      return acc;
    },
    {} as Record<string, MealLog[]>,
  );

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <span className="ml-4 text-gray-600">Loading Dashboard...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to NutriScan Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Please sign in to track your meals and nutrition data.
          </p>
          <SignInButton mode="modal">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg">
              Sign In to Continue
            </Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Activity className="mr-3 h-8 w-8 text-blue-600" />
            Daily Nutrition Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Track your meals and monitor your nutritional intake
          </p>

          {/* Date Selector */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Calendar className="h-5 w-5 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const newDate = e.target.value;
                // Only update if the new date is not empty
                if (newDate && newDate.trim() !== '') {
                  setSelectedDate(newDate);
                }
              }}
              className="px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:outline-none"
            />
            <Button
              onClick={handleClearMeals}
              disabled={isClearing || meals.length === 0}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isClearing ? "Clearing..." : "Clear Day's Meals"}
            </Button>
          </div>
        </div>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">
                {summary.calories}
              </div>
              <div className="text-sm text-blue-600">Calories</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-800">
                {summary.carbs}g
              </div>
              <div className="text-sm text-green-600">Carbs</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-800">
                {summary.protein}g
              </div>
              <div className="text-sm text-orange-600">Protein</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-800">
                {summary.fat}g
              </div>
              <div className="text-sm text-purple-600">Fat</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-800">
                {summary.fiber}g
              </div>
              <div className="text-sm text-yellow-600">Fiber</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
            <CardContent className="p-4 text-center">
              <PieChart className="h-6 w-6 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-800">
                {summary.mealCount}
              </div>
              <div className="text-sm text-pink-600">Meals</div>
            </CardContent>
          </Card>
        </div>

        {/* Meal Logs */}
        {loading ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600">Loading your meals...</div>
            </CardContent>
          </Card>
        ) : meals.length === 0 ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-8 text-center">
              <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-lg text-gray-600 mb-2">
                No meals logged for {selectedDate}
              </div>
              <div className="text-sm text-gray-500">
                Start scanning your food to track your nutrition!
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMeals).map(([mealType, mealList]) => (
              <Card
                key={mealType}
                className="border-2 border-gray-200 shadow-lg"
              >
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <CardTitle className="flex items-center text-xl">
                    {getMealIcon(mealType)}
                    <span className="ml-3 capitalize">{mealType}</span>
                    <Badge className="ml-auto bg-blue-500 text-white">
                      {mealList.length}{" "}
                      {mealList.length === 1 ? "entry" : "entries"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {mealList.map((meal, mealIndex) => (
                      <div
                        key={mealIndex}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="text-sm text-gray-500 mb-2">
                          Logged at:{" "}
                          {new Date(meal.createdAt).toLocaleTimeString()}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {meal.foods.map(
                            (food: NutritionInfo, foodIndex: number) => (
                              <div
                                key={foodIndex}
                                className="bg-white rounded-lg p-4 border border-gray-200"
                              >
                                <div className="font-semibold text-gray-900 mb-2">
                                  {food.food_name}
                                </div>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Calories:
                                    </span>
                                    <span className="font-medium">
                                      {food.nf_calories?.toFixed(0) || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Carbs:
                                    </span>
                                    <span className="font-medium">
                                      {food.nf_total_carbohydrate?.toFixed(1) ||
                                        0}
                                      g
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Protein:
                                    </span>
                                    <span className="font-medium">
                                      {food.nf_protein?.toFixed(1) || 0}g
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Fat:</span>
                                    <span className="font-medium">
                                      {food.nf_total_fat?.toFixed(1) || 0}g
                                    </span>
                                  </div>
                                  {food.healthData && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <div className="text-xs text-gray-500 mb-1">
                                        Health Impact:
                                      </div>
                                      {food.healthData.glycemicIndex && (
                                        <div className="text-xs">
                                          GI: {food.healthData.glycemicIndex}
                                        </div>
                                      )}
                                      {food.healthData.inflammatoryText && (
                                        <div className="text-xs">
                                          {food.healthData.inflammatoryText}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
