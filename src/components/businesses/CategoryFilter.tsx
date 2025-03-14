
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: string[];
  visibleCategory: string | null;
  setVisibleCategory: (category: string | null) => void;
}

const CategoryFilter = ({ categories, visibleCategory, setVisibleCategory }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      <Button
        variant={visibleCategory === null ? "default" : "outline"}
        className="rounded-full text-sm transition-smooth"
        onClick={() => setVisibleCategory(null)}
      >
        All
      </Button>
      {categories.map(category => (
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
