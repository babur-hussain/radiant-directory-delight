
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
  const showHeader = !hideHeader;
  const showFooter = !hideFooter;
  
  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main className="flex-grow pt-0 w-full overflow-x-hidden">
        {children || <Outlet />}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
