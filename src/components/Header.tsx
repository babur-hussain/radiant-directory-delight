
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import HeaderLinks from './HeaderLinks';
import UserMenu from './UserMenu';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './auth/AuthModal';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleLoginClick = () => {
    setAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className={`main-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-md' : 'bg-transparent'}`}>
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">G</div>
              <span className="text-lg md:text-2xl font-bold text-gray-900">
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
                <Button variant="outline" className="rounded-full" onClick={handleLoginClick}>
                  Login
                </Button>
                <Button variant="gradient" className="hidden sm:flex rounded-full" onClick={handleRegisterClick}>
                  Register
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
                className="text-gray-800 hover:text-purple-600 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/categories"
                className="text-gray-800 hover:text-pink-500 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                to="/businesses"
                className="text-gray-800 hover:text-blue-500 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Businesses
              </Link>
              <Link
                to="/influencers"
                className="text-gray-800 hover:text-orange-500 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Influencers
              </Link>
              <Link
                to="/blog"
                className="text-gray-800 hover:text-teal-500 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/services"
                className="text-gray-800 hover:text-green-500 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                to="/about"
                className="text-gray-800 hover:text-yellow-500 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              {!isAuthenticated && (
                <div className="pt-4 flex flex-col space-y-3">
                  <Button variant="outline" className="w-full rounded-full" onClick={() => {
                    setMobileMenuOpen(false);
                    handleLoginClick();
                  }}>
                    Login
                  </Button>
                  <Button variant="gradient" className="w-full rounded-full" onClick={() => {
                    setMobileMenuOpen(false);
                    handleRegisterClick();
                  }}>
                    Register
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultTab="login"
      />
    </>
  );
};

export default Header;
