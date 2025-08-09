import FoodScanner from '@/components/FoodScanner'
import { BotMessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ScanPage() {
  return (
    <div className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#1a2e45_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 text-center mb-16">
            <Badge variant="secondary" className="py-2 px-4 rounded-full text-sm">
                <BotMessageSquare className="w-5 h-5 mr-2" />
                Multi-Ingredient Analysis Engine
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-gradient">
                Upload Your Meal
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Our AI will deconstruct your meal into individual components, providing a level of analytical depth that is simply unmatched.
            </p>
        </div>
        
        <FoodScanner />
      </div>
    </div>
  )
}