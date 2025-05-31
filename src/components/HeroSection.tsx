
import React from 'react';
import SearchBar from './search/SearchBar';
import { useNavigate } from 'react-router-dom';
import HeroContent from './hero/HeroContent';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative bg-gradient-to-b from-purple-100 to-pink-50 pt-16 md:pt-24 pb-12 md:pb-16 overflow-hidden">
      {/* Abstract shapes background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-purple/30 rounded-full filter blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-brand-blue/30 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-pink/30 rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <HeroContent />
        
        <div className="mt-4 sm:mt-6 md:mt-8 w-full max-w-4xl mx-auto">
          <div className="bg-white p-3 sm:p-4 md:p-6 shadow-xl rounded-2xl">
            <SearchBar initialQuery="" onResultsVisibilityChange={() => {}} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
