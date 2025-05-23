
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
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
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
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button 
          variant="default" 
          size="lg"
          className="px-6"
          onClick={() => navigate('/influencers')}
        >
          Join as Influencer
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="px-6"
          onClick={() => navigate('/businesses')}
        >
          Register Your Business
        </Button>
        <Button 
          variant="secondary" 
          size="lg"
          className="px-6"
          onClick={() => navigate('/subscription')}
        >
          View Plans
        </Button>
      </div>
      
      <div className="mt-5 sm:mt-6 text-xs sm:text-sm text-gray-500">
        <span>Visit us at </span>
        <a href="https://lovable.app" className="text-primary hover:underline">
          lovable.app
        </a>
      </div>
    </div>
  );
};

export default HeroContent;
