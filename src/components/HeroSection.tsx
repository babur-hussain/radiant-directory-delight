
import React from 'react';
import SearchBar from './search/SearchBar';
import { useNavigate } from 'react-router-dom';
import HeroContent from './hero/HeroContent';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative bg-gradient-to-b from-purple-100 to-pink-50 pt-14 sm:pt-16 md:pt-20 lg:pt-24 pb-8 sm:pb-12 md:pb-16 overflow-hidden min-h-[60vh] sm:min-h-[70vh]">
      {/* Abstract shapes background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-20 -right-20 w-64 h-64 sm:w-96 sm:h-96 bg-brand-purple/30 rounded-full filter blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-48 h-48 sm:w-72 sm:h-72 bg-brand-blue/30 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 sm:w-64 sm:h-64 bg-brand-pink/30 rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10 max-w-7xl">
        <HeroContent />
        
        <div className="mt-4 sm:mt-6 md:mt-8 w-full max-w-4xl mx-auto px-1 sm:px-2 md:px-0">
          <div className="bg-white p-2 sm:p-3 md:p-4 lg:p-6 shadow-xl rounded-lg sm:rounded-xl md:rounded-2xl">
            <SearchBar initialQuery="" onResultsVisibilityChange={() => {}} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
