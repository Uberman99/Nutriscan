import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, ArrowLeft, Clock, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getBlogPost } from '@/lib/blog-data'

interface BlogPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params
  const post = getBlogPost(id)
  
  if (!post) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Blog */}
        <Link href="/blog" className="inline-flex items-center text-green-600 hover:text-green-700 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <Badge className="mb-4">{post.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {post.excerpt}
          </p>
          
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {post.author}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(post.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {post.readTime}
            </div>
          </div>

          {/* Share Button */}
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Article
          </Button>
        </header>

        {/* Featured Image */}
        <div className="h-64 md:h-96 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mb-8"></div>

        {/* Article Content */}
        <Card>
          <CardContent className="p-8">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-ul:text-gray-700 prose-li:text-gray-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>

        {/* Author Bio */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex-shrink-0"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{post.author}</h3>
                <p className="text-gray-600 text-sm">
                  Dr. Sarah Johnson is a leading researcher in computer vision and AI applications for health technology. 
                  She has published over 50 papers on machine learning and food recognition systems.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-2">Technology</Badge>
                <h3 className="text-lg font-semibold mb-2">
                  <Link href="/blog/5" className="hover:text-green-600 transition-colors">
                    The Future of Food: AI and Personalized Nutrition
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm">
                  Explore how artificial intelligence is revolutionizing personalized nutrition recommendations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-2">Health</Badge>
                <h3 className="text-lg font-semibold mb-2">
                  <Link href="/blog/4" className="hover:text-green-600 transition-colors">
                    Understanding Food Labels: A Complete Guide
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm">
                  Master the art of reading nutrition labels and make informed decisions about what you eat.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
