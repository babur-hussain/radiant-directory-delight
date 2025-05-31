
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/search/SearchBar';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-purple-50 via-white to-indigo-50 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="block text-gray-900 mb-2">Connect. Create.</span>
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              Grow.
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Where Influencers & Businesses Build Powerful Local Partnerships.
          </p>
          
          {/* Description */}
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            India's most innovative influencer-business matchmaking platform – empowering creators 
            and local brands to grow together.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg"
              onClick={() => navigate('/influencer')}
            >
              Join as Influencer
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-gray-300 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 px-8 py-4 text-lg"
              onClick={() => navigate('/business')}
            >
              Register Your Business
            </Button>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg"
              onClick={() => navigate('/subscription')}
            >
              View Plans
            </Button>
          </div>
          
          {/* Website URL */}
          <p className="text-gray-500 mb-12">
            Visit us at <span className="font-medium">growbhartvyapaar.com</span>
          </p>
          
          {/* Search Section */}
          <div className="max-w-3xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>
      
      {/* Welcome Section */}
      <div className="container px-4 mx-auto mt-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Welcome to <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              GROW BHARAT VYAPAAR
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            India's most innovative influencer-business matchmaking platform – empowering creators and 
            local brands to grow together through meaningful partnerships.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
