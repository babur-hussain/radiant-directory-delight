
import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import BusinessImage from '@/components/BusinessImage';
import { useIsMobile } from '@/hooks/use-mobile';

export interface BusinessResult {
  id: number;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  address: string;
  description: string;
  tags: string[];
  location: string;
}

interface SearchResultsProps {
  results: BusinessResult[];
  isLoading: boolean;
  visible: boolean;
  onResultClick: (id: number) => void;
  onClose: () => void;
}

const SearchResults = ({ results, isLoading, visible, onResultClick, onClose }: SearchResultsProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const resultsRef = useRef<HTMLDivElement>(null);

  // If not visible, don't render anything
  if (!visible) return null;

  console.log("Rendering search results:", results.length, "items");

  return (
    <div 
      ref={resultsRef}
      className="bg-white shadow-2xl border border-gray-100 rounded-xl overflow-hidden"
      style={{ 
        maxHeight: isMobile ? '60vh' : '50vh'
      }}
    >
      <div className="h-full flex flex-col">
        <div className="sticky top-0 z-10 flex justify-between items-center bg-white p-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-700 text-sm">Search Results</h3>
            {!isLoading && results.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {results.length} found
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close search results"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
                <p className="mt-2 text-sm text-gray-500">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No results found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="p-3">
                <div className="space-y-2">
                  {results.slice(0, 8).map((result) => (
                    <Card 
                      key={result.id} 
                      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-gray-100"
                      onClick={() => onResultClick(result.id)}
                    >
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="w-16 h-16 flex-shrink-0">
                            <BusinessImage 
                              src={result.image} 
                              alt={result.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3 flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900 text-sm truncate">{result.name}</h4>
                              <div className="flex items-center text-amber-500 ml-2">
                                <Star className="h-3 w-3 fill-current" />
                                <span className="ml-1 text-xs">{result.rating}</span>
                              </div>
                            </div>
                            <div className="flex items-center text-gray-500 text-xs mt-1">
                              <span className="bg-gray-100 rounded-full px-2 py-0.5 mr-2 text-xs">{result.category}</span>
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">{result.location}</span>
                            </div>
                            {result.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {result.tags.slice(0, 2).map((tag, index) => (
                                  <span 
                                    key={index} 
                                    className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {results.length > 8 && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/businesses');
                      }}
                      className="text-sm text-primary hover:text-primary/80 underline"
                    >
                      View all {results.length} results
                    </button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
