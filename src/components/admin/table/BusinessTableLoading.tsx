
import React from 'react';

const BusinessTableLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <span className="ml-3 text-lg">Loading businesses...</span>
    </div>
  );
};

export default BusinessTableLoading;
