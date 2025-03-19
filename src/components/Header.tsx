
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AuthModal from './auth/AuthModal';
import UserMenu from './UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get auth context with safe defaults
  const { 
    currentUser = null, 
    logout = async () => {}, 
    initialized = false 
  } = useAuth();
  
  const isAuthenticated = !!currentUser;
  const user = currentUser;
  
  // Simple header when auth isn't initialized
  if (!initialized) {
    return (
      <header className="main-header">
        <div className="container">
          <div className="logo-container">
            <Link to="/" className="logo-text">
              Grow Bharat Vyapaar
            </Link>
          </div>
          
          <div className="actions">
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      </header>
    );
  }

  const handleDashboardClick = () => {
    if (!isAuthenticated || !user) return;
    
    if (user.role === "Business") {
      navigate("/business-dashboard");
    } else if (user.role === "Influencer") {
      navigate("/influencer-dashboard");
    } else {
      navigate("/admin/dashboard");
    }
  };

  const shouldShowDashboard = () => {
    if (!isAuthenticated || !user) return false;
    return true;
  };

  return (
    <header className="main-header">
      <div className="container">
        {/* Logo */}
        <div className="logo-container">
          <Link to="/" className="logo-text">
            Grow Bharat Vyapaar
          </Link>
        </div>

        {/* Navigation */}
        <nav>
          <Link to="/">Home</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/businesses">Businesses</Link>
          <Link to="/about">About</Link>
        </nav>

        {/* Actions */}
        <div className="actions">
          {shouldShowDashboard() && (
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full"
              onClick={handleDashboardClick}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          )}
          
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full" 
              onClick={() => setIsAuthModalOpen(true)} 
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login / Register
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button p-2 rounded-md text-gray-600 hover:text-gray-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'visible' : ''}`}>
        <Link to="/">Home</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/businesses">Businesses</Link>
        <Link to="/about">About</Link>
        
        {shouldShowDashboard() && (
          <Button 
            variant="outline" 
            className="justify-start w-full mt-4" 
            onClick={handleDashboardClick}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        )}
        
        {isAuthenticated ? (
          <Button 
            variant="default" 
            className="justify-start w-full mt-2" 
            onClick={logout}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Logout
          </Button>
        ) : (
          <Button 
            variant="default" 
            className="justify-start w-full mt-2" 
            onClick={() => {
              setIsAuthModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login / Register
          </Button>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </header>
  );
};

export default Header;
