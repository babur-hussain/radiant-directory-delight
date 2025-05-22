
import React from 'react';
import SearchBar from './search/SearchBar';
import PopularSearchTerms from './search/PopularSearchTerms';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  
  const handleTermClick = (term: string) => {
    console.log("Search term clicked:", term);
    navigate(`/businesses?search=${encodeURIComponent(term)}`);
  };
  
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
        <div className="hero-content text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-brand-pink text-transparent bg-clip-text">
              Grow Bharat Vyapaar
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-2 md:mb-4 font-light">
            <span className="bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 text-transparent bg-clip-text">
              Discover Indian businesses
            </span>
          </p>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6">
            Find and connect with the best businesses across India. Our platform helps
            you discover quality products and services from local entrepreneurs.
          </p>
        </div>
        
        <div className="mt-4 sm:mt-6 md:mt-8 w-full max-w-4xl mx-auto">
          <div className="bg-white p-3 sm:p-4 md:p-6 shadow-xl rounded-2xl">
            <SearchBar initialQuery="" onResultsVisibilityChange={() => {}} />
            
            <div className="mt-3 sm:mt-4 text-center">
              <PopularSearchTerms onTermClick={handleTermClick} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
