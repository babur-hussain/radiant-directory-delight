
import React from 'react';
import { Loader2 } from 'lucide-react';

type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingProps {
  size?: LoadingSize;
  message?: string;
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const Loading: React.FC<LoadingProps> = ({ size = 'md', message, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      {message && <p className="mt-2 text-muted-foreground text-sm">{message}</p>}
    </div>
  );
};

export default Loading;
