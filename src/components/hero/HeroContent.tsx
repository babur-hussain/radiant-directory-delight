
import React from 'react';

const HeroContent: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center mb-8 sm:mb-12 px-4">
      <div className="flex flex-col items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <img 
          src="/lovable-uploads/99199ab2-5520-497e-a73d-9e95ac7e3c89.png"
          alt="Grow Bharat Vyapaar Logo"
          className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain mb-2 sm:mb-4"
        />
        <div className="inline-block">
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
            Empowering Indian Businesses
          </span>
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0C3C60] mb-4 sm:mb-6 text-balance max-w-4xl">
        Discover and Grow with
        <span className="text-[#F5962C] block mt-1 sm:mt-2">Bharat Vyapaar</span>
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl">
        Your comprehensive platform for finding, connecting, and growing with the best businesses across India.
      </p>
      <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
        <span>Visit us at </span>
        <a href="https://growbharatvyaapar.com" className="text-primary hover:underline">
          growbharatvyaapar.com
        </a>
      </div>
    </div>
  );
};

export default HeroContent;
