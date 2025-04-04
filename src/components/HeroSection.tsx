
import React from 'react';
import SearchBar from './search/SearchBar';
import PopularSearchTerms from './search/PopularSearchTerms';

const HeroSection: React.FC = () => {
  const handleTermClick = (term: string) => {
    console.log("Search term clicked:", term);
  };
  
  return (
    <section className="relative bg-gradient-to-b from-primary/10 to-background pt-10 md:pt-16 pb-6 md:pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="hero-content text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4">Grow Bharat Vyapaar</h1>
          <p className="text-base sm:text-lg md:text-xl mb-3 md:mb-6">Discover Indian businesses</p>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Find and connect with the best businesses across India. Our platform helps
            you discover quality products and services from local entrepreneurs.
          </p>
        </div>
        
        <div className="mt-4 sm:mt-6 md:mt-8 w-full max-w-4xl mx-auto">
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-md">
            <SearchBar initialQuery="" onResultsVisibilityChange={() => {}} />
            
            <div className="mt-3 md:mt-4 text-center">
              <PopularSearchTerms onTermClick={handleTermClick} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
