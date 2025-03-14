
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ExternalLink, X, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  if (!visible) return null;

  return (
    <div 
      className={cn(
        "fixed left-0 right-0 top-[70px] z-50 bg-white shadow-2xl transition-all duration-200 border-t border-gray-100 flex flex-col",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      style={{ height: 'calc(100vh - 70px)' }}
    >
      <div className="container max-w-7xl mx-auto h-full">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          <div className="sticky top-0 z-10 flex justify-between items-center bg-white p-4 border-b">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-700">Search Results</h3>
              {!isLoading && results.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {results.length} found
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-sm"
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
              </Button>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate('/businesses')}
                className="text-sm"
              >
                View all <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="mt-2 text-sm text-gray-500">Searching...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No results found</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="p-4">
                  <div className="space-y-3">
                    {results.map((result) => (
                      <Card 
                        key={result.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => onResultClick(result.id)}
                      >
                        <CardContent className="p-0">
                          <div className="flex">
                            <div className="w-24 h-24 flex-shrink-0">
                              <img 
                                src={result.image} 
                                alt={result.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-3 flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-gray-900 truncate">{result.name}</h4>
                                <div className="flex items-center text-amber-500">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="ml-1 text-sm">{result.rating}</span>
                                  <span className="ml-1 text-xs text-gray-400">({result.reviews})</span>
                                </div>
                              </div>
                              <div className="flex items-center text-gray-500 text-xs mt-1">
                                <span className="bg-gray-100 rounded-full px-2 py-0.5 mr-2">{result.category}</span>
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="truncate">{result.address}</span>
                              </div>
                              <p className="text-gray-600 text-sm mt-1 line-clamp-1">
                                {result.description}
                              </p>
                              <div className="flex gap-1 mt-2">
                                {result.tags.slice(0, 3).map((tag, index) => (
                                  <span 
                                    key={index} 
                                    className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
