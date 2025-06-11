import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

// Default business image - a placeholder image for businesses without images
export const DEFAULT_BUSINESS_IMAGE = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500&h=350&auto=format&fit=crop";

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
