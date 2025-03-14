
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: string[];
  visibleCategory: string | null;
  setVisibleCategory: (category: string | null) => void;
}

const CategoryFilter = ({ categories, visibleCategory, setVisibleCategory }: CategoryFilterProps) => {
  const [allCategories, setAllCategories] = useState<string[]>(categories);
  
  // Add custom categories from localStorage if they exist
  useEffect(() => {
    const storedCategories = localStorage.getItem("businessCategories");
    if (storedCategories) {
      const customCategories = JSON.parse(storedCategories).map((cat: { name: string }) => cat.name);
      const combined = [...new Set([...categories, ...customCategories])].filter(Boolean);
      setAllCategories(combined);
    } else {
      setAllCategories(categories);
    }
    
    // Listen for changes to categories
    const handleCategoriesChanged = () => {
      const updatedStored = localStorage.getItem("businessCategories");
      if (updatedStored) {
        const updated = JSON.parse(updatedStored).map((cat: { name: string }) => cat.name);
        const combined = [...new Set([...categories, ...updated])].filter(Boolean);
        setAllCategories(combined);
      }
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
