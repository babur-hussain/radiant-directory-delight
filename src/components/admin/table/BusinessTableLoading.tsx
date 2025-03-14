
import React from 'react';

const BusinessTableLoading: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      <span className="mt-4 text-lg font-medium">Loading businesses...</span>
    </div>
  );
};

export default BusinessTableLoading;
