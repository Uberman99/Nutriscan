import Link from 'next/link'
import { Scan, Github, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
        <div className="absolute top-10 right-20 w-32 h-32 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-24 h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full animate-pulse"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 p-3 rounded-xl shadow-lg">
                <Scan className="h-7 w-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  NutriScan
                </span>
                <span className="text-xs text-emerald-400 font-medium -mt-1">AI Food Intelligence</span>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              🤖 AI-powered food analysis that helps you make smarter, healthier choices. 
              Scan any food to get instant nutrition facts and health insights! ✨
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-3 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-gray-700 transition-all duration-300 hover:scale-110 shadow-lg">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-xl text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-all duration-300 hover:scale-110 shadow-lg">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-xl text-gray-400 hover:text-purple-400 hover:bg-gray-700 transition-all duration-300 hover:scale-110 shadow-lg">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">🔗 Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-emerald-400 transition-all duration-300 hover:translate-x-2 inline-block">
                  🏠 Home
                </Link>
              </li>
              <li>
                <Link href="/scan" className="text-gray-300 hover:text-blue-400 transition-all duration-300 hover:translate-x-2 inline-block">
                  📸 Scan Food
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-purple-400 transition-all duration-300 hover:translate-x-2 inline-block">
                  📚 Blog
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 NutriScan. All rights reserved.
          </p>
          <p className="text-gray-600 mb-4 max-w-md">
            Powered by Advanced AI, USDA, and cutting-edge technology
          </p>
        </div>
      </div>
    </footer>
  )
}
