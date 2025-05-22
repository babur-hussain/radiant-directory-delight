
import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import Layout from './components/layout/Layout';
import Loading from '@/components/ui/loading';

const AppRoutes: React.FC = () => {
  // Create a fallback element that doesn't rely on router hooks
  const fallbackElement = (
    <Layout hideHeader={false} hideFooter={false}>
      <div className="flex flex-col items-center justify-center min-h-[400px] py-16">
        <Loading size="xl" message="Loading content..." /> 
      </div>
    </Layout>
  );
  
  return (
    <Suspense fallback={fallbackElement}>
      <RouterProvider 
        router={router} 
        fallbackElement={fallbackElement}
      />
    </Suspense>
  );
};

export default AppRoutes;
