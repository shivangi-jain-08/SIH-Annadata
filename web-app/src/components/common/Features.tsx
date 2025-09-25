import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sprout, 
  Brain, 
  ShoppingCart, 
  MapPin, 
  Camera, 
  BarChart3,
  Users,
  Smartphone,
  Shield
} from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <Brain className="h-8 w-8" />,
    title: "AI Crop Advisory",
    description: "Get personalized crop recommendations based on 7-parameter soil analysis and weather data.",
    color: "text-blue-500"
  },
  {
    icon: <Camera className="h-8 w-8" />,
    title: "Disease Detection",
    description: "Upload plant images to instantly detect diseases and get AI-powered treatment recommendations.",
    color: "text-green-500"
  },
  {
    icon: <ShoppingCart className="h-8 w-8" />,
    title: "Direct Marketplace",
    description: "Connect farmers directly with vendors and consumers, eliminating middlemen for fair pricing.",
    color: "text-orange-500"
  },
  {
    icon: <MapPin className="h-8 w-8" />,
    title: "Location Services",
    description: "Real-time vendor-consumer matching based on proximity for fresh, local produce delivery.",
    color: "text-red-500"
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Analytics Dashboard",
    description: "Track your farm performance, sales metrics, and market trends with comprehensive analytics.",
    color: "text-purple-500"
  },
  {
    icon: <Smartphone className="h-8 w-8" />,
    title: "Voice Assistant",
    description: "Multilingual voice interface for easy access to all features, perfect for low-literacy users.",
    color: "text-indigo-500"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Community Network",
    description: "Connect with other farmers, share knowledge, and build a strong agricultural community.",
    color: "text-teal-500"
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Secure Platform",
    description: "Your data is protected with enterprise-grade security and privacy measures.",
    color: "text-gray-500"
  }
];

export function Features() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">Platform Features</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for modern agriculture
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Annadata combines cutting-edge AI technology with practical farming solutions 
            to help you grow better, sell smarter, and connect directly with your market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 group animate-fade-up border-0 bg-gradient-to-br from-white to-gray-50/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className={`${feature.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Interactive Demo Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-8">See it in action</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                <Sprout className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="font-semibold mb-2">Soil Analysis Demo</h4>
                <p className="text-sm text-muted-foreground">
                  Try our AI-powered soil analysis tool
                </p>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg p-6 group-hover:from-secondary/20 group-hover:to-secondary/10 transition-all duration-300">
                <Camera className="h-12 w-12 text-secondary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="font-semibold mb-2">Disease Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Upload a plant image for instant diagnosis
                </p>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-6 group-hover:from-accent/20 group-hover:to-accent/10 transition-all duration-300">
                <ShoppingCart className="h-12 w-12 text-accent mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="font-semibold mb-2">Marketplace Tour</h4>
                <p className="text-sm text-muted-foreground">
                  Explore our direct-to-consumer platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}