
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import { useIsMobile } from '@/hooks/use-responsive';

interface LayoutProps {
  children?: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideHeader = false, hideFooter = false }) => {
  const showHeader = !hideHeader;
  const showFooter = !hideFooter;
  const isMobile = useIsMobile();
  
  // Add class to document body to help with mobile menu styling
  React.useEffect(() => {
    document.body.classList.add('has-mobile-layout');
    
    return () => {
      document.body.classList.remove('has-mobile-layout');
    };
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main className={`flex-grow pt-0 w-full overflow-x-hidden ${isMobile ? 'pb-4' : 'pb-8'}`}>
        {children || <Outlet />}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
