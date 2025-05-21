
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import HeaderLinks from './HeaderLinks';
import UserMenu from './UserMenu';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    // Set loading state to false after a brief delay to simulate auth loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [scrolled]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="main-header bg-white/80 backdrop-blur-lg shadow-md transition-all duration-300">
      <div className="container h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-brand-purple to-brand-pink rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">G</div>
            <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-blue">
              Grow Bharat
            </span>
          </Link>
        </div>

        <HeaderLinks />
        
        <div className="flex items-center space-x-3">
          {isLoading ? (
            <div className="h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : isAuthenticated && user ? (
            <UserMenu />
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="gradient" className="hidden sm:flex" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden flex items-center"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-16 left-0 right-0 z-50 py-4 px-6 border-t">
          <nav className="flex flex-col space-y-4">
            <Link
              to="/"
              className="text-gray-800 hover:text-brand-purple py-2 border-b border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/categories"
              className="text-gray-800 hover:text-brand-pink py-2 border-b border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              to="/businesses"
              className="text-gray-800 hover:text-brand-blue py-2 border-b border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Businesses
            </Link>
            <Link
              to="/influencers"
              className="text-gray-800 hover:text-brand-orange py-2 border-b border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Influencers
            </Link>
            <Link
              to="/blog"
              className="text-gray-800 hover:text-brand-teal py-2 border-b border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              to="/services"
              className="text-gray-800 hover:text-brand-green py-2 border-b border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/about"
              className="text-gray-800 hover:text-brand-yellow py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            {!isAuthenticated && (
              <div className="pt-4 flex flex-col space-y-3">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button variant="gradient" asChild className="w-full">
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
