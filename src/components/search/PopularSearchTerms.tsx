
import React from 'react';

interface PopularSearchTermsProps {
  onTermClick: (term: string) => void;
}

const PopularSearchTerms: React.FC<PopularSearchTermsProps> = ({ onTermClick }) => {
  const popularTerms = ['Restaurants', 'Hotels', 'Coffee', 'Gyms', 'Doctors', 'Auto Services'];

  return (
    <div className="mt-4 flex flex-col items-center">
      <span className="text-gray-500 mb-2">Popular:</span>
      <div className="flex flex-wrap justify-center items-center gap-2 text-sm">
        {popularTerms.map((term) => (
          <button
            key={term}
            className="px-4 py-2 bg-white shadow-sm rounded-full hover:bg-gray-50 text-gray-700 transition-colors"
            onClick={() => onTermClick(term)}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PopularSearchTerms;
