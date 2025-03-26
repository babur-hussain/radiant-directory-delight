import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import UserMenu from './UserMenu';
import AuthModal from './auth/AuthModal';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get auth context with safe defaults
  const { 
    currentUser, 
    user,
    logout,
    isAuthenticated,
    loading,
    initialized
  } = useAuth();
  
  // Helper debugging log (temporary)
  useEffect(() => {
    console.log("Header auth state:", { 
      isAuthenticated, 
      userId: currentUser?.id || user?.id,
      loading,
      initialized
    });
  }, [isAuthenticated, currentUser, user, loading, initialized]);

  const handleDashboardClick = () => {
    if (!isAuthenticated) return;
    
    const userData = currentUser || user;
    
    // Navigate to the appropriate dashboard based on user role
    if (userData?.role === "Admin" || userData?.isAdmin) {
      navigate("/admin");
    } else if (userData?.role === "Influencer") {
      navigate("/dashboard/influencer");
    } else if (userData?.role === "Business") {
      navigate("/dashboard/business");
    } else {
      // Default fallback for users with unspecified roles
      navigate("/profile");
    }
  };

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  // Add explicit logout handler
  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const shouldShowDashboard = () => {
    if (!isAuthenticated) return false;
    return true;
  };

  // Determine if we should show the loading state
  const showLoading = loading && !initialized;
  
  // Don't render auth-dependent UI until we've initialized
  if (showLoading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="container flex items-center justify-between h-16 mx-auto px-4">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent hover:from-indigo-500 hover:via-purple-500 hover:to-violet-500 transition-all duration-300">
              Grow Bharat Vyapaar
            </Link>
          </div>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <div className="container flex items-center justify-between h-16 mx-auto px-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent hover:from-indigo-500 hover:via-purple-500 hover:to-violet-500 transition-all duration-300">
            Grow Bharat Vyapaar
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium hover:text-primary">Home</Link>
          <Link to="/categories" className="text-sm font-medium hover:text-primary">Categories</Link>
          <Link to="/businesses" className="text-sm font-medium hover:text-primary">Businesses</Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary">About</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {shouldShowDashboard() && (
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden md:flex rounded-full"
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
              onClick={handleLoginClick} 
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login / Register
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-3 px-4 space-y-2">
            <Link to="/" className="block py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/categories" className="block py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Categories</Link>
            <Link to="/businesses" className="block py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Businesses</Link>
            <Link to="/about" className="block py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            
            {shouldShowDashboard() && (
              <Button 
                variant="outline" 
                className="w-full justify-start mt-2" 
                onClick={() => {
                  handleDashboardClick();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            )}
            
            {isAuthenticated ? (
              <Button 
                variant="default" 
                className="w-full justify-start mt-2" 
                onClick={handleLogout}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="w-full justify-start mt-2" 
                onClick={() => {
                  handleLoginClick();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login / Register
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onOpenChange={setIsAuthModalOpen} 
      />
    </header>
  );
};

export default Header;
