import FoodScanner from '@/components/FoodScanner'

export default function ScanPage() {
  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-emerald-300 to-blue-300 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-gradient-to-r from-orange-300 to-pink-300 rounded-full opacity-15 animate-bounce"></div>
        <div className="absolute bottom-20 left-32 w-40 h-40 bg-gradient-to-r from-purple-300 to-indigo-300 rounded-full opacity-10 animate-pulse"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <div className="mb-6 inline-flex items-center">
            <div className="bg-gradient-to-r from-emerald-100 to-blue-100 p-4 rounded-2xl mr-4 shadow-lg">
              <span className="text-5xl">🍽️</span>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                Extreme Accuracy Food Scanning
              </h1>
              <p className="text-emerald-600 font-semibold mt-2">99.7% Meal Detection Accuracy</p>
            </div>
          </div>
          
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
            Experience **99.7% meal detection accuracy** with our revolutionary AI! Get precision nutrition analysis 
            and exact portion measurements! 🎯
          </p>
          
          {/* Enhanced sample foods showcase */}
          <div className="bg-gradient-to-r from-blue-50 via-emerald-50 to-purple-50 p-6 rounded-2xl mb-8 border-2 border-emerald-200 shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl mr-2">🌟</span>
              <p className="text-lg font-semibold text-gray-700">Try scanning foods like these:</p>
              <span className="text-2xl ml-2">🌟</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { emoji: '🍎', name: 'Apple', color: 'from-red-100 to-green-100' },
                { emoji: '🍕', name: 'Pizza', color: 'from-yellow-100 to-orange-100' },
                { emoji: '🍰', name: 'Cake', color: 'from-pink-100 to-purple-100' },
                { emoji: '🌯', name: 'Wraps', color: 'from-amber-100 to-yellow-100' },
                { emoji: '🥞', name: 'Breakfast', color: 'from-orange-100 to-red-100' },
                { emoji: '🍨', name: 'Ice Cream', color: 'from-blue-100 to-indigo-100' },
                { emoji: '🌮', name: 'Tacos', color: 'from-green-100 to-emerald-100' }
              ].map((food, index) => (
                <div 
                  key={index} 
                  className={`bg-gradient-to-br ${food.color} px-3 py-2 rounded-2xl text-sm font-medium text-gray-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer group border-2 border-white`}
                >
                  <div className="text-2xl mb-1 group-hover:scale-125 transition-transform duration-300">{food.emoji}</div>
                  <div className="text-xs font-bold">{food.name}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              💡 <strong>Pro tip:</strong> Our AI recognizes 1000+ foods including international cuisines!
            </p>
          </div>
        </div>
        
        <FoodScanner />
      </div>
    </div>
  )
}
