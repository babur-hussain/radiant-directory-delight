
import React from 'react';
import SearchBar from './search/SearchBar';
import PopularSearchTerms from './search/PopularSearchTerms';

const HeroSection: React.FC = () => {
  const handleTermClick = (term: string) => {
    console.log("Search term clicked:", term);
  };
  
  return (
    <section className="relative bg-gradient-to-b from-brand-purple/10 to-brand-blue/5 pt-16 md:pt-24 pb-12 md:pb-16 overflow-hidden">
      {/* Abstract shapes background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-purple/30 rounded-full filter blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-brand-blue/30 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-pink/30 rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="hero-content text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-purple via-brand-pink to-brand-blue">
              Grow Bharat Vyapaar
            </span>
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl mb-4 md:mb-8 font-light">
            <span className="text-gradient-warm">Discover Indian businesses</span>
          </p>
          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-8">
            Find and connect with the best businesses across India. Our platform helps
            you discover quality products and services from local entrepreneurs.
          </p>
        </div>
        
        <div className="mt-6 sm:mt-8 md:mt-10 w-full max-w-4xl mx-auto">
          <div className="glass-card p-5 md:p-6 shadow-xl">
            <SearchBar initialQuery="" onResultsVisibilityChange={() => {}} />
            
            <div className="mt-4 text-center">
              <PopularSearchTerms onTermClick={handleTermClick} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
