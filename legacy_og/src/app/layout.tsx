// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "NutriScan - Vibrant Food Intelligence",
  description: "Scan food with pure accuracy. Get instant ingredient breakdowns, nutrition facts, and vibrant health insights powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`font-sans ${inter.variable} antialiased`}>
            <Navigation />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}