
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useLocation } from 'react-router-dom';
import { Home, Grid, Store, Users, BookOpen, Briefcase, Info } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  onLoginClick,
  onRegisterClick
}) => {
  const location = useLocation();
  
  // Add effect to prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  // If not open, don't render the menu
  if (!isOpen) return null;

  const handleItemClick = () => {
    onClose();
  };

  const handleAuthButtonClick = (action: 'login' | 'register') => {
    onClose();
    if (action === 'login') {
      onLoginClick();
    } else {
      onRegisterClick();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed inset-0 z-40 flex flex-col">
      {/* Enhanced backdrop with beautiful blur gradient effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-blue-500/30 backdrop-blur-lg animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Menu content with beautiful styling */}
      <div className="fixed top-16 left-0 right-0 bottom-0 bg-white/90 backdrop-blur-md shadow-xl border-t border-gray-200/50 overflow-y-auto z-50 animate-slideIn">
        <div className="py-6 px-5 max-h-[calc(100vh-64px)] overflow-auto">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              className={`text-gray-800 font-medium py-4 border-b border-gray-100/70 flex items-center space-x-3 tap-highlight-transparent transition-colors ${isActive('/') ? 'text-purple-600 font-semibold' : 'hover:text-purple-600'}`}
              onClick={handleItemClick}
            >
              <Home className={`w-5 h-5 ${isActive('/') ? 'text-purple-600' : 'text-gray-500'}`} />
              <span>Home</span>
            </Link>
            
            <Link
              to="/categories"
              className={`text-gray-800 font-medium py-4 border-b border-gray-100/70 flex items-center space-x-3 tap-highlight-transparent transition-colors ${isActive('/categories') ? 'text-pink-500 font-semibold' : 'hover:text-pink-500'}`}
              onClick={handleItemClick}
            >
              <Grid className={`w-5 h-5 ${isActive('/categories') ? 'text-pink-500' : 'text-gray-500'}`} />
              <span>Categories</span>
            </Link>
            
            <Link
              to="/businesses"
              className={`text-gray-800 font-medium py-4 border-b border-gray-100/70 flex items-center space-x-3 tap-highlight-transparent transition-colors ${isActive('/businesses') ? 'text-blue-500 font-semibold' : 'hover:text-blue-500'}`}
              onClick={handleItemClick}
            >
              <Store className={`w-5 h-5 ${isActive('/businesses') ? 'text-blue-500' : 'text-gray-500'}`} />
              <span>Businesses</span>
            </Link>
            
            <Link
              to="/influencers"
              className={`text-gray-800 font-medium py-4 border-b border-gray-100/70 flex items-center space-x-3 tap-highlight-transparent transition-colors ${isActive('/influencers') ? 'text-orange-500 font-semibold' : 'hover:text-orange-500'}`}
              onClick={handleItemClick}
            >
              <Users className={`w-5 h-5 ${isActive('/influencers') ? 'text-orange-500' : 'text-gray-500'}`} />
              <span>Influencers</span>
            </Link>
            
            <Link
              to="/blog"
              className={`text-gray-800 font-medium py-4 border-b border-gray-100/70 flex items-center space-x-3 tap-highlight-transparent transition-colors ${isActive('/blog') ? 'text-teal-500 font-semibold' : 'hover:text-teal-500'}`}
              onClick={handleItemClick}
            >
              <BookOpen className={`w-5 h-5 ${isActive('/blog') ? 'text-teal-500' : 'text-gray-500'}`} />
              <span>Blog</span>
            </Link>
            
            <Link
              to="/services"
              className={`text-gray-800 font-medium py-4 border-b border-gray-100/70 flex items-center space-x-3 tap-highlight-transparent transition-colors ${isActive('/services') ? 'text-green-500 font-semibold' : 'hover:text-green-500'}`}
              onClick={handleItemClick}
            >
              <Briefcase className={`w-5 h-5 ${isActive('/services') ? 'text-green-500' : 'text-gray-500'}`} />
              <span>Services</span>
            </Link>
            
            <Link
              to="/about"
              className={`text-gray-800 font-medium py-4 flex items-center space-x-3 tap-highlight-transparent transition-colors ${isActive('/about') ? 'text-yellow-500 font-semibold' : 'hover:text-yellow-500'}`}
              onClick={handleItemClick}
            >
              <Info className={`w-5 h-5 ${isActive('/about') ? 'text-yellow-500' : 'text-gray-500'}`} />
              <span>About Us</span>
            </Link>
          </nav>
          
          {!isAuthenticated && (
            <div className="mt-8 flex flex-col space-y-4">
              <Button 
                variant="outline" 
                className="w-full rounded-full h-12 text-base" 
                onClick={() => handleAuthButtonClick('login')}
              >
                Login
              </Button>
              <Button 
                variant="gradient" 
                className="w-full rounded-full h-12 text-base" 
                onClick={() => handleAuthButtonClick('register')}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
