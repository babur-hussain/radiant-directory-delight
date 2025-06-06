
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideHeader = false, hideFooter = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideHeader && (
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>
      )}
      
      <main className="flex-1">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      
      {!hideFooter && (
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      )}
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            border: '1px solid #e2e8f0',
            fontSize: '14px'
          }
        }}
      />
    </div>
  );
};

export default Layout;
