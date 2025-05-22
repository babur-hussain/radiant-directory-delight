
import React from 'react';

interface PopularSearchTermsProps {
  onTermClick: (term: string) => void;
}

const PopularSearchTerms: React.FC<PopularSearchTermsProps> = ({ onTermClick }) => {
  const popularTerms = ['Restaurants', 'Hotels', 'Coffee', 'Gyms', 'Doctors', 'Auto'];

  const handleTermClick = (term: string) => {
    console.log("Popular term clicked:", term);
    onTermClick(term);
  };

  return (
    <div className="mt-2 sm:mt-4 flex flex-col items-center">
      <span className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">Popular:</span>
      <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 text-xs sm:text-sm">
        {popularTerms.map((term) => (
          <button
            key={term}
            className="px-2 py-1 sm:px-4 sm:py-2 bg-white shadow-sm rounded-full hover:bg-gray-50 text-gray-700 transition-colors tap-highlight-transparent"
            onClick={() => handleTermClick(term)}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PopularSearchTerms;
