
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
    
    // Add class to body when mobile menu is open to prevent scrolling
    if (mobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
      document.body.classList.remove('overflow-hidden');
    };
  }, [scrolled, mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    console.log("Mobile menu toggled:", !mobileMenuOpen); // Debug log
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

        {/* Mobile Menu - Now with a beautiful transparent blur gradient */}
        <div 
          className={`md:hidden fixed inset-0 z-40 transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-blue-500/30 backdrop-blur-lg" onClick={closeMobileMenu}></div>
          <div className="fixed top-16 left-0 right-0 bottom-0 bg-white/80 backdrop-blur-md shadow-xl border-t border-gray-200 z-50 overflow-y-auto h-[calc(100vh-4rem)]">
            <div className="py-6 px-6">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className="text-gray-800 hover:text-purple-600 py-3 border-b border-gray-100 tap-highlight-transparent flex items-center font-medium"
                  onClick={closeMobileMenu}
                >
                  <span className="text-purple-600 mr-2">•</span>
                  Home
                </Link>
                <Link
                  to="/categories"
                  className="text-gray-800 hover:text-pink-500 py-3 border-b border-gray-100 tap-highlight-transparent flex items-center font-medium"
                  onClick={closeMobileMenu}
                >
                  <span className="text-pink-500 mr-2">•</span>
                  Categories
                </Link>
                <Link
                  to="/businesses"
                  className="text-gray-800 hover:text-blue-500 py-3 border-b border-gray-100 tap-highlight-transparent flex items-center font-medium"
                  onClick={closeMobileMenu}
                >
                  <span className="text-blue-500 mr-2">•</span>
                  Businesses
                </Link>
                <Link
                  to="/influencers"
                  className="text-gray-800 hover:text-orange-500 py-3 border-b border-gray-100 tap-highlight-transparent flex items-center font-medium"
                  onClick={closeMobileMenu}
                >
                  <span className="text-orange-500 mr-2">•</span>
                  Influencers
                </Link>
                <Link
                  to="/blog"
                  className="text-gray-800 hover:text-teal-500 py-3 border-b border-gray-100 tap-highlight-transparent flex items-center font-medium"
                  onClick={closeMobileMenu}
                >
                  <span className="text-teal-500 mr-2">•</span>
                  Blog
                </Link>
                <Link
                  to="/services"
                  className="text-gray-800 hover:text-green-500 py-3 border-b border-gray-100 tap-highlight-transparent flex items-center font-medium"
                  onClick={closeMobileMenu}
                >
                  <span className="text-green-500 mr-2">•</span>
                  Services
                </Link>
                <Link
                  to="/about"
                  className="text-gray-800 hover:text-yellow-500 py-3 tap-highlight-transparent flex items-center font-medium"
                  onClick={closeMobileMenu}
                >
                  <span className="text-yellow-500 mr-2">•</span>
                  About Us
                </Link>
                {!isAuthenticated && (
                  <div className="pt-6 flex flex-col space-y-3">
                    <Button variant="outline" className="w-full rounded-full h-12" onClick={() => {
                      closeMobileMenu();
                      handleLoginClick();
                    }}>
                      Login
                    </Button>
                    <Button variant="gradient" className="w-full rounded-full h-12" onClick={() => {
                      closeMobileMenu();
                      handleRegisterClick();
                    }}>
                      Register
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultTab={initialTab}
      />
    </>
  );
};

export default Header;
