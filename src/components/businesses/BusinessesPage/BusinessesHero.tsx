
import React from 'react';

const BusinessesHero: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Local Businesses
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find the best businesses in your area. Browse by category, read reviews, and connect with local business owners.
        </p>
      </div>
    </div>
  );
};

export default BusinessesHero;
