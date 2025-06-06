
import React from 'react';
import { Business } from '@/lib/csv-utils';
import BusinessImage from '@/components/BusinessImage';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BusinessDetailsProps {
  business: Business;
}

const BusinessDetails: React.FC<BusinessDetailsProps> = ({ business }) => {
  const [tagsOpen, setTagsOpen] = React.useState(false);
  const maxVisibleTags = 5;
  const hasMoreTags = business.tags.length > maxVisibleTags;

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
          <Collapsible open={tagsOpen} onOpenChange={setTagsOpen} className="mt-1">
            <div className="flex flex-wrap gap-1">
              {business.tags.slice(0, maxVisibleTags).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {tag}
                </span>
              ))}
              
              {hasMoreTags && (
                <CollapsibleTrigger asChild>
                  <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 underline px-2 py-1">
                    {tagsOpen ? (
                      <>Show Less <ChevronUp className="h-3 w-3" /></>
                    ) : (
                      <>Show All ({business.tags.length}) <ChevronDown className="h-3 w-3" /></>
                    )}
                  </button>
                </CollapsibleTrigger>
              )}
            </div>
            
            <CollapsibleContent>
              <div className="flex flex-wrap gap-1 mt-1">
                {business.tags.slice(maxVisibleTags).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
