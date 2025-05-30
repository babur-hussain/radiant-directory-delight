
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ 
  isOpen, 
  onToggle, 
  className = '' 
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={isOpen ? 'Close mobile menu' : 'Open mobile menu'}
      aria-expanded={isOpen}
      className={`md:hidden relative z-50 min-h-[44px] min-w-[44px] ${className}`}
    >
      <div className="relative w-6 h-6">
        <Menu 
          className={`absolute inset-0 transition-all duration-200 ${
            isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
          }`} 
        />
        <X 
          className={`absolute inset-0 transition-all duration-200 ${
            isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
          }`} 
        />
      </div>
    </Button>
  );
};

export default MobileMenuToggle;
