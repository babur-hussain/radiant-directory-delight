
import React, { useState } from 'react';
import SearchBar from './search/SearchBar';
import HeroContent from './hero/HeroContent';
import PopularSearchTerms from './search/PopularSearchTerms';

const HeroSection: React.FC = () => {
  const [resultsVisible, setResultsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  console.log("Rendering HeroSection component");
  
  const handleTermClick = (term: string) => {
    console.log("Search term clicked:", term);
    setSearchQuery(term);
  };
  
  // Always render the component, with fallback content if needed
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-10 md:pt-16 pb-8">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="hero-content">
          {/* Always render HeroContent */}
          <HeroContent />
        </div>
        
        <div className="mt-8 md:mt-12 w-full max-w-4xl mx-auto z-20 relative">
          <SearchBar 
            initialQuery={searchQuery}
            onResultsVisibilityChange={setResultsVisible}
          />
          
          {!resultsVisible && (
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
