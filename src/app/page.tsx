import Link from "next/link";
import { Camera, Zap, BarChart3, BotMessageSquare, Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-900/[0.04] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
          <div className="container px-4 md:px-6 text-center">
            <div className="flex flex-col items-center space-y-6">
              <Badge variant="outline" className="py-2 px-4 rounded-full text-sm border-primary/30 bg-primary/10 text-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by Gemini 1.5 Pro Vision
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-gradient-primary animate-in fade-in slide-in-from-bottom-6 duration-700">
                Sovereign Food Intelligence
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl animate-in fade-in slide-in-from-bottom-8 duration-900">
                Achieve **pure accuracy** with our revolutionary AI. Get instant nutrition facts,
                complete ingredient breakdowns, and advanced health insights.
              </p>
              <Link href="/scan">
                <Button size="lg" className="mt-4 shadow-lg shadow-primary/30">
                  <Camera className="mr-2 h-5 w-5" />
                  Start Scanning for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gradient-accent">A New Standard in Nutritional Analysis</h2>
              <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed mt-4">
                Our platform leverages a multi-layered AI approach to provide unparalleled accuracy and depth.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-3 lg:gap-12">
              <FeatureCard
                icon={<BotMessageSquare className="h-10 w-10 text-primary" />}
                title="Multi-Ingredient Detection"
                description="Our AI deconstructs entire meals into individual components for the most precise analysis available."
              />
              <FeatureCard
                icon={<Database className="h-10 w-10 text-primary" />}
                title="Comprehensive Data"
                description="Powered by the official USDA database for detailed macro and micronutrient information."
              />
              <FeatureCard
                icon={<BarChart3 className="h-10 w-10 text-primary" />}
                title="Personalized Dashboard"
                description="Log your meals and track your nutritional intake over time to achieve your specific health goals."
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/30">
        <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="mb-6 rounded-full bg-primary/10 p-5 border border-primary/20">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
)