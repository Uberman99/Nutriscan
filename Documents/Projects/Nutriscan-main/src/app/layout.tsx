// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ClerkProvider } from '@clerk/nextjs';
import { isDevAuth } from '@/lib/dev-auth';

export const metadata: Metadata = {
  title: "NutriScan - Smart Food Analysis & Nutrition Tracker",
  description: "Scan food, analyze nutrition, and find the best prices instantly with AI-powered insights.",
  keywords: ["nutrition", "food scanner", "health", "diet", "calories", "food prices"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const dev = isDevAuth();
  const content = (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Navigation />
        <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 relative">
          {/* Global background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-emerald-200 to-blue-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-full opacity-10 animate-pulse"></div>
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
  if (dev) {
    return content;
  }
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      {content}
    </ClerkProvider>
  );
}