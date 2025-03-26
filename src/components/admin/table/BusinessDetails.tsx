import React from 'react';
import { Business, ensureTagsArray } from '@/types/business';

interface BusinessDetailsProps {
  business: Business;
}

const BusinessDetails: React.FC<BusinessDetailsProps> = ({ business }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Business Details</h2>
      <div>
        <strong>Name:</strong> {business.name}
      </div>
      <div>
        <strong>Category:</strong> {business.category}
      </div>
      <div>
        <strong>Description:</strong> {business.description}
      </div>
      <div>
        <strong>Address:</strong> {business.address}
      </div>
      <div>
        <strong>Phone:</strong> {business.phone}
      </div>
      <div>
        <strong>Email:</strong> {business.email}
      </div>
      <div>
        <strong>Website:</strong> {business.website}
      </div>
      <div>
        <strong>Rating:</strong> {business.rating}
      </div>
      <div>
        <strong>Reviews:</strong> {business.reviews}
      </div>
      <div>
        <strong>Featured:</strong> {business.featured ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Tags:</strong> {ensureTagsArray(business.tags).join(', ')}
      </div>
    </div>
  );
};

export default BusinessDetails;
