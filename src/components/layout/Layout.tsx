import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

interface LayoutProps {
  children?: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

// Keep track of layout rendering to prevent duplicate layouts
const isLayoutMounted = { current: false };

const Layout: React.FC<LayoutProps> = ({ children, hideHeader = false, hideFooter = false }) => {
  const location = useLocation();
  const showHeader = !hideHeader;
  const showFooter = !hideFooter;

  // Reset layout mounting state on route changes
  useEffect(() => {
    return () => {
      isLayoutMounted.current = false;
    };
  }, [location.pathname]);
  
  // Check if we're already inside a layout to prevent nesting
  if (isLayoutMounted.current) {
    return <>{children || <Outlet />}</>;
  }
  
  // Mark layout as mounted
  isLayoutMounted.current = true;
  
  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main className="flex-grow">
        {children || <Outlet />}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
