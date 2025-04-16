
import React from 'react';
import { Link } from 'react-router-dom';

const HeaderLinks = () => {
  return (
    <div className="flex items-center gap-4">
      <Link
        to="/influencers"
        className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
      >
        Influencers
      </Link>
    </div>
  );
};

export default HeaderLinks;
