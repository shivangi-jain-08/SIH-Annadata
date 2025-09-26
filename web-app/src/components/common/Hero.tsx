import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  ctaLink: string;
}

const heroSlides: HeroSlide[] = [
  {
    title: "Smart Agriculture",
    subtitle: "AI-Powered Crop Advisory",
    description: "Get personalized crop recommendations based on soil analysis and weather data. Maximize your yield with data-driven insights.",
    image: "https://www.staragri.com/wp-content/uploads/2025/07/Rise-of-AI-in-Agriculture.png",
    cta: "Start Farming Smart",
    ctaLink: "/register"
  },
  {
    title: "Direct Marketplace",
    subtitle: "Connect Farmers to Consumers",
    description: "Skip the middleman. Farmers sell directly to vendors and consumers, ensuring fair prices and fresh produce.",
    image: "https://kisansabha.in/Images/agricultural/Empowering%20Farmers%20Through%20Digital%20Agricultural%20Marketplaces.jpg",
    cta: "Join Marketplace",
    ctaLink: "/register"
  },
  {
    title: "Disease Detection",
    subtitle: "AI-Powered Plant Health",
    description: "Upload plant images to instantly detect diseases and get treatment recommendations from our ML models.",
    image: "https://media.licdn.com/dms/image/v2/D5612AQEpDAG6eND5WQ/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1733230410040?e=2147483647&v=beta&t=OnXJFzdBC3oszBTt7yUrSQi_txIhx431RXqydYI477U",
    cta: "Try Disease Detection",
    ctaLink: "/register"
  }
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <section className="relative overflow-hidden min-h-[600px] flex items-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-6 z-10">
            <div className="animate-fade-up">
              <Badge className="mb-4" variant="outline">
                {currentSlideData.subtitle}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                {currentSlideData.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
                {currentSlideData.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" >
                  <Link to={currentSlideData.ctaLink}>
                    {currentSlideData.cta}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 animate-fade-up relative mt-8 lg:mt-0" style={{ animationDelay: "0.2s" }}>
            <div className="relative h-[400px] w-full">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                </div>
              ))}
              
              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all duration-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all duration-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-primary scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Scroll Down Indicator */}
      {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div> */}
    </section>
  );
}