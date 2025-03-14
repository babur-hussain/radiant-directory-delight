
import React from 'react';
import { Business } from '@/lib/csv-utils';
import BusinessImage from '@/components/BusinessImage';

interface BusinessDetailsProps {
  business: Business;
}

const BusinessDetails: React.FC<BusinessDetailsProps> = ({ business }) => {
  return (
    <div className="space-y-4">
      <div className="aspect-video overflow-hidden rounded-md">
        <BusinessImage 
          src={business.image} 
          alt={business.name}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Category</p>
          <p className="text-sm">{business.category}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Rating</p>
          <p className="text-sm">{business.rating} ⭐ ({business.reviews} reviews)</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium">Address</p>
          <p className="text-sm">{business.address}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium">Phone</p>
          <p className="text-sm">{business.phone}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium">Description</p>
          <p className="text-sm">{business.description}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium">Tags</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {business.tags.map((tag: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
