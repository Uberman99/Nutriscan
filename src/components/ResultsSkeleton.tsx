import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Activity, Star, ShoppingCart } from 'lucide-react';

export default function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Food Detection Skeleton */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gray-100 border-b border-gray-200">
          <CardTitle className="flex items-center">
            <Utensils className="mr-3 h-7 w-7 text-gray-400" />
            <div>
              <Skeleton width={300} height={24} />
              <Skeleton width={200} height={16} style={{ marginTop: '8px' }} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            <li className="flex items-center justify-between p-3 rounded-lg bg-gray-50 shadow-sm border">
              <div className="flex items-center">
                <Skeleton circle={true} height={24} width={24} className="mr-3" />
                <Skeleton width={150} height={20} />
              </div>
              <Skeleton width={100} height={20} />
            </li>
            <li className="flex items-center justify-between p-3 rounded-lg bg-gray-50 shadow-sm border">
              <div className="flex items-center">
                <Skeleton circle={true} height={24} width={24} className="mr-3" />
                <Skeleton width={120} height={20} />
              </div>
              <Skeleton width={90} height={20} />
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* AI Analysis Skeleton */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gray-100 border-b border-gray-200">
          <CardTitle className="flex items-center">
            <Activity className="mr-3 h-7 w-7 text-gray-400" />
            <div>
              <Skeleton width={350} height={24} />
              <Skeleton width={250} height={16} style={{ marginTop: '8px' }} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 shadow-md">
            <Skeleton width={180} height={24} />
            <Skeleton width={100} height={32} />
          </div>
          <div>
            <Skeleton width={200} height={20} className="mb-2" />
            <Skeleton count={3} height={16} />
          </div>
          <div>
            <Skeleton width={220} height={20} className="mb-2" />
            <Skeleton count={2} height={16} />
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Breakdown Skeleton */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gray-100 border-b border-gray-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="mr-3 h-7 w-7 text-gray-400" />
              <div>
                <Skeleton width={320} height={24} />
                <Skeleton width={220} height={16} style={{ marginTop: '8px' }} />
              </div>
            </div>
            <Skeleton width={120} height={32} />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg shadow-md">
            <Skeleton width={150} height={24} className="mb-2" />
            <Skeleton count={4} height={20} />
          </div>
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg shadow-md">
            <Skeleton width={100} height={24} className="mb-2" />
            <Skeleton count={3} height={20} />
          </div>
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg shadow-md">
            <Skeleton width={100} height={24} className="mb-2" />
            <Skeleton count={2} height={20} />
          </div>
        </CardContent>
      </Card>

      {/* Price Comparison Skeleton */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gray-100 border-b border-gray-200">
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-3 h-7 w-7 text-gray-400" />
            <div>
              <Skeleton width={250} height={24} />
              <Skeleton width={180} height={16} style={{ marginTop: '8px' }} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 shadow-sm border">
              <Skeleton width={100} height={20} />
              <Skeleton width={80} height={20} />
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 shadow-sm border">
              <Skeleton width={120} height={20} />
              <Skeleton width={70} height={20} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
