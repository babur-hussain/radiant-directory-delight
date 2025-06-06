
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const FormStepIndicator: React.FC<FormStepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels
}) => {
  return (
    <div className="w-full mb-6">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between items-center">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                isCompleted && "bg-blue-600 text-white",
                isCurrent && "bg-blue-100 text-blue-600 border-2 border-blue-600",
                !isCompleted && !isCurrent && "bg-gray-200 text-gray-500"
              )}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 text-center px-1",
                isCurrent && "text-blue-600 font-medium",
                !isCurrent && "text-gray-500"
              )}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormStepIndicator;
