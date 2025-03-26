import React from 'react';
import { Business, ensureTagsArray } from '@/types/business';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface BusinessCardProps {
  business: Business;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const tags = ensureTagsArray(business.tags);
  
  return (
    <Link href={`/business/${business.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
      <div className="relative">
        <img
          className="w-full h-48 object-cover"
          src={business.image || "https://via.placeholder.com/400x300"}
          alt={business.name}
        />
        <div className="absolute top-2 left-2 bg-primary text-white text-sm py-1 px-2 rounded-md z-10">
          Featured
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{business.name}</h3>
        <div className="flex items-center mb-2">
          <Star className="h-5 w-5 text-yellow-500 mr-1" />
          <span className="text-gray-700">{business.rating}</span>
          <span className="text-gray-500 ml-1">({business.reviews} reviews)</span>
        </div>
        <p className="text-gray-600 text-sm mb-3">{business.description?.substring(0, 100)}...</p>
        <div className="flex flex-wrap">
          {tags.map((tag, index) => (
            <span key={index} className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1 mr-2 mb-2">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default BusinessCard;
