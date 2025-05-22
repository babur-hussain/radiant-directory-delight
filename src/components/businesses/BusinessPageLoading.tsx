
import React from 'react';
import { Loader2 } from 'lucide-react';

export const BusinessPageLoading: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
      <div className="text-center mb-8 sm:mb-12 animate-pulse">
        <div className="h-10 w-3/4 sm:w-1/2 bg-gray-200 rounded-lg mx-auto mb-4"></div>
        <div className="h-4 w-full sm:w-2/3 bg-gray-100 rounded-lg mx-auto"></div>
      </div>
      <div className="flex flex-col justify-center items-center py-16 sm:py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-lg sm:text-xl text-gray-600">Loading businesses...</span>
        <p className="text-sm text-gray-400 mt-2">Please wait while we fetch the latest data</p>
      </div>
    </div>
  );
};
