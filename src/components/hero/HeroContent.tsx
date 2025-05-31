
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HeroContent: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center text-center mb-8 sm:mb-12 px-4">
      <div className="flex flex-col items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <img 
          src="/lovable-uploads/99199ab2-5520-497e-a73d-9e95ac7e3c89.png"
          alt="Lovable Logo"
          className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain mb-2 sm:mb-4"
        />
        <div className="inline-block">
          <span className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-medium text-primary bg-primary/10 rounded-full border border-primary/20 shadow-sm">
            Empowering Influencers & Businesses
          </span>
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0C3C60] mb-4 sm:mb-6 text-balance max-w-4xl">
        Connect. Collaborate. 
        <span className="text-[#F5962C] block mt-1 sm:mt-2">Grow.</span>
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mb-6">
        Where Influencers & Businesses Build Powerful Local Partnerships.
      </p>
      <p className="text-sm sm:text-base text-gray-500 max-w-2xl mb-8">
        India's most innovative influencer-business matchmaking platform – empowering creators and local brands to grow together.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="default" 
          size="lg"
          className="px-8 py-3 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out rounded-xl font-semibold border-0"
          onClick={() => navigate('/influencers')}
        >
          Join as Influencer
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="px-8 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-out rounded-xl font-semibold"
          onClick={() => navigate('/businesses')}
        >
          Register Your Business
        </Button>
        <Button 
          variant="secondary" 
          size="lg"
          className="px-8 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out rounded-xl font-semibold border-0"
          onClick={() => navigate('/subscription')}
        >
          View Plans
        </Button>
      </div>
      
      <div className="mt-5 sm:mt-6 text-xs sm:text-sm text-gray-500">
        <span>Visit us at </span>
        <a href="https://www.growbhartvyapaar.com" className="text-primary hover:underline font-medium">
          growbhartvyapaar.com
        </a>
      </div>
    </div>
  );
};

export default HeroContent;
