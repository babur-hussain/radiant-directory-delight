
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import HeaderLinks from './HeaderLinks';
import UserMenu from './UserMenu';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './auth/AuthModal';
import MobileMenu from './MobileMenu';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<'login' | 'register'>('login');
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
    setInitialTab('login');
    setAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setInitialTab('register');
    setAuthModalOpen(true);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`main-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-purple-600 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white font-bold">G</div>
              <span className="text-lg md:text-2xl font-bold text-gray-900">
                Grow Bharat
              </span>
            </Link>
          </div>

          <HeaderLinks />
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isLoading ? (
              <div className="h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : isAuthenticated && user ? (
              <UserMenu />
            ) : (
              <>
                <Button variant="outline" className="rounded-full text-sm px-3 py-1 h-9 sm:h-10 sm:px-4 sm:py-2" onClick={handleLoginClick}>
                  Login
                </Button>
                <Button variant="gradient" className="hidden sm:flex rounded-full text-sm px-3 py-1 h-9 sm:h-10 sm:px-4 sm:py-2" onClick={handleRegisterClick}>
                  Register
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden flex items-center justify-center w-10 h-10 tap-highlight-transparent z-50"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            type="button"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </header>

      {/* Use our MobileMenu component */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={closeMobileMenu} 
        isAuthenticated={isAuthenticated}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultTab={initialTab}
      />
    </>
  );
};

export default Header;
