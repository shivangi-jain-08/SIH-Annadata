import React from 'react';
import { Hero } from '@/components/common/Hero';
import { LiveMarketTicker, MarketPrices } from '@/components/common/MarketPrices';
import { Features } from '@/components/common/Features';
import { UserRoleCards } from '@/components/common/UserRoleCards';
import { Badge } from '@/components/ui/badge';

export function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero />
      
      {/* Live Market Ticker */}
      <LiveMarketTicker />
      
      {/* Role Selection Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-2" variant="outline">Choose Your Role</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Select Your Portal</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Annadata offers specialized interfaces for farmers, vendors, and consumers in the agricultural ecosystem.
            </p>
          </div>
          <UserRoleCards />
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Market Prices Section */}
      <MarketPrices />

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-2" variant="outline">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Smart, Sustainable</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our platform connects the entire agricultural value chain through technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-up">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Farmers Upload Data</h3>
              <p className="text-muted-foreground">
                Farmers input soil data, upload crop images, and list their produce on the platform
              </p>
            </div>

            <div className="text-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Provides Insights</h3>
              <p className="text-muted-foreground">
                Our ML models analyze data to provide crop recommendations, disease detection, and market insights
              </p>
            </div>

            <div className="text-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Connections</h3>
              <p className="text-muted-foreground">
                Vendors and consumers connect directly with farmers for fresh, fair-priced produce
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform agriculture?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers, vendors, and consumers who are already using Annadata 
            to build a more sustainable and profitable agricultural ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-primary px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              Get Started Today
            </a>
            <a
              href="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-primary transition-colors duration-300"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}