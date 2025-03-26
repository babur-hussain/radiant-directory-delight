
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
      try {
        const parsedCategories = JSON.parse(storedCategories);
        return Array.isArray(parsedCategories) 
          ? parsedCategories.filter(cat => cat && cat.name && cat.name.trim() !== "").map(cat => cat.name)
          : [];
      } catch (e) {
        console.error("Error parsing categories:", e);
        return [];
      }
    }
    return [];
  }, []);
  
  // Filter out empty locations
  const filteredLocations = locations.filter(loc => loc && loc.trim() !== "");
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <select 
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || "")}
            className="w-full p-2 border rounded text-gray-900 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category || "other"}>
                {category || "Other"}
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
            {filteredLocations.map(location => (
              <option key={location} value={location || "unknown"}>
                {location || "Unknown"}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Rating</label>
          <select 
            value={selectedRating || ""} 
            onChange={(e) => setSelectedRating(e.target.value || "")}
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
