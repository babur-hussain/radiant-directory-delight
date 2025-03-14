
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BusinessTableSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const BusinessTableSearch: React.FC<BusinessTableSearchProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search businesses..."
        className="pl-8 w-full"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default BusinessTableSearch;
