
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface BusinessesFiltersProps {
  categories: string[];
  tags: string[];
  selectedCategory: string | null;
  selectedTags: string[];
  onCategorySelect: (category: string | null) => void;
  onTagsSelect: (tags: string[]) => void;
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
}

const BusinessesFilters: React.FC<BusinessesFiltersProps> = ({
  categories,
  tags,
  selectedCategory,
  selectedTags,
  onCategorySelect,
  onTagsSelect,
  sortBy,
  sortDirection,
  onSort
}) => {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsSelect(selectedTags.filter(t => t !== tag));
    } else {
      onTagsSelect([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onCategorySelect(null);
    onTagsSelect([]);
  };

  const hasActiveFilters = selectedCategory || selectedTags.length > 0;

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === "desc" ? 
      <ChevronDown className="ml-1 h-4 w-4" /> : 
      <ChevronUp className="ml-1 h-4 w-4" />;
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Filter by:</span>
          
          <Select
            value={selectedCategory || ""}
            onValueChange={(value) => onCategorySelect(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Sort by:</span>
          
          <div className="flex gap-2">
            <Button 
              variant={sortBy === "name" ? "default" : "outline"} 
              size="sm"
              onClick={() => onSort("name")}
              className="flex items-center"
            >
              Name {getSortIcon("name")}
            </Button>
            <Button 
              variant={sortBy === "rating" ? "default" : "outline"} 
              size="sm"
              onClick={() => onSort("rating")}
              className="flex items-center"
            >
              Rating {getSortIcon("rating")}
            </Button>
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Tags:</span>
            {tags.map((tag) => (
              <Badge 
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && <Check className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default BusinessesFilters;
