
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, Map, Phone, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        isScrolled 
          ? "bg-white/90 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              DirectSpot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-smooth">
              Home
            </Link>
            <Link to="/categories" className="text-sm font-medium hover:text-primary transition-smooth">
              Categories
            </Link>
            <Link to="/businesses" className="text-sm font-medium hover:text-primary transition-smooth">
              Businesses
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-smooth">
              About
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" className="rounded-full transition-smooth">
              <Map className="h-4 w-4 mr-2" />
              Location
            </Button>
            <Button variant="default" size="sm" className="rounded-full transition-smooth">
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-smooth"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300 overflow-hidden",
          isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container max-w-7xl mx-auto px-4 py-4 flex flex-col space-y-4">
          <Link to="/" className="py-2 text-lg font-medium hover:text-primary transition-smooth">
            Home
          </Link>
          <Link to="/categories" className="py-2 text-lg font-medium hover:text-primary transition-smooth">
            Categories
          </Link>
          <Link to="/businesses" className="py-2 text-lg font-medium hover:text-primary transition-smooth">
            Businesses
          </Link>
          <Link to="/about" className="py-2 text-lg font-medium hover:text-primary transition-smooth">
            About
          </Link>
          <div className="pt-2 flex flex-col space-y-3">
            <Button variant="outline" className="justify-start rounded-full w-full transition-smooth">
              <Map className="h-4 w-4 mr-2" />
              Set Location
            </Button>
            <Button variant="default" className="justify-start rounded-full w-full transition-smooth">
              <User className="h-4 w-4 mr-2" />
              Login / Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
