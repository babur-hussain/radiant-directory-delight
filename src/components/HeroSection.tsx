
import React from 'react';
import SearchBar from './search/SearchBar';
import HeroContent from './hero/HeroContent';
import PopularSearchTerms from './search/PopularSearchTerms';

const HeroSection: React.FC = () => {
  console.log("Rendering HeroSection component");
  
  const handleTermClick = (term: string) => {
    console.log("Search term clicked:", term);
  };
  
  return (
    <section className="relative bg-gradient-to-b from-primary/10 to-background pt-10 md:pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="hero-content text-center">
          <h1 className="text-4xl font-bold mb-4">Grow Bharat Vyapaar</h1>
          <p className="text-xl">Discover Indian businesses</p>
        </div>
        
        <div className="mt-8 w-full max-w-4xl mx-auto">
          <SearchBar initialQuery="" onResultsVisibilityChange={() => {}} />
          
          <div className="mt-4 text-center">
            <PopularSearchTerms onTermClick={handleTermClick} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
