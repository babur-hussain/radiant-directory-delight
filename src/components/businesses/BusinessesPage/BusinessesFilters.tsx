
import React, { useEffect, useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

interface BusinessesFiltersProps {
  categories: string[];
  locations: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLocation: string | null;
  setSelectedLocation: (location: string | null) => void;
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
  featuredOnly: boolean;
  setFeaturedOnly: (featured: boolean) => void;
}

const BusinessesFilters: React.FC<BusinessesFiltersProps> = ({
  categories,
  locations,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  selectedRating,
  setSelectedRating,
  featuredOnly,
  setFeaturedOnly
}) => {
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch unique categories from the businesses table
        const { data, error } = await supabase
          .from('businesses')
          .select('category')
          .not('category', 'is', null)
          .not('category', 'eq', '');
        
        if (error) {
          console.error('Error fetching categories:', error);
          setDbCategories(categories);
          return;
        }
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map(item => item.category).filter(Boolean))
        ).sort();
        
        // Combine with provided categories
        const combined = [...new Set([...uniqueCategories, ...categories])].filter(Boolean);
        setDbCategories(combined);
      } catch (err) {
        console.error('Unexpected error fetching categories:', err);
        setDbCategories(categories);
      }
    };
    
    fetchCategories();
  }, [categories]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="font-medium text-lg mb-4">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {dbCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <Select 
            value={selectedLocation || ""} 
            onValueChange={val => setSelectedLocation(val || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Location</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Rating</label>
          <Select value={selectedRating} onValueChange={setSelectedRating}>
            <SelectTrigger>
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Rating</SelectItem>
              <SelectItem value="4+">4+ Stars</SelectItem>
              <SelectItem value="3+">3+ Stars</SelectItem>
              <SelectItem value="2+">2+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="featured-filter" 
            checked={featuredOnly}
            onCheckedChange={(checked) => 
              setFeaturedOnly(checked === true)
            }
          />
          <label 
            htmlFor="featured-filter"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Featured Only
          </label>
        </div>
      </div>
    </div>
  );
};

export default BusinessesFilters;
