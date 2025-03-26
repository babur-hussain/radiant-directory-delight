
import { useState } from 'react';
import { Star, MapPin, Phone, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import BusinessImage from '@/components/BusinessImage';
import { Business } from '@/lib/csv/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { createGoogleSearchUrl } from '@/lib/utils';

interface BusinessCardProps {
  business: Business;
}

const BusinessCard = ({ business }: BusinessCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const maxVisibleTags = 2;
  
  // Handle potentially missing or malformed tags with improved type checking
  let tags: string[] = [];
  
  if (Array.isArray(business.tags)) {
    tags = business.tags;
  } else if (typeof business.tags === 'string' && business.tags.trim() !== '') {
    tags = business.tags.split(',').map(t => t.trim());
  }
  
  const hasMoreTags = tags.length > maxVisibleTags;

  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-smooth">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <BusinessImage 
          src={business.image} 
          alt={business.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {business.featured && (
          <span className="absolute top-3 left-3 bg-primary/90 text-white text-xs px-2 py-1 rounded-md">
            Featured
          </span>
        )}
        <div className="absolute top-3 right-3 flex gap-1">
          {tags.length > 0 && tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index} 
              className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-smooth">
            {business.name}
          </h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-gray-700 ml-1">{business.rating}</span>
            <span className="text-xs text-gray-400 ml-1">({business.reviews})</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{business.description}</p>
        
        {business.address && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{business.address}</span>
          </div>
        )}
        
        {business.phone && (
          <div className="flex items-center text-sm text-gray-500">
            <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{business.phone}</span>
          </div>
        )}
        
        {/* Collapsible Tags Section */}
        {tags.length > 0 && (
          <div className="mt-3">
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, maxVisibleTags).map((tag, index) => (
                  <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
                
                {hasMoreTags && (
                  <CollapsibleTrigger asChild>
                    <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 underline">
                      {isOpen ? (
                        <>Show Less <ChevronUp className="h-3 w-3" /></>
                      ) : (
                        <>Show All ({tags.length}) <ChevronDown className="h-3 w-3" /></>
                      )}
                    </button>
                  </CollapsibleTrigger>
                )}
              </div>
              
              <CollapsibleContent>
                <div className="flex flex-wrap gap-1 pt-1">
                  {tags.slice(maxVisibleTags).map((tag, index) => (
                    <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs font-medium text-gray-500">{business.category}</span>
        <a 
          href={createGoogleSearchUrl(business.name, business.address || '')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-xs font-medium text-primary hover:text-primary/90 transition-smooth"
        >
          View Details
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default BusinessCard;
