
import React from "react";
import { Button } from "@/components/ui/button";

interface DesktopFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLocation: string | null;
  setSelectedLocation: (location: string | null) => void;
  locations: string[];
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
  clearAllFilters: () => void;
}

const DesktopFilters: React.FC<DesktopFiltersProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  locations,
  selectedRating,
  setSelectedRating,
  clearAllFilters
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
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
          <label className="text-sm font-medium mb-1 block">Location</label>
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
          <label className="text-sm font-medium mb-1 block">Rating</label>
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
      </div>
      
      <div className="flex justify-end mt-4">
        <Button variant="outline" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>
    </>
  );
};

export default DesktopFilters;
