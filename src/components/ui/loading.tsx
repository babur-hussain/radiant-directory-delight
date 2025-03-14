
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  message?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

const Loading = ({ 
  size = 'md', 
  className, 
  message,
  variant = 'primary'
}: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4'
  };
  
  const variantClasses = {
    default: 'border-gray-300 border-r-gray-600',
    primary: 'border-primary/30 border-r-primary',
    secondary: 'border-secondary/30 border-r-secondary'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-solid", 
          sizeClasses[size],
          variantClasses[variant]
        )} 
      />
      {message && (
        <p className="mt-3 text-sm text-gray-500">{message}</p>
      )}
    </div>
  );
};

export default Loading;
