import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sprout, 
  Truck, 
  ShoppingBag,
  ArrowRight,
  Users,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface RoleCard {
  role: 'farmer' | 'vendor' | 'consumer';
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  bgGradient: string;
}

const roleCards: RoleCard[] = [
  {
    role: 'farmer',
    title: 'Farmer Portal',
    description: 'Grow smarter with AI-powered insights and direct market access',
    icon: <Sprout className="h-8 w-8" />,
    features: [
      'AI Crop Recommendations',
      'Disease Detection',
      'Soil Analysis',
      'Direct Sales Platform',
      'Weather Insights'
    ],
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-green-100'
  },
  {
    role: 'vendor',
    title: 'Vendor Portal',
    description: 'Bridge the gap between farmers and consumers with smart logistics',
    icon: <Truck className="h-8 w-8" />,
    features: [
      'Dual Marketplace Access',
      'Location-based Matching',
      'Inventory Management',
      'Route Optimization',
      'Real-time Orders'
    ],
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-orange-100'
  },
  {
    role: 'consumer',
    title: 'Consumer Portal',
    description: 'Get fresh, local produce delivered directly from nearby vendors',
    icon: <ShoppingBag className="h-8 w-8" />,
    features: [
      'Fresh Local Produce',
      'Vendor Proximity Alerts',
      'Real-time Delivery',
      'Quality Assurance',
      'Direct Communication'
    ],
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-blue-100'
  }
];

const roleStats = {
  farmer: { users: '10K+', icon: Users, label: 'Active Farmers' },
  vendor: { users: '2K+', icon: TrendingUp, label: 'Verified Vendors' },
  consumer: { users: '50K+', icon: MapPin, label: 'Happy Consumers' }
};

export function UserRoleCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {roleCards.map((card, index) => (
        <Card 
          key={card.role} 
          className={`relative overflow-hidden hover:shadow-xl transition-all duration-500 group animate-fade-up border-0 bg-gradient-to-br ${card.bgGradient}`}
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <Badge variant="outline" className="text-xs">
                {roleStats[card.role].users}
              </Badge>
            </div>
            <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
              {card.title}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {card.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {card.features.map((feature, featureIndex) => (
                <div 
                  key={featureIndex} 
                  className="flex items-center text-sm text-muted-foreground animate-fade-up"
                  style={{ animationDelay: `${(index * 0.2) + (featureIndex * 0.1)}s` }}
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                  {feature}
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                asChild 
                className="w-full group-hover:shadow-md transition-all duration-300"
                size="sm"
              >
                <Link to={`/register?role=${card.role}`}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="ghost" 
                className="w-full text-xs"
                size="sm"
              >
                <Link to={`/dashboard/${card.role}`}>
                  View Demo Dashboard
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center pt-2 text-xs text-muted-foreground">
              {React.createElement(roleStats[card.role].icon, { className: "h-3 w-3 mr-1" })}
              {roleStats[card.role].label}
            </div>
          </CardContent>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700"></div>
        </Card>
      ))}
    </div>
  );
}