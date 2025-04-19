
import React from 'react';
import { Link } from 'react-router-dom';

const HeaderLinks = () => {
  return (
    <div className="hidden md:flex items-center space-x-6">
      <Link to="/" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
        Home
      </Link>
      <Link to="/categories" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
        Categories
      </Link>
      <Link to="/businesses" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
        Businesses
      </Link>
      <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
        About
      </Link>
      <Link to="/influencers" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
        Influencers
      </Link>
    </div>
  );
};

export default HeaderLinks;
