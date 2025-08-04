'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import { isDevAuth, getDevUser } from '@/lib/dev-auth';
import { Scan, BookOpen, Home, Camera, Info, BarChart3, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Scan Food', href: '/scan', icon: Camera },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Blog', href: '/blog', icon: BookOpen },
  { name: 'About', href: '/about', icon: Info },
]
export default function Navigation() {
  const pathname = usePathname();
  const clerk = useUser();
  const dev = isDevAuth();
  let isSignedIn, user;
  if (dev) {
    const devUser = getDevUser();
    isSignedIn = true;
    user = devUser;
  } else {
    isSignedIn = clerk.isSignedIn;
    user = clerk.user;
  }
  return (
    <nav className="bg-white/95 backdrop-blur-md border-b-2 border-gradient-to-r from-emerald-200 to-blue-200 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Scan className="h-7 w-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  NutriScan
                </span>
                <span className="text-xs text-emerald-600 font-medium -mt-1">AI Food Intelligence</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 shadow-md border-2 border-emerald-200'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:shadow-md hover:border-2 hover:border-emerald-100'
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-emerald-600" : "text-gray-500")} />
                  <span className="hidden sm:block">{item.name}</span>
                </Link>
              )
            })}
          </div>
          
          {/* Authentication Section */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:block text-sm text-gray-600">
                  Welcome, {user?.firstName || 'User'}!
                </span>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 rounded-full ring-2 ring-emerald-200 hover:ring-emerald-300 transition-all"
                    }
                  }}
                />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
