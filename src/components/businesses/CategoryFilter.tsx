
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface CategoryFilterProps {
  categories: string[];
  visibleCategory: string | null;
  setVisibleCategory: (category: string | null) => void;
}

const CategoryFilter = ({ categories, visibleCategory, setVisibleCategory }: CategoryFilterProps) => {
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
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
          // Fallback to provided categories if database fetch fails
          setAllCategories(categories.filter(Boolean));
          return;
        }
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map(item => item.category).filter(Boolean))
        ).sort();
        
        console.log('Fetched categories from database:', uniqueCategories);
        
        // Combine with any additional categories from props and localStorage
        const storedCategories = localStorage.getItem("businessCategories");
        let customCategories: string[] = [];
        
        if (storedCategories) {
          try {
            customCategories = JSON.parse(storedCategories).map((cat: { name: string }) => cat.name);
          } catch (e) {
            console.error('Error parsing stored categories:', e);
          }
        }
        
        const combined = [...new Set([...uniqueCategories, ...categories, ...customCategories])].filter(Boolean);
        setAllCategories(combined);
      } catch (err) {
        console.error('Unexpected error fetching categories:', err);
        // Fallback to provided categories
        setAllCategories(categories.filter(Boolean));
      }
    };
    
    fetchCategories();
    
    // Listen for changes to categories
    const handleCategoriesChanged = () => {
      fetchCategories();
    };
    
    window.addEventListener("categoriesChanged", handleCategoriesChanged);
    
    return () => {
      window.removeEventListener("categoriesChanged", handleCategoriesChanged);
    };
  }, [categories]);
  
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      <Button
        variant={visibleCategory === null ? "default" : "outline"}
        className="rounded-full text-sm transition-smooth"
        onClick={() => setVisibleCategory(null)}
      >
        All
      </Button>
      {allCategories.map(category => (
        <Button
          key={category}
          variant={visibleCategory === category ? "default" : "outline"}
          className="rounded-full text-sm transition-smooth"
          onClick={() => setVisibleCategory(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
