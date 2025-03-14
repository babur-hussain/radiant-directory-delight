
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Map, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AuthModal from './auth/AuthModal';
import UserMenu from './UserMenu';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const auth = useAuth();
  const {
    isAuthenticated,
    logout,
    initialized
  } = auth;

  useEffect(() => {
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

  // Make sure we don't show anything until auth is initialized
  if (!initialized) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 w-full z-[1000] bg-white shadow-sm h-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center justify-between w-full h-full">
          <Link to="/" className="flex items-center space-x-2">
            <span className="logo-text font-bold text-2xl bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Grow Bharat Vyapaar</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-smooth">
              Home
            </Link>
            <Link to="/categories" className="text-sm font-medium hover:text-primary transition-smooth">
              Categories
            </Link>
            <Link to="/businesses" className="text-sm font-medium hover:text-primary transition-smooth">
              Businesses
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-smooth">
              About
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" className="rounded-full transition-smooth">
              <Map className="h-4 w-4 mr-2" />
              Location
            </Button>
            
            {isAuthenticated ? <UserMenu /> : <Button variant="default" size="sm" className="rounded-full transition-smooth" onClick={() => setIsAuthModalOpen(true)}>
                <LogIn className="h-4 w-4 mr-2" />
                Login / Register
              </Button>}
          </div>

          <button 
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-smooth"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className={`mobile-menu md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} 
           style={{
             maxHeight: isMobileMenuOpen ? '500px' : '0',
             opacity: isMobileMenuOpen ? '1' : '0'
           }}>
        <div className="container max-w-7xl mx-auto px-4 py-4 flex flex-col space-y-4">
          <Link to="/" className="py-2 text-lg font-medium hover:text-primary transition-smooth">
            Home
          </Link>
          <Link to="/categories" className="py-2 text-lg font-medium hover:text-primary transition-smooth">
            Categories
          </Link>
          <Link to="/businesses" className="py-2 text-lg font-medium hover:text-primary transition-smooth">
            Businesses
          </Link>
          <Link to="/about" className="py-2 text-lg font-medium hover:text-primary transition-smooth">
            About
          </Link>
          <div className="pt-2 flex flex-col space-y-3">
            <Button variant="outline" className="justify-start rounded-full w-full transition-smooth">
              <Map className="h-4 w-4 mr-2" />
              Set Location
            </Button>
            
            {isAuthenticated ? <Button variant="default" className="justify-start rounded-full w-full transition-smooth" onClick={handleMobileLogout}>
                <LogIn className="h-4 w-4 mr-2" />
                Logout
              </Button> : <Button variant="default" className="justify-start rounded-full w-full transition-smooth" onClick={() => {
                setIsAuthModalOpen(true);
                setIsMobileMenuOpen(false);
              }}>
                <LogIn className="h-4 w-4 mr-2" />
                Login / Register
              </Button>}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </header>
  );
};

export default Header;
