import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { getAllBlogPosts } from '@/lib/blog-data'

const categories = ["All", "Technology", "Nutrition", "Health", "Lifestyle", "Future Tech"]

export default function BlogPage() {
  const blogPosts = getAllBlogPosts()
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            The NutriScan Journal
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your source for the latest in nutrition science, food technology, and healthy living.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === "All" ? "default" : "secondary"}
              className="cursor-pointer text-sm px-4 py-2 rounded-full transition-all duration-200 hover:shadow-md"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        <Card className="mb-16 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-auto">
              <Image
                src={featuredPost.imageUrl}
                alt={featuredPost.title}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-l-2xl"
              />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <Badge className="mb-4 w-fit">{featuredPost.category}</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 hover:text-green-600 transition-colors">
                <Link href={`/blog/${featuredPost.id}`}>
                  {featuredPost.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1.5" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    {new Date(featuredPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <span>{featuredPost.readTime}</span>
                </div>
                <Link 
                  href={`/blog/${featuredPost.id}`}
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold"
                >
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl flex flex-col">
              <div className="relative h-48">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-t-2xl"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                </div>
                <CardTitle className="text-xl font-bold hover:text-green-600 transition-colors">
                  <Link href={`/blog/${post.id}`}>
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="line-clamp-3 text-base">
                  {post.excerpt}
                </CardDescription>
              </CardContent>
              <CardContent className="mt-auto pt-0">
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1.5" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <Card className="mt-20 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl">
          <CardContent className="p-10 text-center">
            <h3 className="text-3xl font-bold mb-4">
              Stay Ahead of the Curve
            </h3>
            <p className="mb-8 max-w-2xl mx-auto text-lg opacity-90">
              Subscribe to get the latest articles on nutrition, tech, and wellness delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-5 py-3 border-none rounded-lg text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/50"
              />
              <button className="px-8 py-3 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-md">
                Subscribe
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
