
import React from "react";
import { Button } from "@/components/ui/button";

interface MobileFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLocation: string | null;
  setSelectedLocation: (location: string | null) => void;
  locations: string[];
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
  featuredOnly: boolean;
  setFeaturedOnly: (featured: boolean) => void;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  locations,
  selectedRating,
  setSelectedRating,
  featuredOnly,
  setFeaturedOnly
}) => {
  // Get categories from localStorage or use empty array
  const categories = React.useMemo(() => {
    const storedCategories = localStorage.getItem("businessCategories");
    if (storedCategories) {
      return JSON.parse(storedCategories).map((cat: { name: string }) => cat.name);
    }
    return [];
  }, []);

  return (
    <div className="py-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Category</h3>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border rounded text-gray-900 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Location</h3>
        <select 
          value={selectedLocation || ""} 
          onChange={(e) => setSelectedLocation(e.target.value || null)}
          className="w-full p-2 border rounded text-gray-900 bg-white"
        >
          <option value="">Any Location</option>
          {locations.map(location => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Rating</h3>
        <select 
          value={selectedRating} 
          onChange={(e) => setSelectedRating(e.target.value)}
          className="w-full p-2 border rounded text-gray-900 bg-white"
        >
          <option value="">Any Rating</option>
          <option value="4+">4+ Stars</option>
          <option value="3+">3+ Stars</option>
          <option value="2+">2+ Stars</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          id="featured-mobile" 
          checked={featuredOnly}
          onChange={(e) => setFeaturedOnly(e.target.checked)}
          className="text-primary border-gray-300 focus:ring-primary"
        />
        <label 
          htmlFor="featured-mobile"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Featured Only
        </label>
      </div>
    </div>
  );
};

export default MobileFilters;
