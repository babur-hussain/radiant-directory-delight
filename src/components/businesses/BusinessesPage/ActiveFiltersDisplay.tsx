
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActiveFiltersDisplayProps {
  selectedCategory: string;
  selectedLocation: string | null;
  selectedRating: string;
  featuredOnly: boolean;
  activeTags: string[];
  setSelectedCategory: (category: string) => void;
  setSelectedLocation: (location: string | null) => void;
  setSelectedRating: (rating: string) => void;
  setFeaturedOnly: (featured: boolean) => void;
  toggleTag: (tag: string) => void;
  clearAllFilters: () => void;
  activeFilterCount: number;
}

const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = ({
  selectedCategory,
  selectedLocation,
  selectedRating,
  featuredOnly,
  activeTags,
  setSelectedCategory,
  setSelectedLocation,
  setSelectedRating,
  setFeaturedOnly,
  toggleTag,
  clearAllFilters,
  activeFilterCount
}) => {
  if (activeFilterCount === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">Active filters:</span>
      
      {selectedCategory && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Category: {selectedCategory}
          <button 
            className="ml-1 h-4 w-4 rounded-full bg-gray-200 inline-flex items-center justify-center text-gray-500"
            onClick={() => setSelectedCategory("")}
          >
            ×
          </button>
        </Badge>
      )}
      
      {selectedLocation && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Location: {selectedLocation}
          <button 
            className="ml-1 h-4 w-4 rounded-full bg-gray-200 inline-flex items-center justify-center text-gray-500"
            onClick={() => setSelectedLocation(null)}
          >
            ×
          </button>
        </Badge>
      )}
      
      {selectedRating && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Rating: {selectedRating}
          <button 
            className="ml-1 h-4 w-4 rounded-full bg-gray-200 inline-flex items-center justify-center text-gray-500"
            onClick={() => setSelectedRating("")}
          >
            ×
          </button>
        </Badge>
      )}
      
      {featuredOnly && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Featured Only
          <button 
            className="ml-1 h-4 w-4 rounded-full bg-gray-200 inline-flex items-center justify-center text-gray-500"
            onClick={() => setFeaturedOnly(false)}
          >
            ×
          </button>
        </Badge>
      )}
      
      {activeTags.map(tag => (
        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
          {tag}
          <button 
            className="ml-1 h-4 w-4 rounded-full bg-gray-200 inline-flex items-center justify-center text-gray-500"
            onClick={() => toggleTag(tag)}
          >
            ×
          </button>
        </Badge>
      ))}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 text-xs"
        onClick={clearAllFilters}
      >
        Clear all
      </Button>
    </div>
  );
};

export default ActiveFiltersDisplay;
