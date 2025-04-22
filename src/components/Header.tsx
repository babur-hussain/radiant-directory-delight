
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
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/99199ab2-5520-497e-a73d-9e95ac7e3c89.png"
              alt="Grow Bharat Vyapaar Logo"
              className="w-8 h-8 object-contain"
            />
            <Link to="/" className="text-xl font-bold text-[#0C3C60]">
              Grow Bharat <span className="text-[#F5962C]">Vyapaar</span>
            </Link>
          </div>
          
          {/* Navigation Links - Desktop */}
          <HeaderLinks />
          
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
