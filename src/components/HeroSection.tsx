
import React, { useState } from 'react';
import SearchBar from './search/SearchBar';
import HeroContent from './hero/HeroContent';
import PopularSearchTerms from './search/PopularSearchTerms';

const HeroSection: React.FC = () => {
  const [resultsVisible, setResultsVisible] = useState(false);
  
  console.log("Rendering HeroSection component");
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-10 md:pt-16 pb-8">
      <div className="container max-w-7xl mx-auto px-4">
        <HeroContent />
        
        <div className="mt-8 md:mt-12 w-full max-w-4xl mx-auto z-20 relative">
          <SearchBar 
            onResultsVisibilityChange={setResultsVisible}
          />
          
          {!resultsVisible && (
            <div className="mt-4 text-center">
              <PopularSearchTerms />
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;
