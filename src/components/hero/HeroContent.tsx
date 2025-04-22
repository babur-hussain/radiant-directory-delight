
import React from 'react';

const HeroContent: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center mb-12">
      <div className="inline-block mb-6">
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
          Find the best local businesses
        </span>
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 text-balance max-w-4xl">
        Discover, Connect, and Engage with 
        <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent"> Local Excellence</span>
      </h1>
      <p className="text-xl text-gray-500 max-w-2xl">
        Your comprehensive directory for finding the best businesses, services, and professionals in your area.
      </p>
    </div>
  );
};

export default HeroContent;
