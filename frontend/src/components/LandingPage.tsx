import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Leaf, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  MapPin, 
  Zap, 
  Smartphone,
  BarChart3,
  Camera,
  Sprout,
  Sun,
  Droplets,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Heart,
  Star,
  Award
} from "lucide-react";

interface LandingPageProps {
  onRoleSelect: (role: 'farmer' | 'vendor' | 'consumer') => void;
}

export function LandingPage({ onRoleSelect }: LandingPageProps) {
  const stats = [
    { label: "Happy Farmers", value: "10K+", icon: Users, description: "Active farmers growing with us", color: "text-primary" },
    { label: "Crops Monitored", value: "25K+", icon: Sprout, description: "Acres under smart monitoring", color: "text-success" },
    { label: "Diseases Prevented", value: "5K+", icon: Award, description: "Early detection saves crops", color: "text-warning" },
    { label: "Income Increase", value: "30%", icon: TrendingUp, description: "Average farmer profit boost", color: "text-info" }
  ];

  const farmerBenefits = [
    {
      icon: Smartphone,
      title: "Easy Mobile Access",
      description: "Check your crops anytime, anywhere with our simple mobile app",
      highlight: true
    },
    {
      icon: BarChart3,
      title: "Smart Insights",
      description: "Get easy-to-understand reports about your soil and crops",
      highlight: true
    },
    {
      icon: Camera,
      title: "Disease Detection",
      description: "Take a photo to instantly identify crop diseases and get solutions",
      highlight: true
    },
    {
      icon: ShoppingCart,
      title: "Direct Sales",
      description: "Sell directly to customers without middlemen for better profits",
      highlight: false
    },
    {
      icon: Sun,
      title: "Weather Alerts",
      description: "Get timely weather updates to protect your crops",
      highlight: false
    },
    {
      icon: Droplets,
      title: "Water Management",
      description: "Smart irrigation recommendations to save water and costs",
      highlight: false
    }
  ];

  const roles = [
    {
      id: 'farmer',
      title: 'I am a Farmer',
      subtitle: 'Grow Smarter, Earn More',
      description: 'Get help with your crops, find diseases early, and sell directly to customers',
      icon: Leaf,
      color: 'bg-primary',
      borderColor: 'border-primary',
      featured: true,
      benefits: ['Easy crop monitoring', 'Higher income from direct sales', 'Early disease detection', 'Weather & soil alerts'],
      cta: 'Start Farming Smarter'
    },
    {
      id: 'vendor',
      title: 'I am a Vendor',
      subtitle: 'Efficient Business Management',
      description: 'Manage your shop, track orders, and serve customers better',
      icon: ShoppingCart,
      color: 'bg-secondary',
      borderColor: 'border-secondary',
      featured: false,
      benefits: ['Easy inventory tracking', 'Customer management', 'Order notifications', 'Business analytics'],
      cta: 'Manage My Business'
    },
    {
      id: 'consumer',
      title: 'I am a Customer',
      subtitle: 'Fresh Produce Direct',
      description: 'Buy fresh vegetables and fruits directly from local farmers',
      icon: Users,
      color: 'bg-accent',
      borderColor: 'border-accent',
      featured: false,
      benefits: ['Fresh farm produce', 'Support local farmers', 'Better prices', 'Quality guarantee'],
      cta: 'Shop Fresh Produce'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted overflow-x-hidden">
      {/* Hero Section */}
      <motion.section 
        className="relative pt-16 pb-12 px-4 md:px-6 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 md:mb-10"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl mr-4 shadow-lg">
                <Leaf className="h-10 w-10 md:h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Annadata
                </h1>
                <p className="text-sm md:text-base text-primary/70 font-medium">Smart Agriculture Platform</p>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <p className="text-xl md:text-2xl text-foreground max-w-4xl mx-auto leading-relaxed font-medium">
                Transform your farming with smart technology that's easy to use
              </p>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Monitor crops with IoT sensors, detect diseases with AI, and sell directly to customers for better profits
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Badge className="bg-success/10 text-success border-success/20 px-6 py-3 text-base font-medium">
                <Heart className="h-4 w-4 mr-2" />
                Trusted by 10,000+ Farmers
              </Badge>
              <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-3 text-base font-medium">
                <Star className="h-4 w-4 mr-2" />
                4.9/5 Rating
              </Badge>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center border border-border/50 hover:border-primary/30 transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="bg-primary/10 rounded-full w-12 h-12 md:w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className={`h-6 w-6 md:h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm md:text-base text-foreground font-medium">{stat.label}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Role Selection */}
      <motion.section 
        className="py-8 md:py-16 px-4 md:px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Choose Your Path</h2>
            <p className="text-muted-foreground text-lg">
              Select what describes you best to get started
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="cursor-pointer group relative"
                onClick={() => onRoleSelect(role.id as 'farmer' | 'vendor' | 'consumer')}
              >
                <Card className={`h-full transition-all duration-300 border-2 relative overflow-hidden ${role.featured ? 'border-primary shadow-2xl ring-4 ring-primary/20' : 'border-border hover:border-primary/50'} ${role.featured ? 'bg-gradient-to-br from-primary/5 to-secondary/5' : 'bg-card'} hover:shadow-xl group-hover:border-primary/60`}>
                  {role.featured && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 shadow-lg">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  {role.featured && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
                  )}
                  
                  <CardHeader className="text-center pb-4 relative pt-8">
                    <div className={`w-18 h-18 md:w-24 h-24 rounded-2xl ${role.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      <role.icon className="h-8 w-8 md:h-12 w-12 text-white" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl mb-2">{role.title}</CardTitle>
                    <p className="text-sm font-semibold text-primary mb-2">{role.subtitle}</p>
                    <CardDescription className="text-base leading-relaxed">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {role.benefits.map((benefit, idx) => (
                        <motion.div 
                          key={benefit} 
                          className="flex items-center text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.2 + idx * 0.1 }}
                        >
                          <div className="bg-success/20 rounded-full p-1 mr-3">
                            <CheckCircle className="h-3 w-3 text-success" />
                          </div>
                          <span className="text-foreground">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    <Button 
                      className={`w-full mt-6 group-hover:scale-105 transition-all duration-300 text-base py-6 ${role.featured ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg' : 'border-2'}`}
                      variant={role.featured ? "default" : "outline"}
                      size="lg"
                    >
                      <span className="flex items-center">
                        {role.cta}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Farmer Benefits Section */}
      <motion.section 
        className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-br from-muted/30 via-primary/5 to-secondary/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 mb-4">
                <Sprout className="h-4 w-4 mr-2" />
                For Farmers, By Farmers
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                How Annadata Transforms Your Farm
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                From traditional farming to smart agriculture - simple tools and smart technology that actually work
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {farmerBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`${benefit.highlight ? 'md:col-span-1' : ''}`}
              >
                <Card className={`h-full p-6 md:p-8 transition-all duration-300 border-2 hover:shadow-xl group ${
                  benefit.highlight 
                    ? 'border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/5 hover:border-primary/50' 
                    : 'bg-card hover:border-primary/30 border-border'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-5">
                    <div className={`w-14 h-14 md:w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
                      benefit.highlight 
                        ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <benefit.icon className="h-7 w-7 md:h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-3 text-lg md:text-xl text-foreground">{benefit.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-base">{benefit.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Call to Action */}
          <motion.div 
            className="text-center mt-16 md:mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 rounded-2xl p-8 md:p-12 border border-primary/20">
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                Ready to Transform Your Farm?
              </h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Join the agricultural revolution. Start using smart technology to increase your yields and profits today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg px-8 py-6 shadow-lg"
                  onClick={() => onRoleSelect('farmer')}
                >
                  <Leaf className="h-5 w-5 mr-2" />
                  Start Smart Farming Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Heart className="h-4 w-4 mr-1 text-success" />
                  Free to start • No credit card required
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}