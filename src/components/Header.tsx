
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import HeaderLinks from './HeaderLinks';
import UserMenu from './UserMenu';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './auth/AuthModal';
import MobileMenu from './MobileMenu';
import { useIsMobile } from '@/hooks/use-mobile';

const Header: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
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
      <header className={`main-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 md:px-6">
          <div className="flex items-center min-w-0">
            <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 min-w-0" onClick={closeMobileMenu}>
              <div className="bg-purple-600 rounded-full w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base flex-shrink-0">G</div>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                Grow Bharat
              </span>
            </Link>
          </div>

          {!isMobile && <HeaderLinks />}
          
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
            {loading ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="h-8 sm:h-9 md:h-10 w-12 sm:w-16 md:w-20 bg-gray-200 animate-pulse rounded-full"></div>
                {!isMobile && <div className="h-8 sm:h-9 md:h-10 w-16 sm:w-20 md:w-24 bg-gray-200 animate-pulse rounded-full"></div>}
              </div>
            ) : isAuthenticated && user ? (
              <UserMenu />
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="rounded-full text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 h-7 sm:h-8 md:h-9 lg:h-10" 
                  onClick={handleLoginClick}
                >
                  Login
                </Button>
                <Button 
                  variant="gradient" 
                  className="hidden xs:flex rounded-full text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 h-7 sm:h-8 md:h-9 lg:h-10" 
                  onClick={handleRegisterClick}
                >
                  Register
                </Button>
              </>
            )}

            <button
              className="md:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 z-50 tap-highlight-transparent ml-1"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </header>

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
