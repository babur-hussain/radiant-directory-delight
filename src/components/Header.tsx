
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AuthModal from './auth/AuthModal';
import UserMenu from './UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

const Header = () => {
  console.log("Header component rendering start"); // Debug log

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useAuth();
  const {
    currentUser,
    logout,
    initialized
  } = auth;
  
  const isAuthenticated = !!currentUser;
  const user = currentUser;
  
  const { getUserSubscription } = useSubscription();
  
  // Fetch subscription data when user changes
  useEffect(() => {
    console.log("Header useEffect for subscription");
    const fetchSubscription = async () => {
      if (user?.uid) {
        try {
          const subscription = await getUserSubscription();
          console.log("Fetched subscription:", subscription);
          setSubscriptionStatus(subscription?.status || null);
        } catch (error) {
          console.error("Failed to fetch subscription:", error);
          setSubscriptionStatus(null);
        }
      } else {
        setSubscriptionStatus(null);
      }
    };
    
    fetchSubscription();
  }, [getUserSubscription, user?.uid]);
  
  useEffect(() => {
    console.log("Header useEffect for scroll");
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

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

  // Only show dashboard button for users with active subscription or admins
  const shouldShowDashboard = () => {
    console.log("Checking dashboard visibility. User:", user); // Debug log
    if (!isAuthenticated || !user) {
      console.log("Not authenticated or no user"); // Debug log
      return false;
    }
    
    // Always show dashboard button for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log("Development mode, showing dashboard"); // Debug log
      return true;
    }
    
    // Admins always see the dashboard button
    if (user.role === "Admin" || user.isAdmin) {
      console.log("Admin user, showing dashboard"); // Debug log
      return true;
    }
    
    // For debugging, let's always show it for now
    console.log("Showing dashboard for all users"); // Debug log
    return true;
  };

  // Make sure we don't show anything until auth is initialized
  if (!initialized) {
    console.log("Auth not initialized yet"); // Debug log
    return null;
  }

  console.log("Header fully rendered"); // Debug log

  return (
    <header className="fixed top-0 left-0 w-full z-[9999] bg-white shadow-sm h-16 main-header">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="logo-text font-bold text-2xl bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent" style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
            Grow Bharat Vyapaar
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sm font-medium text-gray-700 hover:text-primary transition-smooth">
            Home
          </Link>
          <Link to="/categories" className="text-sm font-medium text-gray-700 hover:text-primary transition-smooth">
            Categories
          </Link>
          <Link to="/businesses" className="text-sm font-medium text-gray-700 hover:text-primary transition-smooth">
            Businesses
          </Link>
          <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-primary transition-smooth">
            About
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {shouldShowDashboard() && (
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full transition-smooth" 
              onClick={handleDashboardClick}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              <span className="text-gray-800">Dashboard</span>
            </Button>
          )}
          
          {isAuthenticated ? <UserMenu /> : <Button variant="default" size="sm" className="rounded-full transition-smooth" onClick={() => setIsAuthModalOpen(true)}>
              <LogIn className="h-4 w-4 mr-2" />
              <span>Login / Register</span>
            </Button>}
        </div>

        <button 
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-smooth"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`mobile-menu md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} 
           style={{
             maxHeight: isMobileMenuOpen ? '500px' : '0',
             opacity: isMobileMenuOpen ? '1' : '0'
           }}>
        <div className="container max-w-7xl mx-auto px-4 py-4 flex flex-col space-y-4">
          <Link to="/" className="py-2 text-lg font-medium hover:text-primary transition-smooth">
            <span className="text-gray-800">Home</span>
          </Link>
          <Link to="/categories" className="py-2 text-lg font-medium hover:text-primary transition-smooth">
            <span className="text-gray-800">Categories</span>
          </Link>
          <Link to="/businesses" className="py-2 text-lg font-medium hover:text-primary transition-smooth">
            <span className="text-gray-800">Businesses</span>
          </Link>
          <Link to="/about" className="py-2 text-lg font-medium hover:text-primary transition-smooth">
            <span className="text-gray-800">About</span>
          </Link>
          <div className="pt-2 flex flex-col space-y-3">
            {shouldShowDashboard() && (
              <Button 
                variant="outline" 
                className="justify-start rounded-full w-full transition-smooth" 
                onClick={handleDashboardClick}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span className="text-gray-800">Dashboard</span>
              </Button>
            )}
            
            {isAuthenticated ? <Button variant="default" className="justify-start rounded-full w-full transition-smooth" onClick={handleMobileLogout}>
                <LogIn className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button> : <Button variant="default" className="justify-start rounded-full w-full transition-smooth" onClick={() => {
                setIsAuthModalOpen(true);
                setIsMobileMenuOpen(false);
              }}>
                <LogIn className="h-4 w-4 mr-2" />
                <span>Login / Register</span>
              </Button>}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </header>
  );
};

export default Header;
