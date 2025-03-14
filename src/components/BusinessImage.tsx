
import React, { useState } from 'react';
import { DEFAULT_BUSINESS_IMAGE } from '@/lib/csv-utils';
import { ImageOff } from 'lucide-react';

interface BusinessImageProps {
  src: string;
  alt: string;
  className?: string;
}

const BusinessImage = ({ src, alt, className = '' }: BusinessImageProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center p-4 text-gray-400">
          <ImageOff className="h-10 w-10 mb-2" />
          <span className="text-xs text-center">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src || DEFAULT_BUSINESS_IMAGE}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
};

export default BusinessImage;
