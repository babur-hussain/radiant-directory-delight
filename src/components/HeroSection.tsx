
import React, { useState, useEffect } from 'react';
import SearchBar from './search/SearchBar';
import HeroContent from './hero/HeroContent';
import PopularSearchTerms from './search/PopularSearchTerms';

interface PopularSearchTermsProps {
  onTermClick: (term: string) => void;
}

const HeroSection: React.FC = () => {
  const [resultsVisible, setResultsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [renderFailed, setRenderFailed] = useState(false);
  
  console.log("Rendering HeroSection component");
  
  useEffect(() => {
    console.log("HeroSection mounted");
    
    // Add a safety check to ensure the component renders
    const renderCheck = setTimeout(() => {
      if (!document.querySelector('.hero-content')) {
        console.log("HeroSection content not detected, forcing rerender");
        setRenderFailed(true);
      }
    }, 500);
    
    return () => clearTimeout(renderCheck);
  }, []);
  
  const handleTermClick = (term: string) => {
    console.log("Search term clicked:", term);
    setSearchQuery(term);
  };
  
  // Emergency backup render if needed
  if (renderFailed) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-10 md:pt-16 pb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">Welcome to Grow Bharat Vyapaar</h1>
          <p className="mt-4">Discover local businesses across India</p>
          <div className="mt-8 w-full max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="Search for businesses..." 
              className="w-full p-3 rounded-md border border-gray-300"
            />
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-10 md:pt-16 pb-8">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="hero-content">
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
