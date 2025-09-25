import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, LineChart } from 'lucide-react';

interface PriceData {
  product: string;
  currentPrice: number;
  previousPrice: number;
  trend: "up" | "down" | "stable";
  unit: string;
}

const marketData: PriceData[] = [
  {
    product: "Rice",
    currentPrice: 35,
    previousPrice: 32,
    trend: "up",
    unit: "kg"
  },
  {
    product: "Wheat",
    currentPrice: 28,
    previousPrice: 30,
    trend: "down",
    unit: "kg"
  },
  {
    product: "Potatoes",
    currentPrice: 20,
    previousPrice: 20,
    trend: "stable",
    unit: "kg"
  },
  {
    product: "Tomatoes",
    currentPrice: 25,
    previousPrice: 30,
    trend: "down",
    unit: "kg"
  },
  {
    product: "Onions",
    currentPrice: 22,
    previousPrice: 18,
    trend: "up",
    unit: "kg"
  },
  {
    product: "Pulses",
    currentPrice: 80,
    previousPrice: 78,
    trend: "up",
    unit: "kg"
  },
  {
    product: "Sugarcane",
    currentPrice: 45,
    previousPrice: 42,
    trend: "up",
    unit: "kg"
  },
  {
    product: "Cotton",
    currentPrice: 120,
    previousPrice: 125,
    trend: "down",
    unit: "kg"
  }
];

const calculateChange = (current: number, previous: number) => {
  const change = ((current - previous) / previous) * 100;
  return Math.abs(change).toFixed(1);
};

// Horizontal scrolling ticker component
export function LiveMarketTicker() {
  return (
    <div className="bg-primary text-white py-2 overflow-hidden">
      <div className="animate-scroll whitespace-nowrap">
        <div className="inline-flex space-x-8">
          {[...marketData, ...marketData].map((item, index) => (
            <div key={index} className="inline-flex items-center space-x-2">
              <span className="font-medium">{item.product}</span>
              <span className="text-primary-100">₹{item.currentPrice}/{item.unit}</span>
              {item.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-300" />
              ) : item.trend === "down" ? (
                <TrendingDown className="h-4 w-4 text-red-300" />
              ) : (
                <LineChart className="h-4 w-4 text-gray-300" />
              )}
              <span className={`text-sm ${
                item.trend === "up" ? "text-green-300" : 
                item.trend === "down" ? "text-red-300" : "text-gray-300"
              }`}>
                {item.trend !== "stable" && (
                  <>
                    {item.trend === "up" ? "+" : "-"}{calculateChange(item.currentPrice, item.previousPrice)}%
                  </>
                )}
                {item.trend === "stable" && "Stable"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MarketPrices() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <Badge className="mb-2" variant="outline">Market Insights</Badge>
          <h2 className="text-3xl font-bold mb-4">Current Market Prices</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest market prices for agricultural products. Make informed decisions for buying and selling.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {marketData.map((item, index) => (
            <Card key={index} className="hover:shadow-md transition-all duration-300 animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{item.product}</CardTitle>
                  {item.trend === "up" ? (
                    <TrendingUp className="text-red-500 h-5 w-5" />
                  ) : item.trend === "down" ? (
                    <TrendingDown className="text-green-500 h-5 w-5" />
                  ) : (
                    <LineChart className="text-gray-500 h-5 w-5" />
                  )}
                </div>
                <CardDescription>Current market price per {item.unit}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                  <div className="text-2xl font-semibold">₹{item.currentPrice}</div>
                  <div className={`text-sm ${item.trend === "up" ? "text-red-500" : item.trend === "down" ? "text-green-500" : "text-gray-500"}`}>
                    {item.trend !== "stable" && (
                      <>
                        {item.trend === "up" ? "▲" : "▼"} {calculateChange(item.currentPrice, item.previousPrice)}%
                      </>
                    )}
                    {item.trend === "stable" && "━  Stable"}
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}