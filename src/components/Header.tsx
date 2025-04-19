
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { Search, LayoutDashboard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import HeaderLinks from './HeaderLinks';

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic here, e.g., navigate to search results page
    console.log('Search submitted:', searchTerm);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">
              Grow Bharat <span className="text-gray-800">Vyapaar</span>
            </Link>
          </div>
          
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/categories" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              Categories
            </Link>
            <Link to="/businesses" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              Businesses
            </Link>
            <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/influencers" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              Influencers
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center">
              <Input
                type="search"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="mr-2"
              />
              <Button type="submit" variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            {/* Dashboard Button */}
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="gap-1">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            
            {/* Auth Buttons or User Menu */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/auth?tab=login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
