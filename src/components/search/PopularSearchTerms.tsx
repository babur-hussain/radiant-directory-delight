
import React from 'react';

interface PopularSearchTermsProps {
  onTermClick: (term: string) => void;
}

const PopularSearchTerms: React.FC<PopularSearchTermsProps> = ({ onTermClick }) => {
  const popularTerms = ['Restaurants', 'Hotels', 'Coffee', 'Gyms', 'Doctors', 'Auto Services'];

  return (
    <div className="mt-6 flex flex-wrap justify-center items-center gap-2 text-sm text-gray-500">
      <span>Popular:</span>
      {popularTerms.map((term) => (
        <button
          key={term}
          className="px-3 py-1 bg-white/80 backdrop-blur-sm shadow-sm rounded-full hover:bg-primary/10 hover:text-primary transition-smooth"
          onClick={() => onTermClick(term)}
        >
          {term}
        </button>
      ))}
    </div>
  );
};

export default PopularSearchTerms;
