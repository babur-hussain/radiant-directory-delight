
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HeroContent: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center text-center mb-6 sm:mb-8 md:mb-12 px-2 sm:px-4">
      <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <img 
          src="/lovable-uploads/99199ab2-5520-497e-a73d-9e95ac7e3c89.png"
          alt="Lovable Logo"
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain mb-1 sm:mb-2 md:mb-4"
        />
        <div className="inline-block">
          <span className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium text-primary bg-primary/10 rounded-full border border-primary/20 shadow-sm">
            Empowering Influencers & Businesses
          </span>
        </div>
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-[#0C3C60] mb-3 sm:mb-4 md:mb-6 text-balance max-w-4xl leading-tight">
        Connect. Collaborate. 
        <span className="text-[#F5962C] block mt-1 sm:mt-2">Grow.</span>
      </h1>
      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mb-3 sm:mb-4 md:mb-6 px-2">
        Where Influencers & Businesses Build Powerful Local Partnerships.
      </p>
      <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-2xl mb-6 sm:mb-8 px-2">
        India's most innovative influencer-business matchmaking platform – empowering creators and local brands to grow together.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-lg sm:max-w-none">
        <Button 
          variant="default" 
          size="lg"
          className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out rounded-xl font-semibold border-0 text-sm sm:text-base"
          onClick={() => navigate('/influencers')}
        >
          Join as Influencer
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-out rounded-xl font-semibold text-sm sm:text-base"
          onClick={() => navigate('/businesses')}
        >
          Register Your Business
        </Button>
        <Button 
          variant="secondary" 
          size="lg"
          className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out rounded-xl font-semibold border-0 text-sm sm:text-base"
          onClick={() => navigate('/subscription')}
        >
          View Plans
        </Button>
      </div>
      
      <div className="mt-4 sm:mt-5 md:mt-6 text-xs sm:text-sm text-gray-500 px-2">
        <span>Visit us at </span>
        <a href="https://www.growbhartvyapaar.com" className="text-primary hover:underline font-medium break-all">
          growbhartvyapaar.com
        </a>
      </div>
    </div>
  );
};

export default HeroContent;
