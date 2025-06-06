
import React from 'react';
import { Link } from 'react-router-dom';

const HeaderLinks = () => {
  return (
    <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
      <Link to="/" className="text-sm font-medium text-gray-700 hover:text-brand-purple transition-colors">
        Home
      </Link>
      <Link to="/categories" className="text-sm font-medium text-gray-700 hover:text-brand-pink transition-colors">
        Categories
      </Link>
      <Link to="/businesses" className="text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors">
        Businesses
      </Link>
      <Link to="/influencers" className="text-sm font-medium text-gray-700 hover:text-brand-orange transition-colors">
        Influencers
      </Link>
      <Link to="/blog" className="text-sm font-medium text-gray-700 hover:text-brand-teal transition-colors">
        Blog
      </Link>
      <Link to="/services" className="text-sm font-medium text-gray-700 hover:text-brand-green transition-colors">
        Services
      </Link>
      <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-brand-yellow transition-colors">
        About Us
      </Link>
    </div>
  );
};

export default HeaderLinks;
