
import React, { useState, useEffect } from 'react';
import SearchBar from './search/SearchBar';
import HeroContent from './hero/HeroContent';
import PopularSearchTerms from './search/PopularSearchTerms';

const HeroSection: React.FC = () => {
  const [resultsVisible, setResultsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [componentLoaded, setComponentLoaded] = useState(false);
  
  console.log("Rendering HeroSection component");
  
  useEffect(() => {
    console.log("HeroSection mounted");
    setComponentLoaded(true);
  }, []);
  
  const handleTermClick = (term: string) => {
    console.log("Search term clicked:", term);
    setSearchQuery(term);
  };
  
  // Ensure we always render something, even if subcomponents fail
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-10 md:pt-16 pb-8">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="hero-content">
          {componentLoaded ? (
            <HeroContent />
          ) : (
            <div className="text-center py-8">
              <h1 className="text-4xl font-bold">Welcome to Grow Bharat Vyapaar</h1>
              <p className="mt-4 text-lg">Discover local businesses across India</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 md:mt-12 w-full max-w-4xl mx-auto z-20 relative">
          {componentLoaded ? (
            <SearchBar 
              initialQuery={searchQuery}
              onResultsVisibilityChange={setResultsVisible}
            />
          ) : (
            <div className="w-full p-4 rounded-lg border border-gray-200 bg-white">
              <input 
                type="text" 
                placeholder="Search businesses..." 
                className="w-full p-2 rounded-md"
              />
            </div>
          )}
          
          {!resultsVisible && componentLoaded && (
            <div className="mt-4 text-center">
              <PopularSearchTerms onTermClick={handleTermClick} />
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;
