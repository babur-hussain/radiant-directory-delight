
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

interface LayoutProps {
  children?: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideHeader = false, hideFooter = false }) => {
  const location = useLocation();
  
  // Create a list of paths where we should check for nested layouts
  const nestedLayoutPaths = ['/influencers', '/businesses'];
  
  // Check if we're in a layout that might already include Header/Footer
  const isDashboard = location.pathname.includes('/dashboard');
  const isAdmin = location.pathname.includes('/admin');
  const isInNestedLayoutPath = nestedLayoutPaths.some(path => location.pathname === path);
  
  // Only show header/footer if we're not in dashboard or admin routes
  // and if they're not explicitly hidden by props
  const showHeader = !hideHeader && !isDashboard && !isAdmin && !isInNestedLayoutPath;
  const showFooter = !hideFooter && !isDashboard && !isAdmin && !isInNestedLayoutPath;
  
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
