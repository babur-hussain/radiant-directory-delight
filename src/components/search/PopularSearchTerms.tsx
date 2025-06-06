
import React from 'react';

interface PopularSearchTermsProps {
  onTermClick: (term: string) => void;
}

const PopularSearchTerms: React.FC<PopularSearchTermsProps> = ({
  onTermClick
}) => {
  const popularTerms = ['Restaurants', 'Hotels', 'Coffee', 'Gyms', 'Doctors', 'Auto'];

  const handleTermClick = (term: string) => {
    console.log("Popular term clicked:", term);
    onTermClick(term);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <span className="text-sm text-gray-600 mr-2">Popular searches:</span>
      {popularTerms.map((term, index) => (
        <button
          key={index}
          onClick={() => handleTermClick(term)}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 px-2 py-1 rounded-md hover:bg-blue-50"
        >
          {term}
        </button>
      ))}
    </div>
  );
};

export default PopularSearchTerms;
