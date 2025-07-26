import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Brain, Database, DollarSign, Camera, Smartphone, Globe, Zap } from 'lucide-react'

export default function About() {
  const features = [
    {
      icon: Camera,
      title: 'AI-Powered Food Recognition',
      description: 'Advanced computer vision technology instantly identifies food items from photos.',
      tech: 'Google Vision API'
    },
    {
      icon: Brain,
      title: 'Smart Health Analysis',
      description: 'Get personalized health insights and nutritional recommendations.',
      tech: 'Google Gemini AI'
    },
    {
      icon: Database,
      title: 'Comprehensive Nutrition Data',
      description: 'Access detailed nutritional information from the USDA Food Database.',
      tech: 'USDA FoodData Central'
    },
    {
      icon: DollarSign,
      title: 'Price Comparison',
      description: 'Find the best deals and cheapest prices for your food items.',
      tech: 'Real-time Price APIs'
    }
  ]

  const techStack = [
    { name: 'Next.js 15', category: 'Framework' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'Tailwind CSS', category: 'Styling' },
    { name: 'React', category: 'Frontend' },
    { name: 'Google Vision API', category: 'AI/ML' },
    { name: 'Google Gemini AI', category: 'AI/ML' },
    { name: 'USDA FoodData Central', category: 'Data' },
    { name: 'Lucide React', category: 'Icons' }
  ]

  const benefits = [
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Optimized for smartphones with responsive design and touch-friendly interface.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with performance in mind using Next.js and modern web technologies.'
    },
    {
      icon: Globe,
      title: 'Always Available',
      description: 'Access your nutrition data anywhere, anytime with our web-based platform.'
    },
    {
      icon: Eye,
      title: 'Privacy Focused',
      description: 'Your food data stays private. We don\'t store your personal images or data.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
            About NutriScan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            NutriScan is a cutting-edge application that combines artificial intelligence, 
            computer vision, and comprehensive nutrition databases to revolutionize how you 
            understand and interact with food.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-16 border-0 shadow-xl">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Our Mission</h2>
            <p className="text-lg text-gray-600 text-center max-w-4xl mx-auto leading-relaxed">
              To empower individuals with instant, accurate nutritional insights that help them make 
              informed food choices, support their health goals, and find the best value for their 
              grocery shopping. We believe that nutrition information should be accessible, 
              comprehensive, and actionable for everyone.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1">{feature.tech}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Technology Stack</h2>
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {techStack.map((tech, index) => (
                  <div key={index} className="text-center">
                    <Badge 
                      variant="outline" 
                      className="mb-2 px-3 py-1 text-sm font-medium"
                    >
                      {tech.category}
                    </Badge>
                    <p className="font-semibold text-gray-800">{tech.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose NutriScan?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* API Information */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-gray-800">Powered by Industry-Leading APIs</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Google Vision API</h3>
                <p className="text-gray-600 text-sm">
                  Advanced computer vision technology for accurate food recognition and image analysis.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Google Gemini AI</h3>
                <p className="text-gray-600 text-sm">
                  State-of-the-art AI for personalized health insights and nutrition recommendations.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">USDA FoodData Central</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive and authoritative source for food composition data in the United States.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
