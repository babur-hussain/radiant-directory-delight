
import React from 'react';
import Loading from '@/components/ui/loading';

const BusinessTableLoading: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center py-12">
      <Loading 
        size="lg" 
        message="Loading businesses..."
        variant="primary"
      />
    </div>
  );
};

export default BusinessTableLoading;
