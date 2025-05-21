
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

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

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-blue-500/20 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Menu content */}
      <div className="fixed top-16 left-0 right-0 bottom-0 bg-white/80 backdrop-blur-sm shadow-xl border-t border-gray-200/50 overflow-y-auto">
        <div className="py-6 px-5">
          <nav className="flex flex-col">
            <Link
              to="/"
              className="text-gray-800 font-medium py-3 border-b border-gray-100/70 flex items-center space-x-3"
              onClick={handleItemClick}
            >
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span>Home</span>
            </Link>
            
            <Link
              to="/categories"
              className="text-gray-800 font-medium py-3 border-b border-gray-100/70 flex items-center space-x-3"
              onClick={handleItemClick}
            >
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              <span>Categories</span>
            </Link>
            
            <Link
              to="/businesses"
              className="text-gray-800 font-medium py-3 border-b border-gray-100/70 flex items-center space-x-3"
              onClick={handleItemClick}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Businesses</span>
            </Link>
            
            <Link
              to="/influencers"
              className="text-gray-800 font-medium py-3 border-b border-gray-100/70 flex items-center space-x-3"
              onClick={handleItemClick}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span>Influencers</span>
            </Link>
            
            <Link
              to="/blog"
              className="text-gray-800 font-medium py-3 border-b border-gray-100/70 flex items-center space-x-3"
              onClick={handleItemClick}
            >
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>Blog</span>
            </Link>
            
            <Link
              to="/services"
              className="text-gray-800 font-medium py-3 border-b border-gray-100/70 flex items-center space-x-3"
              onClick={handleItemClick}
            >
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Services</span>
            </Link>
            
            <Link
              to="/about"
              className="text-gray-800 font-medium py-3 flex items-center space-x-3"
              onClick={handleItemClick}
            >
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span>About Us</span>
            </Link>
          </nav>
          
          {!isAuthenticated && (
            <div className="mt-6 flex flex-col space-y-3">
              <Button 
                variant="outline" 
                className="w-full rounded-full h-12" 
                onClick={() => handleAuthButtonClick('login')}
              >
                Login
              </Button>
              <Button 
                variant="gradient" 
                className="w-full rounded-full h-12" 
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
