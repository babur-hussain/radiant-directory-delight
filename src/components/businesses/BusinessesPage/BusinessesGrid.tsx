
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { Business, ensureTagsArray } from "@/types/business";
import BusinessImage from "@/components/BusinessImage";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { createGoogleSearchUrl } from "@/lib/utils";

interface BusinessesGridProps {
  businesses: Business[];
  clearAllFilters: () => void;
}

const BusinessesGrid: React.FC<BusinessesGridProps> = ({ businesses, clearAllFilters }) => {
  if (businesses.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg mb-12">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No businesses found</h3>
        <p className="text-gray-600">Try adjusting your search or filters to find what you're looking for.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={clearAllFilters}
        >
          Clear All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {businesses.map(business => (
        <Card key={business.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="relative h-48 overflow-hidden">
            <BusinessImage 
              src={business.image} 
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {business.featured && (
              <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded">
                Featured
              </span>
            )}
            <div className="absolute top-3 right-3 flex flex-wrap gap-1 max-w-[70%] justify-end">
              {ensureTagsArray(business.tags).slice(0, 2).map((tag, i) => (
                <span key={i} className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <h3 className="font-semibold text-xl text-gray-900 group-hover:text-primary transition-colors">
                {business.name}
              </h3>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm ml-1">{business.rating}</span>
                <span className="text-xs text-gray-500 ml-1">({business.reviews})</span>
              </div>
            </div>
            <span className="text-sm text-gray-500">{business.category}</span>
          </CardHeader>
          
          <CardContent className="pb-2">
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{business.description}</p>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <MapPin className="h-4 w-4 mr-1 shrink-0" />
              <span className="truncate">{business.address}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Phone className="h-4 w-4 mr-1 shrink-0" />
              <span>{business.phone}</span>
            </div>
            
            {/* Collapsible Tags Section */}
            {ensureTagsArray(business.tags).length > 0 && (
              <CollapsibleTagsSection tags={ensureTagsArray(business.tags)} />
            )}
          </CardContent>
          
          <CardFooter className="pt-2">
            <Button variant="outline" className="w-full" asChild>
              <a 
                href={createGoogleSearchUrl(business.name, business.address)}
                target="_blank" 
                rel="noopener noreferrer"
              >
                View Details
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

interface CollapsibleTagsSectionProps {
  tags: string[];
}

const CollapsibleTagsSection: React.FC<CollapsibleTagsSectionProps> = ({ tags }) => {
  const [isOpen, setIsOpen] = useState(false);
  const maxVisibleTags = 3;
  const hasMoreTags = tags.length > maxVisibleTags;

  return (
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
  );
};

export default BusinessesGrid;
